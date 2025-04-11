// import { Variant } from 'framer-motion'; // Commented out to avoid conflict
// import { Variant } from 'framer-motion'; // Commented out to avoid conflict
interface Variant {
  id?: string;
  name: string;
  price: number;
  imageUrl?: string;
  images?: { url: string; alt: string; isPrimary: boolean }[];
  attributes?: Record<string, string>;
  inStock: boolean;
}
import { 
  VideoModel, 
  EventModel, 
  MixModel, 
  GalleryModel, 
  SubscriberModel, 
  UserModel,
  ProductModel,
  OrderModel,
  connectToDatabase 
} from './models/db';
import { 
  Video, InsertVideo, 
  Event, InsertEvent, 
  Mix, InsertMix, 
  Gallery, InsertGallery, 
  Subscriber, InsertSubscriber, 
  User, InsertUser,
  Product, InsertProduct,
  Order, InsertOrder,
  // Variant // Ensure Variant is exported from '@shared/schema'
} from '@shared/schema';

export interface IStorage {
  // Video methods
  getVideos(): Promise<Video[]>;
  getFeaturedVideos(limit?: number): Promise<Video[]>;
  getVideo(id: string): Promise<Video | null>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, video: Partial<Video>): Promise<Video | null>;
  deleteVideo(id: string): Promise<boolean>;

  // Event methods
  getEvents(): Promise<Event[]>;
  getUpcomingEvents(limit?: number): Promise<Event[]>;
  getEvent(id: string): Promise<Event | null>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<Event>): Promise<Event | null>;
  deleteEvent(id: string): Promise<boolean>;

  // Mix methods
  getMixes(): Promise<Mix[]>;
  getFeaturedMixes(limit?: number): Promise<Mix[]>;
  getMix(id: string): Promise<Mix | null>;
  createMix(mix: InsertMix): Promise<Mix>;
  updateMix(id: string, mix: Partial<Mix>): Promise<Mix | null>;
  deleteMix(id: string): Promise<boolean>;

  // Gallery methods
  getGallery(): Promise<Gallery[]>;
  getGalleryItem(id: string): Promise<Gallery | null>;
  createGalleryItem(item: InsertGallery): Promise<Gallery>;
  updateGalleryItem(id: string, item: Partial<Gallery>): Promise<Gallery | null>;
  deleteGalleryItem(id: string): Promise<boolean>;

  // Subscriber methods
  getSubscribers(): Promise<Subscriber[]>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  deleteSubscriber(id: string): Promise<boolean>;

  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | null>;
  updateStripeCustomerId(userId: string, customerId: string): Promise<User | null>;
  updateStripeSubscriptionId(userId: string, subscriptionId: string): Promise<User | null>;
  
  // Product methods
  getProducts(category?: string): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Order methods
  getOrders(): Promise<Order[]>;
  getUserOrders(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<Order>): Promise<Order | null>;
}

