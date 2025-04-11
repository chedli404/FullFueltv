import mongoose, { Schema, Document } from 'mongoose';

// Image interface
export interface IProductImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
  isLocalPath?: boolean;
}

// Product variant interface
export interface IProductVariant {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string; // Keep for backward compatibility
  images: IProductImage[];
  attributes: Record<string, string>;
  inStock: boolean;
}

// Product interface
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  imageUrl: string; // Keep for backward compatibility
  images: IProductImage[];
  category: 'clothing' | 'audio' | 'vinyl' | 'accessories' | 'other';
  inStock: boolean;
  featured: boolean;
  variants: IProductVariant[];
  createdAt: Date;
}

// Create a Mongoose schema for product images
const ProductImageSchema = new Schema({
  url: { type: String, required: true },
  alt: { type: String },
  isPrimary: { type: Boolean, default: false },
  isLocalPath: { type: Boolean, default: true }
});

// Create a Mongoose schema for product variants
const ProductVariantSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  imageUrl: { type: String }, // Keep for backward compatibility
  images: { type: [ProductImageSchema], default: [] },
  attributes: { type: Map, of: String, default: {} },
  inStock: { type: Boolean, default: true }
});

// Create the Product schema
const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true }, // Keep for backward compatibility
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

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);