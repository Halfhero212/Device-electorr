import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { useParams } from 'react-router-dom';
import { ref, onValue, off, set, get } from 'firebase/database';

function DevicePage() {
    const [device, setDevice] = useState({});
    const [votes, setVotes] = useState({});
    const { deviceId } = useParams();

    useEffect(() => {
        const deviceRef = ref(db, `/devices/${deviceId}`);
        const handleValue = onValue(deviceRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                console.log(`No data found for device with ID ${deviceId}`);
            }
            setDevice(data);
        }, (error) => {
            console.error('Failed to read device data:', error);
        });

        const yesVotesRef = ref(db, `/devices/${deviceId}/votes/yes`);
        const noVotesRef = ref(db, `/devices/${deviceId}/votes/no`);

        const handleYesVotes = onValue(yesVotesRef, (snapshot) => {
            const yesVotes = snapshot.val() || [];
            setVotes(votes => ({ ...votes, yes: yesVotes.length }));
        }, (error) => {
            console.error('Failed to read yes votes:', error);
        });

        const handleNoVotes = onValue(noVotesRef, (snapshot) => {
            const noVotes = snapshot.val() || [];
            setVotes(votes => ({ ...votes, no: noVotes.length }));
        }, (error) => {
            console.error('Failed to read no votes:', error);
        });

        // Cleanup function
        return () => {
            off(deviceRef, handleValue);
            off(yesVotesRef, handleYesVotes);
            off(noVotesRef, handleNoVotes);
        };
    }, [deviceId]);

    const handleVote = (voteType, userId) => {
        const votesRef = ref(db, `devices/${deviceId}/votes/${voteType}`);
        get(votesRef).then((snapshot) => {
            const votes = snapshot.val() || {};
            set(votesRef, {...votes, [userId]: {reason: "some reason"}});
        }).catch((error) => {
            console.error('Error while voting:', error);
        });
    };
    

    return (
        <div>
            <h1>{device.name}</h1>
            <p>{device.description}</p>
            <button onClick={() => handleVote('yes')}>Vote Yes</button>
            <button onClick={() => handleVote('no')}>Vote No</button>
            <div>
                <h2>Votes</h2>
                <p>Yes: {votes.yes || 0}</p>
                <p>No: {votes.no || 0}</p>
            </div>
        </div>
    );
}

export default DevicePage;
