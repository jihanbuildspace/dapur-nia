"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { BottomNav, NavTab } from "@/components/layout/bottom-nav";
import { MenuList } from "@/components/modules/menu/menu-list";
import { OrderList } from "@/components/modules/order/order-list";
import { CustomerList } from "@/components/modules/customer/customer-list";
import { DailyReport } from "@/components/modules/report/daily-report";
import { getOrders, resetAllDataToDemo } from "@/lib/firestore-service";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("menu");
  const [activeOrderCount, setActiveOrderCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    updateOrderCount();
  }, [activeTab, refreshKey]);

  const updateOrderCount = async () => {
    try {
      const orders = await getOrders();
      const active = orders.filter((o) =>
        ["menunggu_pembayaran", "dikonfirmasi", "diproses", "dikirim"].includes(o.status)
      );
      setActiveOrderCount(active.length);
    } catch {
      setActiveOrderCount(0);
    }
  };

  const handleResetData = async () => {
    if (confirm("Reset seluruh data ke demo katering Dapur Nia default?")) {
      await resetAllDataToDemo();
      setRefreshKey((k) => k + 1);
      alert("Data berhasil direset ke sampel latihan.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header Aplikasi Mobile */}
      <Header onResetData={handleResetData} />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-lg px-4 pt-4">
        <div key={refreshKey}>
          {activeTab === "menu" && <MenuList />}
          {activeTab === "orders" && <OrderList />}
          {activeTab === "customers" && <CustomerList />}
          {activeTab === "reports" && <DailyReport />}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        orderCount={activeOrderCount}
      />
    </div>
  );
}
