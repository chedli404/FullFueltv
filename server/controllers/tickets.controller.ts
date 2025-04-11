import { Request, Response } from 'express';
import { storage } from '../storage';
import mongoose from 'mongoose';
import { UserModel } from '../models/db';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface User {
      id: string;
      // Add other user properties as needed
    }
  }
}

import Stripe from 'stripe';

// Initialize Stripe if the secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) 
  : null;

export const ticketsController = {
  /**
   * Purchase a ticket for an event
   * POST /api/tickets/purchase
   */
  purchaseTicket: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required to purchase tickets' 
        });
      }

      const { eventId, quantity, paymentMethod, paymentDetails } = req.body;

      if (!eventId || !quantity || !paymentMethod) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: eventId, quantity, or paymentMethod' 
        });
      }

      // Validate that the event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ 
          success: false, 
          message: 'Event not found' 
        });
      }

      // For Stripe payments, validate that payment was successful via the Stripe payment intent
      let paymentSuccessful = true;
      if (paymentMethod === 'stripe') {
        // For Stripe payments, tickets are recorded via the webhook handler
        // This endpoint doesn't need to do anything for Stripe payments
        // as the payment is handled asynchronously
        return res.status(200).json({
          success: true,
          message: 'Stripe payment initiated successfully',
          pendingPayment: true
        });
      } else if (!paymentSuccessful) {
        return res.status(400).json({ 
          success: false, 
          message: 'Payment processing failed' 
        });
      }

      // Update the user's purchased tickets
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Add this event to the user's purchased tickets list
      for (let i = 0; i < quantity; i++) {
        user.purchasedTickets.push(eventId);
      }
      
      await user.save();

      // Update event attendance count
      if (event.attending !== undefined) {
        await storage.updateEvent(eventId, { 
          attending: (event.attending || 0) + quantity 
        });
      }

      // Return success response with ticket details
      return res.status(200).json({
        success: true,
        message: 'Tickets purchased successfully',
        data: {
          event: {
            id: event.id,
            title: event.title,
            date: event.date,
            location: event.location
          },
          quantity,
          totalPrice: quantity * 25.00, // Mock price calculation
          purchaseDate: new Date(),
          paymentMethod
        }
      });
    } catch (error: any) {
      console.error('Error purchasing ticket:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to purchase ticket',
        error: error.message
      });
    }
  },

  /**
   * Get tickets for the current user
   * GET /api/tickets
   */
  getUserTickets: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required to view tickets' 
        });
      }

      // Get the user with populated ticket data
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Get the event details for each purchased ticket
      const ticketPromises = user.purchasedTickets.map(async (eventId: string) => {
        const event = await storage.getEvent(eventId);
        return event ? {
          eventId: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          eventType: event.eventType,
          imageUrl: event.imageUrl
        } : null;
      });

      const tickets = (await Promise.all(ticketPromises)).filter(ticket => ticket !== null);

      // Return the tickets
      return res.status(200).json({
        success: true,
        data: tickets
      });
    } catch (error: any) {
      console.error('Error fetching user tickets:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user tickets',
        error: error.message
      });
    }
  },

  /**
   * Handle Stripe webhook events
   * POST /api/stripe/webhook
   */
  handleStripeWebhook: async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(500).json({ 
        success: false, 
        message: 'Stripe is not configured' 
      });
    }

    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.warn('Missing Stripe webhook secret - webhook verification disabled');
    }

    let event;

    try {
      // Verify the event came from Stripe if we have a webhook secret
      if (endpointSecret && sig) {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          endpointSecret
        );
      } else {
        // If we don't have a webhook secret, just parse the event
        event = req.body;
      }
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        
        try {
          // Extract metadata
          const { eventId, userId, quantity } = paymentIntent.metadata;
          
          if (!eventId || !userId) {
            console.error('Missing eventId or userId in payment intent metadata');
            return res.status(400).json({ 
              success: false, 
              message: 'Missing eventId or userId in payment intent metadata' 
            });
          }

          // Get user and event
          const user = await UserModel.findById(userId);
          const event = await storage.getEvent(eventId);
          
          if (!user || !event) {
            console.error('User or event not found for ticket purchase');
            return res.status(404).json({ 
              success: false, 
              message: 'User or event not found for ticket purchase' 
            });
          }

          // Add tickets to user's purchased tickets
          const ticketCount = parseInt(quantity, 10) || 1;
          for (let i = 0; i < ticketCount; i++) {
            user.purchasedTickets.push(eventId);
          }
          await user.save();

          // Update event attendance count
          if (event.attending !== undefined) {
            await storage.updateEvent(eventId, { 
              attending: (event.attending || 0) + ticketCount 
            });
          }

          console.log(`Successfully recorded ${ticketCount} tickets for user ${userId} to event ${eventId}`);
        } catch (error: any) {
          console.error('Error processing successful payment:', error);
          // We don't want to return an error status as Stripe will retry the webhook
          // Just log the error and return a 200 status
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log(`Payment failed for PaymentIntent: ${failedPayment.id}`);
        break;
        
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  }
};