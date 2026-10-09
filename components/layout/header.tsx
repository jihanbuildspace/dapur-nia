"use client";

import React, { useState } from "react";
import { Utensils, RotateCcw, Sparkles, LogIn, LogOut, User as UserIcon, ChefHat, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { UserProfileDialog } from "@/components/modules/auth/user-profile-dialog";

interface HeaderProps {
  onResetData?: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

export function Header({ onResetData, onOpenLogin, onLogout }: HeaderProps) {
  const { isAuthenticated, userName, userRole, isOwner, logout } = useAuth();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const handleLogoutClick = async () => {
    await logout();
    if (onLogout) onLogout();
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md px-4 py-2.5 shadow-xs">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          {/* Brand & Identitas */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-foreground">
                  Dapur Nia
                </h1>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium bg-primary/10 text-primary border-primary/20">
                  Sesi 3
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500 inline" />
                Katering Harian & Pesanan
              </p>
            </div>
          </div>

          {/* Status Autentikasi Pengguna di Bagian Kanan Header */}
          <div className="flex items-center gap-1.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                {/* Tombol Profil Pengguna Interaktif */}
                <button
                  type="button"
                  onClick={() => setProfileDialogOpen(true)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-muted/60 hover:bg-muted border border-border/80 transition-colors text-left"
                  title="Lihat profil dan pengaturan peran"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0 max-w-[90px] sm:max-w-[120px]">
                    <span className="text-xs font-semibold text-foreground truncate leading-tight">
                      {userName}
                    </span>
                    <span className="text-[10px] text-primary font-medium leading-none mt-0.5">
                      {isOwner ? "Pemilik" : "Staf"}
                    </span>
                  </div>
                </button>

                {/* Tombol Keluar Cepat */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogoutClick}
                  title="Keluar dari akun"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="default"
                  size="sm"
                  onClick={onOpenLogin}
                  className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-xl shadow-xs"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Masuk</span>
                </Button>

                {onResetData && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onResetData}
                    title="Reset data contoh demo"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-xl"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Dialog Profil Akun */}
      <UserProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        onLogout={() => {
          if (onLogout) onLogout();
        }}
        onResetData={onResetData}
      />
    </>
  );
}
