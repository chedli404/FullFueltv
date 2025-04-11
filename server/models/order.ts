import mongoose, { Schema, Document } from 'mongoose';

// Order item interface
export interface IOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
}

// Shipping details interface
export interface IShippingDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Order interface
export interface IOrder extends Document {
  userId: string | mongoose.Types.ObjectId;
  items: IOrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shippingDetails: IShippingDetails;
  paymentIntentId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: Date;
}

// Create a Mongoose schema for order items
const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
});

// Create a Mongoose schema for shipping details
const ShippingDetailsSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true }
});

// Create the Order schema
const OrderSchema = new Schema({
  userId: { 
    type: Schema.Types.Mixed, 
    ref: 'User', 
    required: true,
    // This will convert valid ObjectIds to ObjectIds and leave strings as is
    set: (v: string) => {
      try {
        return mongoose.Types.ObjectId.isValid(v) ? new mongoose.Types.ObjectId(v) : v;
      } catch (error) {
        return v;
      }
    }
  },
  items: { type: [OrderItemSchema], required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  total: { type: Number, required: true },
  shippingDetails: { type: ShippingDetailsSchema, required: true },
  paymentIntentId: { type: String },
  paymentStatus: { 
    type: String, 
    required: true,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);