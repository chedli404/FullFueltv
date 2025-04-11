import mongoose, { Document, Schema } from 'mongoose';

export interface IContentModeration extends Document {
  contentId: string;
  contentType: 'comment' | 'gallery' | 'video' | 'user_profile' | 'other';
  reportedBy: string;
  reportReason: 'inappropriate_content' | 'copyright_violation' | 'hate_speech' | 'spam' | 'misinformation' | 'personal_attack' | 'other';
  additionalDetails?: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  reviewedBy?: string;
  actionTaken?: 'none' | 'warning' | 'content_removed' | 'user_suspended' | 'user_banned';
  createdAt: Date;
  reviewedAt?: Date;
}

const ContentModerationSchema: Schema = new Schema({
  contentId: { type: String, required: true },
  contentType: { 
    type: String, 
    enum: ['comment', 'gallery', 'video', 'user_profile', 'other'],
    required: true 
  },
  reportedBy: { type: String, required: true },
  reportReason: { 
    type: String,
    enum: ['inappropriate_content', 'copyright_violation', 'hate_speech', 'spam', 'misinformation', 'personal_attack', 'other'],
    required: true
  },
  additionalDetails: { type: String },
  status: { 
    type: String,
    enum: ['pending', 'reviewed', 'actioned', 'dismissed'],
    default: 'pending'
  },
  reviewedBy: { type: String },
  actionTaken: { 
    type: String,
    enum: ['none', 'warning', 'content_removed', 'user_suspended', 'user_banned']
  },
  createdAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date }
});

// Add indexes for efficient querying
ContentModerationSchema.index({ status: 1 });
ContentModerationSchema.index({ contentType: 1 });
ContentModerationSchema.index({ reportedBy: 1 });
ContentModerationSchema.index({ reviewedBy: 1 });
ContentModerationSchema.index({ createdAt: -1 });

export const ContentModeration = mongoose.models.ContentModeration || 
  mongoose.model<IContentModeration>('ContentModeration', ContentModerationSchema);