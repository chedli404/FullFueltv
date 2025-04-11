# Stripe Payment Integration Guide for Full Fuel TV

This document provides a comprehensive guide for the Stripe payment integration in the Full Fuel TV application.

## Overview

Full Fuel TV uses Stripe to process payments for:
1. Event ticket purchases
2. Merchandise purchases from the shop

## Stripe Account Setup

### 1. Create a Stripe Account

1. Go to [Stripe's website](https://stripe.com/) and sign up for an account
2. Complete the verification process
3. Navigate to the Stripe Dashboard

### 2. Retrieve API Keys

1. In the Stripe Dashboard, go to "Developers" > "API keys"
2. You'll see two types of keys:
   - **Publishable key**: Starts with `pk_` - This is used in your frontend code
   - **Secret key**: Starts with `sk_` - This is used in your backend code
3. During development, use the test keys (starts with `pk_test_` and `sk_test_`)

### 3. Add Stripe API Keys to Replit Secrets

1. In your Replit project, go to the Secrets tab (lock icon)
2. Add the following secrets:
   - `VITE_STRIPE_PUBLIC_KEY`: Your Stripe publishable key (for frontend)
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (for backend)

## Implementation Details

### Ticket Purchase Flow

1. User selects an event and clicks "Purchase Ticket"
2. Application creates a Stripe Payment Intent via `/api/tickets/create-payment-intent`
3. Stripe Elements collects card details securely
4. On successful payment, a ticket record is created and associated with the user

### Shop Purchase Flow

1. User adds items to cart and proceeds to checkout
2. Application creates a Stripe Payment Intent via `/api/shop/create-payment-intent`
3. Stripe Elements collects card details securely
4. On successful payment, an order record is created and associated with the user

## Frontend Implementation

The Stripe integration in the frontend uses:
- `@stripe/react-stripe-js`: React components for Stripe Elements
- `@stripe/stripe-js`: Core Stripe JavaScript SDK

### Key Components

1. **TicketPurchaseModal.tsx**: Handles ticket purchases
   - Initializes Stripe Elements
   - Creates Payment Intent
   - Displays payment form
   - Handles payment confirmation

2. **CheckoutPage.tsx**: Handles merchandise purchases
   - Calculates total based on cart items
   - Creates Payment Intent
   - Displays payment form
   - Processes order after successful payment

## Backend Implementation

The backend handles Stripe payment processing through:

1. **tickets.controller.ts**: 
   - Creates payment intents for ticket purchases
   - Processes ticket purchase after successful payment
   - Handles Stripe webhooks for asynchronous payment events

2. **shop.controller.ts**:
   - Creates payment intents for merchandise purchases
   - Processes orders after successful payment
   - Updates product inventory

## Testing Stripe Integration

### Test Cards

Use these cards for testing different payment scenarios:

1. Successful payment: `4242 4242 4242 4242`
2. Requires authentication: `4000 0025 0000 3155`
3. Payment declined: `4000 0000 0000 9995`

For all test cards:
- Use any future date for expiration date
- Use any 3-digit CVC
- Use any postal code

### Testing Process

1. Add items to cart or select an event ticket
2. Proceed to checkout
3. Enter test card details
4. Verify that payment is processed correctly
5. Check that order/ticket is created in the database
6. Verify that payment appears in Stripe Dashboard (under "Payments")

## Webhook Setup (optional but recommended)

For production use, set up Stripe webhooks to handle asynchronous payment events:

1. In Stripe Dashboard, go to "Developers" > "Webhooks"
2. Add an endpoint URL: `https://your-app-url.repl.co/api/stripe/webhook`
3. Select the events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Stripe will provide a webhook secret
5. Add the webhook secret to Replit Secrets as `STRIPE_WEBHOOK_SECRET`
6. Update the webhook handler in your backend to verify the signature

## Going to Production

When moving to production:

1. Switch from test API keys to live API keys
2. Set up proper error handling and logging
3. Implement email notifications for successful/failed payments
4. Consider adding fraud prevention measures
5. Set up recurring billing if offering subscription services

## Troubleshooting

### Common Issues

1. **Payment Intent Creation Fails**:
   - Check that your Stripe secret key is correct
   - Ensure the amount is in the smallest currency unit (cents for USD)
   - Verify your Stripe account status

2. **Card Element Doesn't Render**:
   - Ensure the Stripe provider is correctly set up in your React component
   - Check browser console for errors
   - Verify that your publishable key is correct

3. **Payment Fails**:
   - Check Stripe Dashboard for the specific error
   - Ensure test cards are used correctly in test mode
   - Verify that the card details are valid

### Error Messages

Stripe provides detailed error messages that can help diagnose issues:

- Card declined errors: Check the decline code in the Stripe Dashboard
- Authentication errors: Ensure 3D Secure is handled correctly
- API errors: Verify API keys and request parameters

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Elements React Documentation](https://stripe.com/docs/stripe-js/react)
- [Stripe Testing Documentation](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)