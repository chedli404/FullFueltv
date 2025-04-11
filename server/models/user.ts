import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username?: string;
  name: string;
  email: string;
  password?: string;
  profilePicture?: string;
  role: 'user' | 'admin';
  bio?: string;
  favoriteArtists: string[];
  purchasedTickets: string[];
  createdAt: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  bio: {
    type: String,
  },
  favoriteArtists: {
    type: [String],
    default: [],
  },
  purchasedTickets: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  stripeCustomerId: {
    type: String,
  },
  stripeSubscriptionId: {
    type: String,
  },
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);