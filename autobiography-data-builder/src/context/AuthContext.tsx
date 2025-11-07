"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  User,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const provider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const ref = doc(db, "users", firebaseUser.uid);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setIsAdmin(Boolean(data.isAdmin));
        } else {
          await setDoc(ref, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            createdAt: new Date().toISOString(),
            isAdmin: false,
          });
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      loginWithEmail: async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      signupWithEmail: async (
        email: string,
        password: string,
        displayName: string
      ) => {
        const credentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (credentials.user) {
          await updateProfile(credentials.user, { displayName });
          await setDoc(doc(db, "users", credentials.user.uid), {
            email,
            displayName,
            createdAt: new Date().toISOString(),
            isAdmin: false,
          });
        }
      },
      loginWithGoogle: async () => {
        await signInWithPopup(auth, provider);
      },
      logout: async () => {
        await signOut(auth);
      },
    }),
    [user, loading, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
