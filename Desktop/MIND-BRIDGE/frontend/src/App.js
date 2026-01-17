import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { login } from './store/slices/authSlice';

import AuthContainer from './pages/auth';
import SetupProfile from './pages/SetupProfile';
import Dashboard from './pages/dashboard';
import MoodLog from './pages/MoodLog';
import CreateCircle from './pages/CreateCircle';
import Circles from './pages/Circles';
import CirclePage from './pages/CirclePage';
import JournalsPage from './pages/JournalsPage';


function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // This request sends your Cookie automatically
        const res = await axios.get('http://localhost:5001/api/auth/me', {
          withCredentials: true
        });

        if (res.data.success) {

          dispatch(login(res.data.user));
        }
      } catch (err) {
        console.log("No active session found");
      } finally {
        // Once the check is done, stop showing the loading screen
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  // While checking the cookie, show a simple loading state 
  // to prevent the Dashboard from flashing "Welcome back, User"
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#509678]"></div>
      </div>
    );
  }

  return (

    <Router>

      <Routes>

        <Route path="/auth" element={<AuthContainer />} />
        <Route path="/" element={<AuthContainer />} />


        <Route path="/setup-profile" element={<SetupProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />


        <Route path="/mood-log" element={<MoodLog />} />
        <Route path="/circles/create" element={<CreateCircle />} />

        <Route path="/circles" element={<Circles />} />
        <Route path="/circles/:id" element={<CirclePage />} />

        <Route path="/journals" element={<JournalsPage />} />

      </Routes>

    </Router>

  );
}

export default App;