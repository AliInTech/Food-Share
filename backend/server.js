const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors(
  
));

/* =========================
   ENV CHECK
========================= */
if (!process.env.JWT_SECRET || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ Missing ENV variables");
}

/* =========================
   DB CONNECTION
========================= */

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://foodshare-app:8766237224@cluster0.pfo3g2z.mongodb.net/?appName=Cluster0")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

/* =========================
   MODELS
========================= */
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'donor' }
}));

const Food = mongoose.model('Food', new mongoose.Schema({
  title: String,
  quantity: String,
  location: String,
  expiryTime: String,

  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  status: {
    type: String,
    enum: [
      'available',
      'pending',
      'pending_confirmation',
      'completed'
    ],
    default: 'available'
  },

  otp: { type: String, default: null },

  pickupDetails: {
    fullName: String,
    mobileNumber: String,
    address: String,
    pickupTime: String,
    notes: String
  },

  createdAt: { type: Date, default: Date.now }
}));

/* =========================
   EMAIL SETUP
========================= */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* =========================
   AUTH MIDDLEWARE
========================= */
const authorize = (role) => (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (role && decoded.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* =========================
   AUTH ROUTES
========================= */
app.post('/api/register', async (req, res) => {
  const { email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({ email, password: hashed, role: role || 'donor' });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token, user });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Not found" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token, user });
});

/* =========================
   FOOD APIs
========================= */

// ADD FOOD
app.post('/api/food', authorize('donor'), async (req, res) => {
  const food = await Food.create({
    ...req.body,
    donor: req.user.id
  });

  res.json(food);
});

// GET FOOD
app.get('/api/food', authorize(), async (req, res) => {
  let query = {};

  if (req.user.role === 'donor') {
    query = { donor: req.user.id };
  } else {
    query = { status: 'available' };
  }

  const data = await Food.find(query)
    .populate('donor', 'email')
    .populate('claimedBy', 'email')
    .sort({ createdAt: -1 });

  res.json(data);
});

/* =========================
   NGO CLAIM
========================= */
app.post('/api/food/claim/:id', authorize('ngo'), async (req, res) => {
  const food = await Food.findById(req.params.id);

  if (!food) return res.status(404).json({ message: "Not found" });
  if (food.status !== 'available') {
    return res.status(400).json({ message: "Already claimed" });
  }

  food.status = 'pending';
  food.claimedBy = req.user.id;

  await food.save();

  res.json({ message: "Claimed successfully" });
});
/* =========================
   HEALTH CHECK ROUTE
========================= */
app.get('/', (req, res) => {
  res.json({
    status: "Active",
    message: "SFDP Backend is running",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});  

/* =========================
   FINAL CONFIRM DONATION (UPDATED)
========================= */
app.post('/api/food/confirm-donation/:id', authorize('donor'), async (req, res) => {
  const { fullName, mobileNumber, address, pickupTime, notes } = req.body;

  try {
    const food = await Food.findById(req.params.id).populate('claimedBy');
    if (!food) return res.status(404).json({ message: "Food not found" });

    if (food.donor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your food" });
    }
     if (!food.claimedBy) {
      return res.status(400).json({ message: "No NGO has claimed this food yet" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    food.status = 'pending_confirmation';
    food.otp = otp;
    food.pickupDetails = {
      fullName,
      mobileNumber,
      address,
      pickupTime,
      notes
    };

    await food.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: food.claimedBy.email,
      subject: `🍕 Pickup Confirmed: ${food.title}`,

      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Food Pickup Details</h2>

          <h3>Food Info</h3>
          <p>${food.title} | ${food.quantity}</p>
          <p>${food.location}</p>
          <p>${food.expiryTime}</p>

          <hr/>

          <h3>Donor Info</h3>
          <p><b>Name:</b> ${fullName}</p>
          <p><b>Phone:</b> ${mobileNumber}</p>
          <p><b>Address:</b> ${address}</p>
          <p><b>Pickup Time:</b> ${pickupTime}</p>
          <p><b>Notes:</b> ${notes || "None"}</p>

          <hr/>

          <h2 style="color:green;">OTP: ${otp}</h2>
        </div>
      `
    });

    res.json({ message: "Confirmation sent successfully", food });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message:err.message "Server error" });
  }
});

/* =========================
   VERIFY OTP
========================= */
app.post('/api/food/verify-otp', authorize('donor'), async (req, res) => {
  const { foodId, otp } = req.body;

  const food = await Food.findById(foodId);

  if (!food) return res.status(404).json({ message: "Not found" });

  if (food.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  food.status = 'completed';
  food.otp = null;

  await food.save();

  res.json({ message: "Donation completed successfully" });
});

/* =========================
   DELETE FOOD
========================= */
app.delete('/api/food/:id', authorize('donor'), async (req, res) => {
  const food = await Food.findById(req.params.id);

  if (!food) return res.status(404).json({ message: "Not found" });

  if (food.donor.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not allowed" });
  }

  await Food.findByIdAndDelete(req.params.id);

  res.json({ message: "Deleted" });
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => console.log(`🚀 Server running on ${PORT}`));