"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    // Get admin credentials from environment variables
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (adminPhone && adminPassword && phone === adminPhone && password === adminPassword) {
      const adminUser = {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        phone: adminPhone,
        isAdmin: true,
      };

      setUser(adminUser);
      localStorage.setItem("user", JSON.stringify(adminUser));
      return { success: true, message: "Logged in as admin" };
    }

    // Call backend API for regular user login
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    const result = await res.json();
    if (result.success) {
      setUser(result.user);
      localStorage.setItem("user", JSON.stringify(result.user));
    }

    return result;
  };

  const logout = () => {
    if (user) {
      // Clear the user-specific cart from localStorage
      localStorage.removeItem(`cart_${user.id}`);
    }
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin: user?.isAdmin || false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}