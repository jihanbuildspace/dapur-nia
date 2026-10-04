export interface MenuItem {
  id: string;
  name: string;
  price: number;
  remainingPortions: number;
  category?: string;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt?: string | number;
  updatedAt?: string | number;
}

export interface Customer {
  id: string;
  name: string;
  whatsapp: string;
  address: string;
  notes?: string;
  createdAt?: string | number;
}

export type OrderStatus =
  | 'menunggu_pembayaran'
  | 'dikonfirmasi'
  | 'diproses'
  | 'dikirim'
  | 'selesai'
  | 'dibatalkan';

export interface OrderItemSnapshot {
  menuId: string;
  menuName: string;
  priceAtOrder: number;
  qty: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerWhatsapp: string;
  customerAddress: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  orderDate: string; // "YYYY-MM-DD"
  paymentProofUrl?: string;
  notes?: string;
  createdAt: string | number;
  updatedAt?: string | number;
}

export interface DailyReportSummary {
  date: string;
  totalOrders: number;
  totalPortionsSold: number;
  totalRevenue: number;
  menuSales: {
    menuId: string;
    menuName: string;
    portionsSold: number;
    revenue: number;
  }[];
}
