import { useState, useEffect } from "react";
import {
  auth,
  signInWithGoogle,
  getRedirectResultAsync,
} from "../lib/firebase-client";
import { onAuthStateChanged, signOut } from "firebase/auth";

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: "student" | "admin";
  displayName: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const API_BASE = "";

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        // Check for redirect result (when user returns from Google)
        const result = await getRedirectResultAsync();
        if (result && result.user) {
          const idToken = await result.user.getIdToken();
          const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setState({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return; // Already logged in, no need to subscribe
          } else {
            setState({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }
        }
      } catch (error) {
        console.error("Redirect sign-in error:", error);
        setState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // If no redirect result, listen to auth state changes
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setState({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            setState({ user: null, isAuthenticated: false, isLoading: false });
          }
        } else {
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      });
    };

    initializeAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async () => {
    try {
      await signInWithGoogle();
      // Page redirects to Google — user will come back and the redirect result will be handled
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return { ...state, login, logout };
}
