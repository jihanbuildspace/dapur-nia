"use client";

import React from "react";
import { Order, OrderStatus } from "@/lib/types";
import { formatRupiah, formatDateIndonesian } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Truck,
  CheckCheck,
  XCircle,
  MessageCircle,
  MapPin,
  AlertTriangle,
} from "lucide-react";

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
}

export function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "menunggu_pembayaran":
        return (
          <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 text-[10px]">
            <Clock className="h-3 w-3" /> Menunggu Bayar
          </Badge>
        );
      case "dikonfirmasi":
        return (
          <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 gap-1 text-[10px]">
            <CheckCircle2 className="h-3 w-3" /> Dikonfirmasi
          </Badge>
        );
      case "diproses":
        return (
          <Badge variant="outline" className="border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400 gap-1 text-[10px]">
            <ChefHat className="h-3 w-3" /> Sedang Dimasak
          </Badge>
        );
      case "dikirim":
        return (
          <Badge variant="outline" className="border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 gap-1 text-[10px]">
            <Truck className="h-3 w-3" /> Dalam Pengiriman
          </Badge>
        );
      case "selesai":
        return (
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1 text-[10px]">
            <CheckCheck className="h-3 w-3" /> Selesai
          </Badge>
        );
      case "dibatalkan":
        return (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <XCircle className="h-3 w-3" /> Dibatalkan
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStatusChange = async (next: OrderStatus) => {
    if (next === "dibatalkan") {
      const confirmed = confirm(
        "Apakah Anda yakin ingin membatalkan pesanan ini? Stok porsi menu akan otomatis dikembalikan."
      );
      if (!confirmed) return;
    }
    await onUpdateStatus(order.id, next);
  };

  return (
    <Card className="p-3.5 border-border/80 shadow-xs hover:shadow-md transition-all space-y-3 bg-card">
      {/* Header Kartu Pesanan */}
      <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-foreground">
              {order.orderNumber}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatDateIndonesian(order.orderDate)}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-foreground mt-0.5">
            {order.customerName}
          </h4>
        </div>
        <div className="shrink-0">{getStatusBadge(order.status)}</div>
      </div>

      {/* Info Kontak & Alamat */}
      <div className="text-xs space-y-1 text-muted-foreground">
        <div className="flex items-center justify-between">
          <a
            href={`https://wa.me/${order.customerWhatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <MessageCircle className="h-3 w-3" />
            +{order.customerWhatsapp}
          </a>
        </div>
        <div className="flex items-start gap-1">
          <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
          <span className="line-clamp-2">{order.customerAddress}</span>
        </div>
        {order.notes && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
            &ldquo;{order.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Daftar Item Menu (Snapshot) */}
      <div className="rounded-lg bg-muted/40 p-2.5 space-y-1.5 text-xs">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Rincian Menu
        </span>
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-foreground">
            <span className="font-medium line-clamp-1">
              {item.menuName}{" "}
              <span className="text-muted-foreground font-normal">
                × {item.qty}
              </span>
            </span>
            <span className="font-semibold shrink-0 ml-2">
              {formatRupiah(item.subtotal)}
            </span>
          </div>
        ))}

        <div className="border-t border-border/60 pt-1.5 mt-1 flex justify-between text-muted-foreground text-[11px]">
          <span>Ongkos Kirim:</span>
          <span>{formatRupiah(order.shippingFee)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm text-primary pt-0.5">
          <span>Total Tagihan:</span>
          <span>{formatRupiah(order.totalAmount)}</span>
        </div>
      </div>

      {/* Rantai Aksi Transisi Status Linier (Invariant: Tidak Boleh Melompat atau Mundur) */}
      <div className="pt-1 flex items-center justify-end gap-2 flex-wrap">
        {order.status === "menunggu_pembayaran" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("dibatalkan")}
              className="h-8 text-xs text-destructive hover:bg-destructive/10"
            >
              Batalkan
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusChange("dikonfirmasi")}
              className="h-8 text-xs font-semibold gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Konfirmasi Bayar
            </Button>
          </>
        )}

        {order.status === "dikonfirmasi" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("dibatalkan")}
              className="h-8 text-xs text-destructive hover:bg-destructive/10"
            >
              Batalkan
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusChange("diproses")}
              className="h-8 text-xs font-semibold gap-1"
            >
              <ChefHat className="h-3.5 w-3.5" /> Mulai Masak
            </Button>
          </>
        )}

        {order.status === "diproses" && (
          <Button
            size="sm"
            onClick={() => handleStatusChange("dikirim")}
            className="h-8 text-xs font-semibold gap-1 w-full sm:w-auto"
          >
            <Truck className="h-3.5 w-3.5" /> Kirim Pesanan
          </Button>
        )}

        {order.status === "dikirim" && (
          <Button
            size="sm"
            onClick={() => handleStatusChange("selesai")}
            className="h-8 text-xs font-semibold gap-1 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Tandai Selesai
          </Button>
        )}

        {order.status === "selesai" && (
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCheck className="h-3.5 w-3.5" /> Pesanan telah selesai
          </span>
        )}

        {order.status === "dibatalkan" && (
          <span className="text-[11px] text-destructive font-medium flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> Porsi telah dikembalikan ke stok
          </span>
        )}
      </div>
    </Card>
  );
}
