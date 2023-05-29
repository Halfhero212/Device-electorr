import React, { useState, useEffect } from 'react';
import { auth, db, storage } from './firebase';
import { ref, onValue, off, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

function Profile() {
    const [profile, setProfile] = useState({ name: '', position: '', picture: '' });
    const [editMode, setEditMode] = useState(false);
    const [newProfilePic, setNewProfilePic] = useState(null);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setNewProfilePic(e.target.files[0]);
        }
    };

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const profileRef = ref(db, `users/${user.uid}`);
        const handleValue = onValue(profileRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setProfile(data);
            }
        });

        // Cleanup subscription on unmount
        return () => off(profileRef, handleValue);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
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
                    setProfile({ ...profile, picture: downloadURL });
                });
            });
        } catch (error) {
            console.error('Error updating profile picture: ', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        const profileRef = ref(db, `users/${user.uid}`);
        await set(profileRef, profile);
        setEditMode(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-semibold text-gray-800 mb-8">My Profile</h1>
            {editMode ? (
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-gray-700">Name: </label>
                    <input 
                        type="text" 
                        name="name"
                        value={profile.name} 
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md"
                    />

                    <label className="block text-sm font-medium text-gray-700">Position: </label>
                    <input 
                        type="text" 
                        name="position"
                        value={profile.position} 
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md"
                    />

                    <label className="block text-sm font-medium text-gray-700">Profile Picture: </label>
                    <input 
                        type="file"
                        onChange={handleImageChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md"
                    />

                    <button onClick={handleProfilePicChange} className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Update Profile Picture
                    </button>

                    <button type="submit" className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Save Changes
                    </button>
                </form>
            ) : (
                <button type="button" onClick={() => setEditMode(true)} className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Edit Profile
                </button>
            )}

            {profile.picture && <img className="mt-4 w-48 h-48 rounded-full object-cover" src={profile.picture} alt="Profile" />}
        </div>
    );
}

export default Profile;
