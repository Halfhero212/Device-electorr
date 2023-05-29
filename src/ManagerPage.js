import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { ref, onValue, off, push, set, remove as removeRef } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
//import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

function ManagerPage() {
    const [devices, setDevices] = useState([]);
    const [newDeviceName, setNewDeviceName] = useState('');
    const [newDeviceDescription, setNewDeviceDescription] = useState('');
    const [newDeviceImage, setNewDeviceImage] = useState(null);
    const [vote, setVote] = useState({ deviceId: '', value: '', reason: '' });

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setNewDeviceImage(e.target.files[0]);
        }
    };

    useEffect(() => {
        const deviceRef = ref(db, '/devices');
        const handleValue = onValue(deviceRef, (snapshot) => {
            const data = snapshot.val();
            const deviceList = Object.keys(data).map(id => {
                const device = data[id];
                let yesVotes = 0;
                let noVotes = 0;
    
                if (device.votes) {
                    yesVotes = Object.keys(device.votes.yes || {}).length;
                    noVotes = Object.keys(device.votes.no || {}).length;
                }
    
                return { 
                    id, 
                    name: device.name, 
                    description: device.description,
                    imageUrl: device.imageUrl,
                    managerId: device.managerId,  // Add the manager id
                    yesVotes, 
                    noVotes
                };
            });
            setDevices(deviceList);
        });
    
        // Cleanup subscription on unmount
        return () => off(deviceRef, handleValue);
    }, []);
    
    const handleAddDevice = async (event) => {
        event.preventDefault();

        if (newDeviceName === '' || newDeviceDescription === '' || newDeviceImage === null) {
            alert('Device name, description and image cannot be empty.');
            return;
        }

        try {
            // First, upload the image to Firebase Storage
            const storageService = getStorage();
            const imageRef = storageRef(storageService, 'deviceImages/' + newDeviceImage.name);
            const uploadTask = uploadBytesResumable(imageRef, newDeviceImage);

            // Listen for state changes, errors, and completion of the upload.
            uploadTask.on('state_changed',
            (snapshot) => {
                // Handle progress
            }, 
            (error) => {
                // Handle unsuccessful uploads
                console.error('Error uploading image: ', error);
            }, 
            () => {
                // Handle successful uploads on complete
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    // Then, store the new device data, including the URL of the uploaded image
                    const deviceRef = push(ref(db, '/devices'));
                    set(deviceRef, { 
                        name: newDeviceName, 
                        description: newDeviceDescription, 
                        imageUrl: downloadURL, 
                        managerId: auth.currentUser.uid  // Add the user ID who posted the device
                    });

                    setNewDeviceName('');
                    setNewDeviceDescription('');
                    setNewDeviceImage(null);
                });
            });
        } catch (error) {
            console.error('Error adding device: ', error);
        }
    };

    const handleDeleteDevice = async (deviceId, imageName) => {
        // Confirm deletion
        if (!window.confirm('Are you sure you want to delete this device?')) return;

        try {
            // Delete the device data from the database
            await removeRef(ref(db, `/devices/${deviceId}`));

            // Optional: Also delete the image from storage
            const storageService = getStorage();
            const imageRef = storageRef(storageService, `deviceImages/${imageName}`);
            await deleteObject(imageRef);
        } catch (error) {
            console.error('Error deleting device: ', error);
        }
    };

    const handleVote = async (event) => {
        event.preventDefault();

        if (vote.deviceId === '' || vote.value === '' || vote.reason === '') {
            alert('All vote fields must be filled out.');
            return;
        }

        try {
            const voteRef = push(ref(db, `/devices/${vote.deviceId}/votes/${vote.value}`));
            await set(voteRef, { managerName: auth.currentUser.displayName, reason: vote.reason });

            setVote({ deviceId: '', value: '', reason: '' });
        } catch (error) {
            console.error('Error casting vote: ', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-semibold text-gray-800 mb-8">Manager Page</h1>
            <form className="mb-8 space-y-4" onSubmit={handleAddDevice}>
                <input
                    type="text"
                    placeholder="Device Name"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    className="w-full px-3 py-2 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                />
                <input
                    type="text"
                    placeholder="Device Description"
                    value={newDeviceDescription}
                    onChange={(e) => setNewDeviceDescription(e.target.value)}
                    className="w-full px-3 py-2 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                />
                <input
                    type="file"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 text-gray-900 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none">Add Device</button>
            </form>
            {devices.map((device) => (
                <div key={device.id} className="border rounded-lg shadow overflow-hidden mb-8">
                    <img className="w-full h-56 object-cover object-center" src={device.imageUrl} alt={device.name} />
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">{device.name}</h2>
                        <p className="text-gray-600 text-sm mb-2">{device.description}</p>
                        <p className="text-gray-600 text-sm mb-2"><span className="font-bold">Posted by:</span> {device.managerName}</p>
                        <div className="flex items-center justify-between">
                        <p className="text-gray-800">
                            <span className="font-bold">Yes votes:</span> {device.yesVotes}
                        </p>
                        <p className="text-gray-800">
                            <span className="font-bold">No votes:</span> {device.noVotes}
                        </p>
                        {device.managerId === auth.currentUser.uid && (
                            <button onClick={() => handleDeleteDevice(device.id, device.imageUrl)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none">Delete</button>
                        )}

                    </div>
                        
                        <form className="mt-4 space-y-4" onSubmit={handleVote}>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="radio"
                                    id={`yes-${device.id}`}
                                    name={`vote-${device.id}`}
                                    value="yes"
                                    checked={vote.value === 'yes'}
                                    onChange={(e) => setVote({ ...vote, deviceId: device.id, value: e.target.value })}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor={`yes-${device.id}`} className="font-medium text-gray-700">Yes</label>
                            </div>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="radio"
                                    id={`no-${device.id}`}
                                    name={`vote-${device.id}`}
                                    value="no"
                                    checked={vote.value === 'no'}
                                    onChange={(e) => setVote({ ...vote, deviceId: device.id, value: e.target.value })}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor={`no-${device.id}`} className="font-medium text-gray-700">No</label>
                            </div>
                            <input
                                type="text"
                                placeholder="Reason"
                                value={vote.reason}
                                onChange={(e) => setVote({ ...vote, reason: e.target.value })}
                                className="w-full px-3 py-2 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                            />
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none">Vote</button>
                        </form>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ManagerPage;
