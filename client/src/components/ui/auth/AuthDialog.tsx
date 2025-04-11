import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, googleLogin } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GoogleLogin } from '@react-oauth/google';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Login schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

// Register schema
const registerSchema = loginSchema.extend({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthDialogProps {
  trigger: React.ReactNode;
  defaultTab?: 'login' | 'register';
  onOpenChange?: (open: boolean) => void;
}

export function AuthDialog({
  trigger,
  defaultTab = 'login',
  onOpenChange,
}: AuthDialogProps) {
  const { toast } = useToast();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [isOpen, setIsOpen] = useState(false);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) =>
      apiRequest('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      if (data.token && data.user) {
        login(data.token, data.user);
        toast({
          title: 'Login successful',
          description: `Welcome back, ${data.user.name}!`,
        });
        handleCloseDialog();
      } else {
        toast({
          title: 'Login failed',
          description: data.message || 'An error occurred during login',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Login failed',
        description: error.message || 'An error occurred during login',
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormValues) =>
      apiRequest('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      if (data.token && data.user) {
        login(data.token, data.user);
        toast({
          title: 'Registration successful',
          description: `Welcome to Full Fuel, ${data.user.name}!`,
        });
        handleCloseDialog();
      } else {
        toast({
          title: 'Registration failed',
          description: data.message || 'An error occurred during registration',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
    },
  });

  // Login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Register form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  // Dialog open/close handlers
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    if (onOpenChange) {
      onOpenChange(false);
    }
    
    // Reset forms
    loginForm.reset();
    registerForm.reset();
  };

  // Google login handler
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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Sign in or create an account to access more features.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 py-4">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </Form>
            
            <div className="mt-4">
              <Separator className="my-4" />
              <div className="text-center text-sm text-muted-foreground mb-2">
                Or continue with
              </div>
              <div className="flex justify-center">
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
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4 py-4">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </Form>
            
            <div className="mt-4">
              <Separator className="my-4" />
              <div className="text-center text-sm text-muted-foreground mb-2">
                Or continue with
              </div>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    toast({
                      title: 'Google signup failed',
                      description: 'Error authenticating with Google',
                      variant: 'destructive',
                    });
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}