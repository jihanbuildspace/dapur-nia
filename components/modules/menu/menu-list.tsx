"use client";

import React, { useState, useEffect } from "react";
import { MenuItem } from "@/lib/types";
import { getMenus, addMenu, updateMenu, deleteMenu } from "@/lib/firestore-service";
import { MenuCard } from "./menu-card";
import { MenuDialog } from "./menu-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, UtensilsCrossed, AlertCircle, RefreshCw, Lock, Sparkles, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MenuListProps {
  isOwnerMode?: boolean;
  onRequireLogin?: () => void;
}

export function MenuList({ isOwnerMode = false, onRequireLogin }: MenuListProps) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuToEdit, setMenuToEdit] = useState<MenuItem | null>(null);

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMenus();
      setMenus(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data menu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleOpenAdd = () => {
    if (!isOwnerMode && onRequireLogin) {
      onRequireLogin();
      return;
    }
    setMenuToEdit(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (menu: MenuItem) => {
    if (!isOwnerMode && onRequireLogin) {
      onRequireLogin();
      return;
    }
    setMenuToEdit(menu);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!isOwnerMode && onRequireLogin) {
      onRequireLogin();
      return;
    }
    if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) return;
    try {
      await deleteMenu(id);
      setMenus((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(err.message || "Gagal menghapus menu.");
    }
  };

  const handleUpdatePortion = async (id: string, newPortion: number) => {
    if (!isOwnerMode && onRequireLogin) {
      onRequireLogin();
      return;
    }
    try {
      await updateMenu(id, { remainingPortions: newPortion });
      setMenus((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, remainingPortions: newPortion, isAvailable: newPortion > 0 }
            : m
        )
      );
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui porsi.");
    }
  };

  const handleSaveMenu = async (data: Omit<MenuItem, "id">) => {
    if (menuToEdit) {
      await updateMenu(menuToEdit.id, data);
    } else {
      await addMenu(data);
    }
    await fetchMenus();
  };

  const filteredMenus = menus.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Banner Mode / Status Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base font-bold tracking-tight text-foreground">
            {isOwnerMode ? "Kelola Menu Katering" : "Daftar Menu Katering"}
          </h2>
          {isOwnerMode ? (
            <Badge variant="secondary" className="bg-primary/15 text-primary text-[10px] gap-1 px-1.5 py-0 font-medium border-primary/20">
              <ShieldCheck className="h-3 w-3" /> Mode Pemilik
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-muted-foreground px-1.5 py-0">
              Tamu
            </Badge>
          )}
        </div>

        {!isOwnerMode && onRequireLogin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRequireLogin}
            className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2 font-medium"
          >
            <Lock className="h-3 w-3 mr-1" />
            Kelola Menu
          </Button>
        )}
      </div>

      {/* Header Aksi & Pencarian */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari menu atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-sm h-9 bg-background"
          />
        </div>
        {isOwnerMode ? (
          <Button onClick={handleOpenAdd} size="sm" className="h-9 gap-1 font-medium">
            <Plus className="h-4 w-4" />
            <span>Tambah Menu</span>
          </Button>
        ) : (
          onRequireLogin && (
            <Button
              onClick={onRequireLogin}
              variant="outline"
              size="sm"
              className="h-9 gap-1 text-xs border-primary/30 text-primary hover:bg-primary/10 font-medium"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Menu</span>
            </Button>
          )
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchMenus} className="h-7 text-xs">
            <RefreshCw className="h-3 w-3 mr-1" /> Coba Lagi
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl border border-border p-3 bg-card animate-pulse"
            >
              <div className="h-20 w-20 rounded-lg bg-muted shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="h-4 w-1/4 rounded bg-muted pt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMenus.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 px-4 text-center bg-card/50">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {searchQuery ? "Menu Tidak Ditemukan" : "Belum Ada Menu Katering"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            {searchQuery
              ? `Tidak ada menu yang cocok dengan kata kunci "${searchQuery}".`
              : "Belum ada daftar menu katering yang tersedia saat ini."}
          </p>
          {!searchQuery && (
            <Button
              onClick={handleOpenAdd}
              size="sm"
              className="mt-4 gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>{isOwnerMode ? "Tambah Menu Pertama" : "Masuk & Tambah Menu"}</span>
            </Button>
          )}
        </div>
      ) : (
        /* Grid / List Menu */
        <div className="space-y-2.5">
          {filteredMenus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              isOwner={isOwnerMode}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onUpdatePortion={handleUpdatePortion}
            />
          ))}
        </div>
      )}

      {/* Modal Dialog (Hanya aktif saat pemilik/login) */}
      <MenuDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        menuToEdit={menuToEdit}
        onSave={handleSaveMenu}
      />
    </div>
  );
}

