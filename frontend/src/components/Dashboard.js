import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css';

/* =========================
   CONFIRM MODAL (DELETE)
========================= */
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, actionText }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>{title}</h2>
        <p>{message}</p>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="confirm-btn" onClick={onConfirm}>
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   ACCEPT FORM MODAL
========================= */
const AcceptModal = ({ isOpen, onClose, onSubmit, formData, setFormData, food }) => {
  if (!isOpen || !food) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <h2>Confirm Donation</h2>
        <p><b>{food.title}</b></p>

        <form onSubmit={handleSubmit}>

          <input
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <input
            name="mobileNumber"
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
          />

          <input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <input
            name="pickupTime"
            placeholder="Pickup Time"
            value={formData.pickupTime}
            onChange={handleChange}
            required
          />

          <textarea
            name="notes"
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={handleChange}
          />

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="confirm-btn">
              Send OTP
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

/* =========================
   DASHBOARD
========================= */
const Dashboard = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemId: null
  });

  const [acceptOpen, setAcceptOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    address: '',
    pickupTime: '',
    notes: ''
  });

  /* =========================
     LOGOUT (FIX ADDED)
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };

  /* =========================
     FETCH FOOD
  ========================= */
  const fetchFood = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get('http://localhost:5000/api/food', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFoodItems(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load food");
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     INIT
  ========================= */
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setRole(decoded.role);
      } catch (err) {
        console.log("Token error");
      }
    }

    fetchFood();
  }, [fetchFood]);

  /* =========================
     NGO CLAIM
  ========================= */
  const handleClaim = async (id) => {
    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `http://localhost:5000/api/food/claim/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Claim sent!");
      fetchFood();
    } catch (err) {
      alert(err.response?.data?.message || "Claim failed");
    }
  };

  /* =========================
     OPEN ACCEPT FORM
  ========================= */
  const openAccept = (item) => {
    setSelectedFood(item);
    setFormData({
      fullName: '',
      mobileNumber: '',
      address: item.location || '',
      pickupTime: '',
      notes: ''
    });
    setAcceptOpen(true);
  };

  /* =========================
     SEND OTP (CONFIRM DONATION)
  ========================= */
  const handleAcceptSubmit = async () => {
    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `http://localhost:5000/api/food/confirm-donation/${selectedFood._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("OTP sent to NGO!");
      setAcceptOpen(false);
      fetchFood();
    } catch (err) {
      alert(err.response?.data?.message || "Error sending OTP");
    }
  };

  /* =========================
     VERIFY OTP
  ========================= */
  const handleVerifyOTP = async (id) => {
    const otp = prompt("Enter OTP:");
    if (!otp) return;

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `http://localhost:5000/api/food/verify-otp`,
        { foodId: id, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Completed!");
      fetchFood();
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  };

  /* =========================
     DELETE FOOD
  ========================= */
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');

      await axios.delete(`http://localhost:5000/api/food/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFoodItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filteredFood = foodItems.filter(item =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const status = (s) => (s || '').toLowerCase();

  /* =========================
     UI
  ========================= */
  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="dash-header">
        <h1>{role === 'donor' ? "My Donations" : "Food Nearby"}</h1>

        <div className="header-btns">

          {role === 'donor' && (
            <button
              onClick={() => window.location.href = '/add-food'}
              className="add-btn"
            >
              + List Food
            </button>
          )}

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>

        </div>
      </header>

      {/* SEARCH */}
      <input
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="food-grid">

          {filteredFood.map(item => (
            <div key={item._id} className="food-card">

              <h3>{item.title}</h3>
              <p>{item.location}</p>
              <p>{item.status}</p>

              <div className="card-actions">

                {/* NGO */}
                {role === 'ngo' ? (
                  status(item.status) === 'available' ? (
                    <button onClick={() => handleClaim(item._id)}>
                      Claim
                    </button>
                  ) : (
                    <span>{item.status}</span>
                  )
                ) : (
                  /* DONOR */
                  <>
                    {status(item.status) === 'pending' && (
                      <button onClick={() => openAccept(item)}>
                        Send OTP
                      </button>
                    )}

                    {status(item.status) === 'pending_confirmation' && (
                      <button onClick={() => handleVerifyOTP(item._id)}>
                        Verify OTP
                      </button>
                    )}

                    {status(item.status) === 'available' && (
                      <button onClick={() =>
                        setDeleteModal({ isOpen: true, itemId: item._id })
                      }>
                        Delete
                      </button>
                    )}
                  </>
                )}

              </div>
            </div>
          ))}

        </div>
      )}

      {/* DELETE MODAL */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, itemId: null })}
        onConfirm={() => {
          handleDelete(deleteModal.itemId);
          setDeleteModal({ isOpen: false, itemId: null });
        }}
        title="Delete Listing?"
        message="This action cannot be undone."
        actionText="Delete"
      />

      {/* ACCEPT MODAL */}
      <AcceptModal
        isOpen={acceptOpen}
        onClose={() => setAcceptOpen(false)}
        onSubmit={handleAcceptSubmit}
        formData={formData}
        setFormData={setFormData}
        food={selectedFood}
      />

    </div>
  );
};

export default Dashboard;