"use client";

import React, { useState, useEffect } from "react";
import { DailyReportSummary } from "@/lib/types";
import { getDailyReport } from "@/lib/firestore-service";
import { formatRupiah, getTodayDateString, formatDateIndonesian } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  UtensilsCrossed,
  BarChart3,
  CheckCircle,
  Info,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export function DailyReport() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [report, setReport] = useState<DailyReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport(selectedDate);
  }, [selectedDate]);

  const loadReport = async (date: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDailyReport(date);
      setReport(data);
    } catch (e: any) {
      console.error("Gagal memuat laporan harian", e);
      setError(e?.message || "Gagal memuat data laporan harian.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Date Picker Header */}
      <Card className="p-3.5 border-border/80 bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Pilih Tanggal Laporan
            </span>
            <h2 className="text-sm font-semibold text-foreground mt-0.5">
              {formatDateIndonesian(selectedDate)}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 text-xs w-full sm:w-auto bg-background"
            />
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadReport(selectedDate)}
            className="h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Coba Lagi
          </Button>
        </div>
      )}

      {/* Ringkasan Metrik Harian */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 rounded-xl border border-border bg-card animate-pulse" />
          <div className="h-24 rounded-xl border border-border bg-card animate-pulse" />
        </div>
      ) : report ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Kartu Uang Masuk */}
            <Card className="p-3.5 border-border/80 bg-gradient-to-br from-amber-500/10 to-transparent">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Uang Masuk</span>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-2">
                <span className="text-lg font-extrabold text-primary block leading-tight">
                  {formatRupiah(report.totalRevenue)}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  dari {report.totalOrders} pesanan sah
                </span>
              </div>
            </Card>

            {/* Kartu Porsi Terjual */}
            <Card className="p-3.5 border-border/80 bg-gradient-to-br from-emerald-500/10 to-transparent">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Porsi Terjual</span>
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-2">
                <span className="text-lg font-extrabold text-foreground block leading-tight">
                  {report.totalPortionsSold}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    porsi
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  kapasitas katering
                </span>
              </div>
            </Card>
          </div>

          {/* Rincian Penjualan per Menu */}
          <Card className="p-4 border-border/80 bg-card">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
                Rincian Porsi per Menu
              </span>
              <span className="text-[10px] font-normal text-muted-foreground">
                (Pesanan Batal Tidak Dihitung)
              </span>
            </h3>

            {report.menuSales.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground space-y-2">
                <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/40" />
                <p className="text-xs font-semibold">
                  Belum Ada Penjualan Pada Tanggal Ini
                </p>
                <p className="text-[11px] max-w-xs mx-auto">
                  Pesanan yang dibuat atau diselesaikan pada tanggal{" "}
                  {selectedDate} akan otomatis terakumulasi di sini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {report.menuSales.map((item) => (
                  <div
                    key={item.menuId}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground block">
                        {item.menuName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Terjual: <strong className="text-foreground">{item.portionsSold}</strong> porsi
                      </span>
                    </div>
                    <span className="font-bold text-primary text-sm">
                      {formatRupiah(item.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Catatan Invariant Laporan */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <div>
              <strong>Aturan Integritas Data Laporan:</strong> Sesuai PRD Sesi 3,
              laporan hanya menghitung pesanan yang sah. Pesanan berstatus{" "}
              <span className="font-medium text-destructive">Dibatalkan</span>{" "}
              secara ketat dieksklusi dari perhitungan uang masuk dan porsi terjual.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
