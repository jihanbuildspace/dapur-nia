"use client";

import React, { useState, useEffect } from "react";
import { Customer } from "@/lib/types";
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from "@/lib/firestore-service";
import { CustomerDialog } from "./customer-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Users, Phone, MapPin, Edit2, Trash2, MessageCircle, AlertCircle, RefreshCw } from "lucide-react";

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCustomers();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data pelanggan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenAdd = () => {
    setCustomerToEdit(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setCustomerToEdit(c);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) return;
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || "Gagal menghapus pelanggan.");
    }
  };

  const handleSaveCustomer = async (data: Omit<Customer, "id">) => {
    if (customerToEdit) {
      await updateCustomer(customerToEdit.id, data);
    } else {
      await addCustomer(data);
    }
    await fetchCustomers();
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.whatsapp.includes(searchQuery) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Search & Add Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, WA, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-sm h-9 bg-background"
          />
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="h-9 gap-1 font-medium">
          <Plus className="h-4 w-4" />
          <span>Tambah Pelanggan</span>
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchCustomers} className="h-7 text-xs">
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
              className="p-3.5 rounded-xl border border-border bg-card animate-pulse space-y-2"
            >
              <div className="h-4 w-1/3 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
              <div className="h-3 w-3/4 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 px-4 text-center bg-card/50">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {searchQuery ? "Pelanggan Tidak Ditemukan" : "Belum Ada Data Pelanggan"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            {searchQuery
              ? `Tidak ada pelanggan yang cocok dengan pencarian "${searchQuery}".`
              : "Simpan nama, nomor WhatsApp unik, dan alamat pelanggan untuk memudahkan pengiriman pesanan."}
          </p>
          {!searchQuery && (
            <Button onClick={handleOpenAdd} size="sm" className="mt-4 gap-1">
              <Plus className="h-4 w-4" />
              <span>Tambah Pelanggan Pertama</span>
            </Button>
          )}
        </div>
      ) : (
        /* Customer Cards */
        <div className="space-y-2.5">
          {filtered.map((c) => (
            <Card key={c.id} className="p-3.5 border-border/80 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    {c.name}
                  </h3>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${c.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                    +{c.whatsapp}
                  </a>

                  {/* Alamat */}
                  <p className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                    <span className="line-clamp-2">{c.address}</span>
                  </p>

                  {c.notes && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded px-2 py-0.5 inline-block mt-1">
                      Catatan: {c.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleOpenEdit(c)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Ubah data pelanggan"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDelete(c.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    title="Hapus pelanggan"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customerToEdit={customerToEdit}
        onSave={handleSaveCustomer}
      />
    </div>
  );
}
