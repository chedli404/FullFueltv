import { Request, Response } from 'express';
import { storage } from '../storage';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'full-fuel-jwt-secret';

// Profile update validation schema
const profileUpdateSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  bio: z.string().optional(),
});

export const usersController = {
  // Get current user's profile
  getProfile: async (req: Request, res: Response) => {
    try {
      // Get the auth token from the request header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      
      // Get the user from the database
      const user = await storage.getUser(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Return the user (excluding password)
      const userProfile = {
        ...user,
        password: undefined
      };
      
      return res.json(userProfile);
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Error fetching profile' });
    }
  },
  
  // Update user profile
  updateProfile: async (req: Request, res: Response) => {
    try {
      // Get the auth token from the request header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      
      // Get the user from the database
      const user = await storage.getUser(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Validate the request body
      const validationResult = profileUpdateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid input',
          details: validationResult.error.errors
        });
      }
      
      const { name, username, bio } = validationResult.data;
      
      // Check if username is already taken (if being changed)
      if (username !== user.username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== user.id) {
          return res.status(400).json({ error: 'Username is already taken' });
        }
      }
      
      // Update the user profile
      const updatedUser = await storage.updateUser(user.id, {
        name,
        username,
        bio
      });
      
      // Return the updated user (excluding password)
      const updatedProfile = {
        ...updatedUser,
        password: undefined
      };
      
      return res.json(updatedProfile);
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Error updating profile' });
    }
  },
  
  // Admin method to list all users (requires admin role)
  listUsers: async (req: Request, res: Response) => {
    try {
      // Get the auth token from the request header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      
      // Get the user from the database
      const user = await storage.getUser(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if the user is an admin
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
      }
      
      // Get all users from the database
      const users = await storage.getUsers();
      
      // Return users with password field removed for security
      const secureUsers = users.map(user => ({
        ...user,
        password: undefined
      }));
      
      return res.json({
        users: secureUsers
      });
    } catch (error) {
      console.error('List users error:', error);
      return res.status(500).json({ error: 'Error listing users' });
    }
  },
  
  // Admin method to update user roles (requires admin role)
  updateUserRole: async (req: Request, res: Response) => {
    try {
      // Get the auth token from the request header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      
      // Get the user from the database
      const currentUser = await storage.getUser(decoded.id);
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if the current user is an admin
      if (currentUser.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
      }
      
      // Get and validate the user ID and role from the request body
      const { userId, role } = req.body;
      
      if (!userId || !role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid user ID or role' });
      }
      
      // Get the target user
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
      }
      
      // Update the user's role
      const updatedUser = await storage.updateUser(userId, { role });
      
      // Return the updated user (excluding password)
      const updatedProfile = {
        ...updatedUser,
        password: undefined
      };
      
      return res.json(updatedProfile);
    } catch (error) {
      console.error('Update user role error:', error);
      return res.status(500).json({ error: 'Error updating user role' });
    }
  }
};