import { z } from "zod";

// Video schema
export const videoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  youtubeId: z.string(),
  thumbnailUrl: z.string().optional(),
  duration: z.string(),
  views: z.number().default(0),
  publishedAt: z.date(),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

export type Video = z.infer<typeof videoSchema>;
export type InsertVideo = Omit<Video, "id">;

// Event schema
export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.date(),
  location: z.string(),
  imageUrl: z.string().optional(),
  eventType: z.enum(["festival", "club", "livestream"]),
  attending: z.number().default(0),
  link: z.string().optional(),
  featured: z.boolean().default(false)
});

export type Event = z.infer<typeof eventSchema>;
export type InsertEvent = Omit<Event, "id">;

// Mix schema
export const mixSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  artist: z.string(),
  duration: z.string(),
  imageUrl: z.string().optional(),
  youtubeId: z.string(),
  soundcloudUrl: z.string().optional(),
  publishedAt: z.date(),
  featured: z.boolean().default(false),
  audioUrl: z.string().optional(),
  genre: z.string().optional(),
 
});

export type Mix = z.infer<typeof mixSchema>;
export type InsertMix = Omit<Mix, "id">;

// Gallery schema
export const gallerySchema = z.object({
  id: z.string(),
  title: z.string(),
  caption: z.string().optional(),
  imageUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  category: z.enum(["event", "artist", "venue", "other"]).default("other"),
  publishedAt: z.date(),
  featured: z.boolean().default(false),
  instagramUrl: z.string().optional(),
  eventId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  createdBy: z.string().optional(),
  views: z.number().default(0),
  width: z.number().optional(),
  height: z.number().optional(),
  altText: z.string().optional(),
  photographer: z.string().optional(),
});

export type Gallery = z.infer<typeof gallerySchema>;
export type InsertGallery = Omit<Gallery, "id">;

// Gallery collection schema for organizing gallery items
export const galleryCollectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  items: z.array(z.string()), // Array of gallery item IDs
  publishedAt: z.date(),
  featured: z.boolean().default(false),
  eventId: z.string().optional(),
  createdBy: z.string().optional(),
  

});

export type GalleryCollection = z.infer<typeof galleryCollectionSchema>;
export type InsertGalleryCollection = Omit<GalleryCollection, "id">;

// Subscriber schema
export const subscriberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  subscribeDate: z.date(),
  marketingConsent: z.boolean().default(false)
});

export type Subscriber = z.infer<typeof subscriberSchema>;
export type InsertSubscriber = Omit<Subscriber, "id">;

// Create the insert schema for subscribers
export const insertSubscriberSchema = subscriberSchema.omit({ 
  id: true, 
  subscribeDate: true 
});

// User schema (for authentication)
export const userSchema = z.object({
  id: z.string(),
  username: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  profilePicture: z.string().optional(),
  role: z.enum(["user", "admin", "artist", "moderator"]).default("user"),
  bio: z.string().optional(),
  favoriteArtists: z.array(z.string()).default([]),
  purchasedTickets: z.array(z.string()).default([]),
  createdAt: z.date(),
  lastLogin: z.date().optional(),
  status: z.enum(["active", "suspended", "deleted"]).default("active"),
  isEmailVerified: z.boolean().default(false),
  phoneNumber: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  socialProfiles: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    soundcloud: z.string().optional(),
    website: z.string().optional()
  }).optional(),
  preferences: z.object({
    emailNotifications: z.boolean().default(true),
    marketingEmails: z.boolean().default(false),
    darkMode: z.boolean().default(false),
    language: z.string().default("en")
  }).optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional()
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = Omit<User, "id" | "createdAt">;

// Schema for frontend authentication
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Schema for registration
export const registerSchema = loginSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }).optional(),
});

// Product schema for shop
export const productSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  imageUrl: z.string(), // Keep for backward compatibility
  images: z.array(z.object({
    url: z.string(),
    alt: z.string().optional(),
    isPrimary: z.boolean().default(false)
  })).default([]),
  category: z.enum(["clothing", "audio", "vinyl", "accessories", "other"]),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  variants: z.array(z.object({
    _id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    price: z.number().optional(),
    imageUrl: z.string().optional(), // Keep for backward compatibility
    images: z.array(z.object({
      url: z.string(),
      alt: z.string().optional(),
      isPrimary: z.boolean().default(false)
    })).default([]),
    attributes: z.record(z.string(), z.string()).default({}), // e.g. { size: "M", color: "Black" }
    inStock: z.boolean().default(true)
  })).default([]),
  createdAt: z.date()
});

