const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
try {
const { name, email, password, role } = req.body;

if (!name || !email || !password) {
  return res.status(400).json({
    success: false,
    message: 'Name, email, and password are required',
  });
}

if (password.length < 8) {
  return res.status(400).json({
    success: false,
    message: 'Password must be at least 8 characters long',
  });
}

const normalizedEmail = email.trim().toLowerCase();

const existingUser = await User.findOne({
  email: normalizedEmail,
});

if (existingUser) {
  return res.status(409).json({
    success: false,
    message: 'Email already registered',
  });
}

// Public registration can create employees only.
// Admin and project manager accounts should be created
// through a protected administrative process.
const hashedPassword = await bcrypt.hash(password, 12);

const user = await User.create({
  name: name.trim(),
  email: normalizedEmail,
  password: hashedPassword,
  role: 'employee',
});

return res.status(201).json({
  success: true,
  message: 'Registration successful',
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});


} catch (error) {
if (error.code === 11000) {
return res.status(409).json({
success: false,
message: 'Email already registered',
});
}

console.error('Registration error:', error.message);

return res.status(500).json({
  success: false,
  message: 'Unable to register user',
});


}
});


router.post('/login', async (req, res) => {
try {
const { email, password } = req.body;

if (!email || !password) {
  return res.status(400).json({
    success: false,
    message: 'Email and password are required',
  });
}

const user = await User.findOne({
  email: email.trim().toLowerCase(),
});

if (!user || !user.isActive) {
  return res.status(401).json({
    success: false,
    message: 'Invalid email or password',
  });
}

const isPasswordCorrect = await bcrypt.compare(
  password,
  user.password
);

if (!isPasswordCorrect) {
  return res.status(401).json({
    success: false,
    message: 'Invalid email or password',
  });
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing from .env');
}

const token = jwt.sign(
  {
    userId: user._id.toString(),
    role: user.role,
  },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

return res.status(200).json({
  success: true,
  message: 'Login successful',
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});


} catch (error) {
console.error('Login error:', error.message);

return res.status(500).json({
  success: false,
  message: 'Unable to log in',
});


}
});

module.exports = router;
