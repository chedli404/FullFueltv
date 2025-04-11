import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  contentId: string;
  contentType: 'video' | 'gallery' | 'event' | 'mix';
  userId: string;
  text: string;
  createdAt: Date;
  parentId?: string;
  status: 'visible' | 'hidden' | 'deleted';
  likes: number;
  flags: number;
}

const CommentSchema: Schema = new Schema({
  contentId: { type: String, required: true },
  contentType: { 
    type: String, 
    enum: ['video', 'gallery', 'event', 'mix'], 
    required: true 
  },
  userId: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  parentId: { type: String },
  status: { 
    type: String,
    enum: ['visible', 'hidden', 'deleted'],
    default: 'visible'
  },
  likes: { type: Number, default: 0 },
  flags: { type: Number, default: 0 }
});

// Add indexes for efficient querying
CommentSchema.index({ contentId: 1, contentType: 1 });
CommentSchema.index({ userId: 1 });
CommentSchema.index({ parentId: 1 });
CommentSchema.index({ status: 1 });
CommentSchema.index({ createdAt: -1 });

export const Comment = mongoose.models.Comment || 
  mongoose.model<IComment>('Comment', CommentSchema);