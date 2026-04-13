const ConfirmDonationModal = ({ isOpen, onClose, onSubmit, foodItem }) => {
  const [formData, setFormData] = React.useState({
    fullName: '', mobileNumber: '', address: foodItem?.location || '', 
    pickupTime: '', notes: ''
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box glass-card">
        <h2 className="zomato-red">Confirm Donation</h2>
        <p className="subtitle">Confirm details for: <strong>{foodItem.title}</strong></p>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
          <div className="form-group">
            <input type="text" placeholder="Full Name" required 
                   onChange={e => setFormData({...formData, fullName: e.target.value})} />
            <input type="text" placeholder="Mobile Number" required 
                   onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
            <input type="text" placeholder="Pickup Address" defaultValue={foodItem.location} required 
                   onChange={e => setFormData({...formData, address: e.target.value})} />
            <input type="text" placeholder="Preferred Pickup Time (e.g. 6:00 PM)" required 
                   onChange={e => setFormData({...formData, pickupTime: e.target.value})} />
            <textarea placeholder="Any special instructions/notes?" 
                   onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="accept-btn">Confirm & Send Email</button>
          </div>
        </form>
      </div>
    </div>
  );
};