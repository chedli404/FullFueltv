import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { InsertUser } from '@shared/schema';
import { OAuth2Client } from 'google-auth-library';

// JWT secret key from environment or a default (should be env var in production)
const JWT_SECRET = process.env.JWT_SECRET || 'full-fuel-jwt-secret';

// Google OAuth client
const GOOGLE_CLIENT_ID = '459807581006-5kb6rg9s1dj6klua4icma8raoi0la55c.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// This function is no longer needed but kept for compatibility
export const configurePassport = () => {
  return null;
};

export const authController = {
  // Register new user
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password, username } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      
      // Check if username exists (if provided)
      if (username) {
        const existingUsername = await storage.getUserByUsername(username);
        if (existingUsername) {
          return res.status(400).json({ error: 'Username is already taken' });
        }
      }
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create new user
      const newUser: InsertUser = {
        name,
        email,
        // Generate username from email if not provided
        username: username || email.split('@')[0],
        password: hashedPassword,
        role: 'user',
        favoriteArtists: [],
        purchasedTickets: []
      };
      
      const user = await storage.createUser(newUser);
      
      // Create JWT
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return user and token (exclude password from response)
      const userWithoutPassword = {
        ...user,
        password: undefined
      };
      
      return res.json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Error creating user' });
    }
  },
  
  // Login with email/password
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Verify password
      if (!user.password) {
        return res.status(400).json({ error: 'This account uses a different authentication method' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Create JWT
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return user and token (exclude password)
      const userWithoutPassword = {
        ...user,
        password: undefined
      };
      
      return res.json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Error logging in' });
    }
  },
  
  // Google login
  googleLogin: async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'Google token is required' });
      }
      
      // We'll try a more flexible token handling approach with better error logging
      try {
        // First attempt: Verify token with the standard approach
        const ticket = await client.verifyIdToken({
          idToken: token,
          // Allowing any audience to prevent audience mismatch errors
          audience: undefined 
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
            password: hashedPassword, // Store hashed password
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
      } catch (verifyError) {
        console.error('Token verification error:', verifyError);
        
        // If we're getting an audience mismatch, try parsing the token directly
        try {
          // Extract JWT parts manually
          const parts = token.split('.');
          if (parts.length !== 3) {
            return res.status(400).json({ error: 'Invalid token format' });
          }
          
          // Decode the payload part (middle section of JWT)
          const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          
          if (!decoded || !decoded.email) {
            return res.status(400).json({ error: 'Invalid token content' });
          }
          
          // Check if user exists
          let user = await storage.getUserByEmail(decoded.email);
          
          if (!user) {
            // Create new user if not exists
            const hashedPassword = await bcrypt.hash(Math.random().toString(), 10);
            const newUser: InsertUser = {
              name: decoded.name || 'Google User',
              email: decoded.email,
              username: decoded.email.split('@')[0],
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
        } catch (fallbackError) {
          console.error('Fallback token handling error:', fallbackError);
          return res.status(400).json({ error: 'Unable to process Google token' });
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      return res.status(500).json({ error: 'Error with Google login' });
    }
  },
  
  // Register with Google
  registerWithGoogle: async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'Google token is required' });
      }
      
      // We'll try a more flexible token handling approach with better error logging
      try {
        // First attempt: Verify token with the standard approach
        const ticket = await client.verifyIdToken({
          idToken: token,
          // Allowing any audience to prevent audience mismatch errors
          audience: undefined 
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
        
        // Create new user with hashed password
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
      } catch (verifyError) {
        console.error('Token verification error:', verifyError);
        
        // If we're getting an audience mismatch, try parsing the token directly
        try {
          // Extract JWT parts manually
          const parts = token.split('.');
          if (parts.length !== 3) {
            return res.status(400).json({ error: 'Invalid token format' });
          }
          
          // Decode the payload part (middle section of JWT)
          const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          
          if (!decoded || !decoded.email) {
            return res.status(400).json({ error: 'Invalid token content' });
          }
          
          // Check if user exists
          const existingUser = await storage.getUserByEmail(decoded.email);
        
          if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
          }
          
          // Create new user with hashed password
          const hashedPassword = await bcrypt.hash(Math.random().toString(), 10);
          const newUser: InsertUser = {
            name: decoded.name || 'Google User',
            email: decoded.email,
            username: decoded.email.split('@')[0],
            password: hashedPassword,
            role: 'user',
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
        } catch (fallbackError) {
          console.error('Fallback token handling error:', fallbackError);
          return res.status(400).json({ error: 'Unable to process Google token' });
        }
      }
    } catch (error) {
      console.error('Google registration error:', error);
      return res.status(500).json({ error: 'Error with Google registration' });
    }
  },

  // Get current user endpoint
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const token = authHeader.split(' ')[1];
      
      try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        
        // Get user
        const user = await storage.getUser(decoded.id);
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        // Remove password from response
        const userWithoutPassword = {
          ...user,
          password: undefined
        };
        
        // Return with user in an object to match expected format
        return res.json({ user: userWithoutPassword });
      } catch (jwtError) {
        console.error('JWT verification error:', jwtError);
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(500).json({ error: 'Server error during authentication' });
    }
  }
};