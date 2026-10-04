"use client";

import React, { useState, useEffect } from "react";
import { Order, OrderStatus } from "@/lib/types";
import { getOrders, updateOrderStatus } from "@/lib/firestore-service";
import { OrderCard } from "./order-card";
import { OrderDialog } from "./order-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ShoppingBag, AlertCircle, RefreshCw } from "lucide-react";

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"semua" | "aktif" | "selesai" | "dibatalkan">("semua");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat daftar pesanan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui status.");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerWhatsapp.includes(searchQuery);

    if (!matchesSearch) return false;

    if (statusFilter === "aktif") {
      return ["menunggu_pembayaran", "dikonfirmasi", "diproses", "dikirim"].includes(o.status);
    }
    if (statusFilter === "selesai") {
      return o.status === "selesai";
    }
    if (statusFilter === "dibatalkan") {
      return o.status === "dibatalkan";
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Search & New Order CTA */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari No. Order / Pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-sm h-9 bg-background"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="h-9 gap-1 font-medium">
          <Plus className="h-4 w-4" />
          <span>Buat Pesanan</span>
        </Button>
      </div>

      {/* Filter Tabs Status */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: "semua", label: "Semua" },
          { id: "aktif", label: "Aktif" },
          { id: "selesai", label: "Selesai" },
          { id: "dibatalkan", label: "Dibatalkan" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              statusFilter === tab.id
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchOrders} className="h-7 text-xs">
            <RefreshCw className="h-3 w-3 mr-1" /> Muat Ulang
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border bg-card animate-pulse space-y-3"
            >
              <div className="flex justify-between">
                <div className="h-4 w-1/3 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
              <div className="h-16 bg-muted/50 rounded-lg" />
              <div className="h-8 w-28 bg-muted rounded ml-auto" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 px-4 text-center bg-card/50">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {searchQuery || statusFilter !== "semua"
              ? "Tidak Ada Pesanan yang Cocok"
              : "Belum Ada Pesanan Masuk"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            {searchQuery || statusFilter !== "semua"
              ? "Coba ubah filter status atau kata kunci pencarian Anda."
              : "Catat pesanan katering harian baru langsung dengan snapshot harga dan kontrol porsi otomatis."}
          </p>
          {statusFilter === "semua" && !searchQuery && (
            <Button onClick={() => setDialogOpen(true)} size="sm" className="mt-4 gap-1">
              <Plus className="h-4 w-4" />
              <span>Buat Pesanan Pertama</span>
            </Button>
          )}
        </div>
      ) : (
        /* List Order Cards */
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}

      <OrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onOrderCreated={fetchOrders}
      />
    </div>
  );
}
