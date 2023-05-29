import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function NavigationBar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out', error);
        }
    };

    return (
        <nav className="bg-gray-800 p-4">
            <ul className="flex items-center justify-between text-white space-x-4">
                <li>
                    <Link className="hover:text-blue-400" to="/">Home</Link>
                </li>
                {user && (
                    <>
                        <li>
                            <Link className="hover:text-blue-400" to={`/profile/${user.uid}`}>My Profile</Link>
                        </li>
                        <li>
                            <Link className="hover:text-blue-400" to="/manager">Manager Page</Link>
                        </li>
                        <li>
                            <Link className="hover:text-blue-400" to="/ceo">CEO Page</Link>
                        </li>
                        <li>
                            <button 
                                onClick={handleSignOut}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                            >
                                Sign Out
                            </button>
                        </li>
                    </>
                )}
                {!user && (
                    <>
                        <li>
                            <Link className="hover:text-blue-400" to="/signin">Sign In</Link>
                        </li>
                        <li>
                            <Link className="hover:text-blue-400" to="/signup">Sign Up</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default NavigationBar;
