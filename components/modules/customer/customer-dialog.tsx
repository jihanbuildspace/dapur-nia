"use client";

import React, { useState, useEffect } from "react";
import { Customer } from "@/lib/types";
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

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerToEdit?: Customer | null;
  onSave: (data: Omit<Customer, "id">) => Promise<void>;
}

export function CustomerDialog({
  open,
  onOpenChange,
  customerToEdit,
  onSave,
}: CustomerDialogProps) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name || "");
      setWhatsapp(customerToEdit.whatsapp || "");
      setAddress(customerToEdit.address || "");
      setNotes(customerToEdit.notes || "");
    } else {
      setName("");
      setWhatsapp("");
      setAddress("");
      setNotes("");
    }
    setErrorMessage("");
  }, [customerToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Nama pelanggan wajib diisi.");
      return;
    }

    if (!whatsapp.trim()) {
      setErrorMessage("Nomor WhatsApp wajib diisi.");
      return;
    }

    if (!address.trim()) {
      setErrorMessage("Alamat pengiriman wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        address: address.trim(),
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan data pelanggan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customerToEdit ? "Ubah Data Pelanggan" : "Tambah Pelanggan Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMessage && (
            <div className="rounded-lg bg-destructive/15 p-2.5 text-xs font-medium text-destructive border border-destructive/20">
              {errorMessage}
            </div>
          )}

          {/* Nama Pelanggan */}
          <div className="space-y-1.5">
            <Label htmlFor="cust-name">
              Nama Lengkap <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cust-name"
              placeholder="Contoh: Ibu Siti Rahma"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Nomor WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="cust-wa">
              Nomor WhatsApp <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cust-wa"
              type="tel"
              placeholder="08123456789 atau 628123456789"
              value={whatsapp}
              maxLength={20}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Nomor harus unik dan dapat menerima pesan WhatsApp.
            </p>
          </div>

          {/* Alamat Pengiriman */}
          <div className="space-y-1.5">
            <Label htmlFor="cust-address">
              Alamat Pengiriman <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="cust-address"
              className="flex min-h-[70px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-xs focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Jalan, nomor rumah, RT/RW, kelurahan, dan patokan..."
              value={address}
              maxLength={300}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {/* Catatan Khusus */}
          <div className="space-y-1.5">
            <Label htmlFor="cust-notes">Catatan Tambahan (Opsional)</Label>
            <Input
              id="cust-notes"
              placeholder="Contoh: Pagar abu-abu, kirim sebelum jam 11 siang"
              value={notes}
              maxLength={150}
              onChange={(e) => setNotes(e.target.value)}
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
                : customerToEdit
                ? "Simpan Perubahan"
                : "Simpan Pelanggan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
