import React, { createContext, useState, useContext, ReactNode } from 'react';
import { users } from '../data/mockData';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, pass: string) => {
    const foundUser = users.find(u => u.email === email && u.password === pass);
    if (foundUser) {
      // In a real app, you wouldn't store the password in the user state
      const { password, ...userToStore } = foundUser;
      setUser(userToStore as User);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};