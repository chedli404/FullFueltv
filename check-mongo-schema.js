import mongoose from 'mongoose';
import 'dotenv/config';

async function checkSchema() {
  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:');
    collections.forEach(collection => {
      console.log(' -', collection.name);
    });
    
    // Specifically check the users collection indexes
    try {
      const userIndexes = await mongoose.connection.db.collection('users').indexes();
      console.log('\nUser collection indexes:');
      userIndexes.forEach(index => {
        console.log(' -', JSON.stringify(index));
      });
      
      // Get a sample user document
      const users = await mongoose.connection.db.collection('users').find({}).limit(1).toArray();
      if (users.length > 0) {
        console.log('\nSample user document:');
        console.log(JSON.stringify(users[0], null, 2));
      } else {
        console.log('\nNo users found in the collection');
      }
    } catch (e) {
      console.log('Users collection not found or error:', e.message);
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema();