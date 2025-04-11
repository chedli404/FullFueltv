import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, navigate } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronRight, 
  Users, 
  Video, 
  Calendar, 
  Music, 
  Image, 
  BarChart3, 
  Settings, 
  Ticket 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [location] = useLocation();

  // Check if the user is an admin
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/users/profile'],
    enabled: !!user,
  });

  if (userLoading) {
    return (
      <div className="container py-10">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-middle">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if user is not an admin
  if (userData && userData.role !== 'admin') {
    toast({
      title: 'Access denied',
      description: 'You do not have permission to access the admin dashboard.',
      variant: 'destructive',
    });
    navigate('/');
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagementPlaceholder />;
      case 'videos':
        return <ContentManagementPlaceholder type="videos" />;
      case 'events':
        return <ContentManagementPlaceholder type="events" />;
      case 'music':
        return <ContentManagementPlaceholder type="music" />;
      case 'gallery':
        return <ContentManagementPlaceholder type="gallery" />;
      case 'tickets':
        return <ContentManagementPlaceholder type="tickets" />;
      default:
        return (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                  Welcome to the Full Fuel TV admin dashboard. Manage your content and users from here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DashboardCard 
                    title="Users" 
                    description="Manage user accounts" 
                    icon={<Users className="w-5 h-5 text-blue-500" />}
                    count={10}
                    onClick={() => setActiveTab('users')}
                  />
                  <DashboardCard 
                    title="Videos" 
                    description="Manage video content" 
                    icon={<Video className="w-5 h-5 text-red-500" />}
                    count={24}
                    onClick={() => setActiveTab('videos')}
                  />
                  <DashboardCard 
                    title="Events" 
                    description="Manage events" 
                    icon={<Calendar className="w-5 h-5 text-green-500" />}
                    count={8}
                    onClick={() => setActiveTab('events')}
                  />
                  <DashboardCard 
                    title="Music" 
                    description="Manage music and mixes" 
                    icon={<Music className="w-5 h-5 text-purple-500" />}
                    count={15}
                    onClick={() => setActiveTab('music')}
                  />
                  <DashboardCard 
                    title="Gallery" 
                    description="Manage gallery images" 
                    icon={<Image className="w-5 h-5 text-yellow-500" />}
                    count={42}
                    onClick={() => setActiveTab('gallery')}
                  />
                  <DashboardCard 
                    title="Tickets" 
                    description="Manage ticket sales" 
                    icon={<Ticket className="w-5 h-5 text-orange-500" />}
                    count={56}
                    onClick={() => setActiveTab('tickets')}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Overview of your platform's performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StatCard title="Total Users" value="152" change="+12%" />
                  <StatCard title="Active Subscribers" value="87" change="+5%" />
                  <StatCard title="Monthly Views" value="2.4k" change="+18%" />
                  <StatCard title="Ticket Sales" value="$1,245" change="+23%" />
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Site
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="space-y-1">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('users')}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button
              variant={activeTab === 'videos' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('videos')}
            >
              <Video className="mr-2 h-4 w-4" />
              Videos
            </Button>
            <Button
              variant={activeTab === 'events' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('events')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Events
            </Button>
            <Button
              variant={activeTab === 'music' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('music')}
            >
              <Music className="mr-2 h-4 w-4" />
              Music
            </Button>
            <Button
              variant={activeTab === 'gallery' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('gallery')}
            >
              <Image className="mr-2 h-4 w-4" />
              Gallery
            </Button>
            <Button
              variant={activeTab === 'tickets' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('tickets')}
            >
              <Ticket className="mr-2 h-4 w-4" />
              Tickets
            </Button>
            <Separator className="my-2" />
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
        
        <div className="md:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function DashboardCard({ title, description, icon, count, onClick }) {
  return (
    <div 
      className="bg-card border rounded-lg p-4 flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="bg-secondary p-2 rounded-full">
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center">
        <span className="font-semibold mr-2">{count}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function StatCard({ title, value, change }) {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="text-sm text-muted-foreground">{title}</h3>
      <div className="flex items-end justify-between mt-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}

// Placeholder components for the content management sections
// To be replaced with actual implementations
function UserManagementPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View and manage all registered users on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="font-medium">Name</div>
            <div className="font-medium">Email</div>
            <div className="font-medium">Role</div>
            <div className="font-medium">Actions</div>
          </div>
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>User {item}</span>
                </div>
                <div>user{item}@example.com</div>
                <div>{item === 1 ? 'Admin' : 'User'}</div>
                <div>
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button>Add New User</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentManagementPlaceholder({ type }) {
  const typeMapping = {
    videos: {
      title: 'Video Management',
      description: 'Manage video content, add new videos, and update existing ones.',
      icon: <Video className="w-4 h-4" />,
      fields: ['Title', 'Category', 'Duration', 'Upload Date'],
    },
    events: {
      title: 'Event Management',
      description: 'Manage events, create new events, and update existing ones.',
      icon: <Calendar className="w-4 h-4" />,
      fields: ['Event Name', 'Date', 'Location', 'Tickets Available'],
    },
    music: {
      title: 'Music Management',
      description: 'Manage music mixes and tracks on the platform.',
      icon: <Music className="w-4 h-4" />,
      fields: ['Title', 'Artist', 'Duration', 'Release Date'],
    },
    gallery: {
      title: 'Gallery Management',
      description: 'Manage gallery images and collections.',
      icon: <Image className="w-4 h-4" />,
      fields: ['Title', 'Collection', 'Upload Date', 'Status'],
    },
    tickets: {
      title: 'Ticket Management',
      description: 'Manage ticket sales, prices, and availability.',
      icon: <Ticket className="w-4 h-4" />,
      fields: ['Event', 'Price', 'Sold', 'Available'],
    },
  };

  const { title, description, icon, fields } = typeMapping[type];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="flex items-center justify-between p-4 border-b">
            {fields.map((field) => (
              <div key={field} className="font-medium">{field}</div>
            ))}
            <div className="font-medium">Actions</div>
          </div>
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between p-4">
                {fields.map((field, index) => (
                  <div key={index}>
                    {index === 0 ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          {icon}
                        </div>
                        <span>{`${type.slice(0, -1)} ${item}`}</span>
                      </div>
                    ) : (
                      <span>Sample data</span>
                    )}
                  </div>
                ))}
                <div>
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button>{`Add New ${type.slice(0, -1).charAt(0).toUpperCase() + type.slice(0, -1).slice(1)}`}</Button>
        </div>
      </CardContent>
    </Card>
  );
}