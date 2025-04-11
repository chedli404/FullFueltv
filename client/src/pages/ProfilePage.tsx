import { useState } from 'react';
import { useAuth, User } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, UserIcon, MusicIcon, TicketIcon, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Profile update validation schema
const profileUpdateSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  bio: z.string().optional(),
});

type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;

export default function ProfilePage() {
  const { user, goToPreviousPath } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  
  // Get the auth token from localStorage
  const token = localStorage.getItem('auth_token');
  
  // Form setup for profile update
  const form = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      bio: user?.bio || '',
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileUpdateValues) => 
      apiRequest('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      // Invalidate queries that might contain the user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: ProfileUpdateValues) => {
    updateProfileMutation.mutate(data);
  };

  // If user is not authenticated, display a message
  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              You need to be logged in to view your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please sign in to access your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => goToPreviousPath()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.profilePicture} alt={user.name} />
              <AvatarFallback>
                <UserIcon className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>@{user.username}</span>
                <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                  {user.role === 'admin' ? 'Admin' : 'Member'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <CalendarIcon className="mr-1 h-4 w-4" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {user.bio && (
            <div className="mt-4">
              <p>{user.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your profile information and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Artists</CardTitle>
              <CardDescription>
                Artists you've marked as favorites
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.favoriteArtists && user.favoriteArtists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.favoriteArtists.map((artist, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <MusicIcon className="h-4 w-4" />
                      <span>{artist}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  You haven't added any favorite artists yet.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" disabled>Add Artists</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>My Tickets</CardTitle>
              <CardDescription>
                Events you've purchased tickets for
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.purchasedTickets && user.purchasedTickets.length > 0 ? (
                <div className="space-y-4">
                  {user.purchasedTickets.map((ticket, index) => (
                    <div key={index} className="flex items-center gap-2 p-4 border rounded-md">
                      <TicketIcon className="h-5 w-5" />
                      <span>Ticket #{index + 1}: {ticket}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <TicketIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground mb-3">
                    You haven't purchased any tickets yet.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="/events">Browse Events</a>
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Tickets are stored securely and tied to your account.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}