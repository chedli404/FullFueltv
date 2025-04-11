import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  eventId: string;
  userId: string;
  ticketType: 'general' | 'vip' | 'backstage';
  price: number;
  purchaseDate: Date;
  status: 'active' | 'used' | 'cancelled' | 'expired';
  paymentIntentId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  ticketCode?: string;
}

const TicketSchema: Schema = new Schema({
  eventId: { type: String, required: true },
  userId: { type: String, required: true },
  ticketType: { 
    type: String, 
    enum: ['general', 'vip', 'backstage'], 
    default: 'general',
    required: true 
  },
  price: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['active', 'used', 'cancelled', 'expired'], 
    default: 'active',
    required: true 
  },
  paymentIntentId: { type: String },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending',
    required: true 
  },
  ticketCode: { type: String }
});

// Add indexes for common queries
TicketSchema.index({ userId: 1 });
TicketSchema.index({ eventId: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ paymentStatus: 1 });

export const Ticket = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);