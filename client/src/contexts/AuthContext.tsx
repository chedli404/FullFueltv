import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Define User interface
export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  profilePicture?: string;
  bio?: string;
  role: 'user' | 'admin';
  favoriteArtists: string[];
  purchasedTickets: string[];
  createdAt: string;
}

// Define Auth Context Type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  savePreviousPath: () => void;
  goToPreviousPath: () => void;
}

// Create Auth Context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  savePreviousPath: () => {},
  goToPreviousPath: () => {}
});

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Function to save current path before redirecting
  const savePreviousPath = () => {
    const currentPath = window.location.pathname;
    if (currentPath !== '/profile' && !currentPath.startsWith('/auth/') && currentPath !== '/admin') {
      localStorage.setItem('prev_path', currentPath);
    }
  };
  
  // Function to go back to previous path
  const goToPreviousPath = () => {
    const prevPath = localStorage.getItem('prev_path') || '/';
    window.location.href = prevPath;
    localStorage.removeItem('prev_path');
  };
  
  // Effect to check if user is logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        // Check if there's a token in localStorage
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          // No token, user is not authenticated
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // If we have a token, verify it with the backend
        console.log('Token found in localStorage, verifying with backend');
        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          
          if (response.ok && data.user) {
            console.log('Token valid, user authenticated');
            setUser(data.user);
          } else {
            console.log('Token invalid, clearing');
            // Token is invalid, clear it
            localStorage.removeItem('auth_token');
            setUser(null);
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('auth_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Immediately check auth status when component mounts
    checkAuthStatus();
  }, []);
  
  // Login function
  const login = (token: string, userData: User) => {
    localStorage.setItem('auth_token', token);
    setUser(userData);
    setIsLoading(false);
  };
  
  // Logout function
  const logout = () => {
    // Clear all auth-related data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('prev_path');
    
    // Reset user state
    setUser(null);
    
    // Force authentication check to run again
    setIsLoading(false);
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      savePreviousPath,
      goToPreviousPath
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth Context
export const useAuth = () => useContext(AuthContext);