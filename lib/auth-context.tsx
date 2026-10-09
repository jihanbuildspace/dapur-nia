"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase";
import { AppUser, UserRole } from "./types";

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  isOwner: boolean;
  isStaff: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = "dapur_nia_auth_user_v2";

export const DEMO_USERS: Record<UserRole, { name: string; email: string; role: UserRole; roleLabel: string; description: string }> = {
  pemilik: {
    name: "Dina (Pemilik)",
    email: "dina@dapurnia.com",
    role: "pemilik",
    roleLabel: "Pemilik Katering",
    description: "Akses penuh: kelola menu, pesanan, pelanggan, laporan, & reset data.",
  },
  staf: {
    name: "Rani (Staf)",
    email: "rani@dapurnia.com",
    role: "staf",
    roleLabel: "Staf Operasional",
    description: "Akses operasional: perbarui status pesanan & pantau stok menu.",
  },
  pelanggan: {
    name: "Pelanggan Setia",
    email: "pelanggan@dapurnia.com",
    role: "pelanggan",
    roleLabel: "Pelanggan Katering",
    description: "Akses pemesanan: lihat menu harian, buat pesanan, & cek ringkasan.",
  },
};

function formatAuthError(err: any): string {
  const code = err?.code || "";
  switch (code) {
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/user-disabled":
      return "Akun ini telah dinonaktifkan.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email atau kata sandi salah. Silakan periksa kembali.";
    case "auth/email-already-in-use":
      return "Email sudah terdaftar. Silakan masuk menggunakan akun tersebut.";
    case "auth/weak-password":
      return "Kata sandi terlalu lemah. Gunakan minimal 6 karakter.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat lagi.";
    case "auth/network-request-failed":
      return "Koneksi internet bermasalah. Periksa jaringan Anda.";
    default:
      return err?.message || "Terjadi kesalahan saat autentikasi.";
  }
}

function determineRoleFromEmail(email: string): UserRole {
  const lower = email.toLowerCase();
  if (lower.includes("dina") || lower.includes("pemilik") || lower.includes("owner") || lower.includes("admin")) {
    return "pemilik";
  }
  if (lower.includes("rani") || lower.includes("staf") || lower.includes("staff")) {
    return "staf";
  }
  return "pemilik"; // default fallback for training app
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved local user session
    try {
      const saved = localStorage.getItem(LOCAL_AUTH_KEY);
      if (saved) {
        const parsed: AppUser = JSON.parse(saved);
        setAppUser(parsed);
      }
    } catch {
      // Ignore parse error
    }

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const email = currentUser.email || "";
          const name = currentUser.displayName || email.split("@")[0] || "Pemilik";
          const role = determineRoleFromEmail(email);

          const profile: AppUser = {
            uid: currentUser.uid,
            name,
            email,
            role,
          };
          setAppUser(profile);
          try {
            localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
          } catch {}
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (!email.trim() || !password) {
      throw new Error("Email dan kata sandi wajib diisi.");
    }

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const u = userCredential.user;
        setUser(u);
        const role = determineRoleFromEmail(u.email || email);
        const profile: AppUser = {
          uid: u.uid,
          name: u.displayName || (u.email ? u.email.split("@")[0] : "Pengguna"),
          email: u.email || email.trim(),
          role,
        };
        setAppUser(profile);
        try {
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
        } catch {}
      } catch (err: any) {
        // If user not found and it's demo/offline friendly, or firestore mock
        throw new Error(formatAuthError(err));
      }
    } else {
      // Fallback local auth simulation
      const role = determineRoleFromEmail(email);
      const name = email.split("@")[0] || "Pengguna";
      const profile: AppUser = {
        uid: "local-" + Date.now(),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email.trim(),
        role,
      };
      setAppUser(profile);
      try {
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
      } catch {}
    }
  };

  const loginAsDemo = async (role: UserRole) => {
    const demo = DEMO_USERS[role];
    const profile: AppUser = {
      uid: `demo-${role}-${Date.now()}`,
      name: demo.name,
      email: demo.email,
      role: demo.role,
    };
    setAppUser(profile);
    try {
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
    } catch {}
  };

  const register = async (name: string, email: string, password: string, role: UserRole = "pemilik") => {
    if (!name.trim()) {
      throw new Error("Nama lengkap akun wajib diisi.");
    }
    if (!email.trim()) {
      throw new Error("Email akun wajib diisi.");
    }
    if (password.length < 6) {
      throw new Error("Kata sandi minimal 6 karakter.");
    }

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const u = userCredential.user;
        await updateProfile(u, {
          displayName: name.trim(),
        });
        setUser({ ...u, displayName: name.trim() } as User);
        const profile: AppUser = {
          uid: u.uid,
          name: name.trim(),
          email: email.trim(),
          role,
        };
        setAppUser(profile);
        try {
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
        } catch {}
      } catch (err: any) {
        throw new Error(formatAuthError(err));
      }
    } else {
      const profile: AppUser = {
        uid: "local-" + Date.now(),
        name: name.trim(),
        email: email.trim(),
        role,
      };
      setAppUser(profile);
      try {
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
      } catch {}
    }
  };

  const resetPassword = async (email: string) => {
    if (!email.trim()) {
      throw new Error("Masukkan alamat email untuk reset kata sandi.");
    }
    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, email.trim());
      } catch (err: any) {
        throw new Error(formatAuthError(err));
      }
    } else {
      // Offline / Local feedback
      await new Promise((res) => setTimeout(res, 500));
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("Sign out error:", e);
      }
    }
    setUser(null);
    setAppUser(null);
    try {
      localStorage.removeItem(LOCAL_AUTH_KEY);
    } catch {}
  };

  const isAuthenticated = Boolean(user || appUser);
  const userRole: UserRole = appUser?.role || (isAuthenticated ? "pemilik" : "pelanggan");
  const userName = appUser?.name || user?.displayName || user?.email?.split("@")[0] || "Tamu";
  const userEmail = appUser?.email || user?.email || "";
  const isOwner = isAuthenticated && (userRole === "pemilik");
  const isStaff = isAuthenticated && (userRole === "pemilik" || userRole === "staf");

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser,
        userName,
        userEmail,
        userRole,
        isOwner,
        isStaff,
        isAuthenticated,
        isLoading,
        login,
        loginAsDemo,
        register,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
