import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { firebaseAuthService, firebaseService } from '../services/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [users, setUsers] = useState(() => storageService.getUsers());

  // Subscribe to Firestore users collection in real time
  useEffect(() => {
    const unsub = firebaseService.subscribeToUsers((remoteUsers) => {
      if (remoteUsers && remoteUsers.length > 0) {
        setUsers(remoteUsers);
        storageService.saveUsers(remoteUsers);
        // If current user is in remote users, sync updated role immediately
        if (currentUser) {
          const freshMe = remoteUsers.find(u => u.id === currentUser.id || u.email?.toLowerCase() === currentUser.email?.toLowerCase());
          if (freshMe && freshMe.role !== currentUser.role) {
            setCurrentUser(prev => ({ ...prev, role: freshMe.role }));
          }
        }
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, [currentUser]);

  // Listen to Firebase Authentication state change & session recovery
  useEffect(() => {
    let isMounted = true;

    // First try Firebase Auth state listener
    const unsubscribe = firebaseAuthService.onAuthStateChanged((profile) => {
      if (!isMounted) return;
      if (profile) {
        setCurrentUser(profile);
        setIsAuthenticated(true);
        setUsers(prev => {
          if (prev.some(u => u.id === profile.id)) {
            return prev.map(u => u.id === profile.id ? { ...u, ...profile } : u);
          }
          return [...prev, profile];
        });
        setIsLoadingSession(false);
      } else {
        // Fallback: Check local auth session
        authService.checkSession().then(localUser => {
          if (!isMounted) return;
          if (localUser) {
            setCurrentUser(localUser);
            setIsAuthenticated(true);
          } else {
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
          setIsLoadingSession(false);
        }).catch(() => {
          if (isMounted) {
            setCurrentUser(null);
            setIsAuthenticated(false);
            setIsLoadingSession(false);
          }
        });
      }
    });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Google Sign-In
  const loginWithGoogle = async () => {
    const profile = await firebaseAuthService.signInWithGoogle();
    setCurrentUser(profile);
    setIsAuthenticated(true);
    setUsers(prev => {
      if (prev.some(u => u.id === profile.id || u.email?.toLowerCase() === profile.email?.toLowerCase())) {
        return prev.map(u => (u.id === profile.id || u.email?.toLowerCase() === profile.email?.toLowerCase()) ? { ...u, ...profile } : u);
      }
      return [...prev, profile];
    });
    return profile;
  };

  // Email & Password Sign-In
  const loginWithEmail = async (email, password, rememberMe = true) => {
    let profile = null;
    const fbAuth = firebaseAuthService.getAuthInstance();
    
    if (fbAuth) {
      try {
        profile = await firebaseAuthService.signInWithEmail(email, password);
      } catch (err) {
        // Fallback to local accounts
        console.warn('Firebase sign-in failed, attempting workspace credential validation:', err);
        profile = await authService.login(email, password, rememberMe);
      }
    } else {
      profile = await authService.login(email, password, rememberMe);
    }

    setCurrentUser(profile);
    setIsAuthenticated(true);
    setUsers(prev => {
      if (prev.some(u => u.id === profile.id || u.email?.toLowerCase() === profile.email?.toLowerCase())) {
        return prev.map(u => (u.id === profile.id || u.email?.toLowerCase() === profile.email?.toLowerCase()) ? { ...u, ...profile } : u);
      }
      return [...prev, profile];
    });
    return profile;
  };

  // Email & Password Sign-Up (Defaults to Employee role)
  const registerWithEmail = async ({ name, email, password }) => {
    let profile = null;
    const fbAuth = firebaseAuthService.getAuthInstance();
    const isSeedAdmin = email.trim().toLowerCase() === 'balakamal.cloud@gmail.com' || email.trim().toLowerCase() === 'kamal.t@pal.tech';
    const assignedRole = isSeedAdmin ? 'Admin' : 'Employee';

    if (fbAuth) {
      try {
        profile = await firebaseAuthService.registerWithEmail(email, password, name);
      } catch (err) {
        console.warn('Firebase register failed, saving to local accounts:', err);
        profile = await authService.register({ name, email, password, role: assignedRole });
        try {
          await firebaseAuthService.adminCreateUser(profile);
        } catch (e) {
          console.warn('Could not sync user to Firestore:', e);
        }
      }
    } else {
      profile = await authService.register({ name, email, password, role: assignedRole });
    }

    setCurrentUser(profile);
    setIsAuthenticated(true);
    setUsers(prev => [...prev.filter(u => u.id !== profile.id && u.email?.toLowerCase() !== profile.email?.toLowerCase()), profile]);
    return profile;
  };

  // Logout
  const logout = async () => {
    try {
      await firebaseAuthService.signOutUser();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    authService.clearSession();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Admin: Update User Role (Admin only)
  const updateUserRole = async (userId, newRole) => {
    if (currentUser?.role !== 'Admin') {
      throw new Error('Only an Administrator can change user roles.');
    }

    await firebaseAuthService.updateUserRole(userId, newRole);
    authService.updateUserRole(userId, newRole);

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, role: newRole }));
    }
    return true;
  };

  // Admin: Directly Add User (Admin only)
  const adminAddUser = async ({ name, email, password, role = 'Employee' }) => {
    if (currentUser?.role !== 'Admin') {
      throw new Error('Only an Administrator can add workspace users.');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: password || 'welcome123',
      role: role || 'Employee',
      avatarColor: '#0077E6',
      createdAt: new Date().toISOString()
    };

    authService.saveAccount(newUser);
    await firebaseAuthService.adminCreateUser(newUser);

    setUsers(prev => [...prev.filter(u => u.id !== newUser.id), newUser]);
    return newUser;
  };

  // Deduplicate users list by email and id so each account only appears once
  const uniqueUsers = React.useMemo(() => {
    const seenEmails = new Set();
    const seenIds = new Set();
    const result = [];
    for (const u of users) {
      const emailNorm = (u.email || '').toLowerCase().trim();
      if (emailNorm && seenEmails.has(emailNorm)) continue;
      if (u.id && seenIds.has(u.id)) continue;
      if (emailNorm) seenEmails.add(emailNorm);
      if (u.id) seenIds.add(u.id);
      result.push(u);
    }
    return result;
  }, [users]);

  return (
    <AuthContext.Provider value={{
      users: uniqueUsers,
      currentUser,
      isAuthenticated,
      isLoadingSession,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
      updateUserRole,
      adminAddUser
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

export default AuthContext;
