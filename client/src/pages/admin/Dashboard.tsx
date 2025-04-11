import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Video as VideoType, 
  Event as EventType, 
  Mix as MixType, // Ensure MixType is imported correctly
  Gallery as GalleryType 
} from '@shared/schema';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash, 
  Star, 
  Youtube,
  Image,
  PlusCircle,
  Users,
  Video,
  Music,
  Calendar as CalendarIcon,
  ShoppingBag
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('users');
  
  // Modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMixModal, setShowMixModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Current item being edited
  const [currentVideo, setCurrentVideo] = useState<Partial<VideoType> | null>(null);
  const [currentEvent, setCurrentEvent] = useState<Partial<EventType> | null>(null);
  const [currentMix, setCurrentMix] = useState<Partial<MixType> | null>(null);
  const [currentGallery, setCurrentGallery] = useState<Partial<GalleryType> | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Partial<any> | null>(null);
  
  // Alert dialog for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);
  
  // If user is not admin, redirect to home
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      setLocation('/');
    }
  }, [user, setLocation, toast]);

  // Query for users data
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/users');
      return response.users || [];
    },
    enabled: user?.role === 'admin',
  });

  // Query for videos data
  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['/api/videos'],
    queryFn: async () => {
      const response = await apiRequest('/api/videos');
      return response || [];
    },
    enabled: user?.role === 'admin',
  });

  // Query for events data
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await apiRequest('/api/events');
      return response || [];
    },
    enabled: user?.role === 'admin',
  });

  // Query for mixes data
  const { data: mixes, isLoading: mixesLoading } = useQuery({
    queryKey: ['/api/mixes'],
    queryFn: async () => {
      const response = await apiRequest('/api/mixes');
      return response || [];
    },
    enabled: user?.role === 'admin',
  });

  // Query for gallery data
  const { data: gallery, isLoading: galleryLoading } = useQuery({
    queryKey: ['/api/gallery'],
    queryFn: async () => {
      const response = await apiRequest('/api/gallery');
      return response || [];
    },
    enabled: user?.role === 'admin',
  });

  // Query for products data
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/shop/products'],
    queryFn: async () => {
      const response = await apiRequest('/api/shop/products');
      return response || [];
    },
    enabled: user?.role === 'admin',
  });

  // Mutation for updating user role
  const updateUserRoleMutation = useMutation({
    mutationFn: (data: { userId: string; role: 'user' | 'admin' }) => 
      apiRequest('/api/admin/users/role', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User role has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    },
  });

  // Handler for promoting/demoting users
  const handleRoleChange = (userId: string, newRole: 'user' | 'admin') => {
    updateUserRoleMutation.mutate({ userId, role: newRole });
  };
  
  // Video mutations
  const createVideoMutation = useMutation({
    mutationFn: (data: Partial<VideoType>) => 
      apiRequest('/api/videos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Video Created",
        description: "New video has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      setShowVideoModal(false);
      setCurrentVideo(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create video.",
        variant: "destructive",
      });
    },
  });
  
  const updateVideoMutation = useMutation({
    mutationFn: (data: { id: string; video: Partial<VideoType> }) => 
      apiRequest(`/api/videos/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.video),
      }),
    onSuccess: () => {
      toast({
        title: "Video Updated",
        description: "Video has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      setShowVideoModal(false);
      setCurrentVideo(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update video.",
        variant: "destructive",
      });
    },
  });
  
  const deleteVideoMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/videos/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      toast({
        title: "Video Deleted",
        description: "Video has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete video.",
        variant: "destructive",
      });
    },
  });
  
  // Event mutations
  const createEventMutation = useMutation({
    mutationFn: (data: Partial<EventType>) => 
      apiRequest('/api/events', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Event Created",
        description: "New event has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setShowEventModal(false);
      setCurrentEvent(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create event.",
        variant: "destructive",
      });
    },
  });
  
  const updateEventMutation = useMutation({
    mutationFn: (data: { id: string; event: Partial<EventType> }) => 
      apiRequest(`/api/events/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.event),
      }),
    onSuccess: () => {
      toast({
        title: "Event Updated",
        description: "Event has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setShowEventModal(false);
      setCurrentEvent(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update event.",
        variant: "destructive",
      });
    },
  });
  
  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/events/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      toast({
        title: "Event Deleted",
        description: "Event has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      });
    },
  });
  
  // Mix mutations
  const createMixMutation = useMutation({
    mutationFn: (data: Partial<MixType>) => 
      apiRequest('/api/mixes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Mix Created",
        description: "New mix has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mixes'] });
      setShowMixModal(false);
      setCurrentMix(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create mix.",
        variant: "destructive",
      });
    },
  });
  
  const updateMixMutation = useMutation({
    mutationFn: (data: { id: string; mix: Partial<MixType> }) => 
      apiRequest(`/api/mixes/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.mix),
      }),
    onSuccess: () => {
      toast({
        title: "Mix Updated",
        description: "Mix has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mixes'] });
      setShowMixModal(false);
      setCurrentMix(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update mix.",
        variant: "destructive",
      });
    },
  });
  
  const deleteMixMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/mixes/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      toast({
        title: "Mix Deleted",
        description: "Mix has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mixes'] });
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete mix.",
        variant: "destructive",
      });
    },
  });
  
  // Gallery mutations
  const createGalleryItemMutation = useMutation({
    mutationFn: (data: Partial<GalleryType>) => 
      apiRequest('/api/gallery', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Gallery Item Created",
        description: "New gallery item has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      setShowGalleryModal(false);
      setCurrentGallery(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create gallery item.",
        variant: "destructive",
      });
    },
  });
  
  const updateGalleryItemMutation = useMutation({
    mutationFn: (data: { id: string; item: Partial<GalleryType> }) => 
      apiRequest(`/api/gallery/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.item),
      }),
    onSuccess: () => {
      toast({
        title: "Gallery Item Updated",
        description: "Gallery item has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      setShowGalleryModal(false);
      setCurrentGallery(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update gallery item.",
        variant: "destructive",
      });
    },
  });
  
  const deleteGalleryItemMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/gallery/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      toast({
        title: "Gallery Item Deleted",
        description: "Gallery item has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete gallery item.",
        variant: "destructive",
      });
    },
  });
  
  // Handler functions
  const handleAddVideo = () => {
    setIsEditMode(false);
    setCurrentVideo({
      title: '',
      description: '',
      youtubeId: '',
      thumbnailUrl: '',
      duration: '',
      views: 0,
      publishedAt: new Date(),
      featured: false,
      tags: []
    });
    setShowVideoModal(true);
  };
  
  const handleEditVideo = (video: VideoType) => {
    setIsEditMode(true);
    setCurrentVideo(video);
    setShowVideoModal(true);
  };
  
  const handleDeleteVideo = (id: string) => {
    setItemToDelete({ type: 'video', id });
    setShowDeleteConfirm(true);
  };
  
  const handleAddEvent = () => {
    setIsEditMode(false);
    setCurrentEvent({
      title: '',
      description: '',
      date: new Date(),
      location: '',
      imageUrl: '',
      eventType: 'festival',
      attending: 0,
      link: '',
      featured: false
    });
    setShowEventModal(true);
  };
  
  const handleEditEvent = (event: EventType) => {
    setIsEditMode(true);
    setCurrentEvent(event);
    setShowEventModal(true);
  };
  
  const handleDeleteEvent = (id: string) => {
    setItemToDelete({ type: 'event', id });
    setShowDeleteConfirm(true);
  };
  
  const handleAddMix = () => {
    setIsEditMode(false);
    setCurrentMix({
      title: '',
      description: '',
      artist: '',
      duration: '',
      imageUrl: '',
      youtubeId: 'default', // Setting a default placeholder value
      publishedAt: new Date(),
      featured: false
    });
    setShowMixModal(true);
  };
  
  const handleEditMix = (mix: MixType) => {
    setIsEditMode(true);
    setCurrentMix(mix);
    setShowMixModal(true);
  };
  
  const handleDeleteMix = (id: string) => {
    setItemToDelete({ type: 'mix', id });
    setShowDeleteConfirm(true);
  };
  
  const handleAddGalleryItem = () => {
    setIsEditMode(false);
    setCurrentGallery({
      caption: '',
      imageUrl: '',
      publishedAt: new Date(),
      instagramUrl: ''
    });
    setShowGalleryModal(true);
  };
  
  const handleEditGalleryItem = (item: GalleryType) => {
    setIsEditMode(true);
    setCurrentGallery(item);
    setShowGalleryModal(true);
  };
  
  const handleDeleteGalleryItem = (id: string) => {
    setItemToDelete({ type: 'gallery', id });
    setShowDeleteConfirm(true);
  };
  
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    
    switch (itemToDelete.type) {
      case 'video':
        deleteVideoMutation.mutate(itemToDelete.id);
        break;
      case 'event':
        deleteEventMutation.mutate(itemToDelete.id);
        break;
      case 'mix':
        deleteMixMutation.mutate(itemToDelete.id);
        break;
      case 'gallery':
        deleteGalleryItemMutation.mutate(itemToDelete.id);
        break;
      case 'product':
        deleteProductMutation.mutate(itemToDelete.id);
        break;
    }
  };
  
  const handleVideoSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentVideo) return;
    
    if (isEditMode && currentVideo.id) {
      updateVideoMutation.mutate({
        id: currentVideo.id,
        video: currentVideo
      });
    } else {
      createVideoMutation.mutate(currentVideo);
    }
  };
  
  const handleEventSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentEvent) return;
    
    if (isEditMode && currentEvent.id) {
      updateEventMutation.mutate({
        id: currentEvent.id,
        event: currentEvent
      });
    } else {
      createEventMutation.mutate(currentEvent);
    }
  };
  
  const handleMixSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentMix) return;
    
    if (isEditMode && currentMix.id) {
      updateMixMutation.mutate({
        id: currentMix.id,
        mix: currentMix
      });
    } else {
      createMixMutation.mutate(currentMix);
    }
  };
  
  const handleGallerySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentGallery) return;
    
    if (isEditMode && currentGallery.id) {
      updateGalleryItemMutation.mutate({
        id: currentGallery.id,
        item: currentGallery
      });
    } else {
      createGalleryItemMutation.mutate(currentGallery);
    }
  };
  
  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('/api/shop/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Product Created",
        description: "New product has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/shop/products'] });
      setShowProductModal(false);
      setCurrentProduct(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product.",
        variant: "destructive",
      });
    },
  });
  
  const updateProductMutation = useMutation({
    mutationFn: (data: { id: string; product: any }) => 
      apiRequest(`/api/shop/products/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.product),
      }),
    onSuccess: () => {
      toast({
        title: "Product Updated",
        description: "Product has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/shop/products'] });
      setShowProductModal(false);
      setCurrentProduct(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    },
  });
  
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/shop/products/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/shop/products'] });
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    },
  });
  
  // Product handlers
  const handleAddProduct = () => {
    setIsEditMode(false);
    setCurrentProduct({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: 'clothing',
      inStock: true,
      featured: false,
      variants: []
    });
    setShowProductModal(true);
  };
  
  const handleEditProduct = (product: any) => {
    setIsEditMode(true);
    setCurrentProduct(product);
    setShowProductModal(true);
  };
  
  const handleDeleteProduct = (id: string) => {
    setItemToDelete({ type: 'product', id });
    setShowDeleteConfirm(true);
  };
  
  const handleProductSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;
    
    if (isEditMode && currentProduct.id) {
      updateProductMutation.mutate({
        id: currentProduct.id,
        product: currentProduct
      });
    } else {
      createProductMutation.mutate(currentProduct);
    }
  };

  // If user is not yet loaded or not an admin
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user.role !== 'admin') {
    return null; // The useEffect will redirect
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage all aspects of Full Fuel TV</p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setLocation('/')}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-4 h-4"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full mb-8">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span>Videos</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span>Music</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span>Gallery</span>
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Shop</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View, edit and manage user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>List of all users</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>@{user.username}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Change Role
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Change User Role</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {user.role === 'admin' 
                                        ? "Are you sure you want to remove admin privileges from this user?" 
                                        : "Are you sure you want to grant admin privileges to this user?"}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRoleChange(
                                        user.id, 
                                        user.role === 'admin' ? 'user' : 'admin'
                                      )}
                                    >
                                      Confirm
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Video Management</CardTitle>
                  <CardDescription>
                    Manage video content and featured videos
                  </CardDescription>
                </div>
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleAddVideo}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Video</span>
                </Button>
              </CardHeader>
              <CardContent>
                {videosLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>List of all videos</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>YouTube ID</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {videos?.map((video: any) => (
                        <TableRow key={video.id}>
                          <TableCell className="font-medium">{video.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Youtube className="h-4 w-4" />
                              <span>{video.youtubeId}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{video.duration}</span>
                            </div>
                          </TableCell>
                          <TableCell>{video.views?.toLocaleString()}</TableCell>
                          <TableCell>
                            {video.featured ? (
                              <Badge variant="default" className="bg-yellow-500">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            ) : (
                              <Badge variant="outline">Standard</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleEditVideo(video)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleDeleteVideo(video.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Event Management</CardTitle>
                  <CardDescription>
                    Add, edit and manage upcoming events
                  </CardDescription>
                </div>
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleAddEvent}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Event</span>
                </Button>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>List of all events</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Attending</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events?.map((event: any) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>{event.location}</TableCell>
                          <TableCell>
                            <Badge variant={
                              event.eventType === 'festival' ? 'default' :
                              event.eventType === 'club' ? 'secondary' : 'outline'
                            }>
                              {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{event.attending?.toLocaleString() || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleEditEvent(event)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => window.open(`/events/${event.id}`, '_blank')}
                              >
                                <ShoppingBag className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Music Tab */}
          <TabsContent value="music">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Music Management</CardTitle>
                  <CardDescription>
                    Manage mixes and featured music content
                  </CardDescription>
                </div>
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleAddMix}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Mix</span>
                </Button>
              </CardHeader>
              <CardContent>
                {mixesLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>List of all mixes</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Artist</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mixes?.map((mix: any) => (
                        <TableRow key={mix.id}>
                          <TableCell className="font-medium">{mix.title}</TableCell>
                          <TableCell>{mix.artist}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{mix.duration}</span>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(mix.publishedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {mix.featured ? (
                              <Badge variant="default" className="bg-yellow-500">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            ) : (
                              <Badge variant="outline">Standard</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleEditMix(mix)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleDeleteMix(mix.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gallery Management</CardTitle>
                  <CardDescription>
                    Manage gallery images and collection
                  </CardDescription>
                </div>
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleAddGalleryItem}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Image</span>
                </Button>
              </CardHeader>
              <CardContent>
                {galleryLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gallery?.map((item: any) => (
                      <div key={item.id} className="relative group overflow-hidden rounded-lg">
                        <img
                          src={item.imageUrl.startsWith('http') ? item.imageUrl : `/images/${item.imageUrl}`}
                          alt={item.caption}
                          className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                          <div className="flex justify-end">
                            <div className="flex gap-2">
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-8 w-8 rounded-full"
                                onClick={() => handleEditGalleryItem(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="icon" 
                                className="h-8 w-8 rounded-full"
                                onClick={() => handleDeleteGalleryItem(item.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{item.caption}</h3>
                            <p className="text-white/80 text-sm">
                              {new Date(item.publishedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Tab */}
          <TabsContent value="shop">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Shop Management</CardTitle>
                  <CardDescription>
                    Manage products, inventory, and featured items
                  </CardDescription>
                </div>
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleAddProduct}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Product</span>
                </Button>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>List of all products</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products?.map((product: any) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <img 
                            src={product.imageUrl.startsWith('http') ? product.imageUrl :         `/images/products${product.imageUrl}`}
                               alt={product.name} 
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {product.inStock ? (
                              <Badge variant="default" className="bg-green-500">In Stock</Badge>
                            ) : (
                              <Badge variant="destructive">Out of Stock</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {product.featured ? (
                              <Badge variant="default" className="bg-yellow-500">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            ) : (
                              <Badge variant="outline">Standard</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => window.open(`/shop/${product.id}`, '_blank')}
                              >
                                <ShoppingBag className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) {
                  if (itemToDelete.type === 'video') {
                    deleteVideoMutation.mutate(itemToDelete.id);
                  } else if (itemToDelete.type === 'event') {
                    deleteEventMutation.mutate(itemToDelete.id);
                  } else if (itemToDelete.type === 'mix') {
                    deleteMixMutation.mutate(itemToDelete.id);
                  } else if (itemToDelete.type === 'gallery') {
                    deleteGalleryItemMutation.mutate(itemToDelete.id);
                  }
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Video" : "Add New Video"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update video details" : "Add a new video to your collection"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => handleVideoSubmit(e)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={currentVideo?.title || ''}
                  onChange={(e) => setCurrentVideo({...currentVideo, title: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="youtubeId" className="text-right">
                  YouTube ID
                </Label>
                <Input
                  id="youtubeId"
                  name="youtubeId"
                  value={currentVideo?.youtubeId || ''}
                  onChange={(e) => setCurrentVideo({...currentVideo, youtubeId: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={currentVideo?.description || ''}
                  onChange={(e) => setCurrentVideo({...currentVideo, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="thumbnailUrl" className="text-right">
                  Thumbnail URL
                </Label>
                <Input
                  id="thumbnailUrl"
                  name="thumbnailUrl"
                  value={currentVideo?.thumbnailUrl || ''}
                  onChange={(e) => setCurrentVideo({...currentVideo, thumbnailUrl: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration
                </Label>
                <Input
                  id="duration"
                  name="duration"
                  value={currentVideo?.duration || ''}
                  onChange={(e) => setCurrentVideo({...currentVideo, duration: e.target.value})}
                  className="col-span-3"
                  placeholder="e.g. 12:34"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="views" className="text-right">
                  Views
                </Label>
                <Input
                  id="views"
                  name="views"
                  type="number"
                  value={currentVideo?.views || 0}
                  onChange={(e) => setCurrentVideo({...currentVideo, views: parseInt(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featured" className="text-right">
                  Featured
                </Label>
                <div className="col-span-3 flex items-center">
                  <Checkbox
                    id="featured"
                    name="featured"
                    checked={currentVideo?.featured || false}
                    onCheckedChange={(checked) => 
                      setCurrentVideo({...currentVideo, featured: checked === true})
                    }
                  />
                  <Label htmlFor="featured" className="ml-2">
                    Display as featured video
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowVideoModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Update" : "Add"} Video
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Event" : "Add New Event"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update event details" : "Add a new event to your calendar"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => handleEventSubmit(e)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={currentEvent?.title || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, title: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={currentEvent?.description || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={currentEvent?.date ? new Date(currentEvent.date).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setCurrentEvent({...currentEvent, date});
                  }}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={currentEvent?.location || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, location: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={currentEvent?.imageUrl || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, imageUrl: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="eventType" className="text-right">
                  Type
                </Label>
                <Select 
                  value={currentEvent?.eventType || 'festival'} 
                  onValueChange={(value) => setCurrentEvent({...currentEvent, eventType: value as "festival" | "club" | "livestream" | undefined})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="club">Club</SelectItem>
                    <SelectItem value="concert">Concert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link" className="text-right">
                  Website Link
                </Label>
                <Input
                  id="link"
                  name="link"
                  value={currentEvent?.link || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, link: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featured" className="text-right">
                  Featured
                </Label>
                <div className="col-span-3 flex items-center">
                  <Checkbox
                    id="featured"
                    name="featured"
                    checked={currentEvent?.featured || false}
                    onCheckedChange={(checked) => 
                      setCurrentEvent({...currentEvent, featured: checked === true})
                    }
                  />
                  <Label htmlFor="featured" className="ml-2">
                    Display as featured event
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEventModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Update" : "Add"} Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Mix Modal */}
      <Dialog open={showMixModal} onOpenChange={setShowMixModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Mix" : "Add New Mix"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update mix details" : "Add a new mix to your collection"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => handleMixSubmit(e)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={currentMix?.title || ''}
                  onChange={(e) => setCurrentMix({...currentMix, title: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="artist" className="text-right">
                  Artist
                </Label>
                <Input
                  id="artist"
                  name="artist"
                  value={currentMix?.artist || ''}
                  onChange={(e) => setCurrentMix({...currentMix, artist: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={currentMix?.description || ''}
                  onChange={(e) => setCurrentMix({...currentMix, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                  Cover Art URL
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={currentMix?.imageUrl || ''}
                  onChange={(e) => setCurrentMix({...currentMix, imageUrl: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="audioUrl" className="text-right">
                  Audio URL
                </Label>
                <Input
                  id="audioUrl"
                  name="audioUrl"
                  value={currentMix?.audioUrl || ''}
                  onChange={(e) => setCurrentMix({...currentMix, audioUrl: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="youtubeId" className="text-right">
                  YouTube ID
                </Label>
                <Input
                  id="youtubeId"
                  name="youtubeId"
                  value={currentMix?.youtubeId || 'default'}
                  onChange={(e) => setCurrentMix({...currentMix, youtubeId: e.target.value || 'default'})}
                  className="col-span-3"
                  required
                />
                <div className="col-span-4 pl-[25%] text-xs text-muted-foreground">
                  Required - Enter YouTube video ID or use "default" if not applicable
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration
                </Label>
                <Input
                  id="duration"
                  name="duration"
                  value={currentMix?.duration || ''}
                  onChange={(e) => setCurrentMix({...currentMix, duration: e.target.value})}
                  className="col-span-3"
                  placeholder="e.g. 1:02:34"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="genre" className="text-right">
                  Genre
                </Label>
                <Input
                  id="genre"
                  name="genre"
                  value={currentMix?.genre || ''}
                  onChange={(e) => setCurrentMix({...currentMix, genre: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featured" className="text-right">
                  Featured
                </Label>
                <div className="col-span-3 flex items-center">
                  <Checkbox
                    id="featured"
                    name="featured"
                    checked={currentMix?.featured || false}
                    onCheckedChange={(checked) => 
                      setCurrentMix({...currentMix, featured: checked === true})
                    }
                  />
                  <Label htmlFor="featured" className="ml-2">
                    Display as featured mix
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowMixModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Update" : "Add"} Mix
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Gallery Modal */}
      <Dialog open={showGalleryModal} onOpenChange={setShowGalleryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Gallery Item" : "Add New Gallery Item"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update gallery item details" : "Add a new image to your gallery"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => handleGallerySubmit(e)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="caption" className="text-right">
                  Caption
                </Label>
                <Input
                  id="caption"
                  name="caption"
                  value={currentGallery?.caption || ''}
                  onChange={(e) => setCurrentGallery({...currentGallery, caption: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={currentGallery?.imageUrl || ''}
                  onChange={(e) => setCurrentGallery({...currentGallery, imageUrl: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  name="category"
                  value={currentGallery?.category || ''}
                  onChange={(e) => setCurrentGallery({...currentGallery, category: e.target.value as "artist" | "event" | "venue" | "other" | undefined})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="photographer" className="text-right">
                  Photographer
                </Label>
                <Input
                  id="photographer"
                  name="photographer"
                  value={currentGallery?.photographer || ''}
                  onChange={(e) => setCurrentGallery({...currentGallery, photographer: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowGalleryModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Update" : "Add"} Gallery Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update product details" : "Add a new product to your shop"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => handleProductSubmit(e)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={currentProduct?.name || ''}
                  onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={currentProduct?.description || ''}
                  onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <div className="col-span-3 flex items-center">
                  <span className="mr-2">$</span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentProduct?.price || 0}
                    onChange={(e) => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={currentProduct?.imageUrl || ''}
                  onChange={(e) => setCurrentProduct({...currentProduct, imageUrl: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select 
                  value={currentProduct?.category || 'clothing'} 
                  onValueChange={(value) => setCurrentProduct({...currentProduct, category: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="audio">Audio Equipment</SelectItem>
                    <SelectItem value="vinyl">Vinyl Records</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="inStock" className="text-right">
                  In Stock
                </Label>
                <div className="col-span-3 flex items-center">
                  <Checkbox
                    id="inStock"
                    name="inStock"
                    checked={currentProduct?.inStock || false}
                    onCheckedChange={(checked) => 
                      setCurrentProduct({...currentProduct, inStock: checked === true})
                    }
                  />
                  <Label htmlFor="inStock" className="ml-2">
                    Product is available for purchase
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featured" className="text-right">
                  Featured
                </Label>
                <div className="col-span-3 flex items-center">
                  <Checkbox
                    id="featured"
                    name="featured"
                    checked={currentProduct?.featured || false}
                    onCheckedChange={(checked) => 
                      setCurrentProduct({...currentProduct, featured: checked === true})
                    }
                  />
                  <Label htmlFor="featured" className="ml-2">
                    Display as featured product
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowProductModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Update" : "Add"} Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}