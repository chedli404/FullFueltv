import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminActionLog extends Document {
  adminId: string;
  action: 
    'create_user' | 
    'update_user' | 
    'delete_user' | 
    'create_product' | 
    'update_product' | 
    'delete_product' | 
    'create_event' | 
    'update_event' | 
    'delete_event' | 
    'create_video' | 
    'update_video' | 
    'delete_video' | 
    'update_order' | 
    'create_gallery_item' | 
    'update_gallery_item' | 
    'delete_gallery_item' |
    'other';
  details: string;
  timestamp: Date;
  entityId?: string;
  entityType?: 'user' | 'product' | 'event' | 'video' | 'order' | 'gallery' | 'other';
}

const AdminActionLogSchema: Schema = new Schema({
  adminId: { type: String, required: true },
  action: { 
    type: String, 
    enum: [
      'create_user', 
      'update_user', 
      'delete_user', 
      'create_product', 
      'update_product', 
      'delete_product', 
      'create_event', 
      'update_event', 
      'delete_event', 
      'create_video', 
      'update_video', 
      'delete_video', 
      'update_order', 
      'create_gallery_item', 
      'update_gallery_item', 
      'delete_gallery_item',
      'other'
    ],
    required: true 
  },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  entityId: { type: String },
  entityType: { 
    type: String, 
    enum: ['user', 'product', 'event', 'video', 'order', 'gallery', 'other'] 
  }
});

// Add indexes for efficient querying
AdminActionLogSchema.index({ adminId: 1 });
AdminActionLogSchema.index({ action: 1 });
AdminActionLogSchema.index({ timestamp: -1 });
AdminActionLogSchema.index({ entityType: 1, entityId: 1 });

export const AdminActionLog = mongoose.models.AdminActionLog || 
  mongoose.model<IAdminActionLog>('AdminActionLog', AdminActionLogSchema);