import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

const AddFood = () => {
  const [formData, setFormData] = useState({
    title: '',
    quantity: '',
    location: '',
    expiryTime: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:5000/api/food',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Food Listed Successfully!");
      window.location.href = '/dashboard';

    } catch (err) {
      alert(err.response?.data?.message || "Failed to list food");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>List Surplus Food</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Food Title"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Quantity"
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Location"
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Expiry Time"
            onChange={(e) =>
              setFormData({ ...formData, expiryTime: e.target.value })
            }
            required
          />

          <button type="submit" className="submit-btn">
            Post Donation
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFood;