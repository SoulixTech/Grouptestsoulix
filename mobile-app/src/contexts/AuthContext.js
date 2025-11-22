import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../config/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const adminStatus = await SecureStore.getItemAsync('isAdmin');
      const adminUser = await SecureStore.getItemAsync('adminUser');
      
      if (adminStatus === 'true' && adminUser) {
        setIsAdmin(true);
        setCurrentUser(adminUser);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        return { success: false, message: 'Invalid credentials' };
      }

      setIsAdmin(true);
      setCurrentUser(username);
      await SecureStore.setItemAsync('isAdmin', 'true');
      await SecureStore.setItemAsync('adminUser', username);
      
      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      setIsAdmin(false);
      setCurrentUser(null);
      await SecureStore.deleteItemAsync('isAdmin');
      await SecureStore.deleteItemAsync('adminUser');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAdmin, currentUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
