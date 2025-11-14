// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage
  const [user, setUser] = useState(() => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      try {
        return JSON.parse(userDataString);
      } catch (e) {
        console.error('Error parsing userData from localStorage:', e);
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // Sync user across tabs
  useEffect(() => {
    const syncUser = () => {
      const userDataString = localStorage.getItem("userData");
      if (userDataString) {
        try {
          setUser(JSON.parse(userDataString));
        } catch (e) {
          console.error('Error parsing userData:', e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Run once on mount
    syncUser();
    setLoading(false);

    // Listen for changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === "userData") {
        syncUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("userData", JSON.stringify(user));
      // Keep legacy keys for backwards compatibility
      localStorage.setItem("userId", user.id);
      localStorage.setItem("email", user.email);
      if (user.token) localStorage.setItem("token", user.token);
    } else {
      localStorage.removeItem("userData");
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
      localStorage.removeItem("token");
    }
  }, [user]);

  const login = (userData) => {
    console.log('Login called with userData:', userData);
    setUser(userData);
    // 🔑 Important: force storage event so other tabs update immediately
    localStorage.setItem("loginEvent", Date.now());
  };

const logout = async () => {
  try {
    // Sign out from Firebase
    await signOut(auth);
    console.log('Signed out from Firebase');
  } catch (error) {
    console.error('Error signing out from Firebase:', error);
  }
  
  setUser(null);
  // Remove persisted user info
  localStorage.removeItem("userData");
  localStorage.removeItem("userId");
  localStorage.removeItem("email");
  localStorage.removeItem("token");
  // Trigger logout event for other tabs
  localStorage.setItem("logoutEvent", Date.now());
};

  // Also listen for custom login/logout events
  useEffect(() => {
    const syncEvents = (e) => {
      if (e.key === "loginEvent" || e.key === "logoutEvent") {
        const userDataString = localStorage.getItem("userData");
        if (userDataString) {
          try {
            setUser(JSON.parse(userDataString));
          } catch (e) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", syncEvents);
    return () => window.removeEventListener("storage", syncEvents);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
