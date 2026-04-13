import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('donor');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const url = isLogin
        ? 'http://localhost:5000/api/login'
        : 'http://localhost:5000/api/register';

      const response = await axios.post(url, {
        email,
        password,
        role: isLogin ? undefined : role
      });

      localStorage.setItem('token', response.data.token);
      window.location.href = '/dashboard';

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-toggle">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>

          <button
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>

        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>

        <form className="auth-form" onSubmit={handleSubmit}>

          {!isLogin && (
            <div className="role-selector">
              <label>Join as:</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="donor">Donor</option>
                <option value="ngo">NGO</option>
              </select>
            </div>
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button type="submit" className="submit-btn">
            {isLogin ? "Login" : "Register"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Auth;