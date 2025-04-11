// Script to make a user an admin by their email
require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

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

async function makeUserAdmin(email) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    // Update user role to admin
    user.role = 'admin';
    await user.save();

    console.log(`Successfully made user ${user.name} (${user.email}) an admin`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address: node make-admin.js your@email.com');
  process.exit(1);
}

// Execute the function
makeUserAdmin(email);