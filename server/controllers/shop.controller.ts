import { Request, Response } from 'express';

// Extend the Request interface to include the user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; role: string };
  }
}
import { storage } from '../storage';
import Stripe from 'stripe';
import { z } from 'zod';
import { productSchema, orderSchema } from '@shared/schema';
import jwt from 'jsonwebtoken';
import { ProductModel } from 'server/models/db';

const JWT_SECRET = process.env.JWT_SECRET || 'full-fuel-jwt-secret';

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret key');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia'
});

// Schema for creating payment intent for shop items
const shopPaymentIntentSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().min(1)
  })),
  shippingDetails: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string()
  })
});

export const shopController = {
  /**
   * Get all products
   * GET /api/shop/products
   */
  getProducts: async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const products = await storage.getProducts(category);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  },

  /**
   * Get featured products
   * GET /api/shop/products/featured
   */
  getFeaturedProducts: async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const products = await storage.getFeaturedProducts(limit);
      res.json(products);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      res.status(500).json({ error: 'Failed to fetch featured products' });
    }
  },

  /**
   * Get a product by ID
   * GET /api/shop/products/:id
   */
  async getProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  /**
   * Create a new product (admin only)
   * POST /api/shop/products
   */
  createProduct: async (req: Request, res: Response) => {
    try {
      // Check JWT token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      let decoded;
      
      try {
        decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Get user from storage using the ID from token
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      const validationResult = productSchema.omit({ _id: true, createdAt: true }).safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid product data',
          details: validationResult.error.format()
        });
      }
      
      const product = await storage.createProduct({
        ...validationResult.data,
        // Ensure createdAt is handled correctly
        ...(storage.createProduct as any).createdAt && { createdAt: new Date() }
      });
      
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  },

  /**
   * Update a product (admin only)
   * PUT /api/shop/products/:id
   */
  updateProduct: async (req: Request, res: Response) => {
    try {
      // Check JWT token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      let decoded;
      
      try {
        decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Get user from storage using the ID from token
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      const { id } = req.params;
      const existingProduct = await storage.getProduct(id);
      
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const validationResult = productSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid product data',
          details: validationResult.error.format()
        });
      }
      
      const updatedProduct = await storage.updateProduct(id, validationResult.data);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  },

  /**
   * Delete a product (admin only)
   * DELETE /api/shop/products/:id
   */
  deleteProduct: async (req: Request, res: Response) => {
    try {
      // Check JWT token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      let decoded;
      
      try {
        decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Get user from storage using the ID from token
      const user = await storage.getUser(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      const { id } = req.params;
      const result = await storage.deleteProduct(id);
      
      if (!result) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  },

  /**
   * Get all orders (admin only)
   * GET /api/shop/orders
   */
  getOrders: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  },

  /**
   * Get orders for the current user
   * GET /api/shop/user/orders
   */
  getUserOrders: async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const orders = await storage.getUserOrders(user.id);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ error: 'Failed to fetch user orders' });
    }
  },

  /**
   * Get an order by ID
   * GET /api/shop/orders/:id
   */
  getOrder: async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { id } = req.params;
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Only allow admins or the order owner to view the order
      if (user.role !== 'admin' && order.userId !== user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  },

  /**
   * Update an order status (admin only)
   * PUT /api/shop/orders/:id
   */
  updateOrder: async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      const { id } = req.params;
      const existingOrder = await storage.getOrder(id);
      
      if (!existingOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      const validationResult = orderSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid order data',
          details: validationResult.error.format()
        });
      }
      
      const updatedOrder = await storage.updateOrder(id, validationResult.data);
      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  },

  /**
   * Create a payment intent for shop products
   * POST /api/shop/create-payment-intent
   */
  createPaymentIntent: async (req: Request, res: Response) => {
    try {
      // Get user if authenticated, but allow guest checkout
      const user = req.user as any;
      
      const validationResult = shopPaymentIntentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request data',
          details: validationResult.error.format()
        });
      }
      
      const { items, shippingDetails } = validationResult.data;
      
      // Calculate the total price by fetching products
      let total = 0;
      const orderItems = [];
      
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        
        if (!product) {
          return res.status(404).json({ error: `Product not found: ${item.productId}` });
        }
        
        if (!product.inStock) {
          return res.status(400).json({ error: `Product not in stock: ${product.name}` });
        }
        
        let price = product.price;
        let variant = undefined;
        
        // Check variant if provided
        if (item.variantId) {
          variant = product.variants.find(v => v._id === item.variantId);
          
          if (!variant) {
            return res.status(404).json({ error: `Variant not found: ${item.variantId}` });
          }
          
          if (!variant.inStock) {
            return res.status(400).json({ error: `Variant not in stock: ${variant.name}` });
          }
          
          // Use variant price if available
          if (variant.price !== undefined) {
            price = variant.price;
          }
        }
        
        const itemTotal = price * item.quantity;
        total += itemTotal;
        
        orderItems.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: price
        });
      }
      
      // Create the payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId: user?.id || 'guest',
          orderType: 'shop'
        }
      });
      
      // Create an order record
      const order = await storage.createOrder({
        userId: user?.id || 'guest',
        items: orderItems,
        total,
        shippingDetails,
        paymentIntentId: paymentIntent.id,
        status: 'pending',
        paymentStatus: 'pending',
       
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  }
};