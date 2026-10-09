"use client";

import React, { useState } from "react";
import { useAuth, DEMO_USERS } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
  Utensils,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ChefHat,
  CheckCircle2,
  KeyRound,
  Zap,
} from "lucide-react";

interface LoginPageProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
  onBackToHome: () => void;
}

export function LoginPage({ onSuccess, onSwitchToRegister, onBackToHome }: LoginPageProps) {
  const { login, loginAsDemo, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(null);

    if (!email.trim() || !password) {
      setError("Silakan masukkan email dan kata sandi.");
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Gagal masuk. Periksa email dan kata sandi Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setError(null);
    setResetSuccess(null);
    try {
      setDemoLoadingRole(role);
      await loginAsDemo(role);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Gagal masuk dengan akun demo.");
    } finally {
      setDemoLoadingRole(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(null);

    if (!resetEmail.trim()) {
      setError("Masukkan alamat email untuk pemulihan kata sandi.");
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(resetEmail);
      setResetSuccess(
        `Tautan reset kata sandi telah dikirimkan ke ${resetEmail}. Silakan periksa kotak masuk atau folder spam email Anda.`
      );
    } catch (err: any) {
      setError(err.message || "Gagal mengirimkan email reset kata sandi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 pt-1 animate-in fade-in duration-200">
      {/* Tombol Navigasi Kembali */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Daftar Menu (Tamu)
        </button>

        <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground gap-1">
          <ShieldCheck className="h-3 w-3 text-primary" />
          Autentikasi Aman
        </Badge>
      </div>

      {/* Main Login Card */}
      <Card className="border-border/80 shadow-lg overflow-hidden bg-card/95 backdrop-blur-sm rounded-2xl">
        <CardHeader className="text-center pb-3 pt-6 bg-linear-to-b from-primary/5 to-transparent">
          <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 mb-2.5">
            <Utensils className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            {isResetMode ? "Atur Ulang Kata Sandi" : "Masuk ke Dapur Nia"}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
            {isResetMode
              ? "Masukkan email akun Anda untuk menerima petunjuk pembuatan kata sandi baru."
              : "Kelola pesanan katering harian, stok porsi menu, data pelanggan, dan laporan penjualan."}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 sm:px-6 pb-6 pt-2 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Success Message */}
          {resetSuccess && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in duration-150">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{resetSuccess}</div>
            </div>
          )}

          {!isResetMode ? (
            <>
              {/* Form Login Regular */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Field Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs font-semibold text-foreground">
                    Email Akun <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="contoh: dina@dapurnia.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 text-sm h-10 bg-background/80 rounded-xl"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Field Kata Sandi */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-xs font-semibold text-foreground">
                      Kata Sandi <span className="text-destructive">*</span>
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setResetSuccess(null);
                        setResetEmail(email);
                        setIsResetMode(true);
                      }}
                      className="text-[11px] font-medium text-primary hover:underline underline-offset-2"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan kata sandi akun"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 text-sm h-10 bg-background/80 rounded-xl"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                      aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Tombol Submit Masuk */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 font-semibold gap-2 mt-2 shadow-sm rounded-xl"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{isLoading ? "Memverifikasi Akun..." : "Masuk ke Aplikasi"}</span>
                </Button>
              </form>

              {/* Pemisah atau */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/80" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-card px-2.5 text-muted-foreground font-semibold tracking-wider">
                    atau uji coba cepat
                  </span>
                </div>
              </div>

              {/* Opsi Akses Demo Instan */}
              <div className="space-y-2 rounded-xl bg-muted/40 p-3 border border-border/60">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1">
                  <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>Masuk Cepat Demo (1-Klik)</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Gunakan peran instan untuk menguji fitur tanpa perlu mendaftar manual:
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={Boolean(demoLoadingRole)}
                    onClick={() => handleDemoLogin("pemilik")}
                    className="h-auto py-2 px-2.5 flex flex-col items-start text-left border-primary/30 hover:border-primary hover:bg-primary/5 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-1 font-semibold text-xs text-primary">
                      <ChefHat className="h-3.5 w-3.5" />
                      <span>Dina (Pemilik)</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                      Kelola Menu & Laporan
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={Boolean(demoLoadingRole)}
                    onClick={() => handleDemoLogin("staf")}
                    className="h-auto py-2 px-2.5 flex flex-col items-start text-left border-border hover:border-foreground/30 hover:bg-muted/70 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-1 font-semibold text-xs text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                      <span>Rani (Staf)</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                      Operasional Pesanan
                    </span>
                  </Button>
                </div>
              </div>

              {/* Switch ke Halaman Daftar */}
              <div className="pt-2 text-center border-t border-border/60">
                <p className="text-xs text-muted-foreground">
                  Belum memiliki akun pengelola?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="font-bold text-primary hover:underline underline-offset-2 ml-1"
                  >
                    Daftar Akun Baru
                  </button>
                </p>
              </div>
            </>
          ) : (
            /* Mode Pemulihan Kata Sandi */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="text-xs font-semibold text-foreground">
                  Email Akun Terdaftar <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-9 text-sm h-10 bg-background/80 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsResetMode(false);
                    setError(null);
                    setResetSuccess(null);
                  }}
                  className="flex-1 h-10 text-xs rounded-xl"
                >
                  Kembali ke Masuk
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-10 text-xs font-semibold gap-1.5 rounded-xl"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>{isLoading ? "Mengirimkan..." : "Kirim Tautan"}</span>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
