# Full Fuel TV

A dynamic electronic music platform that empowers users to discover, stream, and interact with music content through an innovative and engaging web application.

## Features

- **Content Browsing**: Browse and watch electronic music videos and live DJ sets
- **Events**: View upcoming music events and purchase tickets
- **Music Streaming**: Listen to DJ mixes and featured tracks
- **Gallery**: View photo galleries from past events
- **Shop**: Purchase merchandise including clothing, audio equipment, and vinyl
- **User Authentication**: Email/password and Google OAuth login options
- **User Profiles**: Personalized user profiles with favorite artists and purchase history
- **Admin Dashboard**: Content management for administrators

## Technology Stack

- **Frontend**:
  - React with TypeScript
  - Shadcn UI components
  - TanStack Query for data fetching
  - Zod for form validation
  - Wouter for routing

- **Backend**:
  - Express.js server
  - MongoDB database with Mongoose
  - JWT authentication
  - Stripe payment processing

- **Authentication**:
  - Custom JWT authentication
  - Google OAuth integration

- **Payment Processing**:
  - Stripe integration for ticket purchases
  - Stripe integration for merchandise sales

## Project Structure

The application follows a modern, organized structure:

- `client/` - Frontend React application
- `server/` - Backend Express API
- `shared/` - Shared types and schemas
- `project_cleanup/` - Documentation and guides

For detailed information about the project structure, see `project_cleanup/PROJECT_STRUCTURE.md`.

## Setup Instructions

### Prerequisites

- Node.js
- MongoDB
- Stripe account
- Firebase project (for Google OAuth)

### Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up the required environment variables (see below)
4. Start the development server with `npm run dev`

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Firebase (for frontend)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

## Documentation

For detailed setup and configuration instructions, see:

- [Project Structure](project_cleanup/PROJECT_STRUCTURE.md)
- [Firebase Authentication Setup](project_cleanup/FIREBASE_SETUP.md)
- [MongoDB Setup](project_cleanup/MONGODB_SETUP.md)
- [Stripe Payment Integration](project_cleanup/STRIPE_SETUP.md)

## Admin Tools

Use the following tools for administrative tasks:

- Create admin user: `node create-admin.js "Admin Name" admin@example.com password123`
- Make existing user admin: `node make-admin.js user@example.com`
- Update Firebase configuration: `node update-firebase-config.js`

## License

This project is licensed under the MIT License - see the LICENSE file for details.