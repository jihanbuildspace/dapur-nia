"use client";

import React from "react";
import { UtensilsCrossed, Settings, ShoppingBag, Users, BarChart3, ChefHat } from "lucide-react";

export type NavTab = "menu" | "manage" | "orders" | "customers" | "reports" | "login" | "register";

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  orderCount?: number;
}

export function BottomNav({ activeTab, onTabChange, orderCount = 0 }: BottomNavProps) {
  const tabs = [
    { id: "menu" as NavTab, label: "Menu", icon: UtensilsCrossed },
    { id: "manage" as NavTab, label: "Kelola", icon: ChefHat },
    { id: "orders" as NavTab, label: "Pesanan", icon: ShoppingBag, badge: orderCount },
    { id: "customers" as NavTab, label: "Pelanggan", icon: Users },
    { id: "reports" as NavTab, label: "Laporan", icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-md pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-1 flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-150 ${
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
                  }`}
                />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[11px] leading-none tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-8 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
