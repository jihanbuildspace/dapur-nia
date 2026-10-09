"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User as UserIcon,
  LogOut,
  Mail,
  ShieldCheck,
  ChefHat,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void;
  onResetData?: () => void;
}

export function UserProfileDialog({
  open,
  onOpenChange,
  onLogout,
  onResetData,
}: UserProfileDialogProps) {
  const { userName, userEmail, userRole, isOwner, loginAsDemo, logout } = useAuth();

  const handleLogoutClick = async () => {
    await logout();
    onOpenChange(false);
    onLogout();
  };

  const handleSwitchRole = async (targetRole: "pemilik" | "staf") => {
    await loginAsDemo(targetRole);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-primary" />
            Profil Akun Pengelola
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Info Pengguna */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/50 border border-border/80">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary font-bold text-primary-foreground text-lg shadow-sm shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-foreground truncate">{userName}</h3>
                <Badge
                  variant={isOwner ? "default" : "secondary"}
                  className="text-[10px] px-1.5 py-0 font-semibold"
                >
                  {isOwner ? "Pemilik (Dina)" : "Staf (Rani)"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3" />
                {userEmail || "akun-demo@dapurnia.com"}
              </p>
            </div>
          </div>

          {/* Hak Akses Peran Aktif */}
          <div className="rounded-xl border border-border/70 p-3 bg-card space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Hak Akses Aktif:</span>
            </div>
            <ul className="text-[11px] text-muted-foreground space-y-1 pl-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                <span>Melihat dan menyaring daftar pesanan harian</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                <span>Memperbarui status alur pesanan katering</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                <span>{isOwner ? "Akses penuh: Tambah, edit, & hapus menu" : "Melihat ketersediaan stok & porsi menu"}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                <span>Melihat rekap laporan penjualan dan pendapatan</span>
              </li>
            </ul>
          </div>

          {/* Penggantian Peran Cepat untuk Pengujian */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Ganti Peran Uji Coba:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={userRole === "pemilik" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSwitchRole("pemilik")}
                className="h-8 text-xs font-semibold gap-1.5 rounded-xl"
              >
                <ChefHat className="h-3.5 w-3.5" />
                <span>Sebagai Pemilik</span>
              </Button>
              <Button
                type="button"
                variant={userRole === "staf" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSwitchRole("staf")}
                className="h-8 text-xs font-semibold gap-1.5 rounded-xl"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Sebagai Staf</span>
              </Button>
            </div>
          </div>

          {/* Aksi Tambahan: Reset Data & Logout */}
          <div className="pt-2 border-t border-border/70 flex items-center justify-between gap-2">
            {onResetData ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onResetData();
                }}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Demo</span>
              </Button>
            ) : <div />}

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleLogoutClick}
              className="h-8 text-xs font-semibold gap-1.5 rounded-xl"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar Akun</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
