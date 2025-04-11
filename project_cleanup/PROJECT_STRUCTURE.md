# Full Fuel TV - Project Structure

This document outlines the organization and structure of the Full Fuel TV application, a platform for electronic music media content.

## Project Overview

Full Fuel TV is a platform that allows users to:
- Browse and watch electronic music videos and DJ sets
- View upcoming music events and purchase tickets
- Listen to music mixes
- View photo galleries
- Purchase merchandise from the shop
- User authentication (email/password and Google OAuth)
- Admin functionality for content management

## Directory Structure

### Client-Side (`client/src/`)

- **components/** - Reusable UI components
  - **ui/** - Shadcn UI components
  - **ui/auth/** - Authentication-related UI components
  - **ui/payment/** - Payment-related UI components
  
- **contexts/** - React Context providers
  - **AuthContext.tsx** - Authentication state management
  
- **hooks/** - Custom React hooks
  
- **lib/** - Utility functions and configuration
  - **queryClient.ts** - TanStack Query setup and API request functions
  
- **pages/** - Application routes/pages
  - **admin/** - Admin dashboard and management pages
  - **auth/** - Authentication pages
  - **HomePage.tsx, EventsPage.tsx, etc.** - Main content pages

### Server-Side (`server/`)

- **controllers/** - API route handlers
  - **auth.controller.ts** - Authentication-related endpoints
  - **shop.controller.ts** - E-commerce functionality
  - **tickets.controller.ts** - Event ticket purchase functionality
  - **users.controller.ts** - User management endpoints
  
- **models/** - MongoDB schemas and types
  - **db.ts** - Database connection and schema exports
  - **user.ts** - User model definition
  - **product.ts** - Shop product model
  - **order.ts** - Order model
  
- **index.ts** - Express server setup
- **routes.ts** - API route definitions
- **storage.ts** - Data access layer
- **vite.ts** - Vite configuration for serving the React app

### Shared (`shared/`)

- **schema.ts** - Shared type definitions and validation schemas

## Authentication Flow

1. **Regular Authentication**:
   - User submits email/password through AuthDialog
   - server/controllers/auth.controller.ts validates credentials
   - JWT token is issued for successful authentication
   
2. **Google OAuth Authentication**:
   - User clicks Google Login button in AuthDialog
   - @react-oauth/google handles OAuth flow
   - Token is sent to server/controllers/auth.controller.ts for verification
   - JWT token is issued for successful authentication

## Data Flow

1. **Client-side data fetching**:
   - TanStack Query is used for data fetching and caching
   - API requests go through lib/queryClient.ts
   
2. **Server-side data handling**:
   - Express routes in server/routes.ts receive requests
   - Controllers handle business logic
   - MongoDB models define data structure
   - storage.ts provides a consistent interface for data operations

## Admin Features

- User management
- Content management (videos, events, mixes, gallery)
- Order management
- Event ticket management

## Payment Processing

- Stripe integration for ticket purchases
- Stripe integration for shop product purchases