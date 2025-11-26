// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { users } from '../data/mockData';
import { loginUser } from '../services/api';

export interface User {
  user_id: number;
  name: string;
  email: string;
  mobile?: string;
  role: 'student' | 'teacher' | 'admin' | 'partner' | 'both';
  city?: string;
  address?: string;
  photo_url?: string; // Add this line
  created_at: string;
  student?: any;
  teacher?: any;
  partner?: any;
  course?: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  updateUser: (userData: User) => void; // Add this function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for stored user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Add updateUser function
  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 AuthContext: Starting login process for:', email);
      console.log('🔐 AuthContext: Mock users available:', users.length);

      // First, try mock data login
      console.log('🔐 AuthContext: Searching for user in mock data...');
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        console.log('🔐 AuthContext: User found in mock data:', foundUser);
        
        // Convert mock user to match User interface
        const userData: User = {
          user_id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          mobile: (foundUser as any).mobile || '',
          role: (foundUser as any).role as 'student' | 'teacher' | 'admin' | 'partner' | 'both',
          city: (foundUser as any).city || '',
          address: (foundUser as any).address || '',
          photo_url: (foundUser as any).photo_url || '', // Add this line
          created_at: (foundUser as any).created_at || new Date().toISOString(),
          student: (foundUser as any).student,
          teacher: (foundUser as any).teacher,
          partner: (foundUser as any).partner,
          course: (foundUser as any).course
        };
        
        console.log('🔐 AuthContext: Setting user data:', userData);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('🔐 AuthContext: Mock data login successful!');
        return true;
      } else {
        console.log('🔐 AuthContext: User NOT found in mock data');
        console.log('🔐 AuthContext: Available emails:', users.map(u => u.email));
      }

      console.log('🔐 AuthContext: Attempting API login as fallback...');

      // If not found in mock data, try API login
      const response = await loginUser(email, password);
      
      console.log('🔐 AuthContext: API login response:', response);

      if (response.success && response.data) {
        const userData: User = {
          user_id: response.data.user_id,
          name: response.data.name,
          email: response.data.email,
          mobile: response.data.mobile || '',
          role: response.data.role,
          city: response.data.city || '',
          address: response.data.address || '',
          photo_url: response.data.photo_url || '', // Add this line
          created_at: response.data.created_at,
          student: response.data.student,
          teacher: response.data.teacher,
          partner: response.data.partner,
          course: response.data.course
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('🔐 AuthContext: API login successful');
        return true;
      } else {
        throw new Error(response.message || 'Invalid email or password');
      }

    } catch (error) {
      console.error('🔐 AuthContext: Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      error,
      updateUser // Add this to the provider value
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};