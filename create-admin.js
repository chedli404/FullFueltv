// Script to create an admin user
require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

// Set up MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

// Define User Schema to match your application's schema
const UserSchema = new Schema({
  username: String,
  name: String,
  email: { type: String, required: true },
  password: String,
  googleId: String,
  profilePicture: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  bio: String,
  favoriteArtists: [String],
  purchasedTickets: [String],
  createdAt: { type: Date, default: Date.now }
});

// Create User model
const User = mongoose.model('User', UserSchema);

async function createAdminUser(name, email, password) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log(`User with email ${email} already exists`);
      
      // If user exists but is not admin, make them admin
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`Updated ${existingUser.name} (${existingUser.email}) to admin role`);
      } else {
        console.log(`User ${existingUser.name} (${existingUser.email}) is already an admin`);
      }
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const username = email.split('@')[0]; // Simple username from email
      
      const newUser = new User({
        username,
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        favoriteArtists: [],
        purchasedTickets: []
      });
      
      await newUser.save();
      console.log(`Created new admin user: ${name} (${email})`);
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Get arguments from command line
const name = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (!name || !email || !password) {
  console.error('Please provide name, email, and password: node create-admin.js "Admin Name" admin@example.com password123');
  process.exit(1);
}

// Execute the function
createAdminUser(name, email, password);