export class MongoStorage implements IStorage {
  constructor() {
    connectToDatabase();
  }
  getFeaturedProducts(limit?: number): Promise<Product[]> {
    throw new Error('Method not implemented.');
  }
  getProduct(id: string): Promise<Product | null> {
    throw new Error('Method not implemented.');
  }
  createProduct(product: InsertProduct): Promise<Product> {
    throw new Error('Method not implemented.');
  }
  updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
    throw new Error('Method not implemented.');
  }
  deleteProduct(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getOrders(): Promise<Order[]> {
    throw new Error('Method not implemented.');
  }
  getUserOrders(userId: string): Promise<Order[]> {
    throw new Error('Method not implemented.');
  }
  getOrder(id: string): Promise<Order | null> {
    throw new Error('Method not implemented.');
  }
  createOrder(order: InsertOrder): Promise<Order> {
    throw new Error('Method not implemented.');
  }
  updateOrder(id: string, order: Partial<Order>): Promise<Order | null> {
    throw new Error('Method not implemented.');
  }

  // Video methods
  async getVideos(): Promise<Video[]> {
    const videos = await VideoModel.find().sort({ publishedAt: -1 });
    return videos.map(video => ({
      id: video._id.toString(),
      title: video.title,
      description: video.description,
      youtubeId: video.youtubeId,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      views: video.views,
      publishedAt: new Date(video.publishedAt),
      featured: video.featured,
      tags: video.tags
    }));
  }

  async getFeaturedVideos(limit: number = 3): Promise<Video[]> {
    const videos = await VideoModel.find({ featured: true }).sort({ publishedAt: -1 }).limit(limit);
    return videos.map(video => ({
      id: video._id.toString(),
      title: video.title,
      description: video.description,
      youtubeId: video.youtubeId,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      views: video.views,
      publishedAt: new Date(video.publishedAt),
      featured: video.featured,
      tags: video.tags
    }));
  }

  async getVideo(id: string): Promise<Video | null> {
    try {
      const video = await VideoModel.findById(id);
      if (!video) return null;
      
      return {
        id: video._id.toString(),
        title: video.title,
        description: video.description,
        youtubeId: video.youtubeId,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.views,
        publishedAt: new Date(video.publishedAt),
        featured: video.featured,
        tags: video.tags
      };
    } catch (error) {
      return null;
    }
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const newVideo = await VideoModel.create(video);
    return {
      id: newVideo._id.toString(),
      title: newVideo.title,
      description: newVideo.description,
      youtubeId: newVideo.youtubeId,
      thumbnailUrl: newVideo.thumbnailUrl,
      duration: newVideo.duration,
      views: newVideo.views,
      publishedAt: new Date(newVideo.publishedAt),
      featured: newVideo.featured,
      tags: newVideo.tags
    };
  }

  async updateVideo(id: string, video: Partial<Video>): Promise<Video | null> {
    try {
      const updatedVideo = await VideoModel.findByIdAndUpdate(id, video, { new: true });
      if (!updatedVideo) return null;
      
      return {
        id: updatedVideo._id.toString(),
        title: updatedVideo.title,
        description: updatedVideo.description,
        youtubeId: updatedVideo.youtubeId,
        thumbnailUrl: updatedVideo.thumbnailUrl,
        duration: updatedVideo.duration,
        views: updatedVideo.views,
        publishedAt: new Date(updatedVideo.publishedAt),
        featured: updatedVideo.featured,
        tags: updatedVideo.tags
      };
    } catch (error) {
      return null;
    }
  }

  async deleteVideo(id: string): Promise<boolean> {
    try {
      const result = await VideoModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    const events = await EventModel.find().sort({ date: 1 });
    return events.map(event => ({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: new Date(event.date),
      location: event.location,
      imageUrl: event.imageUrl,
      eventType: event.eventType as "festival" | "club" | "livestream",
      attending: event.attending,
      link: event.link,
      featured: event.featured
    }));
  }

  async getUpcomingEvents(limit: number = 3): Promise<Event[]> {
    const now = new Date();
    const events = await EventModel.find({ date: { $gte: now } }).sort({ date: 1 }).limit(limit);
    return events.map(event => ({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: new Date(event.date),
      location: event.location,
      imageUrl: event.imageUrl,
      eventType: event.eventType as "festival" | "club" | "livestream",
      attending: event.attending,
      link: event.link,
      featured: event.featured
    }));
  }

  async getEvent(id: string): Promise<Event | null> {
    try {
      const event = await EventModel.findById(id);
      if (!event) return null;
      
      return {
        id: event._id.toString(),
        title: event.title,
        description: event.description,
        date: new Date(event.date),
        location: event.location,
        imageUrl: event.imageUrl,
        eventType: event.eventType as "festival" | "club" | "livestream",
        attending: event.attending,
        link: event.link,
        featured: event.featured
      };
    } catch (error) {
      return null;
    }
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const newEvent = await EventModel.create(event);
    return {
      id: newEvent._id.toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: new Date(newEvent.date),
      location: newEvent.location,
      imageUrl: newEvent.imageUrl,
      eventType: newEvent.eventType as "festival" | "club" | "livestream",
      attending: newEvent.attending,
      link: newEvent.link,
      featured: newEvent.featured
    };
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<Event | null> {
    try {
      const updatedEvent = await EventModel.findByIdAndUpdate(id, event, { new: true });
      if (!updatedEvent) return null;
      
      return {
        id: updatedEvent._id.toString(),
        title: updatedEvent.title,
        description: updatedEvent.description,
        date: new Date(updatedEvent.date),
        location: updatedEvent.location,
        imageUrl: updatedEvent.imageUrl,
        eventType: updatedEvent.eventType as "festival" | "club" | "livestream",
        attending: updatedEvent.attending,
        link: updatedEvent.link,
        featured: updatedEvent.featured
      };
    } catch (error) {
      return null;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      const result = await EventModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  // Mix methods
  async getMixes(): Promise<Mix[]> {
    const mixes = await MixModel.find().sort({ publishedAt: -1 });
    return mixes.map(mix => ({
      id: mix._id.toString(),
      title: mix.title,
      description: mix.description,
      artist: mix.artist,
      duration: mix.duration,
      imageUrl: mix.imageUrl,
      youtubeId: mix.youtubeId,
      soundcloudUrl: mix.soundcloudUrl,
      publishedAt: new Date(mix.publishedAt),
      featured: mix.featured
    }));
  }

  async getFeaturedMixes(limit: number = 1): Promise<Mix[]> {
    const mixes = await MixModel.find({ featured: true }).sort({ publishedAt: -1 }).limit(limit);
    return mixes.map(mix => ({
      id: mix._id.toString(),
      title: mix.title,
      description: mix.description,
      artist: mix.artist,
      duration: mix.duration,
      imageUrl: mix.imageUrl,
      youtubeId: mix.youtubeId,
      soundcloudUrl: mix.soundcloudUrl,
      publishedAt: new Date(mix.publishedAt),
      featured: mix.featured
    }));
  }

  async getMix(id: string): Promise<Mix | null> {
    try {
      const mix = await MixModel.findById(id);
      if (!mix) return null;
      
      return {
        id: mix._id.toString(),
        title: mix.title,
        description: mix.description,
        artist: mix.artist,
        duration: mix.duration,
        imageUrl: mix.imageUrl,
        youtubeId: mix.youtubeId,
        soundcloudUrl: mix.soundcloudUrl,
        publishedAt: new Date(mix.publishedAt),
        featured: mix.featured
      };
    } catch (error) {
      return null;
    }
  }

  async createMix(mix: InsertMix): Promise<Mix> {
    const newMix = await MixModel.create(mix);
    return {
      id: newMix._id.toString(),
      title: newMix.title,
      description: newMix.description,
      artist: newMix.artist,
      duration: newMix.duration,
      imageUrl: newMix.imageUrl,
      youtubeId: newMix.youtubeId,
      soundcloudUrl: newMix.soundcloudUrl,
      publishedAt: new Date(newMix.publishedAt),
      featured: newMix.featured
    };
  }

  async updateMix(id: string, mix: Partial<Mix>): Promise<Mix | null> {
    try {
      const updatedMix = await MixModel.findByIdAndUpdate(id, mix, { new: true });
      if (!updatedMix) return null;
      
      return {
        id: updatedMix._id.toString(),
        title: updatedMix.title,
        description: updatedMix.description,
        artist: updatedMix.artist,
        duration: updatedMix.duration,
        imageUrl: updatedMix.imageUrl,
        youtubeId: updatedMix.youtubeId,
        soundcloudUrl: updatedMix.soundcloudUrl,
        publishedAt: new Date(updatedMix.publishedAt),
        featured: updatedMix.featured
      };
    } catch (error) {
      return null;
    }
  }

  async deleteMix(id: string): Promise<boolean> {
    try {
      const result = await MixModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  // Gallery methods
  async getGallery(): Promise<Gallery[]> {
    const gallery = await GalleryModel.find().sort({ publishedAt: -1 });
    return gallery.map(item => ({
      id: item._id.toString(),
      title: item.title || "Untitled", // Provide a default or fetch from the item
      category: item.category || "other", // Provide a default or fetch from the item
      imageUrl: item.imageUrl,
      featured: item.featured || false, // Provide a default or fetch from the item
      views: item.views || 0, // Provide a default or fetch from the item
      publishedAt: new Date(item.publishedAt),
      tags: item.tags || [], // Provide a default or fetch from the item
      caption: item.caption,
      thumbnailUrl: item.thumbnailUrl,
      instagramUrl: item.instagramUrl,
      eventId: item.eventId ? item.eventId.toString() : undefined
    }));
  }

  async getGalleryItem(id: string): Promise<Gallery | null> {
    try {
      const item = await GalleryModel.findById(id);
      if (!item) return null;
      
      return {
        id: item._id.toString(),
        title: item.title || "Untitled", // Provide a default or fetch from the item
        category: item.category || "other", // Provide a default or fetch from the item
        imageUrl: item.imageUrl,
        featured: item.featured || false, // Provide a default or fetch from the item
        views: item.views || 0, // Provide a default or fetch from the item
        publishedAt: new Date(item.publishedAt),
        tags: item.tags || [], // Provide a default or fetch from the item
        caption: item.caption,
        thumbnailUrl: item.thumbnailUrl,
        instagramUrl: item.instagramUrl,
        eventId: item.eventId ? item.eventId.toString() : undefined
      };
    } catch (error) {
      return null;
    }
  }

  async createGalleryItem(item: InsertGallery): Promise<Gallery> {
    const newItem = await GalleryModel.create(item);
    return {
      id: newItem._id.toString(),
      title: newItem.title || "Untitled", // Default or fetched value
      views: newItem.views || 0, // Default or fetched value
      featured: newItem.featured || false, // Default or fetched value
      tags: newItem.tags || [], // Default or fetched value
      category: newItem.category || "other", // Default or fetched value
      caption: newItem.caption,
      imageUrl: newItem.imageUrl,
      thumbnailUrl: newItem.thumbnailUrl,
      publishedAt: new Date(newItem.publishedAt),
      instagramUrl: newItem.instagramUrl,
      eventId: newItem.eventId ? newItem.eventId.toString() : undefined
    };
  }

  async updateGalleryItem(id: string, item: Partial<Gallery>): Promise<Gallery | null> {
    try {
      const updatedItem = await GalleryModel.findByIdAndUpdate(id, item, { new: true });
      if (!updatedItem) return null;
      
      return {
        id: updatedItem._id.toString(),
        title: updatedItem.title || "Untitled", // Provide a default or fetched value
        category: updatedItem.category || "other", // Provide a default or fetched value
        imageUrl: updatedItem.imageUrl,
        featured: updatedItem.featured || false, // Provide a default or fetched value
        tags: updatedItem.tags || [], // Provide a default or fetched value
        views: updatedItem.views || 0, // Provide a default or fetched value
        caption: updatedItem.caption,
        thumbnailUrl: updatedItem.thumbnailUrl,
        publishedAt: new Date(updatedItem.publishedAt),
        instagramUrl: updatedItem.instagramUrl,
        eventId: updatedItem.eventId ? updatedItem.eventId.toString() : undefined
      };
    } catch (error) {
      return null;
    }
  }

  async deleteGalleryItem(id: string): Promise<boolean> {
    try {
      const result = await GalleryModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  // Subscriber methods
  async getSubscribers(): Promise<Subscriber[]> {
    const subscribers = await SubscriberModel.find().sort({ subscribeDate: -1 });
    return subscribers.map(sub => ({
      id: sub._id.toString(),
      name: sub.name,
      email: sub.email,
      subscribeDate: new Date(sub.subscribeDate),
      marketingConsent: sub.marketingConsent
    }));
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const newSubscriber = await SubscriberModel.create(subscriber);
    return {
      id: newSubscriber._id.toString(),
      name: newSubscriber.name,
      email: newSubscriber.email,
      subscribeDate: new Date(newSubscriber.subscribeDate),
      marketingConsent: newSubscriber.marketingConsent
    };
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    try {
      const result = await SubscriberModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  // User methods
  async getUsers(): Promise<User[]> {
    try {
      const users = await UserModel.find().sort({ createdAt: -1 });
      return users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        password: user.password,
        profilePicture: user.profilePicture,
        role: user.role || 'user',
        bio: user.bio,
        favoriteArtists: user.favoriteArtists || [],
        purchasedTickets: user.purchasedTickets || [],
        createdAt: new Date(user.createdAt),
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        status: user.status || 'active', // Default or fetched value
        isEmailVerified: user.isEmailVerified || false // Default or fetched value
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getUser(id: string): Promise<User | null> {
    try {
      const user = await UserModel.findById(id);
      if (!user) return null;
      
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        password: user.password,
        profilePicture: user.profilePicture,
        role: user.role || 'user',
        bio: user.bio,
        favoriteArtists: user.favoriteArtists || [],
        purchasedTickets: user.purchasedTickets || [],
        createdAt: new Date(user.createdAt),
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        status: user.status || 'active', // Default or fetched value
        isEmailVerified: user.isEmailVerified || false // Default or fetched value
      };
    } catch (error) {
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) return null;
      
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        password: user.password,
        profilePicture: user.profilePicture,
        role: user.role || 'user',
        bio: user.bio,
        favoriteArtists: user.favoriteArtists || [],
        purchasedTickets: user.purchasedTickets || [],
        createdAt: new Date(user.createdAt),
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        status: user.status || 'active', // Default or fetched value
        isEmailVerified: user.isEmailVerified || false // Default or fetched value
      };
    } catch (error) {
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ username });
      if (!user) return null;
      
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        password: user.password,
        profilePicture: user.profilePicture,
        role: user.role || 'user',
        bio: user.bio,
        favoriteArtists: user.favoriteArtists || [],
        purchasedTickets: user.purchasedTickets || [],
        createdAt: new Date(user.createdAt),
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        status: user.status || 'active', // Default or fetched value
        isEmailVerified: user.isEmailVerified || false // Default or fetched value
      };
    } catch (error) {
      return null;
    }
  }

  // Google auth method removed

  async createUser(user: InsertUser): Promise<User> {
    const newUser = await UserModel.create(user);
    return {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
      password: newUser.password,
      profilePicture: newUser.profilePicture,
      role: newUser.role || 'user',
      bio: newUser.bio,
      favoriteArtists: newUser.favoriteArtists || [],
      purchasedTickets: newUser.purchasedTickets || [],
      createdAt: new Date(newUser.createdAt),
      stripeCustomerId: newUser.stripeCustomerId,
      stripeSubscriptionId: newUser.stripeSubscriptionId,
      status: newUser.status || 'active', // Default or fetched value
      isEmailVerified: newUser.isEmailVerified || false // Default or fetched value
    };
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(id, user, { new: true });
      if (!updatedUser) return null;
      
      return {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        password: updatedUser.password,
        profilePicture: updatedUser.profilePicture,
        role: updatedUser.role || 'user',
        bio: updatedUser.bio,
        favoriteArtists: updatedUser.favoriteArtists || [],
        purchasedTickets: updatedUser.purchasedTickets || [],
        createdAt: new Date(updatedUser.createdAt),
        stripeCustomerId: updatedUser.stripeCustomerId,
        stripeSubscriptionId: updatedUser.stripeSubscriptionId,
        status: updatedUser.status || 'active', // Default or fetched value
        isEmailVerified: updatedUser.isEmailVerified || false // Default or fetched value
      };
    } catch (error) {
      return null;
    }
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<User | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId, 
        { stripeCustomerId: customerId }, 
        { new: true }
      );
      
      if (!updatedUser) return null;
      
      return {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        password: updatedUser.password,
        profilePicture: updatedUser.profilePicture,
        role: updatedUser.role || 'user',
        bio: updatedUser.bio,
        favoriteArtists: updatedUser.favoriteArtists || [],
        purchasedTickets: updatedUser.purchasedTickets || [],
        createdAt: new Date(updatedUser.createdAt),
        stripeCustomerId: updatedUser.stripeCustomerId,
        stripeSubscriptionId: updatedUser.stripeSubscriptionId,
        status: updatedUser.status || 'active', // Default or fetched value
        isEmailVerified: updatedUser.isEmailVerified || false // Default or fetched value
      };
    } catch (error) {
      console.error('Error updating Stripe customer ID:', error);
      return null;
    }
  }

  async updateStripeSubscriptionId(userId: string, subscriptionId: string): Promise<User | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId, 
        { stripeSubscriptionId: subscriptionId }, 
        { new: true }
      );
      
      if (!updatedUser) return null;
      
      return {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        password: updatedUser.password,
        profilePicture: updatedUser.profilePicture,
        role: updatedUser.role || 'user',
        bio: updatedUser.bio,
        favoriteArtists: updatedUser.favoriteArtists || [],
        purchasedTickets: updatedUser.purchasedTickets || [],
        createdAt: new Date(updatedUser.createdAt),
        stripeCustomerId: updatedUser.stripeCustomerId,
        stripeSubscriptionId: updatedUser.stripeSubscriptionId,
        status: updatedUser.status || 'active', // Default or fetched value
        isEmailVerified: updatedUser.isEmailVerified || false // Default or fetched value
      };
    } catch (error) {
      console.error('Error updating Stripe subscription ID:', error);
      return null;
    }
  }

  // Product methods
  async getProducts(category?: string): Promise<Product[]> {
    let query = {};
    if (category) {
      query = { category };
    }
    const products = await ProductModel.find(query).sort({ createdAt: -1 });
    return products.map(product => ({
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      images: product.images?.map((images: { url: string; alt: string; isPrimary: boolean }) => ({
        url: images.url,
        alt: images.alt,
        isPrimary: images.isPrimary
      })) || [],
      category: product.category as "clothing" | "audio" | "vinyl" | "accessories" | "other",
      inStock: product.inStock,
      featured: product.featured,
      variants: product.variants?.map((variant: Variant) => ({
        id: (variant as any)._id?.toString(),
        name: variant.name,
        price: variant.price || 0,
        imageUrl: variant.imageUrl,
        images: variant.images?.map(image => ({
          url: image.url,
          alt: image.alt,
          isPrimary: image.isPrimary
        })) || [],
        attributes: variant.attributes || {},
        inStock: variant.inStock
      })) || [],
      createdAt: new Date(product.createdAt)
    }));
  }
}

export const storage = new MongoStorage();
