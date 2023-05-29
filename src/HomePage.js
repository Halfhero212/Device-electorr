import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, off } from 'firebase/database';

function HomePage() {
    const [devices, setDevices] = useState([]);

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
                    yesVotes, 
                    noVotes
                };
            });
            setDevices(deviceList);
        });

        // Cleanup subscription on unmount
        return () => off(deviceRef, handleValue);
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <section className="mb-12 text-center">
                <h1 className="text-4xl font-semibold text-gray-800 mb-2">Welcome to Device Showcase!</h1>
                <p className="text-lg text-gray-600">Explore the latest and greatest devices, and vote on your favorites.</p>
            </section>

            {/* Featured Device */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Featured Device</h2>
                {devices.slice(0, 1).map(device => (
                    <div key={device.id} className="border bg-white rounded-lg shadow-lg overflow-hidden p-6 space-y-4">
                        <img className="w-full h-64 object-cover object-center" src={device.imageUrl} alt={device.name} />
                        <h2 className="text-3xl font-semibold text-gray-700">{device.name}</h2>
                        <p className="text-gray-600">{device.description}</p>
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex-1 border-r border-gray-300 pr-2">
                                <p className="text-sm text-gray-500 mb-1">Yes votes</p>
                                <p className="text-lg font-semibold text-gray-800">{device.yesVotes}</p>
                            </div>
                            <div className="flex-1 pl-2">
                                <p className="text-sm text-gray-500 mb-1">No votes</p>
                                <p className="text-lg font-semibold text-gray-800">{device.noVotes}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Latest Devices */}
            <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Latest Devices</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.slice(1).map(device => (
                        <div key={device.id} className="border bg-white rounded-lg shadow-lg overflow-hidden">
                            <img className="w-full h-56 object-cover object-center" src={device.imageUrl} alt={device.name} />
                            <div className="p-6">
                                <h2 className="text-2xl font-semibold text-gray-700 mb-2">{device.name}</h2>
                                <p className="text-gray-600 text-sm mb-4">{device.description}</p>
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="flex-1 border-r border-gray-300 pr-2">
                                        <p className="text-sm text-gray-500 mb-1">Yes votes</p>
                                        <p className="text-lg font-semibold text-gray-800">{device.yesVotes}</p>
                                    </div>
                                    <div className="flex-1 pl-2">
                                        <p className="text-sm text-gray-500 mb-1">No votes</p>
                                        <p className="text-lg font-semibold text-gray-800">{device.noVotes}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer Section */}
            <footer className="mt-12 text-center text-gray-600">
                <p>Thank you for visiting Device Showcase. We hope to see you again soon!</p>
            </footer>
        </div>
    );
}

export default HomePage;
