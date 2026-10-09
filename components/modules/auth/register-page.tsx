"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  Utensils,
  AlertCircle,
  ChefHat,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";

interface RegisterPageProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
  onBackToHome: () => void;
}

export function RegisterPage({ onSuccess, onSwitchToLogin, onBackToHome }: RegisterPageProps) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("pemilik");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama lengkap pemilik/staf wajib diisi.");
      return;
    }
    if (!email.trim()) {
      setError("Alamat email wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.");
      return;
    }

    try {
      setIsLoading(true);
      await register(name.trim(), email.trim(), password, role);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Gagal mendaftarkan akun. Silakan coba lagi.");
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
          Pendaftaran Baru
        </Badge>
      </div>

      {/* Main Register Card */}
      <Card className="border-border/80 shadow-lg overflow-hidden bg-card/95 backdrop-blur-sm rounded-2xl">
        <CardHeader className="text-center pb-3 pt-6 bg-linear-to-b from-primary/5 to-transparent">
          <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 mb-2.5">
            <Utensils className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Daftar Akun Dapur Nia
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
            Buat akun pengelola untuk mengatur menu harian katering, melayani pesanan, dan mencatat laporan.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 sm:px-6 pb-6 pt-2 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Field Nama */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-name" className="text-xs font-semibold text-foreground">
                Nama Lengkap / Panggilan <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="Contoh: Dina Rachmawati"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 text-sm h-10 bg-background/80 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Pilihan Peran Akun */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Peran Pengguna <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("pemilik")}
                  className={`flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all ${
                    role === "pemilik"
                      ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                      : "border-border/80 bg-background/50 hover:bg-muted/60 text-muted-foreground"
                  }`}
                >
                  <ChefHat className={`h-4 w-4 shrink-0 mt-0.5 ${role === "pemilik" ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold flex items-center justify-between">
                      <span>Pemilik</span>
                      {role === "pemilik" && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5 leading-tight">
                      Akses menu & laporan penuh
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("staf")}
                  className={`flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all ${
                    role === "staf"
                      ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                      : "border-border/80 bg-background/50 hover:bg-muted/60 text-muted-foreground"
                  }`}
                >
                  <Sparkles className={`h-4 w-4 shrink-0 mt-0.5 ${role === "staf" ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold flex items-center justify-between">
                      <span>Staf</span>
                      {role === "staf" && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5 leading-tight">
                      Kelola status pesanan
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Field Email */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-xs font-semibold text-foreground">
                Email Akun <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-email"
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
              <Label htmlFor="reg-password" className="text-xs font-semibold text-foreground">
                Kata Sandi (Minimal 6 Karakter) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat kata sandi aman"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 text-sm h-10 bg-background/80 rounded-xl"
                  autoComplete="new-password"
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

            {/* Konfirmasi Kata Sandi */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-confirm" className="text-xs font-semibold text-foreground">
                Konfirmasi Kata Sandi <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ketik ulang kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 text-sm h-10 bg-background/80 rounded-xl"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* Tombol Submit Daftar */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 font-semibold gap-2 mt-2 shadow-sm rounded-xl"
            >
              <UserPlus className="h-4 w-4" />
              <span>{isLoading ? "Mendaftarkan Akun..." : "Daftar & Masuk ke Dapur Nia"}</span>
            </Button>
          </form>

          {/* Switch ke Halaman Masuk */}
          <div className="pt-3 text-center border-t border-border/60">
            <p className="text-xs text-muted-foreground">
              Sudah memiliki akun pengelola?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-bold text-primary hover:underline underline-offset-2 ml-1"
              >
                Masuk di sini
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
