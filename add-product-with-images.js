import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define ProductImage Schema (should match your model definition)
const ProductImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String },
  isPrimary: { type: Boolean, default: false }
});

// Define ProductVariant Schema (should match your model definition)
const ProductVariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  imageUrl: { type: String },
  images: { type: [ProductImageSchema], default: [] },
  attributes: { type: Map, of: String, default: {} },
  inStock: { type: Boolean, default: true }
});

// Define Product Schema (should match your model definition)
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  images: { type: [ProductImageSchema], default: [] },
  category: { 
    type: String, 
    required: true,
    enum: ['clothing', 'audio', 'vinyl', 'accessories', 'other']
  },
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  variants: { type: [ProductVariantSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

// Create Product Model
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Create a new product with multiple images
async function addProductWithImages() {
  try {
    // Create a product with multiple images
    const newProduct = new Product({
      name: 'Full Fuel T-Shirt Deluxe',
      description: 'Limited edition t-shirt with our iconic logo. Made from premium quality cotton for maximum comfort.',
      price: 29.99,
      imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000',
          alt: 'T-shirt front view',
          isPrimary: true
        },
        {
          url: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=987',
          alt: 'T-shirt back view',
          isPrimary: false
        },
        {
          url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000',
          alt: 'T-shirt worn by model',
          isPrimary: false
        }
      ],
      category: 'clothing',
      inStock: true,
      featured: true,
      variants: [
        {
          name: 'Black Medium',
          price: 29.99,
          imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000',
              alt: 'Black T-shirt front view',
              isPrimary: true
            },
            {
              url: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=987',
              alt: 'Black T-shirt back view',
              isPrimary: false
            }
          ],
          attributes: {
            color: 'Black',
            size: 'M'
          },
          inStock: true
        },
        {
          name: 'White Medium',
          price: 29.99,
          imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=987',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=987',
              alt: 'White T-shirt front view',
              isPrimary: true
            },
            {
              url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1072',
              alt: 'White T-shirt back view',
              isPrimary: false
            }
          ],
          attributes: {
            color: 'White',
            size: 'M'
          },
          inStock: true
        }
      ]
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();
    console.log('Product created successfully:', savedProduct);
    console.log('Product ID:', savedProduct._id);
    console.log('View product at: /shop/products/' + savedProduct._id);
  } catch (error) {
    console.error('Error creating product:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

// Run the function to add the product
addProductWithImages();