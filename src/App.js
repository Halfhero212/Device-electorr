/* eslint-disable no-unused-vars */

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import DevicePage from './DevicePage';
import ProfilePage from './ProfilePage';
import SignInPage from './SignInPage';
import SignUpPage from './SignUpPage'; 
import PostDevice from './PostDevice';
import NavigationBar from './NavigationBar';
import ManagerPage from './ManagerPage'; // Import ManagerPage from the correct file
import CEOPage from './CEOPage'; // Import CEOPage
import DeviceDetail from './DeviceDetail';

import './App.css';

function App() {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/device/:deviceId" element={<DevicePage />} />
        <Route path="/device/:deviceId/detail" element={<DeviceDetail />} />
        <Route path="/profile/:managerId" element={<ProfilePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/postdevice" element={<PostDevice />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="/ceo" element={<CEOPage />} />
      </Routes>
    </Router>
  );
}

export default App;
