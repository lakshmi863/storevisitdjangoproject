import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Standard icon fix ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// --- STEP 1: DEFINE CUSTOM ICONS ---

// The default blue icon for pending tasks
const blueIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// A new green icon for completed tasks
const greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


const LiveMap = () => {
    const [currentPosition, setCurrentPosition] = useState(null);
    // State will now hold the full task list, not just stores
    const [tasks, setTasks] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('access');

    // Effect for real-time geolocation tracking
    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                setCurrentPosition({ lat: latitude, lng: longitude, accuracy: accuracy });
                if (loading) setLoading(false);
            },
            (geoError) => {
                setError(`Geolocation Error: ${geoError.message}.`);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [loading]);


    // --- STEP 2: FETCH DAILY TASKS, NOT STORES ---
    useEffect(() => {
        const fetchTodaysTasks = async () => {
            if (!token) { navigate('/login'); return; }
            try {
                // Change the endpoint to get the list with visit statuses
                const response = await axios.get('http://127.0.0.1:8000/accounts/tasks/today/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(response.data || []);
            } catch (err) {
                console.error("Failed to fetch tasks:", err);
                setError('Could not load task data for the map.');
            }
        };
        fetchTodaysTasks();
    }, [token, navigate]);


    if (loading) {
        return <div className="min-h-screen flex items-center justify-center font-semibold">Loading map and getting your location...</div>;
    }
    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-red-600 p-4 text-center font-semibold">{error}</div>;
    }
    if (!currentPosition) {
         return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">Could not get your current location.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Live Map</h1>
                    <button onClick={() => navigate('/')} className="py-2 px-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        &larr; Back to Dashboard
                    </button>
                </div>
                <div className="mb-2 text-center text-gray-700 font-semibold">
                    Location Accuracy: {currentPosition.accuracy.toFixed(0)} meters
                </div>
                <div className="bg-white rounded-lg shadow-md h-[75vh]">
                    <MapContainer center={[currentPosition.lat, currentPosition.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                        
                        <Circle center={[currentPosition.lat, currentPosition.lng]} radius={currentPosition.accuracy} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1, weight: 1 }}/>
                        <Marker position={[currentPosition.lat, currentPosition.lng]} >
                            <Popup>You are here (within {currentPosition.accuracy.toFixed(0)}m)</Popup>
                        </Marker>

                        {/* --- STEP 3: CONDITIONAL MARKER & POPUP RENDERING --- */}
                        {tasks.map(task => {
                            // Determine which icon and popup content to use based on status
                            const isCompleted = task.status === 'completed';
                            const iconToUse = isCompleted ? greenIcon : blueIcon;

                            // Ensure we only try to render tasks that have location data
                            if (!task.store || !task.store.latitude || !task.store.longitude) {
                                return null;
                            }

                            return (
                                <Marker 
                                    key={task.id} 
                                    position={[task.store.latitude, task.store.longitude]}
                                    icon={iconToUse} // Assign the correct icon
                                >
                                    <Popup>
                                        <div className="font-bold text-base">{task.store.store_information}</div>
                                        {isCompleted ? (
                                            <div className="text-green-600 font-semibold">Visit Complete</div>
                                        ) : (
                                            <div>Status: Pending</div>
                                        )}
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default LiveMap;