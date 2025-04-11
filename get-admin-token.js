import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'full-fuel-jwt-secret';

// MongoDB connection
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI environment variable is required");
  process.exit(1);
}

async function login(email, password) {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db();
    const usersCollection = database.collection("users");
    
    // Find user by email
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      console.error("User not found");
      return null;
    }
    
    if (user.role !== 'admin') {
      console.error("User is not an admin");
      return null;
    }
    
    // Verify password (optional if you want to verify password)
    if (password && user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.error("Invalid password");
        return null;
      }
    }
    
    // Create JWT
    const token = jwt.sign(
      { id: user._id.toString(), name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
    
  } finally {
    await client.close();
  }
}

// Get admin token without password verification
async function getAdminToken() {
  const adminEmails = [
    'chedlifrinifd@gmail.com',
    'chedlifriniffd@gmail.com',
    'chedlifriniffdd@gmail.com'
  ];
  
  for (const email of adminEmails) {
    const result = await login(email);
    if (result) {
      console.log(`\nAdmin token for ${result.user.name} (${result.user.email}):`);
      console.log("\x1b[32m%s\x1b[0m", result.token);
      console.log("\nUse this token in your requests with the Authorization header:");
      console.log("\x1b[33m%s\x1b[0m", `Authorization: Bearer ${result.token}`);
      console.log("\nExample curl command:");
      console.log("\x1b[36m%s\x1b[0m", `curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${result.token}" -d '{"name":"Test Product","description":"A test product","price":29.99,"category":"clothing","stockQuantity":10,"images":["https://example.com/image.jpg"]}' http://localhost:5000/api/shop/products`);
      return;
    }
  }
  
  console.error("Failed to get admin token for any admin user");
}

// Run the function
getAdminToken().catch(console.error);