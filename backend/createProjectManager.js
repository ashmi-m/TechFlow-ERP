
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createProjectManager() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const name = process.env.PM_NAME;
    const email = process.env.PM_EMAIL?.trim().toLowerCase();
    const password = process.env.PM_PASSWORD;

    if (!name || !email || !password) {
      throw new Error('Project Manager details are missing.');
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('This email already exists. No changes made.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'project_manager',
    });

    console.log('Project Manager account created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createProjectManager();