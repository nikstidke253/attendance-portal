import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(null);
  
  // Function to check session validity
  const checkSession = useCallback(async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/session-check`);
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        return false;
      }
      return true;
    }
  }, []);
  
  // Reset session timer on user activity
  const resetSessionTimer = useCallback(() => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    
    const timer = setTimeout(() => {
      checkSession();
    }, 14 * 60 * 1000); // Check at 14 minutes
    
    setSessionTimer(timer);
  }, [sessionTimer, checkSession]);
  
  // Add activity listeners
  useEffect(() => {
    if (isAuthenticated) {
      const events = ['mousedown', 'keydown', 'scroll', 'click', 'touchstart'];
      
      const handleActivity = () => {
        resetSessionTimer();
      };
      
      events.forEach(event => {
        window.addEventListener(event, handleActivity);
      });
      
      resetSessionTimer();
      
      return () => {
        events.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
        if (sessionTimer) {
          clearTimeout(sessionTimer);
        }
      };
    }
  }, [isAuthenticated, resetSessionTimer, sessionTimer]);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/me`);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Fetch user error:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (username, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        username,
        password
      });
      
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return false;
    }
  };
  
  const logout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    // Force reload to clear all state
    window.location.href = '/login';
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};