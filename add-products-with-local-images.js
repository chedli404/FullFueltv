import 'dotenv/config';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  imageUrl: String,
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean,
    isLocalPath: Boolean
  }],
  category: {
    type: String,
    enum: ['clothing', 'audio', 'vinyl', 'accessories', 'other']
  },
  inStock: Boolean,
  featured: Boolean,
  variants: [{
    id: String,
    name: String,
    price: Number,
    imageUrl: String,
    images: [{
      url: String,
      alt: String,
      isPrimary: Boolean,
      isLocalPath: Boolean
    }],
    attributes: {
      type: Map,
      of: String
    },
    inStock: Boolean
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

async function addProductsWithLocalImages() {
  try {
    // Delete existing products (CAUTION: this will delete all products)
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Sample products with local images
   

    // Insert products
    await Product.insertMany(products);
    console.log(`Added ${products.length} products with local images`);

    // List products
    const addedProducts = await Product.find({}).lean();
    console.log('Products in database:');
    addedProducts.forEach(product => {
      console.log(`- ${product.name} (${product.images.length} images)`);
      
      if (product.variants.length > 0) {
        console.log(`  Variants:`);
        product.variants.forEach(variant => {
          console.log(`  - ${variant.name} (${variant.images.length} images)`);
        });
      }
    });

  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
  }
}

// Run the function
addProductsWithLocalImages();