export type Product = z.infer<typeof productSchema>;
export type InsertProduct = Omit<Product, "id" | "createdAt">;

// Order schema for shop purchases
export const orderSchema = z.object({
  id: z.string(),
  userId: z.union([z.string(), z.literal('guest')]),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number(),
    price: z.number()
  })),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending"),
  total: z.number(),
  shippingDetails: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string()
  }),
  paymentIntentId: z.string().optional(),
  paymentStatus: z.enum(["pending", "paid", "failed"]).default("pending"),
  createdAt: z.date()
});

export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = Omit<Order, "id" | "createdAt">;

// Ticket schema
export const ticketSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  ticketType: z.enum(["general", "vip", "backstage"]).default("general"),
  price: z.number(),
  purchaseDate: z.date(),
  status: z.enum(["active", "used", "cancelled", "expired"]).default("active"),
  paymentIntentId: z.string().optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).default("pending"),
  ticketCode: z.string().optional()
});

export type Ticket = z.infer<typeof ticketSchema>;
export type InsertTicket = Omit<Ticket, "id">;

// Admin Dashboard schemas
export const dashboardStatsSchema = z.object({
  totalUsers: z.number(),
  totalOrders: z.number(),
  totalRevenue: z.number(),
  totalTicketsSold: z.number(),
  totalVideos: z.number(),
  totalGalleryItems: z.number(),
  totalEvents: z.number(),
  usersThisMonth: z.number(),
  ordersThisMonth: z.number(),
  revenueThisMonth: z.number(),
  ticketsSoldThisMonth: z.number()
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// Admin action log schema
export const adminActionLogSchema = z.object({
  id: z.string(),
  adminId: z.string(),
  action: z.enum([
    "create_user", 
    "update_user", 
    "delete_user", 
    "create_product", 
    "update_product", 
    "delete_product", 
    "create_event", 
    "update_event", 
    "delete_event", 
    "create_video", 
    "update_video", 
    "delete_video", 
    "update_order", 
    "create_gallery_item", 
    "update_gallery_item", 
    "delete_gallery_item",
    "other"
  ]),
  details: z.string(),
  timestamp: z.date(),
  entityId: z.string().optional(),
  entityType: z.enum(["user", "product", "event", "video", "order", "gallery", "other"]).optional()
});

export type AdminActionLog = z.infer<typeof adminActionLogSchema>;
export type InsertAdminActionLog = Omit<AdminActionLog, "id">;

// Content moderation schema
export const contentModerationSchema = z.object({
  id: z.string(),
  contentId: z.string(),
  contentType: z.enum(["comment", "gallery", "video", "user_profile", "other"]),
  reportedBy: z.string(),
  reportReason: z.enum([
    "inappropriate_content", 
    "copyright_violation", 
    "hate_speech", 
    "spam", 
    "misinformation", 
    "personal_attack", 
    "other"
  ]),
  additionalDetails: z.string().optional(),
  status: z.enum(["pending", "reviewed", "actioned", "dismissed"]).default("pending"),
  reviewedBy: z.string().optional(),
  actionTaken: z.enum(["none", "warning", "content_removed", "user_suspended", "user_banned"]).optional(),
  createdAt: z.date(),
  reviewedAt: z.date().optional()
});

export type ContentModeration = z.infer<typeof contentModerationSchema>;
export type InsertContentModeration = Omit<ContentModeration, "id">;

// Content Comment schema
export const commentSchema = z.object({
  id: z.string(),
  contentId: z.string(),
  contentType: z.enum(["video", "gallery", "event", "mix"]),
  userId: z.string(),
  text: z.string(),
  createdAt: z.date(),
  parentId: z.string().optional(),
  status: z.enum(["visible", "hidden", "deleted"]).default("visible"),
  likes: z.number().default(0),
  flags: z.number().default(0)
});

export type Comment = z.infer<typeof commentSchema>;
export type InsertComment = Omit<Comment, "id">;
