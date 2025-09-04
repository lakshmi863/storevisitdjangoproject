// C:\Users\Lenovo\Desktop\React and Django\Frontend\src\pages\CreateActivity.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateActivity = () => {
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState('');
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // For user feedback
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('access');

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8000/accounts/employee/stores/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStores(res.data || []);
                if (res.data && res.data.length > 0) {
                    setSelectedStore(res.data[0].store_id);
                }
            } catch (err) {
                console.error("Error fetching stores:", err);
            }
        };
        fetchStores();
    }, [token]);

    const handleSubmit = (event) => {
        event.preventDefault();
        setError('');
        setMessage('Getting your current location...');
        setIsSubmitting(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setMessage('Verifying location and submitting...');
                try {
                    await axios.post('http://127.0.0.1:8000/accounts/activities/create/', {
                        store: selectedStore,
                        remarks,
                        latitude,
                        longitude,
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    
                    navigate('/'); // Success! Redirect to dashboard.
                } catch (err) {
                    setError(err.response?.data?.error || 'An unexpected error occurred.');
                    setMessage('');
                } finally {
                    setIsSubmitting(false);
                }
            },
            (geoError) => {
                setError(`Location Error: ${geoError.message}. Please allow location access and try again.`);
                setMessage('');
                setIsSubmitting(false);
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-900">Create New Activity</h2>
                 <button onClick={() => navigate(-1)} className="text-sm text-indigo-600 hover:text-indigo-500">
                    &larr; Back to Dashboard
                </button>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {message && !error && <p className="text-sm text-center text-blue-600 bg-blue-100 p-3 rounded-md">{message}</p>}
                    {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Select Store</label>
                        <select
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {stores.map(store => (
                                <option key={store.store_id} value={store.store_id}>
                                    {store.store_information}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Remarks / Feedback</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                            placeholder="Example: Order received for 10 units."
                        />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors">
                        {isSubmitting ? 'Submitting...' : 'Log Visit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateActivity;