"use client";

import React from "react";
import { MenuItem } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Plus, Minus, AlertCircle, CheckCircle2 } from "lucide-react";

interface MenuCardProps {
  menu: MenuItem;
  isOwner?: boolean;
  onEdit?: (menu: MenuItem) => void;
  onDelete?: (id: string) => void;
  onUpdatePortion?: (id: string, newPortion: number) => void;
}

export function MenuCard({
  menu,
  isOwner = true,
  onEdit,
  onDelete,
  onUpdatePortion,
}: MenuCardProps) {
  const isOutOfStock = menu.remainingPortions <= 0;
  const isLowStock = menu.remainingPortions > 0 && menu.remainingPortions <= 3;

  return (
    <Card className={`overflow-hidden transition-all duration-200 border-border/80 hover:shadow-md ${
      isOutOfStock ? "opacity-75 bg-muted/30" : "bg-card"
    }`}>
      <div className="flex gap-3 p-3">
        {/* Foto Menu */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
          {menu.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={menu.imageUrl}
              alt={menu.name}
              className={`h-full w-full object-cover transition-transform ${
                isOutOfStock ? "grayscale" : ""
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Foto
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] font-bold text-white uppercase tracking-wider">
              Habis
            </div>
          )}
        </div>

        {/* Info Menu */}
        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-1">
              <h3 className="text-sm font-semibold leading-tight text-foreground line-clamp-1">
                {menu.name}
              </h3>
              {isOwner && onEdit && onDelete && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEdit(menu)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Ubah Menu"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(menu.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    title="Hapus Menu"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {menu.category && (
              <span className="text-[10px] text-muted-foreground block">
                {menu.category}
              </span>
            )}

            {menu.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                {menu.description}
              </p>
            )}
          </div>

          {/* Harga & Status / Kontrol Porsi */}
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/50">
            <span className="text-sm font-bold text-primary">
              {formatRupiah(menu.price)}
            </span>

            <div className="flex items-center gap-1.5">
              {isOutOfStock ? (
                <Badge variant="destructive" className="text-[10px] px-2 py-0">
                  <AlertCircle className="h-3 w-3 mr-1 inline" />
                  Habis
                </Badge>
              ) : isLowStock ? (
                <Badge variant="outline" className="text-[10px] border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0">
                  Sisa {menu.remainingPortions} porsi!
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600 inline" />
                  {menu.remainingPortions} porsi
                </Badge>
              )}

              {/* Tombol Cepat Porsi +/- untuk Pemilik */}
              {isOwner && onUpdatePortion && (
                <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
                  <button
                    type="button"
                    disabled={menu.remainingPortions <= 0}
                    onClick={() => onUpdatePortion(menu.id, Math.max(0, menu.remainingPortions - 1))}
                    className="px-1.5 py-0.5 hover:bg-muted text-muted-foreground disabled:opacity-30"
                    title="Kurangi 1 porsi"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-xs font-semibold px-1 min-w-[20px] text-center">
                    {menu.remainingPortions}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdatePortion(menu.id, menu.remainingPortions + 1)}
                    className="px-1.5 py-0.5 hover:bg-muted text-muted-foreground"
                    title="Tambah 1 porsi"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
