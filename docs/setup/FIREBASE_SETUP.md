# Firebase Authentication Setup for Full Fuel TV

This document provides detailed instructions for setting up Firebase Authentication for the Full Fuel TV application.

## Prerequisites

1. A Google account
2. Access to the Firebase Console (https://console.firebase.google.com/)

## Step 1: Create Firebase Project

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Click "Add project"
3. Enter a project name (e.g., "Full Fuel TV")
4. Follow the setup wizard (you can disable Google Analytics if not needed)
5. Click "Create project"

## Step 2: Register Web Application

1. In your Firebase project dashboard, click the web icon (`</>`) to add a web app
2. Enter a name for your app (e.g., "Full Fuel TV Web")
3. Check "Also set up Firebase Hosting" if desired
4. Click "Register app"
5. You'll see Firebase configuration information - we'll need this in Step 4

## Step 3: Set Up Authentication

1. In the Firebase Console, navigate to "Authentication" in the left sidebar
2. Click "Get started"
3. In the "Sign-in method" tab, enable the following providers:
   - Email/Password
   - Google
4. For the Google provider, click the pencil icon to edit:
   - Choose a support email
   - Save
5. In the "Settings" tab under "Authorized domains":
   - Add your Replit domain: `yourappname.yourreplit-username.repl.co`
   - Add your custom domain if you have one
   - Note: localhost is already authorized by default

## Step 4: Set Environment Variables in Replit

1. From the Firebase Console, go to Project Settings (gear icon in top left)
2. In the "General" tab, scroll down to "Your apps" section
3. Find your web app and click the config icon (</>) 
4. Copy the Firebase configuration values

5. In your Replit project:
   - Go to the Secrets tab (lock icon)
   - Add the following secrets:
     - `VITE_FIREBASE_API_KEY`: Your Firebase API key
     - `VITE_FIREBASE_PROJECT_ID`: Your Firebase project ID
     - `VITE_FIREBASE_APP_ID`: Your Firebase app ID

## Step 5: Set Up OAuth Consent Screen in Google Cloud Console

1. Go to the Google Cloud Console: https://console.cloud.google.com/
2. Make sure you're using the same Google account as your Firebase project
3. Select your Firebase project from the dropdown at the top
4. Navigate to "APIs & Services" > "OAuth consent screen"
5. Select "External" user type (unless you have a Google Workspace)
6. Fill in the required app information:
   - App name
   - User support email
   - Developer contact information
7. Click "Save and Continue"
8. For scopes, add the following:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
9. Click "Save and Continue"
10. Add test users if in testing mode
11. Click "Save and Continue"

## Step 6: Configure OAuth Credentials

1. In Google Cloud Console, navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the Application type
4. Enter a name for your OAuth client
5. Under "Authorized JavaScript origins", add:
   - Your Replit domain: `https://yourappname.yourreplit-username.repl.co`
   - `http://localhost:3000` for local development
6. Under "Authorized redirect URIs", add:
   - Your Replit domain: `https://yourappname.yourreplit-username.repl.co`
   - `http://localhost:3000` for local development
7. Click "Create"
8. Note your OAuth client ID and client secret

## Step 7: Update Environment Variables

1. Add your OAuth client ID and secret to Replit Secrets:
   - `GOOGLE_CLIENT_ID`: Your OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your OAuth client secret

## Troubleshooting

### Redirect URI Mismatch

If you see a "redirect_uri_mismatch" error:
1. Ensure your domain is added to both:
   - Firebase Console > Authentication > Settings > Authorized domains
   - Google Cloud Console > APIs & Services > Credentials > OAuth Client ID > Authorized redirect URIs
2. Make sure the URI used in the application exactly matches what you've configured

### Token Validation Errors

If you see "Wrong recipient" or "payload audience != requiredAudience" errors:
1. Verify that the `GOOGLE_CLIENT_ID` environment variable exactly matches your OAuth client ID
2. Ensure you're using the correct OAuth client ID with the Google Auth library

### Invalid Origin

If you see an "invalid origin" error:
1. Check that your domain is added to "Authorized JavaScript origins" in the Google Cloud Console
2. Make sure the domain includes the protocol (https://) and has no trailing slash

## Testing Authentication

1. In your application, navigate to the login page
2. Try logging in with email/password
3. Try logging in with Google
4. Verify that the user is created in Firebase Console > Authentication > Users