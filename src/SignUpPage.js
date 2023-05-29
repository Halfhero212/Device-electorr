import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [picture, setPicture] = useState('');
    const [error, setError] = useState(null);

    const auth = getAuth();
    const db = getDatabase();

    const signUpWithEmailAndPassword = async (event) => {
        event.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store their profile information
            const profileRef = ref(db, `users/${user.uid}`);
            await set(profileRef, {
                name: name,
                position: position,
                picture: picture,
            });
        } catch (error) {
            // Handle any errors here
            if (error.code === 'auth/email-already-in-use') {
                setError('There already exists an account with the given email address.');
            } else if (error.code === 'auth/invalid-email') {
                setError('The email address is not valid.');
            } else if (error.code === 'auth/operation-not-allowed') {
                setError('Signing up with Email and Password is not enabled. Please contact the administrator.');
            } else if (error.code === 'auth/weak-password') {
                setError('The password is not strong enough. Please choose a stronger password.');
            } else {
                setError(error.message);
            }
        }
    }

    return (
        <div>
            <h1>Sign Up</h1>
            {error !== null && <div>{error}</div>}
            <form onSubmit={signUpWithEmailAndPassword}>
                <label htmlFor="name">
                    Name:
                    <input
                        type="text"
                        name="userName"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your Name"
                    />
                </label>
                <br />
                <label htmlFor="position">
                    Position:
                    <input
                        type="text"
                        name="userPosition"
                        value={position}
                        onChange={(event) => setPosition(event.target.value)}
                        placeholder="Your Position"
                    />
                </label>
                <br />
                <label htmlFor="picture">
                    Picture URL:
                    <input
                        type="text"
                        name="userPicture"
                        value={picture}
                        onChange={(event) => setPicture(event.target.value)}
                        placeholder="Your Picture URL"
                    />
                </label>
                <br />
                <label htmlFor="email">
                    Email:
                    <input
                        type="email"
                        name="userEmail"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Your Email"
                    />
                </label>
                <br />
                <label htmlFor="password">
                    Password:
                    <input
                        type="password"
                        name="userPassword"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Your Password"
                    />
                </label>
                <br />
                <button type="submit">Sign Up</button>
            </form>
            <p>
                Already have an account? <Link to="/signin">Sign In</Link>
            </p>
        </div>
    );
}

export default SignUpPage;
