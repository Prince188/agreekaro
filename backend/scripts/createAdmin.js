require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = process.argv[2] || process.env.ADMIN_EMAIL;
    const password = process.argv[3] || process.env.ADMIN_PASSWORD;
    const name = process.argv[4] || 'Admin';

    if (!email || !password) {
      console.log('Usage: node scripts/createAdmin.js <email> <password> [name]');
      process.exit(1);
    }

    let user = await User.findOne({ email });
    if (user) {
      user.role = 'admin';
      await user.save();
      console.log(`Existing user promoted to admin: ${email}`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = await User.create({ name, email, password: hashedPassword, role: 'admin' });
      console.log(`Admin created: ${email}`);
    }
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

createAdmin();
