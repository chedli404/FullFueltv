# Google Authentication Fixes for Full Fuel TV

This document outlines the specific issues with Google Authentication in the Full Fuel TV application and provides code changes to fix them.

## Current Issues

1. **Hardcoded Client ID**: The Google client ID is hardcoded instead of using environment variables
2. **Audience Validation**: The current implementation bypasses audience validation
3. **Token Verification**: Token verification has issues in the fallback error handling

## Recommended Code Changes

### 1. Update Main.tsx to Use Environment Variables

```tsx
// client/src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Check for required environment variable
if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
  console.error('Missing VITE_GOOGLE_CLIENT_ID environment variable');
}

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID as string}>
    <App />
  </GoogleOAuthProvider>
);
```

### 2. Update Auth Controller to Use Environment Variables and Improve Token Verification

```typescript
// server/controllers/auth.controller.ts

// Update the client ID to use environment variable
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.warn('Missing GOOGLE_CLIENT_ID environment variable. Google authentication might not work correctly.');
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Update the googleLogin method
googleLogin: async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Google token is required' });
    }
    
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google authentication is not configured properly' });
    }
    
    try {
      // Verify token with proper audience
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        console.error('Invalid Google token payload:', payload);
        return res.status(400).json({ error: 'Invalid Google token payload' });
      }
      
      // Check if user exists
      let user = await storage.getUserByEmail(payload.email);
      
      if (!user) {
        // Create new user if not exists
        const hashedPassword = await bcrypt.hash(payload.sub || Math.random().toString(), 10);
        const newUser: InsertUser = {
          name: payload.name || 'Google User',
          email: payload.email,
          username: payload.email.split('@')[0],
          password: hashedPassword,
          role: 'user',
          profilePicture: payload.picture,
          favoriteArtists: [],
          purchasedTickets: []
        };
        
        user = await storage.createUser(newUser);
      }
      
      // Create JWT
      const jwtToken = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return user and token
      const userWithoutPassword = {
        ...user,
        password: undefined
      };
      
      return res.json({ token: jwtToken, user: userWithoutPassword });
    } catch (verificationError) {
      // More specific error handling
      console.error('Google token verification error:', verificationError);
      
      if (verificationError.message.includes('audience')) {
        return res.status(400).json({ 
          error: 'Token audience validation failed. Please verify your Google Client ID configuration.' 
        });
      }
      
      if (verificationError.message.includes('expired')) {
        return res.status(400).json({ error: 'Google token has expired. Please try again.' });
      }
      
      return res.status(400).json({ 
        error: 'Invalid Google token. Please try again or use email/password login.' 
      });
    }
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ error: 'Error with Google login' });
  }
}
```

### 3. Update the registerWithGoogle Method as Well

```typescript
// server/controllers/auth.controller.ts

registerWithGoogle: async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Google token is required' });
    }
    
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google authentication is not configured properly' });
    }
    
    try {
      // Verify token with proper audience
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        console.error('Invalid Google token payload:', payload);
        return res.status(400).json({ error: 'Invalid Google token payload' });
      }
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(payload.email);
      
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      
      // Create new user
      const hashedPassword = await bcrypt.hash(payload.sub || Math.random().toString(), 10);
      const newUser: InsertUser = {
        name: payload.name || 'Google User',
        email: payload.email,
        username: payload.email.split('@')[0],
        password: hashedPassword,
        role: 'user',
        profilePicture: payload.picture,
        favoriteArtists: [],
        purchasedTickets: []
      };
      
      const user = await storage.createUser(newUser);
      
      // Create JWT
      const jwtToken = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return user and token
      const userWithoutPassword = {
        ...user,
        password: undefined
      };
      
      return res.json({ token: jwtToken, user: userWithoutPassword });
    } catch (verificationError) {
      // More specific error handling
      console.error('Google token verification error:', verificationError);
      
      if (verificationError.message.includes('audience')) {
        return res.status(400).json({ 
          error: 'Token audience validation failed. Please verify your Google Client ID configuration.' 
        });
      }
      
      if (verificationError.message.includes('expired')) {
        return res.status(400).json({ error: 'Google token has expired. Please try again.' });
      }
      
      return res.status(400).json({ 
        error: 'Invalid Google token. Please try again or use email/password registration.' 
      });
    }
  } catch (error) {
    console.error('Google registration error:', error);
    return res.status(500).json({ error: 'Error with Google registration' });
  }
}
```

### 4. Improve Error Handling in the Frontend

```tsx
// client/src/components/ui/auth/AuthDialog.tsx

const handleGoogleLogin = async (credentialResponse: any) => {
  try {
    if (!credentialResponse.credential) {
      toast({
        title: 'Google login failed',
        description: 'No credential received from Google',
        variant: 'destructive',
      });
      return;
    }
    
    const response = await googleLogin(credentialResponse.credential);
    if (response.token && response.user) {
      login(response.token, response.user);
      toast({
        title: 'Google login successful',
        description: `Welcome, ${response.user.name}!`,
      });
      handleCloseDialog();
    } else {
      toast({
        title: 'Google login failed',
        description: response.error || 'An error occurred with Google login',
        variant: 'destructive',
      });
    }
  } catch (error: any) {
    console.error('Google login error:', error);
    
    let errorMessage = 'An error occurred with Google login';
    
    // Try to extract more specific error message
    if (error.message) {
      if (error.message.includes('audience')) {
        errorMessage = 'Authentication configuration error. Please contact support.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('cancelled')) {
        errorMessage = 'Login was cancelled.';
      } else {
        errorMessage = error.message;
      }
    }
    
    toast({
      title: 'Google login failed',
      description: errorMessage,
      variant: 'destructive',
    });
  }
};
```

## Steps to Implement These Changes

1. Update `client/src/main.tsx` to use the environment variable
2. Update `server/controllers/auth.controller.ts` with the improved token verification
3. Make sure both `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` environment variables are set
4. Update the error handling in `client/src/components/ui/auth/AuthDialog.tsx`

## Additional Configuration Steps

1. Verify that the Google Client ID in your environment variables matches the one in your Google Cloud Console
2. Ensure that your application's domain is properly configured as an authorized JavaScript origin in Google Cloud Console
3. Add both your development and production domains to the authorized origins list

## Expected Behavior After Fixes

1. Google authentication will use environment variables instead of hardcoded values
2. Token verification will properly validate the audience
3. Error messages will be more specific and helpful
4. The authentication flow will be more robust with better error handling