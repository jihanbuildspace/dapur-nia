"use client";

import React, { useState, useEffect } from "react";
import { MenuItem, Customer } from "@/lib/types";
import { getMenus, getCustomers, createOrder } from "@/lib/firestore-service";
import { formatRupiah, getTodayDateString } from "@/lib/utils";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingBag, Truck, User, AlertCircle } from "lucide-react";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
}

export function OrderDialog({ open, onOpenChange, onOrderCreated }: OrderDialogProps) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // Customer custom manual fields
  const [custName, setCustName] = useState("");
  const [custWhatsapp, setCustWhatsapp] = useState("");
  const [custAddress, setCustAddress] = useState("");

  // Selected menu item quantities { [menuId]: qty }
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [shippingFee, setShippingFee] = useState<number | string>(10000);
  const [notes, setNotes] = useState("");
  const [orderDate, setOrderDate] = useState(getTodayDateString());

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
      setItemQuantities({});
      setShippingFee(10000);
      setNotes("");
      setOrderDate(getTodayDateString());
      setErrorMessage("");
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [menuData, custData] = await Promise.all([getMenus(), getCustomers()]);
      setMenus(menuData);
      setCustomers(custData);
      if (custData.length > 0) {
        setSelectedCustomerId(custData[0].id);
        setCustName(custData[0].name);
        setCustWhatsapp(custData[0].whatsapp);
        setCustAddress(custData[0].address);
      }
    } catch (e) {
      console.error("Failed loading dialog data", e);
    }
  };

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    if (id === "new") {
      setCustName("");
      setCustWhatsapp("");
      setCustAddress("");
    } else {
      const found = customers.find((c) => c.id === id);
      if (found) {
        setCustName(found.name);
        setCustWhatsapp(found.whatsapp);
        setCustAddress(found.address);
      }
    }
  };

  const handleQuantityChange = (menuId: string, delta: number, max: number) => {
    setItemQuantities((prev) => {
      const current = prev[menuId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[menuId];
        return copy;
      }
      if (next > max) {
        return prev; // locked to remaining portions
      }
      return { ...prev, [menuId]: next };
    });
  };

  // Kalkulasi Live Total & Subtotal (Invariant: Anti-Minus Tagihan)
  const menuMap = new Map(menus.map((m) => [m.id, m]));
  let subtotal = 0;
  let totalPortions = 0;
  Object.entries(itemQuantities).forEach(([menuId, qty]) => {
    const menu = menuMap.get(menuId);
    if (menu) {
      subtotal += menu.price * qty;
      totalPortions += qty;
    }
  });

  const parsedShipping = Number(shippingFee) || 0;
  const grandTotal = Math.max(0, subtotal + Math.max(0, parsedShipping));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!custName.trim() || !custWhatsapp.trim() || !custAddress.trim()) {
      setErrorMessage("Data pelanggan (Nama, WhatsApp, Alamat) wajib lengkap.");
      return;
    }

    if (totalPortions <= 0) {
      setErrorMessage("Pesanan harus memiliki minimal satu porsi menu (tidak boleh 0 porsi).");
      return;
    }

    if (parsedShipping < 0) {
      setErrorMessage("Ongkos kirim tidak boleh bernilai negatif.");
      return;
    }

    const itemsPayload = Object.entries(itemQuantities).map(([menuId, qty]) => ({
      menuId,
      qty,
    }));

    try {
      setIsSubmitting(true);
      await createOrder({
        customerId: selectedCustomerId || "cust-new",
        customerName: custName.trim(),
        customerWhatsapp: custWhatsapp.trim(),
        customerAddress: custAddress.trim(),
        items: itemsPayload,
        shippingFee: Math.max(0, parsedShipping),
        orderDate,
        notes: notes.trim(),
      });

      onOrderCreated();
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal membuat pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Buat Pesanan Katering Baru
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMessage && (
            <div className="rounded-lg bg-destructive/15 p-2.5 text-xs font-medium text-destructive border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Pilih Pelanggan */}
          <div className="rounded-xl border border-border/70 p-3 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                Pilih Pelanggan
              </Label>
              <select
                className="h-8 rounded-md border border-input bg-background px-2 py-0 text-xs shadow-xs"
                value={selectedCustomerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.whatsapp})
                  </option>
                ))}
                <option value="new">+ Pelanggan Baru / Manual</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Nama Pelanggan *"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="h-8 text-xs bg-background"
                required
              />
              <Input
                placeholder="No. WhatsApp *"
                value={custWhatsapp}
                onChange={(e) => setCustWhatsapp(e.target.value)}
                className="h-8 text-xs bg-background"
                required
              />
            </div>
            <Input
              placeholder="Alamat Pengiriman Lengkap *"
              value={custAddress}
              onChange={(e) => setCustAddress(e.target.value)}
              className="h-8 text-xs bg-background"
              required
            />
          </div>

          {/* 2. Pilih Menu & Jumlah Porsi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground">
                Pilih Menu & Jumlah Porsi <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Total: <strong className="text-primary">{totalPortions}</strong> porsi
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {menus.map((menu) => {
                const qty = itemQuantities[menu.id] || 0;
                const isHabis = menu.remainingPortions <= 0;

                return (
                  <div
                    key={menu.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                      qty > 0
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/60 bg-card"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-semibold text-foreground line-clamp-1">
                        {menu.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-primary font-bold">
                          {formatRupiah(menu.price)}
                        </span>
                        {isHabis ? (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0">
                            Habis
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            Sisa: {menu.remainingPortions}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stepper +/- */}
                    <div className="flex items-center border border-border rounded-md overflow-hidden bg-background shrink-0">
                      <button
                        type="button"
                        disabled={qty <= 0}
                        onClick={() => handleQuantityChange(menu.id, -1, menu.remainingPortions)}
                        className="px-2 py-1 hover:bg-muted text-muted-foreground disabled:opacity-30"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold px-2 min-w-[24px] text-center">
                        {qty}
                      </span>
                      <button
                        type="button"
                        disabled={isHabis || qty >= menu.remainingPortions}
                        onClick={() => handleQuantityChange(menu.id, 1, menu.remainingPortions)}
                        className="px-2 py-1 hover:bg-muted text-muted-foreground disabled:opacity-30"
                        title={qty >= menu.remainingPortions ? "Porsi maksimal tercapai" : "Tambah"}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Ongkir & Tanggal */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <Label htmlFor="shipping-fee" className="text-xs flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                Ongkos Kirim (Rp)
              </Label>
              <Input
                id="shipping-fee"
                type="number"
                min="0"
                step="1000"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                className="h-8 text-xs bg-background"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="order-date" className="text-xs">
                Tanggal Pesanan
              </Label>
              <Input
                id="order-date"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="h-8 text-xs bg-background"
                required
              />
            </div>
          </div>

          {/* Catatan Pesanan */}
          <div className="space-y-1">
            <Label htmlFor="order-notes" className="text-xs">
              Catatan Pesanan (Opsional)
            </Label>
            <Input
              id="order-notes"
              placeholder="Contoh: Sambal dipisah, minta sendok plastik"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-8 text-xs bg-background"
            />
          </div>

          {/* Live Ringkasan Tagihan */}
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal Makanan:</span>
              <span className="font-semibold text-foreground">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Ongkos Kirim:</span>
              <span className="font-semibold text-foreground">{formatRupiah(Math.max(0, parsedShipping))}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-primary pt-1 border-t border-primary/20">
              <span>Total Tagihan:</span>
              <span>{formatRupiah(grandTotal)}</span>
            </div>
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
            <Button
              type="submit"
              disabled={isSubmitting || totalPortions === 0}
              className="font-bold gap-1"
            >
              {isSubmitting ? "Menyimpan Pesanan..." : `Simpan Pesanan (${formatRupiah(grandTotal)})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
