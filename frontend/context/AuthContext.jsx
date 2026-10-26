"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  getStoredUser,
  fetchCurrentUser,
  signIn as apiSignIn,
  signUp as apiSignUp,
  clearSession,
} from "@/lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load: show whatever we have cached immediately (no flash of
  // "logged out"), then verify with the backend that the token is still
  // valid and refresh with the real record.
  useEffect(() => {
    const cached = getStoredUser();
    if (cached) setUser(cached);

    fetchCurrentUser()
      .then((u) => setUser(u)) // null if token invalid/expired
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function signIn(credentials) {
    const u = await apiSignIn(credentials);
    setUser(u);
    return u;
  }

  async function signUp(details) {
    const u = await apiSignUp(details);
    setUser(u);
    return u;
  }

  function signOut() {
    clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
