import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { ref, onValue, off } from 'firebase/database';
import { Link } from 'react-router-dom';

function DeviceList() {
    const [devices, setDevices] = useState({});

    useEffect(() => {
        const devicesRef = ref(db, 'devices');
        const handleValue = onValue(devicesRef, (snapshot) => {
            setDevices(snapshot.val());
        });

        // Cleanup function
        return () => off(devicesRef, handleValue);
    }, []);

    return (
        <div>
            <h1>Devices</h1>
            {Object.entries(devices).map(([id, device]) => (
                <div key={id}>
                    <h2>
                        <Link to={`/device/${id}`}>{device.name}</Link>
                    </h2>
                    <p>{device.description}</p>
                </div>
            ))}
        </div>
    );
}

export default DeviceList;
