# Stripe Implementation Details in Full Fuel TV

This document provides a comprehensive overview of the Stripe payment integration in the Full Fuel TV application, focusing on both tickets and merchandise.

## Current Implementation

The application uses Stripe for two main payment flows:

1. **Event Ticket Purchases**
2. **Shop Merchandise Purchases**

## Architecture Overview

### Frontend Components

1. **TicketPurchase.tsx**
   - Creates payment intent for event tickets
   - Renders Stripe Elements for credit card input
   - Handles ticket purchase confirmation

2. **Checkout.tsx**
   - Creates payment intent for merchandise
   - Renders Stripe Elements for credit card input
   - Handles order processing and confirmation

### Backend Controllers

1. **tickets.controller.ts**
   - `/api/tickets/create-payment-intent` - Creates a payment intent for ticket purchases
   - `/api/tickets/purchase` - Completes ticket purchase after successful payment
   - `/api/stripe/webhook` - Handles asynchronous payment events (optional)

2. **shop.controller.ts**
   - `/api/shop/create-payment-intent` - Creates a payment intent for product purchases
   - `/api/shop/orders` - Creates and manages orders

## Detailed Implementation

### Event Ticket Purchase Flow

1. User selects an event and clicks "Purchase Ticket"
2. Frontend creates a payment intent via API request to `/api/tickets/create-payment-intent`
3. Backend calculates the amount and creates a Stripe Payment Intent
4. Frontend receives the client secret and renders Stripe Elements
5. User enters payment details and submits
6. On successful payment, frontend calls `/api/tickets/purchase` to finalize the purchase
7. Backend creates a ticket record associated with the user

### Shop Merchandise Purchase Flow

1. User adds items to cart and proceeds to checkout
2. Frontend creates a payment intent via API request to `/api/shop/create-payment-intent`
3. Backend calculates the total based on items in cart
4. Frontend receives the client secret and renders Stripe Elements
5. User enters payment details and submits
6. On successful payment, backend creates an order record
7. Order status is updated based on payment outcome

## Code Structure

### Frontend Stripe Setup

```typescript
// Main Stripe setup
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe with public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Wrap payment form with Elements provider
<Elements stripe={stripePromise} options={{ clientSecret }}>
  <PaymentForm />
</Elements>
```

### Payment Form Component

```typescript
// Payment form using Stripe Elements
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-complete`,
      },
    });
    
    if (result.error) {
      // Handle error
    } else {
      // Payment succeeded
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit">Pay Now</button>
    </form>
  );
}
```

### Backend Payment Intent Creation

```typescript
// Create payment intent for tickets
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// In tickets.controller.ts
createPaymentIntent: async (req: Request, res: Response) => {
  try {
    const { eventId, quantity } = req.body;
    
    // Get event details
    const event = await storage.getEvent(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Calculate amount
    const amount = event.ticketPrice * quantity * 100; // Convert to cents
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        eventId,
        userId: req.user.id,
        quantity
      }
    });
    
    // Return client secret
    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Error creating payment intent' });
  }
}
```

## Error Handling Improvements

### Frontend Error Handling

```typescript
// Improved error handling in payment form
const handleSubmit = async (e) => {
  e.preventDefault();
  
  setSubmitting(true);
  setErrorMessage('');
  
  if (!stripe || !elements) {
    setErrorMessage('Stripe has not loaded. Please refresh the page.');
    setSubmitting(false);
    return;
  }
  
  const result = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/payment-complete`,
    },
    redirect: 'if_required'
  });
  
  if (result.error) {
    // Handle specific error types
    if (result.error.type === 'card_error') {
      setErrorMessage(result.error.message || 'Your card was declined.');
    } else if (result.error.type === 'validation_error') {
      setErrorMessage('Please check your card details and try again.');
    } else {
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Payment error:', result.error);
    }
    setSubmitting(false);
  } else if (result.paymentIntent) {
    if (result.paymentIntent.status === 'succeeded') {
      // Handle successful payment without redirect
      await finalizePayment(result.paymentIntent.id);
    }
  }
};
```

### Backend Error Handling

```typescript
// Improved backend error handling
createPaymentIntent: async (req: Request, res: Response) => {
  try {
    const { eventId, quantity } = req.body;
    
    // Validate input
    if (!eventId || !quantity || quantity < 1) {
      return res.status(400).json({ 
        error: 'Invalid request parameters. Please provide eventId and quantity.' 
      });
    }
    
    // Get event details with error handling
    let event;
    try {
      event = await storage.getEvent(eventId);
    } catch (dbError) {
      console.error('Database error fetching event:', dbError);
      return res.status(500).json({ error: 'Error retrieving event details.' });
    }
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    
    // Check if tickets are available
    if (event.ticketsAvailable < quantity) {
      return res.status(400).json({ 
        error: `Only ${event.ticketsAvailable} tickets available.` 
      });
    }
    
    // Calculate amount with validation
    if (!event.ticketPrice || event.ticketPrice <= 0) {
      return res.status(400).json({ error: 'Invalid ticket price.' });
    }
    
    const amount = Math.round(event.ticketPrice * quantity * 100); // Convert to cents
    
    // Create payment intent with error handling
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: {
          eventId,
          userId: req.user.id,
          quantity
        }
      });
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      
      // Handle specific Stripe errors
      if (stripeError.type === 'StripeCardError') {
        return res.status(400).json({ error: stripeError.message });
      } else if (stripeError.type === 'StripeInvalidRequestError') {
        return res.status(400).json({ 
          error: 'Invalid payment request. Please check your details.' 
        });
      } else {
        return res.status(500).json({ 
          error: 'An error occurred while processing your payment.' 
        });
      }
    }
    
    // Return client secret
    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      error: 'An unexpected error occurred. Please try again later.' 
    });
  }
}
```

## Testing Scenarios

### Test Card Numbers

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0025 0000 3155 | Requires authentication |
| 4000 0000 0000 9995 | Payment declined |

### Testing Process

1. **Ticket Purchase Testing**
   - Select an event with available tickets
   - Enter quantity and proceed to payment
   - Test with different card numbers
   - Verify ticket creation after successful payment

2. **Shop Purchase Testing**
   - Add items to cart
   - Proceed to checkout
   - Complete payment with test cards
   - Verify order creation and status updates

## Security Considerations

1. **Frontend**
   - Never log or store full card details
   - Use Stripe Elements to avoid handling sensitive data
   - Implement proper error handling to avoid revealing system details

2. **Backend**
   - Secure API endpoints with authentication
   - Validate all user inputs
   - Implement webhook signature verification
   - Use environment variables for API keys

## Webhook Integration

For asynchronous payment events, implement Stripe webhooks:

```typescript
// Webhook handler in tickets.controller.ts
handleStripeWebhook: async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      await handleFailedPayment(failedPaymentIntent);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({ received: true });
}
```

## Troubleshooting Common Issues

1. **Payment Intent Creation Fails**
   - Check if Stripe API key is correct and not expired
   - Verify the amount is a positive integer (cents)
   - Check for network connectivity issues

2. **Card Element Doesn't Render**
   - Ensure Stripe is properly initialized
   - Check if client secret is correctly passed to Elements
   - Verify the DOM element exists for mounting

3. **Payment Confirmation Fails**
   - Check browser console for detailed error messages
   - Verify the card details are valid
   - Check if 3D Secure authentication is properly handled

4. **Webhook Events Not Received**
   - Verify the webhook URL is publicly accessible
   - Check if the webhook is registered in Stripe Dashboard
   - Verify signature verification is implemented correctly