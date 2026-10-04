"use client";

import React, { useState, useEffect } from "react";
import { MenuItem } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuToEdit?: MenuItem | null;
  onSave: (data: Omit<MenuItem, "id">) => Promise<void>;
}

export function MenuDialog({
  open,
  onOpenChange,
  menuToEdit,
  onSave,
}: MenuDialogProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [remainingPortions, setRemainingPortions] = useState<number | string>("");
  const [category, setCategory] = useState("Paket Nasi");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (menuToEdit) {
      setName(menuToEdit.name || "");
      setPrice(menuToEdit.price ?? "");
      setRemainingPortions(menuToEdit.remainingPortions ?? "");
      setCategory(menuToEdit.category || "Paket Nasi");
      setDescription(menuToEdit.description || "");
      setImageUrl(menuToEdit.imageUrl || "");
    } else {
      setName("");
      setPrice("");
      setRemainingPortions(10);
      setCategory("Paket Nasi");
      setDescription("");
      setImageUrl("");
    }
    setErrorMessage("");
  }, [menuToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validasi Skenario Uji Tembus
    if (!name.trim()) {
      setErrorMessage("Nama menu wajib diisi.");
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || price === "") {
      setErrorMessage("Harga harus berupa angka yang valid.");
      return;
    }
    if (numPrice < 0) {
      setErrorMessage("Harga menu tidak boleh kurang dari 0.");
      return;
    }

    const numPortions = Number(remainingPortions);
    if (isNaN(numPortions) || remainingPortions === "") {
      setErrorMessage("Sisa porsi harus berupa angka yang valid.");
      return;
    }
    if (numPortions < 0) {
      setErrorMessage("Sisa porsi tidak boleh kurang dari 0.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        price: numPrice,
        remainingPortions: numPortions,
        category,
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        isAvailable: numPortions > 0,
      });
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan menu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {menuToEdit ? "Ubah Menu Katering" : "Tambah Menu Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMessage && (
            <div className="rounded-lg bg-destructive/15 p-2.5 text-xs font-medium text-destructive border border-destructive/20">
              {errorMessage}
            </div>
          )}

          {/* Nama Menu */}
          <div className="space-y-1.5">
            <Label htmlFor="menu-name">
              Nama Menu <span className="text-destructive">*</span>
            </Label>
            <Input
              id="menu-name"
              placeholder="Contoh: Ayam Bakar Madu"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Kategori */}
          <div className="space-y-1.5">
            <Label htmlFor="menu-category">Kategori</Label>
            <select
              id="menu-category"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-xs focus-visible:ring-1 focus-visible:ring-ring"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Paket Nasi">Paket Nasi</option>
              <option value="Lauk Utama">Lauk Utama</option>
              <option value="Sayur & Sup">Sayur & Sup</option>
              <option value="Minuman">Minuman</option>
              <option value="Snack / Kudapan">Snack / Kudapan</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Harga */}
            <div className="space-y-1.5">
              <Label htmlFor="menu-price">
                Harga (Rp) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="menu-price"
                type="number"
                min="0"
                step="500"
                placeholder="25000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            {/* Sisa Porsi */}
            <div className="space-y-1.5">
              <Label htmlFor="menu-portions">
                Sisa Porsi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="menu-portions"
                type="number"
                min="0"
                placeholder="15"
                value={remainingPortions}
                onChange={(e) => setRemainingPortions(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <Label htmlFor="menu-description">Deskripsi / Lauk Pendamping</Label>
            <Input
              id="menu-description"
              placeholder="Contoh: Nasi, tahu, tempe, sambal & lalap"
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* URL Gambar */}
          <div className="space-y-1.5">
            <Label htmlFor="menu-image">URL Foto (Opsional)</Label>
            <Input
              id="menu-image"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : menuToEdit
                ? "Simpan Perubahan"
                : "Tambah Menu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
