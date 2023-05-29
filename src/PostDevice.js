import React, { useState } from 'react';
import { db, storage } from './firebase';
import { ref, set, child, push } from 'firebase/database';
import {  ref as refStorage, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

function PostDevice() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const postDevice = async (event) => {
    event.preventDefault();

    try {
      // Upload image to Firebase Storage
      const storageRef = refStorage(storage, `images/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);
      
      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on('state_changed',
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        }, 
        (error) => {
          // Handle unsuccessful uploads
          console.error('Error while uploading image:', error);
        }, 
        () => {
          // Handle successful uploads on complete
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // The new device object
            const device = {
              name,
              description,
              imageUrl: downloadURL,
              votes: {},
            };

            // Get a key for a new device
            const newDeviceRef = push(child(ref(db), 'devices'));

            // Write the new device's data to the database
            set(newDeviceRef, device);
            
            // Reset the form
            setName('');
            setDescription('');
            setImage(null);

            console.log("Device posted successfully");
          });
        }
      );
    } catch (error) {
      console.error('Error while posting new device:', error);
    }
  };

  return (
    <div>
      <form onSubmit={postDevice}>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Description:
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>
        <label>
          Image:
          <input type="file" onChange={handleImageChange} required />
        </label>
        <button type="submit">Post Device</button>
      </form>
    </div>
  );
}

export default PostDevice;
