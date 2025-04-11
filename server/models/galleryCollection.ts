import mongoose, { Document, Schema } from 'mongoose';

export interface IGalleryCollection extends Document {
  title: string;
  description?: string;
  coverImageUrl?: string;
  items: string[]; // Array of gallery item IDs
  publishedAt: Date;
  featured: boolean;
  eventId?: string;
  createdBy?: string;
}

const GalleryCollectionSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  coverImageUrl: { type: String },
  items: { type: [String], default: [] },
  publishedAt: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
  eventId: { type: String },
  createdBy: { type: String }
});

// Add indexes for common queries
GalleryCollectionSchema.index({ featured: 1 });
GalleryCollectionSchema.index({ eventId: 1 });
GalleryCollectionSchema.index({ publishedAt: -1 });

export const GalleryCollection = mongoose.models.GalleryCollection || 
  mongoose.model<IGalleryCollection>('GalleryCollection', GalleryCollectionSchema);