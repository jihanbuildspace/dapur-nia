"use client";

import React from "react";
import { Utensils, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onResetData?: () => void;
}

export function Header({ onResetData }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md px-4 py-3 shadow-xs">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-foreground">
                Dapur Nia
              </h1>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                Sesi 3
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500 inline" />
              Katering Harian & Pesanan
            </p>
          </div>
        </div>

        {onResetData && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetData}
            title="Reset data ke default latihan"
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </div>
    </header>
  );
}
