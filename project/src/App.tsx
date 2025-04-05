import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ServiceHighlights from './components/ServiceHighlights';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ServiceApplication from './components/services/ServiceApplication';
import Dashboard from './components/dashboard/Dashboard';
import ProfileSetup from './components/profile/ProfileSetup';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-orange-50">
        <Header />
        <Routes>
          <Route path="/" element={
            <main>
              <Hero />
              <ServiceHighlights />
            </main>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/service/:serviceId" element={<ServiceApplication />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;