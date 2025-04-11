# Firebase Authentication Implementation in Full Fuel TV

This document explains the implementation details of Firebase Authentication in the Full Fuel TV application, specifically focusing on the Google OAuth integration.

## Current Implementation

The application uses Firebase for Google Authentication through the `@react-oauth/google` library on the frontend and the `google-auth-library` on the backend.

### Frontend Implementation

#### 1. Google OAuth Provider Setup

In `client/src/main.tsx`, we wrap the entire application with the Google OAuth Provider:

```tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="459807581006-5kb6rg9s1dj6klua4icma8raoi0la55c.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
```

#### 2. Google Login Component

In `client/src/components/ui/auth/AuthDialog.tsx`, we use the `GoogleLogin` component to handle the OAuth flow:

```tsx
<GoogleLogin
  onSuccess={handleGoogleLogin}
  onError={() => {
    toast({
      title: 'Google login failed',
      description: 'Error authenticating with Google',
      variant: 'destructive',
    });
  }}
/>
```

#### 3. Handling Google Login Response

The `handleGoogleLogin` function processes the credential returned by Google and sends it to our backend:

```tsx
const handleGoogleLogin = async (credentialResponse: any) => {
  try {
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
    toast({
      title: 'Google login failed',
      description: error.message || 'An error occurred with Google login',
      variant: 'destructive',
    });
  }
};
```

#### 4. API Request for Google Authentication

In `client/src/lib/queryClient.ts`, the `googleLogin` function sends the Google ID token to our backend:

```typescript
export async function googleLogin(token: string) {
  const response = await apiRequest("/api/auth/google-login", {
    method: "POST",
    body: JSON.stringify({ token })
  });
  return response;
}
```

### Backend Implementation

#### 1. Google Auth Library Setup

In `server/controllers/auth.controller.ts`, we initialize the Google OAuth client:

```typescript
import { OAuth2Client } from 'google-auth-library';

// Google OAuth client
const GOOGLE_CLIENT_ID = '459807581006-5kb6rg9s1dj6klua4icma8raoi0la55c.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
```

#### 2. Google Login Endpoint

The `googleLogin` endpoint in `auth.controller.ts` handles the Google ID token verification:

```typescript
googleLogin: async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Google token is required' });
    }
    
    try {
      // Verify token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: undefined  // Allowing any audience
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
      // Fallback handling and more error logging...
    }
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ error: 'Error with Google login' });
  }
}
```

## Authentication Flow

1. User clicks the Google login button in the AuthDialog
2. Google OAuth popup appears and user grants permissions
3. Google returns an ID token credential to our frontend
4. Frontend sends the token to our backend via `/api/auth/google-login`
5. Backend verifies the token using the Google Auth Library
6. If valid, backend creates a user if needed, or uses existing user
7. Backend generates a JWT and returns it with user info
8. Frontend stores the JWT in localStorage and updates the auth context
9. User is now authenticated and can access protected routes

## Known Issues and Fixes

### 1. Hardcoded Client ID

The Google client ID is currently hardcoded in both frontend and backend. Best practice is to use environment variables:

- In `client/src/main.tsx`:
  ```tsx
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
  ```
  
- In `server/controllers/auth.controller.ts`:
  ```typescript
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  ```

### 2. Audience Validation Errors

Currently, we're bypassing audience validation with `audience: undefined`. A better approach is to properly set the audience:

```typescript
const ticket = await client.verifyIdToken({
  idToken: token,
  audience: process.env.GOOGLE_CLIENT_ID
});
```

### 3. Error Handling

The current implementation has error handling, but it could be improved with more specific error messages based on different error types from Google's API.

### 4. User Registration Logic

The current logic creates a new user if one doesn't exist with the email from Google. This might need to be adjusted based on specific business requirements (e.g., requiring explicit registration).

## Recommended Improvements

1. **Use Environment Variables**: Replace hardcoded client IDs with environment variables.

2. **Proper Audience Validation**: Configure proper audience validation in the token verification.

3. **Refresh Token Handling**: Implement refresh token logic for long-term sessions.

4. **Better Error Logging**: Improve error logging with structured information.

5. **User Profile Enhancement**: Store additional Google profile information like profile picture URL.

6. **Session Management**: Consider using server-side sessions instead of just JWTs for better security.

7. **Testing**: Add comprehensive testing for the authentication flow.

## Configuration Requirements

To ensure Google Authentication works properly, the following configuration is required:

1. **Google Cloud Console**:
   - Create a project
   - Configure OAuth consent screen
   - Create OAuth credentials
   - Add authorized JavaScript origins matching your app's domains
   - Add authorized redirect URIs matching your app's domains

2. **Environment Variables**:
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
   - `VITE_GOOGLE_CLIENT_ID`: Same as GOOGLE_CLIENT_ID, but for frontend

3. **Firebase Console**:
   - Enable Google Sign-In method
   - Add authorized domains to match your app

## Troubleshooting

For common authentication issues, check:

1. **Token Mismatch**: Ensure the client ID is the same on frontend and backend
2. **Redirect URI Mismatch**: Verify that your app's domain is registered in Google Console
3. **CORS Issues**: Check for CORS errors in browser console
4. **Token Expiration**: Verify that tokens are not expired
5. **Audience Validation**: Ensure proper audience configuration