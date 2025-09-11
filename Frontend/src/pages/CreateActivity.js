import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateActivity = () => {
    // --- STATE MANAGEMENT FOR VALIDATED SELECTION ---
    const [allPendingTasks, setAllPendingTasks] = useState([]); // To populate the dropdown list
    const [nextTask, setNextTask] = useState(null); // The *actual* next task for validation
    const [selectedStoreId, setSelectedStoreId] = useState(''); // The store the user selects from the dropdown
    
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    // State for form submission
    const [remarks, setRemarks] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [locationAccuracy, setLocationAccuracy] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('access');

    // Effect to fetch all pending tasks for the day
    useEffect(() => {
        const fetchTodaysTasks = async () => {
            if (!token) { navigate('/login'); return; }
            try {
                const res = await axios.get('http://127.0.0.1:8000/accounts/tasks/today/', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 1. Filter to get only the tasks that are not yet completed
                const pendingTasks = res.data.filter(task => task.status === 'pending');
                
                if (pendingTasks.length > 0) {
                    setAllPendingTasks(pendingTasks); // Set the list for the dropdown
                    setNextTask(pendingTasks[0]); // The first in the list is the "correct" one
                    setSelectedStoreId(pendingTasks[0].store.store_id); // Pre-select the correct store as a helpful default
                } else {
                    if (res.data.length > 0) {
                        setPageError("Congratulations! You have completed all tasks for today.");
                    } else {
                        setPageError("You have no tasks assigned for today.");
                    }
                }
            } catch (err) {
                console.error("Error fetching tasks:", err);
                setPageError("Could not load your task list. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchTodaysTasks();
    }, [token, navigate]);

    // Submission handler with the new validation logic
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!nextTask) return;

        // --- 2. VALIDATION CHECK ---
        // Compare the user's selection with the ID of the actual next task
        if (parseInt(selectedStoreId) !== nextTask.store.store_id) {
            setSubmitError(`Invalid Selection. Please select the correct next store: #${nextTask.sequence_order} - ${nextTask.store.store_information}`);
            return; // Stop the submission
        }
        
        // If validation passes, proceed as normal
        setSubmitError('');
        setMessage('Getting your current location...');
        setLocationAccuracy(null);
        setIsSubmitting(true);

        const geoOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                setLocationAccuracy(accuracy);
                setMessage('Verifying location and submitting...');
                try {
                    await axios.post('http://127.0.0.1:8000/accounts/activities/create/', {
                        store: selectedStoreId, // Use the validated selectedStoreId
                        remarks,
                        latitude,
                        longitude,
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    navigate('/');
                } catch (err) {
                    setSubmitError(err.response?.data?.error || 'An unexpected error occurred.');
                    setMessage('');
                } finally {
                    setIsSubmitting(false);
                }
            },
            (geoError) => {
                setSubmitError(`Location Error: ${geoError.message}.`);
                setMessage('');
                setIsSubmitting(false);
            },
            geoOptions
        );
    };
    
    // --- RENDER LOGIC ---

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center font-semibold">Loading your next task...</div>;
    }

    if (pageError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-lg p-8 text-center bg-white rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-gray-700">{pageError}</h2>
                    <button onClick={() => navigate('/')} className="mt-6 py-2 px-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        &larr; Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-900">Log Activity</h2>
                <button onClick={() => navigate(-1)} className="text-sm text-indigo-600 hover:text-indigo-500">
                    &larr; Back to Dashboard
                </button>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {message && !submitError && (
                        <div className="text-sm text-center text-blue-600 bg-blue-100 p-3 rounded-md">
                            <p>{message}</p>
                            {locationAccuracy && (
                                <p className="mt-1 font-semibold">Location Accuracy: {locationAccuracy.toFixed(0)} meters</p>
                            )}
                        </div>
                    )}
                    {submitError && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{submitError}</p>}
                    
                    {/* --- 3. THE INTERACTIVE DROPDOWN --- */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Select Store</label>
                        <select
                            value={selectedStoreId}
                            onChange={(e) => setSelectedStoreId(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {/* Populate the dropdown with all pending tasks */}
                            {allPendingTasks.map(task => (
                                <option key={task.store.store_id} value={task.store.store_id}>
                                    {`#${task.sequence_order} - ${task.store.store_information}`}
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
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !nextTask} 
                        className="w-full py-2 px-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Submitting...' : 'Log Visit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateActivity;