# Firebase Authentication Error Resolution Guide

This guide addresses specific Firebase authentication errors encountered in the Full Fuel TV application and provides solutions to fix them.

## Identified Errors

From the error logs, we can identify several issues:

1. **Invalid API Key**: 
   ```
   FirebaseError: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
   ```

2. **Incorrect Key Usage**: 
   ```
   GET https://identitytoolkit.googleapis.com/v1/projects?key=948857661295-onde50eg1hqovq5eferdhk5ssu5ekpt4.apps.googleusercontent.com 400 (Bad Request)
   ```

   This error shows that an OAuth Client ID is being used as a Firebase API key, which is incorrect.

## Root Causes

1. **OAuth Client ID vs Firebase API Key Confusion**:
   - The error shows that an OAuth Client ID (ending with `.apps.googleusercontent.com`) is being used where a Firebase API key should be used.
   - Firebase API keys and OAuth Client IDs are different credentials with different formats.

2. **Incorrect Firebase Configuration**:
   - The log shows `Firebase configuration: {apiKey: true, projectId: true, appId: true}`, which suggests that these values are Boolean flags rather than actual string values.

## Solutions

### 1. Fix Firebase Configuration

Update the firebase.ts file to ensure it's using the correct environmental variables:

```typescript
// INCORRECT (current):
const firebaseConfig = {
  apiKey: Boolean(import.meta.env.VITE_FIREBASE_API_KEY),
  projectId: Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  appId: Boolean(import.meta.env.VITE_FIREBASE_APP_ID),
  // ...other properties missing
};

// CORRECT:
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

### 2. Correct API Key Usage

Make sure you're using the Firebase API key (starts with `AIza...`) and not the OAuth Client ID:

```typescript
// The Firebase API key should be a string that starts with 'AIza'
// Example: AIzaSyC5WF9OtBXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Verify Environment Variables

Make sure the Firebase environment variables are properly set in your project:

1. Obtain the correct Firebase configuration from the Firebase Console:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click the gear icon (⚙️) > Project settings
   - Scroll down to "Your apps" and select your web app
   - Copy the Firebase configuration values

2. Add these values to your environment variables:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   ```

### 4. Confirm the Domain is Authorized

Ensure that your application's domain is authorized in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Authentication > Settings
4. Under "Authorized domains", add your Replit domain: `yourappname.yourreplit-username.repl.co`

### 5. Separate OAuth and Firebase Authentication

Since you're also using Google OAuth directly with the @react-oauth/google library:

1. Make sure you understand the difference between:
   - Direct Google OAuth authentication (using @react-oauth/google)
   - Firebase Google Authentication (using Firebase Auth SDK)

2. Choose one approach and stick with it to avoid confusion.

## Detailed Fix for the "api-key-not-valid" Error

1. **Update firebase.ts**:
   ```typescript
   import { initializeApp } from "firebase/app";
   import { getAuth, GoogleAuthProvider } from "firebase/auth";

   // Log missing environment variables as a warning
   if (!import.meta.env.VITE_FIREBASE_API_KEY) {
     console.warn("VITE_FIREBASE_API_KEY is missing");
   }
   if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
     console.warn("VITE_FIREBASE_PROJECT_ID is missing");
   }
   if (!import.meta.env.VITE_FIREBASE_APP_ID) {
     console.warn("VITE_FIREBASE_APP_ID is missing");
   }

   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
     appId: import.meta.env.VITE_FIREBASE_APP_ID,
   };

   // Initialize Firebase
   const app = initializeApp(firebaseConfig);
   const auth = getAuth(app);
   const googleProvider = new GoogleAuthProvider();

   export { auth, googleProvider };
   ```

2. **Test the Configuration**:
   Add this to your login component to verify the configuration:
   ```typescript
   import { auth } from '../path/to/firebase';

   console.log("Firebase auth initialized:", !!auth);
   ```

## Distinguishing Between Firebase Auth and Direct Google OAuth

Your project seems to be using both Firebase Auth and direct Google OAuth via @react-oauth/google:

1. **Firebase Auth**: Uses Firebase as an intermediary for authentication
   ```typescript
   import { auth, googleProvider } from '../path/to/firebase';
   import { signInWithPopup } from 'firebase/auth';

   const handleFirebaseGoogleSignIn = async () => {
     try {
       const result = await signInWithPopup(auth, googleProvider);
       // Handle successful sign-in
     } catch (error) {
       console.error("Firebase Google sign-in error:", error);
     }
   };
   ```

2. **Direct Google OAuth**: Uses Google's OAuth service directly
   ```typescript
   import { GoogleLogin } from '@react-oauth/google';

   const handleGoogleLogin = (credentialResponse) => {
     // Send token to your backend
     apiRequest('/api/auth/google-login', {
       method: 'POST',
       body: JSON.stringify({ token: credentialResponse.credential })
     });
   };

   // In your component
   <GoogleLogin onSuccess={handleGoogleLogin} />
   ```

**Recommendation**: Choose one approach to avoid confusion. The direct Google OAuth approach with @react-oauth/google is already well-implemented in your code.

## Quick Checklist for Troubleshooting

- [ ] Firebase API key starts with "AIza..." and is not an OAuth Client ID
- [ ] All required Firebase config values are set as environment variables
- [ ] Environment variables are correctly accessed in code (no Boolean conversions)
- [ ] Application domain is authorized in Firebase Console
- [ ] Using a consistent approach for Google authentication
- [ ] Backend properly verifies Google tokens

By following these steps, you should be able to resolve the "api-key-not-valid" error and successfully implement Firebase authentication in your application.