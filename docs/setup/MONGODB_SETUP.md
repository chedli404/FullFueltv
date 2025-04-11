# MongoDB Setup for Full Fuel TV

This document outlines the setup and structure of the MongoDB database used in the Full Fuel TV application.

## MongoDB Setup

### 1. Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account
2. Create a new project (e.g., "Full Fuel TV")

### 2. Create a Free Cluster

1. Click "Build a Database"
2. Select the free tier (M0)
3. Choose your preferred cloud provider and region
4. Name your cluster (e.g., "fullfuel-cluster")
5. Click "Create"

### 3. Set Up Database Access

1. In the left sidebar, go to "Database Access"
2. Click "Add New Database User"
3. Create a username and password
   - Use a strong, secure password
   - Note: This is different from your MongoDB Atlas account credentials
4. Set user privileges to "Read and write to any database"
5. Click "Add User"

### 4. Configure Network Access

1. In the left sidebar, go to "Network Access"
2. Click "Add IP Address"
3. To allow access from anywhere (not recommended for production), click "Allow Access from Anywhere"
4. For more security, add specific IP addresses
5. Click "Confirm"

### 5. Get Your Connection String

1. In your cluster view, click "Connect"
2. Select "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user's password
5. Replace `<dbname>` with your database name (e.g., "fullfuel")

### 6. Add MongoDB URI to Replit Secrets

1. In your Replit project, go to the Secrets tab (lock icon)
2. Add a new secret with the key `MONGODB_URI`
3. Paste your MongoDB connection string as the value
4. Click "Add Secret"

## Database Schema

The Full Fuel TV application uses the following MongoDB collections:

### Users Collection

```javascript
{
  _id: ObjectId,
  username: String,
  name: String,
  email: String,
  password: String (hashed),
  profilePicture: String (URL),
  role: String (user/admin),
  bio: String,
  favoriteArtists: [String],
  purchasedTickets: [String],
  createdAt: Date
}
```

### Videos Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  videoUrl: String,
  thumbnailUrl: String,
  artist: String,
  duration: Number,
  viewCount: Number,
  featured: Boolean,
  tags: [String],
  uploadDate: Date
}
```

### Events Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  imageUrl: String, 
  venue: String,
  address: String,
  city: String,
  date: Date,
  ticketPrice: Number,
  ticketsAvailable: Number,
  ticketsSold: Number,
  featured: Boolean,
  eventType: String,
  eventUrl: String,
  artists: [String]
}
```

### Mixes Collection

```javascript
{
  _id: ObjectId,
  title: String,
  artist: String,
  description: String,
  audioUrl: String,
  imageUrl: String,
  duration: Number,
  genre: [String],
  featured: Boolean,
  releaseDate: Date
}
```

### Gallery Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  imageUrl: String,
  category: String,
  featured: Boolean,
  uploadDate: Date,
  event: String
}
```

### Subscribers Collection

```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  subscribedAt: Date
}
```

### Products Collection

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  imageUrl: String,
  category: String,
  inStock: Boolean,
  featured: Boolean,
  variants: [
    {
      id: String,
      name: String,
      description: String,
      price: Number,
      imageUrl: String,
      attributes: Object,
      inStock: Boolean
    }
  ],
  createdAt: Date
}
```

### Orders Collection

```javascript
{
  _id: ObjectId,
  userId: String,
  items: [
    {
      productId: String,
      variantId: String,
      quantity: Number,
      price: Number
    }
  ],
  status: String,
  total: Number,
  shippingDetails: {
    name: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  paymentIntentId: String,
  paymentStatus: String,
  createdAt: Date
}
```

## Database Connection

The application connects to MongoDB using Mongoose. The connection setup is located in `server/models/db.ts`.

## Data Access Layer

The `server/storage.ts` file provides a consistent interface for interacting with the database. This abstraction layer allows for:

1. Centralized data access logic
2. Type safety through TypeScript interfaces
3. Consistent error handling
4. Easy swapping of the underlying database technology if needed

## Using MongoDB in Development

For development purposes, you can:

1. Use MongoDB Atlas for cloud-hosted development
2. Set up a local MongoDB server for offline development
3. Use MongoDB Memory Server for testing

## Helpful MongoDB Commands

For maintenance and debugging:

```javascript
// Find all users
db.users.find({})

// Find user by email
db.users.findOne({ email: "user@example.com" })

// Update user role to admin
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)

// Count documents in a collection
db.videos.countDocuments()

// Find featured content
db.events.find({ featured: true })
```

## Monitoring and Maintenance

1. Regularly back up your database using MongoDB Atlas
2. Monitor database performance in the MongoDB Atlas dashboard
3. Set up alerts for unusual activity
4. Index frequently queried fields for better performance