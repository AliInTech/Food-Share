import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AddFood from './components/AddFood';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem('token');
  return isAuth ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">

        <nav style={{ padding: '20px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#ef4f5f', margin: 0 }}>FoodShare</h2>
        </nav>

        <Routes>
          <Route path="/auth" element={<Auth />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-food"
            element={
              <ProtectedRoute>
                <AddFood />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;