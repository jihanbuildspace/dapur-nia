"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { BottomNav, NavTab } from "@/components/layout/bottom-nav";
import { MenuList } from "@/components/modules/menu/menu-list";
import { OrderList } from "@/components/modules/order/order-list";
import { CustomerList } from "@/components/modules/customer/customer-list";
import { DailyReport } from "@/components/modules/report/daily-report";
import { LoginPage } from "@/components/modules/auth/login-page";
import { RegisterPage } from "@/components/modules/auth/register-page";
import { LoginDialog } from "@/components/modules/auth/login-dialog";
import { getOrders, resetAllDataToDemo } from "@/lib/firestore-service";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { isAuthenticated, isStaff, isOwner, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("menu");
  const [activeOrderCount, setActiveOrderCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

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

  // Navigasi setelah sukses masuk / daftar -> kembali ke halaman Kelola Menu
  const handleAuthSuccess = () => {
    setActiveTab("manage");
    setRefreshKey((k) => k + 1);
  };

  // Navigasi saat logout -> kembali ke beranda (Daftar Menu tamu)
  const handleLogout = () => {
    setActiveTab("menu");
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header Aplikasi Mobile */}
      <Header
        onResetData={handleResetData}
        onOpenLogin={() => setActiveTab("login")}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-lg px-4 pt-4">
        <div key={refreshKey}>
          {/* Tab Menu: Terbuka untuk Tamu & Pelanggan, atau Mode Pengelola bila sudah masuk */}
          {activeTab === "menu" && (
            <MenuList
              isOwnerMode={isAuthenticated}
              onRequireLogin={() => setLoginDialogOpen(true)}
            />
          )}

          {/* Tab Kelola: Jika belum masuk, diarahkan ke Halaman Masuk Pengelola */}
          {activeTab === "manage" && (
            isAuthenticated ? (
              <MenuList
                isOwnerMode={true}
                onRequireLogin={() => setLoginDialogOpen(true)}
              />
            ) : (
              <LoginPage
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setActiveTab("register")}
                onBackToHome={() => setActiveTab("menu")}
              />
            )
          )}

          {/* Halaman Masuk Langsung */}
          {activeTab === "login" && (
            <LoginPage
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setActiveTab("register")}
              onBackToHome={() => setActiveTab("menu")}
            />
          )}

          {/* Halaman Pendaftaran Akun Pemilik / Staf */}
          {activeTab === "register" && (
            <RegisterPage
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setActiveTab("login")}
              onBackToHome={() => setActiveTab("menu")}
            />
          )}

          {/* Tab Pesanan, Pelanggan, dan Laporan */}
          {activeTab === "orders" && <OrderList />}
          {activeTab === "customers" && <CustomerList />}
          {activeTab === "reports" && <DailyReport />}
        </div>
      </main>

      {/* Modal Dialog Masuk Popup Cepat */}
      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onSuccess={handleAuthSuccess}
      />

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab === "login" || activeTab === "register" ? "manage" : activeTab}
        onTabChange={(tab) => {
          if (tab === "manage" && !isAuthenticated) {
            setActiveTab("login");
          } else {
            setActiveTab(tab);
          }
        }}
        orderCount={activeOrderCount}
      />
    </div>
  );
}
