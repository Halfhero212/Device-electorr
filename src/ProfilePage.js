import React, { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import { ref, onValue, off, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

function ProfilePage() {
    const [userProfile, setUserProfile] = useState(null);
    const [newName, setNewName] = useState('');
    const [newProfilePic, setNewProfilePic] = useState(null);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setNewProfilePic(e.target.files[0]);
        }
    };

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const profileRef = ref(db, `/users/${user.uid}`);
        const handleValue = onValue(profileRef, (snapshot) => {
            const data = snapshot.val();
            setUserProfile(data);
            setNewName(data.name);
        });

        // Cleanup function
        return () => {
            off(profileRef, handleValue);
        };
    }, []);

    const handleNameChange = async (e) => {
        e.preventDefault();
        try {
            const profileRef = ref(db, `/users/${auth.currentUser.uid}`);
            await set(profileRef, { ...userProfile, name: newName });
        } catch (error) {
            console.error('Error updating name: ', error);
        }
    };

    const handleProfilePicChange = async (e) => {
        e.preventDefault();
        try {
            const storageService = getStorage();
            const imageRef = storageRef(storageService, 'userProfileImages/' + newProfilePic.name);
            const uploadTask = uploadBytesResumable(imageRef, newProfilePic);

            uploadTask.on('state_changed',
            (snapshot) => {
                // Handle progress
            }, 
            (error) => {
                // Handle unsuccessful uploads
                console.error('Error uploading image: ', error);
            }, 
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    const profileRef = ref(db, `/users/${auth.currentUser.uid}`);
                    set(profileRef, { ...userProfile, picture: downloadURL });
                });
            });
        } catch (error) {
            console.error('Error updating profile picture: ', error);
        }
    };

    if (!userProfile) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ width: '50%', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '30px', color: '#333' }}>{userProfile.name}</h1>
            <img src={userProfile.picture} alt="Profile" style={{ width: '200px', height: '200px', borderRadius: '50%' }}/>
            <form onSubmit={handleNameChange}>
                <input
                    type="text"
                    placeholder="New name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ margin: '20px 0', display: 'block', padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Change Name
                </button>
            </form>
            <form onSubmit={handleProfilePicChange}>
                <input
                    type="file"
                    onChange={handleImageChange}
                    style={{ margin: '20px 0', display: 'block' }}
                />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#f44336', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Change Profile Picture
                </button>
            </form>
        </div>
    );
}

export default ProfilePage;
