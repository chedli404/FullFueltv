import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Import schemas
import { User, IUser } from './user';
import { Product, IProduct } from './product';
import { Order, IOrder } from './order';
import { Ticket, ITicket } from './ticket';
import { Comment, IComment } from './comment';
import { ContentModeration, IContentModeration } from './contentModeration';
import { AdminActionLog, IAdminActionLog } from './adminActionLog';
import { GalleryCollection, IGalleryCollection } from './galleryCollection';

// Video schema
const VideoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  youtubeId: { type: String, required: true },
  thumbnailUrl: { type: String },
  duration: { type: String, required: true },
  views: { type: Number, default: 0 },
  publishedAt: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
  tags: { type: [String], default: [] }
});

// Event schema
const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String },
  eventType: { 
    type: String, 
    required: true,
    enum: ['festival', 'club', 'livestream']
  },
  attending: { type: Number, default: 0 },
  link: { type: String },
  featured: { type: Boolean, default: false }
});

// Mix schema
const MixSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  artist: { type: String, required: true },
  duration: { type: String, required: true },
  imageUrl: { type: String },
  youtubeId: { type: String, required: true },
  soundcloudUrl: { type: String },
  publishedAt: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false }
});

// Gallery schema
const GallerySchema = new Schema({
  title: { type: String, required: true },
  caption: { type: String },
  imageUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  category: { 
    type: String, 
    enum: ['event', 'artist', 'venue', 'other'], 
    default: 'other' 
  },
  publishedAt: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
  instagramUrl: { type: String },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  tags: { type: [String], default: [] },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  views: { type: Number, default: 0 },
  width: { type: Number },
  height: { type: Number },
  altText: { type: String }
});

// Add indexes for gallery
GallerySchema.index({ category: 1 });
GallerySchema.index({ featured: 1 });
GallerySchema.index({ publishedAt: -1 });
GallerySchema.index({ eventId: 1 });
GallerySchema.index({ tags: 1 });
GallerySchema.index({ views: -1 });

// Subscriber schema
const SubscriberSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  subscribeDate: { type: Date, default: Date.now },
  marketingConsent: { type: Boolean, default: false }
});

export async function connectToDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    return mongoose.connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Create models
export const VideoModel = mongoose.models.Video || mongoose.model('Video', VideoSchema);
export const EventModel = mongoose.models.Event || mongoose.model('Event', EventSchema);
export const MixModel = mongoose.models.Mix || mongoose.model('Mix', MixSchema);
export const GalleryModel = mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);
export const SubscriberModel = mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);
export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', User.schema);
export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', Product.schema);
export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', Order.schema);
export const TicketModel = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', Ticket.schema);
export const CommentModel = mongoose.models.Comment || mongoose.model<IComment>('Comment', Comment.schema);
export const ContentModerationModel = mongoose.models.ContentModeration || mongoose.model<IContentModeration>('ContentModeration', ContentModeration.schema);
export const AdminActionLogModel = mongoose.models.AdminActionLog || mongoose.model<IAdminActionLog>('AdminActionLog', AdminActionLog.schema);
export const GalleryCollectionModel = mongoose.models.GalleryCollection || mongoose.model<IGalleryCollection>('GalleryCollection', GalleryCollection.schema);

// Export models for use in the application
export { 
  User, 
  Product, 
  Order, 
  Ticket, 
  Comment, 
  ContentModeration, 
  AdminActionLog, 
  GalleryCollection 
};