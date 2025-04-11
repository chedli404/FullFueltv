// Script to add more products to the database
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function addProducts() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db();
    const productsCollection = database.collection('products');
    
    // Sample products to add
    const products = [
      {
        name: "Full Fuel Classic T-Shirt",
        description: "Premium quality cotton t-shirt with the Full Fuel logo. Perfect for casual wear and showing your love for electronic music.",
        price: 29.99,
        imageUrl: "fabrica.jpg",
        category: "clothing",
        inStock: true,
        featured: true,
        variants: [
          {
            id: new ObjectId().toString(),
            name: "Black Small",
            attributes: { color: "Black", size: "S" },
            inStock: true
          },
          {
            id: new ObjectId().toString(),
            name: "Black Medium",
            attributes: { color: "Black", size: "M" },
            inStock: true
          },
          {
            id: new ObjectId().toString(),
            name: "Black Large",
            attributes: { color: "Black", size: "L" },
            inStock: true
          },
          {
            id: new ObjectId().toString(),
            name: "White Small",
            attributes: { color: "White", size: "S" },
            inStock: true
          },
          {
            id: new ObjectId().toString(),
            name: "White Medium",
            attributes: { color: "White", size: "M" },
            inStock: true
          },
          {
            id: new ObjectId().toString(),
            name: "White Large",
            attributes: { color: "White", size: "L" },
            inStock: true
          }
        ],
        createdAt: new Date()
      },
      {
        name: "DJ Headphones",
        description: "Professional DJ headphones with exceptional sound isolation and comfort for long mixing sessions.",
        price: 149.99,
        imageUrl: "dove.jpg",
        category: "audio",
        inStock: true,
        featured: true,
        variants: [
          {
            id: new ObjectId().toString(),
            name: "Black",
            attributes: { color: "Black" },
            inStock: true
          },
          {
            id: new ObjectId().toString(),
            name: "Silver",
            attributes: { color: "Silver" },
            inStock: false
          }
        ],
        createdAt: new Date()
      },
      {
        name: "Limited Edition Vinyl Set",
        description: "Exclusive vinyl collection featuring rare tracks from the top Full Fuel artists. A must-have for vinyl collectors.",
        price: 89.99,
        imageUrl: "cecar.jpg",
        category: "vinyl",
        inStock: true,
        featured: true,
        variants: [],
        createdAt: new Date()
      },
      {
        name: "Full Fuel Hoodie",
        description: "Stay warm at late-night events with this premium Full Fuel hoodie featuring subtle logo embroidery and ultra-soft interior.",
        price: 59.99,
        imageUrl: "julian.jpg",
        category: "clothing",
        inStock: true,
        featured: false,
        variants: [
          {
            id: new ObjectId().toString(),
            name: "Black Small",
            attributes: { color: "Black", size: "S" },
            inStock: true
          },
          {
            id: new ObjectId().toString(),
            name: "Black Medium",
            attributes: { color: "Black", size: "M" },
            inStock: true
          },
          {
            id: new ObjectId().toString(),
            name: "Black Large",
            attributes: { color: "Black", size: "L" },
            inStock: true
          }
        ],
        createdAt: new Date()
      },
      {
        name: "Portable Speaker",
        description: "High-quality portable Bluetooth speaker with deep bass and 12-hour battery life. Perfect for taking the party anywhere.",
        price: 79.99,
        imageUrl: "lowris.jpg",
        category: "audio",
        inStock: true,
        featured: false,
        variants: [],
        createdAt: new Date()
      },
      {
        name: "Festival Survival Kit",
        description: "Everything you need for your next festival experience including a waterproof phone pouch, portable charger, ear plugs, and festival guide.",
        price: 49.99,
        imageUrl: "min8.jpg",
        category: "accessories",
        inStock: true,
        featured: false,
        variants: [],
        createdAt: new Date()
      }
    ];
    
    const result = await productsCollection.insertMany(products);
    console.log(`${result.insertedCount} products added successfully`);
    
  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

addProducts().catch(console.error);
// Export the function for potential import elsewhere
export { addProducts };