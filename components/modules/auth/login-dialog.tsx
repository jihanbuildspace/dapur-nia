"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  Utensils,
  AlertCircle,
  ChefHat,
  Sparkles,
  Zap,
} from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoginDialog({ open, onOpenChange, onSuccess }: LoginDialogProps) {
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Silakan masukkan email dan kata sandi.");
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Gagal masuk. Periksa email dan kata sandi Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setError(null);
    try {
      setIsLoading(true);
      await loginAsDemo(role);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Gagal masuk mode demo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm mb-2">
            <Utensils className="h-5 w-5" />
          </div>
          <DialogTitle className="text-lg font-bold">Masuk ke Dapur Nia</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Masuk sebagai pemilik atau staf katering untuk mengakses fitur pengelola.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-1">
          <div className="space-y-1.5">
            <Label htmlFor="dialog-email" className="text-xs font-semibold">
              Email Akun
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="dialog-email"
                type="email"
                placeholder="dina@dapurnia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 text-sm h-10 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dialog-password" className="text-xs font-semibold">
              Kata Sandi
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="dialog-password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10 text-sm h-10 rounded-xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-10 font-semibold gap-2 rounded-xl mt-1">
            <LogIn className="h-4 w-4" />
            <span>{isLoading ? "Memproses..." : "Masuk"}</span>
          </Button>
        </form>

        {/* Akses Cepat Demo */}
        <div className="pt-2 border-t border-border/70 space-y-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span>Akses Cepat Demo:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin("pemilik")}
              className="h-8 text-xs font-medium border-primary/30 text-primary hover:bg-primary/10 rounded-xl gap-1"
            >
              <ChefHat className="h-3.5 w-3.5" />
              <span>Dina (Pemilik)</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin("staf")}
              className="h-8 text-xs font-medium rounded-xl gap-1"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span>Rani (Staf)</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
