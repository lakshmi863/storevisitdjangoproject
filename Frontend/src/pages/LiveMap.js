// C:\Users\Lenovo\Desktop\React and Django\Frontend\src\pages\LiveMap.js

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'; // <-- Import Circle
import 'leaflet/dist/leaflet.css';
//import L from 'leaflet';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ... (leaflet icon fix, no changes)

const LiveMap = () => {
    // --- UPDATED to store the full position object ---
    const [currentPosition, setCurrentPosition] = useState(null); 
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('access');

    // ... (existing code to fetch stores, no changes needed here)

    useEffect(() => {
        // --- UPDATED GEOLOCATION OPTIONS ---
        const geoOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };
        
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                // Store the full position object
                setCurrentPosition({ lat: latitude, lng: longitude, accuracy: accuracy }); 
                setLoading(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                setLoading(false);
            },
            geoOptions // Pass options to watchPositions 
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    if (loading) { /* ... */ }
    if (!currentPosition) { /* ... */ }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-6xl mx-auto">
                 {/* ... (header and back button, no changes) */}
                 
                 {/* --- ADDED ACCURACY DISPLAY --- */}
                 <div className="mb-2 text-center text-gray-700 font-semibold">
                    Current Location Accuracy: {currentPosition.accuracy.toFixed(0)} meters
                 </div>

                <div className="bg-white rounded-lg shadow-md h-[75vh]">
                    <MapContainer center={[currentPosition.lat, currentPosition.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />

                        {/* --- VISUAL CIRCLE FOR ACCURACY --- */}
                        <Circle
                            center={[currentPosition.lat, currentPosition.lng]}
                            radius={currentPosition.accuracy}
                            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                        />
                        
                        <Marker position={[currentPosition.lat, currentPosition.lng]}>
                            <Popup>You are within this circle.</Popup>
                        </Marker>

                        {/* ... (store markers, no changes) */}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default LiveMap;