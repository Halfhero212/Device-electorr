import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, off } from 'firebase/database';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

function CEOPage() {
    const [devices, setDevices] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const deviceRef = ref(db, '/devices');
        const handleValue = onValue(deviceRef, (snapshot) => {
            const data = snapshot.val();
            const deviceList = Object.keys(data).map(id => {
                const device = data[id];
                let yesVotes = 0;
                let noVotes = 0;
                let yesReasons = [];
                let noReasons = [];

                if (device.votes) {
                    yesVotes = Object.keys(device.votes.yes || {}).length;
                    noVotes = Object.keys(device.votes.no || {}).length;
                    yesReasons = Object.values(device.votes.yes || {}).map(vote => vote.reason);
                    noReasons = Object.values(device.votes.no || {}).map(vote => vote.reason);
                }

                return {
                    id,
                    name: device.name,
                    description: device.description,
                    managerId: device.managerId,
                    yesVotes,
                    noVotes,
                    yesReasons,
                    noReasons
                };
            });
            setDevices(deviceList);
        });

        // Cleanup function
        return () => off(deviceRef, handleValue);
    }, []);

    useEffect(() => {
        const usersRef = ref(db, '/users');
        const handleValue = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            const userList = Object.keys(data).map(id => ({ id, ...data[id] }));
            setUsers(userList);
        });

        // Cleanup function
        return () => off(usersRef, handleValue);
    }, []);

    return (
        <div className="w-full mx-auto py-10 px-5 sm:px-24 bg-gray-100">
            <h1 className="text-3xl text-center font-semibold text-gray-800 mb-6">CEO Page</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map(device => {
                const deviceManager = users.find(user => user.id === device.managerId);
                return (
                    <div key={device.id} className="bg-white p-6 rounded shadow hover:shadow-lg transition-shadow duration-200">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">{device.name}</h2>
                        <p className="text-gray-600 mb-2">{device.description}</p>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Manager: {deviceManager ? deviceManager.name : "N/A"}</h3>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Votes:</h3>
                        <div className="flex justify-center items-center mt-4">
                        <BarChart width={400} height={300} data={[{ name: 'Votes', yes: device.yesVotes, no: device.noVotes }]}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="yes" fill="#8884d8" />
                            <Bar dataKey="no" fill="#82ca9d" />
                        </BarChart>
                    </div>


                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Reasons for Yes votes:</h3>
                        <ul className="list-disc pl-5 text-gray-600">
                        {device.yesReasons && device.yesReasons.map((reason, index) => <li key={index}>{reason}</li>)}

                        </ul>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Reasons for No votes:</h3>
                        <ul className="list-disc pl-5 text-gray-600">
                        {device.yesReasons && device.yesReasons.map((reason, index) => <li key={index}>{reason}</li>)}

                        </ul>
                    </div>
                );
            })}

            </div>
        </div>
    );
}

export default CEOPage;
