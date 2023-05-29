import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from './firebase';
import { ref, onValue, off } from 'firebase/database';


function DeviceDetail() {
    const { deviceId } = useParams();
    const [device, setDevice] = useState(null);

    useEffect(() => {
        const deviceRef = ref(db, `devices/${deviceId}`);
        const handleValue = onValue(deviceRef, (snapshot) => {
            const deviceData = snapshot.val();
            setDevice({ id: deviceId, ...deviceData });
        });

        // Cleanup subscription on unmount
        return () => off(deviceRef, handleValue);
    }, [deviceId]);

    if (!device) return 'Loading...';

    

    return (
        <div>
            <h1>{device.name}</h1>
            <p>{device.description}</p>

            <h2>Votes</h2>
            

            <h3>Yes</h3>
            <ul>
                {device.votes?.yes?.map((vote) => (
                    <li key={vote.managerId}>
                        <p>Manager: {vote.managerName}</p>
                        <p>Reason: {vote.reason}</p>
                    </li>
                ))}
            </ul>

            <h3>No</h3>
            <ul>
                {device.votes?.no?.map((vote) => (
                    <li key={vote.managerId}>
                        <p>Manager: {vote.managerName}</p>
                        <p>Reason: {vote.reason}</p>
                    </li>
                ))}
            </ul>
            <Link to="/ceo">Back to all devices</Link>
        </div>
    );
}

export default DeviceDetail;
