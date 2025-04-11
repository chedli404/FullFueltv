import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserIcon, LogOut, Settings, User, ShieldCheck } from 'lucide-react';
import { AuthDialog } from './AuthDialog';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  const { user, isAuthenticated, logout, savePreviousPath } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    // Call logout from AuthContext
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    
    // Force a page refresh to ensure all state is reset
    setTimeout(() => {
      window.location.href = '/';
    }, 300);
  };

  // Save current path before opening auth dialog
  const handleAuthDialogOpen = () => {
    savePreviousPath();
  };

  // If the user is not authenticated, show the login button
  if (!isAuthenticated) {
    return (
      <AuthDialog
        trigger={
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleAuthDialogOpen}
          >
            Sign In
          </Button>
        }
      />
    );
  }

  // If the user is authenticated, show the user menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profilePicture} alt={user?.name} />
            <AvatarFallback>
              <UserIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link 
            to="/profile" 
            className="flex w-full cursor-pointer items-center"
            onClick={savePreviousPath}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        
        {user?.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link 
              to="/admin" 
              className="flex w-full cursor-pointer items-center"
              onClick={savePreviousPath}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem asChild>
          <Link 
            to="/profile" 
            className="flex w-full cursor-pointer items-center"
            onClick={savePreviousPath}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}