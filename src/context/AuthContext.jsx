import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [users, setUsers] = useState(() => storageService.getUsers());

  // Check and restore active persistent token rotation session on load
  useEffect(() => {
    let isMounted = true;
    async function initSession() {
      try {
        const user = await authService.checkSession();
        if (isMounted) {
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
          } else {
            // Check if there is a remembered user in local storage
            const registered = authService.getRegisteredAccounts();
            if (registered && registered.length > 0) {
              // Auto-authenticate with the primary account for seamless zero-barrier experience
              const primary = registered[0];
              const loggedIn = await authService.login(primary.email, primary.passwordHash, true);
              setCurrentUser(loggedIn);
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
            }
          }
        }
      } catch (err) {
        if (isMounted) setIsAuthenticated(false);
      } finally {
        if (isMounted) setIsLoadingSession(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password, rememberMe = true) => {
    const user = await authService.login(email, password, rememberMe);
    setCurrentUser(user);
    setIsAuthenticated(true);
    // Sync into user list
    setUsers(prev => {
      if (prev.some(u => u.id === user.id)) return prev;
      return [...prev, user];
    });
    return user;
  };

  const register = async (formData) => {
    const newUser = await authService.register(formData);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const logout = () => {
    authService.clearSession();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const switchUser = async (userId) => {
    const accounts = authService.getRegisteredAccounts();
    const target = accounts.find(a => a.id === userId);
    if (target) {
      const loggedIn = await authService.login(target.email, target.passwordHash, true);
      setCurrentUser(loggedIn);
      setIsAuthenticated(true);
    }
  };

  const addNewUser = ({ name, email, role, avatarColor, bio }) => {
    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      passwordHash: 'paltech2026',
      role: role ? role.trim() : 'Team Member',
      avatarColor: avatarColor || '#0077E6',
      bio: bio ? bio.trim() : ''
    };
    authService.saveAccount(newUser);
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  return (
    <AuthContext.Provider value={{
      users,
      currentUser,
      isAuthenticated,
      isLoadingSession,
      login,
      register,
      logout,
      switchUser,
      addNewUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
