import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, AuthContextType, LoginCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const initializeAuthOnce = useRef(false);

  // Check for token expiration and auto-logout
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      
      // Only check expiration if we have both a token and a user (fully initialized)
      // and we're not currently in the middle of initializing
      if (token && user && isInitialized && !isInitializing) {
        try {
          // Validate token format before attempting to decode
          const parts = token.split('.');
          if (parts.length !== 3) {
            console.error('Invalid token format during expiration check');
            logout(); // Use logout function instead of direct setUser(null)
            return;
          }

          // Check if the payload is valid base64
          try {
            const payload = JSON.parse(atob(parts[1]));
            const currentTime = Date.now() / 1000;
            
            // Auto-logout 5 minutes before token expires
            if (payload.exp && payload.exp - 300 < currentTime) {
              console.log('Token expiring soon, logging out...');
              logout();
            }
          } catch (decodeError) {
            console.error('Error decoding token payload during expiration check:', decodeError);
            logout(); // Use logout function instead of direct cleanup
          }
        } catch (error) {
          console.error('Error checking token expiration:', error);
          logout(); // Use logout function instead of direct cleanup
        }
      }
    };

    // Only start checking expiration after initialization is complete
    if (isInitialized && !isInitializing) {
      // Check token expiration every minute
      const interval = setInterval(checkTokenExpiration, 60000);
      
      // Also check immediately if we have a user
      if (user) {
        checkTokenExpiration();
      }
      
      return () => clearInterval(interval);
    }
  }, [user, isInitialized, isInitializing]);

  useEffect(() => {
    const initializeAuth = async () => {
      // Prevent multiple initializations using ref and state
      if (isInitialized || isInitializing || initializeAuthOnce.current) {
        return;
      }

      initializeAuthOnce.current = true;
      setIsInitializing(true);
      console.log('Starting auth initialization...');

      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!token || !storedUser) {
          console.log('No token or stored user found, skipping initialization');
          setIsLoading(false);
          setIsInitialized(true);
          setIsInitializing(false);
          return;
        }

        // Check if token is expired (basic check)
        try {
          // Validate token format before attempting to decode
          const parts = token.split('.');
          if (parts.length !== 3) {
            console.error('Invalid token format during initialization');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoading(false);
            setIsInitialized(true);
            setIsInitializing(false);
            return;
          }

          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp && payload.exp < currentTime) {
            // Token is expired
            console.log('Token expired during initialization, clearing stored data');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoading(false);
            setIsInitialized(true);
            setIsInitializing(false);
            return;
          }
        } catch (tokenError) {
          // Invalid token format
          console.error('Invalid token during initialization:', tokenError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoading(false);
          setIsInitialized(true);
          setIsInitializing(false);
          return;
        }

        // Use stored user data immediately for better UX
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('Restored user from localStorage:', userData.name);
          
          // Verify with server in background to ensure data is current
          authService.getCurrentUser().then(freshUserData => {
            // Only update if we're still in the same initialization cycle
            if (isInitialized && !isInitializing) {
              setUser(freshUserData);
              localStorage.setItem('user', JSON.stringify(freshUserData));
              console.log('Refreshed user data from server');
            }
          }).catch(error => {
            console.warn('Failed to refresh user data, clearing invalid auth:', error);
            // If server verification fails with auth error, clear everything
            if (error.status === 401 || error.code === 'UNAUTHORIZED') {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              console.log('Cleared invalid authentication data');
            } else {
              console.warn('Keeping stored data due to non-auth error:', error);
            }
          });
        } catch (userParseError) {
          console.error('Failed to parse stored user data:', userParseError);
          // If stored data is corrupted, try to get fresh data from server
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('Fetched fresh user data from server');
          } catch (serverError) {
            console.error('Failed to get user data from server:', serverError);
            // Clear everything if both stored and server data fail
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        setIsInitializing(false);
        console.log('Auth initialization completed');
      }
    };

    initializeAuth();
  }, [isInitialized, isInitializing]);

  const login = async (credentials: LoginCredentials) => {
    const { user: userData, token } = await authService.login(credentials);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData)); // Store user data for persistence
    setUser(userData);
  };

  const register = async (data: RegisterData) => {
    const { user: userData, token } = await authService.register(data);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData)); // Store user data for persistence
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Clear user data
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser)); // Persist user updates
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};