import { Request, Response } from 'express';
import { storage } from '../storage';
import Stripe from 'stripe';
import { z } from 'zod';

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret key');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Schema for validating subscription request
const subscriptionRequestSchema = z.object({
  priceId: z.string().optional(),
  paymentMethodId: z.string().optional(),
});

export const subscriptionsController = {
  /**
   * Create a customer in Stripe
   * This is typically called when a user signs up
   */
  createStripeCustomer: async (userId: string, email: string, name?: string) => {
    try {
      // Create a customer in Stripe
      const customer = await stripe.customers.create({
        email,
        name: name || email,
        metadata: {
          userId
        }
      });

      // Update user with Stripe customer ID
      await storage.updateStripeCustomerId(userId, customer.id);

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  },

  /**
   * Get or create a subscription for the user
   * POST /api/subscriptions/create
   */
  getOrCreateSubscription: async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const validationResult = subscriptionRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request data',
          details: validationResult.error.format()
        });
      }

      // Get price ID from request or use default
      const { priceId = process.env.STRIPE_DEFAULT_PRICE_ID } = validationResult.data;
      
      if (!priceId) {
        return res.status(400).json({ error: 'Price ID is required' });
      }

      // Check if user has a Stripe customer ID
      let customerId = user.stripeCustomerId;
      
      // If not, create a new customer
      if (!customerId) {
        const customer = await subscriptionsController.createStripeCustomer(
          user.id, 
          user.email, 
          user.username
        );
        customerId = customer.id;
      }

      // Check if user already has a subscription
      if (user.stripeSubscriptionId) {
        // Retrieve existing subscription
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        // Return client secret if payment is needed
        if (subscription.latest_invoice && typeof subscription.latest_invoice !== 'string') {
          const invoice = subscription.latest_invoice;
          if (invoice.payment_intent && typeof invoice.payment_intent !== 'string') {
            return res.json({
              subscriptionId: subscription.id,
              clientSecret: invoice.payment_intent.client_secret
            });
          }
        }
        
        // If subscription is active, just return it
        return res.json({
          subscriptionId: subscription.id,
          status: subscription.status
        });
      }

      // Otherwise, create a new subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: priceId,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with subscription ID
      await storage.updateStripeSubscriptionId(user.id, subscription.id);

      // Return client secret for payment confirmation
      if (subscription.latest_invoice && typeof subscription.latest_invoice !== 'string' &&
          subscription.latest_invoice.payment_intent && 
          typeof subscription.latest_invoice.payment_intent !== 'string') {
        return res.json({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice.payment_intent.client_secret
        });
      }

      return res.json({
        subscriptionId: subscription.id,
        status: subscription.status
      });
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      return res.status(500).json({ 
        error: 'Failed to create subscription',
        message: error.message
      });
    }
  },

  /**
   * Get user's subscription status
   * GET /api/subscriptions/status
   */
  getSubscriptionStatus: async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!user.stripeSubscriptionId) {
        return res.json({
          hasActiveSubscription: false
        });
      }

      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      
      return res.json({
        hasActiveSubscription: subscription.status === 'active',
        subscriptionStatus: subscription.status,
        subscriptionDetails: {
          id: subscription.id,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        }
      });
    } catch (error: any) {
      console.error('Error fetching subscription status:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch subscription status',
        message: error.message
      });
    }
  },

  /**
   * Cancel a subscription
   * POST /api/subscriptions/cancel
   */
  cancelSubscription: async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!user.stripeSubscriptionId) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      // Cancel the subscription at the end of the billing period
      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      return res.json({
        success: true,
        message: 'Subscription will be canceled at the end of the billing period',
        cancelDate: new Date(subscription.current_period_end * 1000)
      });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      return res.status(500).json({ 
        error: 'Failed to cancel subscription',
        message: error.message
      });
    }
  }
};