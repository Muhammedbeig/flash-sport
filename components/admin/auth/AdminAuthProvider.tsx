"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/firebase-client";

type AdminAuthContextValue = {
  user: User | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const BYPASS = process.env.NEXT_PUBLIC_ADMIN_BYPASS_AUTH === "true";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (BYPASS) {
      // ✅ Fake logged-in user for development
      setUser(({ uid: "dev-admin", email: "adminb@livesoccerr.com" } as any) as User);
      setLoading(false);
      return;
    }

    setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {
      // ignore
    });

    const unsub = onAuthStateChanged(firebaseAuth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, [BYPASS]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      loading,
      signInEmail: async (email, password) => {
        if (BYPASS) return;
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      },
      signInGoogle: async () => {
        if (BYPASS) return;
        const provider = new GoogleAuthProvider();
        await signInWithPopup(firebaseAuth, provider);
      },
      logout: async () => {
        if (BYPASS) return;
        await signOut(firebaseAuth);
      },
    }),
    [user, loading, BYPASS]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
