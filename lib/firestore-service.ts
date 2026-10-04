import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
  writeBatch
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { MenuItem, Customer, Order, OrderStatus, DailyReportSummary } from "./types";
import { getTodayDateString, normalizeWhatsappNumber } from "./utils";

// LocalStorage Keys for Offline / Demo Mode Fallback
const STORAGE_KEY_MENUS = "dapur_nia_menus";
const STORAGE_KEY_CUSTOMERS = "dapur_nia_customers";
const STORAGE_KEY_ORDERS = "dapur_nia_orders";

// Initial Demo Seed Data
export const INITIAL_MENUS: Omit<MenuItem, "id">[] = [
  {
    name: "Paket Nasi Ayam Bakar Madu",
    price: 25000,
    remainingPortions: 15,
    category: "Paket Nasi",
    description: "Nasi pulen, ayam bakar madu bumbu rempah, tahu, tempe, sambal bajak & lalapan segar.",
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    isAvailable: true
  },
  {
    name: "Paket Nasi Liwet Komplit",
    price: 28000,
    remainingPortions: 8,
    category: "Paket Nasi",
    description: "Nasi liwet gurih teri petai, ayam goreng lengkuas, tumis labu siam & sambal terasi.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    isAvailable: true
  },
  {
    name: "Sayur Asem Khas Sunda",
    price: 12000,
    remainingPortions: 10,
    category: "Sayur & Sup",
    description: "Sayur asem kuah segar dengan jagung manis, labu, melinjo, dan kacang tanah.",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
    isAvailable: true
  },
  {
    name: "Es Teh Manis Melati",
    price: 5000,
    remainingPortions: 25,
    category: "Minuman",
    description: "Es teh manis wangi melati segar pendamping katering makan siang.",
    imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80",
    isAvailable: true
  }
];

export const INITIAL_CUSTOMERS: Omit<Customer, "id">[] = [
  {
    name: "Budi Santoso",
    whatsapp: "6281234567890",
    address: "Jl. Melati No. 14, RT 02/05, Kebayoran Baru, Jakarta Selatan",
    notes: "Pagar hitam, tolong digantung di pagar jika tidak ada orang."
  },
  {
    name: "Siti Rahma",
    whatsapp: "6287890123456",
    address: "Komplek Pesona Asri Blok C-8, Pondok Indah",
    notes: "Diantar sebelum jam 11:30 WIB untuk makan siang keluarga."
  }
];

// Helper to access LocalStorage safely
function getLocalData<T>(key: string, initial: T): T {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initial;
  } catch {
    return initial;
  }
}


// Helper to remove undefined fields which Firestore rejects
function cleanPayload<T extends Record<string, any>>(obj: T): any {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = cleanPayload(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

async function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error("FIRESTORE_TIMEOUT")), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

function setLocalData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

/* ========================================================
 * 1. MODUL MENU
 * ======================================================== */

export async function getMenus(): Promise<MenuItem[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "menus"), orderBy("name", "asc"));
      const snap = await withTimeout(getDocs(q));
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem));
      }
    } catch (e) {
      console.warn("Firestore fetch menus failed or timed out, fallback to local:", e);
    }
  }

  // Fallback to local storage
  let local = getLocalData<MenuItem[]>(STORAGE_KEY_MENUS, []);
  if (local.length === 0) {
    local = INITIAL_MENUS.map((m, idx) => ({ ...m, id: `menu-${idx + 1}` }));
    setLocalData(STORAGE_KEY_MENUS, local);
  }
  return local;
}

export async function addMenu(data: Omit<MenuItem, "id">): Promise<MenuItem> {
  // Invariant 1: Harga dan sisa porsi tidak boleh negatif
  if (data.price < 0) throw new Error("Harga menu tidak boleh kurang dari 0");
  if (data.remainingPortions < 0) throw new Error("Sisa porsi tidak boleh kurang dari 0");
  if (!data.name || data.name.trim() === "") throw new Error("Nama menu wajib diisi");

  const newItemData: Omit<MenuItem, "id"> = {
    ...data,
    name: data.name.trim(),
    price: Number(data.price),
    imageUrl: data.imageUrl || "",
    description: data.description || "",
    category: data.category || "Umum",
    remainingPortions: Number(data.remainingPortions),
    isAvailable: Number(data.remainingPortions) > 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const ref = await withTimeout(
        addDoc(collection(db, "menus"), cleanPayload({
          ...newItemData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }))
      );
      return { id: ref.id, ...newItemData };
    } catch (e) {
      console.warn("Firestore addMenu timed out or failed, using local storage fallback:", e);
    }
  }

  const list = await getMenus();
  const created: MenuItem = {
    id: `menu-${Date.now()}`,
    ...newItemData
  };
  setLocalData(STORAGE_KEY_MENUS, [created, ...list]);
  return created;
}

export async function updateMenu(id: string, data: Partial<MenuItem>): Promise<void> {
  if (data.price !== undefined && data.price < 0) {
    throw new Error("Harga menu tidak boleh kurang dari 0");
  }
  if (data.remainingPortions !== undefined && data.remainingPortions < 0) {
    throw new Error("Sisa porsi tidak boleh kurang dari 0");
  }

  const updates: any = {
    ...data,
    updatedAt: new Date().toISOString()
  };
  if (data.remainingPortions !== undefined) {
    updates.isAvailable = data.remainingPortions > 0;
  }

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, "menus", id);
      await updateDoc(ref, cleanPayload({
        ...updates,
        updatedAt: serverTimestamp()
      }));
      return;
    } catch (e) {
      console.warn("Firestore updateMenu failed, using local:", e);
    }
  }

  const list = await getMenus();
  const index = list.findIndex(m => m.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...updates };
    setLocalData(STORAGE_KEY_MENUS, list);
  }
}

export async function deleteMenu(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "menus", id));
      return;
    } catch (e) {
      console.warn("Firestore deleteMenu failed, using local:", e);
    }
  }

  const list = await getMenus();
  setLocalData(STORAGE_KEY_MENUS, list.filter(m => m.id !== id));
}

/* ========================================================
 * 2. MODUL PELANGGAN
 * ======================================================== */

export async function getCustomers(): Promise<Customer[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "customers"), orderBy("name", "asc"));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
      }
    } catch (e) {
      console.warn("Firestore fetch customers failed, using local:", e);
    }
  }

  let local = getLocalData<Customer[]>(STORAGE_KEY_CUSTOMERS, []);
  if (local.length === 0) {
    local = INITIAL_CUSTOMERS.map((c, idx) => ({ ...c, id: `cust-${idx + 1}` }));
    setLocalData(STORAGE_KEY_CUSTOMERS, local);
  }
  return local;
}

export async function addCustomer(data: Omit<Customer, "id">): Promise<Customer> {
  if (!data.name || data.name.trim() === "") throw new Error("Nama pelanggan wajib diisi");
  if (!data.address || data.address.trim() === "") throw new Error("Alamat pengiriman wajib diisi");
  if (!data.whatsapp || data.whatsapp.trim() === "") throw new Error("Nomor WhatsApp wajib diisi");

  const normalizedWA = normalizeWhatsappNumber(data.whatsapp);

  // Invariant: Nomor WhatsApp harus unik
  const existingList = await getCustomers();
  const isDuplicate = existingList.some(c => normalizeWhatsappNumber(c.whatsapp) === normalizedWA);
  if (isDuplicate) {
    throw new Error("Nomor WhatsApp ini sudah digunakan oleh pelanggan lain.");
  }

  const newCustData: Omit<Customer, "id"> = {
    ...data,
    name: data.name.trim(),
    whatsapp: normalizedWA,
    address: data.address.trim(),
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const ref = await addDoc(collection(db, "customers"), cleanPayload({
        ...newCustData,
        createdAt: serverTimestamp()
      }));
      return { id: ref.id, ...newCustData };
    } catch (e) {
      console.warn("Firestore addCustomer failed, using local:", e);
    }
  }

  const created: Customer = {
    id: `cust-${Date.now()}`,
    ...newCustData
  };
  setLocalData(STORAGE_KEY_CUSTOMERS, [created, ...existingList]);
  return created;
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
  if (data.whatsapp) {
    const normalizedWA = normalizeWhatsappNumber(data.whatsapp);
    const existingList = await getCustomers();
    const isDuplicate = existingList.some(c => c.id !== id && normalizeWhatsappNumber(c.whatsapp) === normalizedWA);
    if (isDuplicate) {
      throw new Error("Nomor WhatsApp ini sudah digunakan oleh pelanggan lain.");
    }
    data.whatsapp = normalizedWA;
  }

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, "customers", id), cleanPayload(data));
      return;
    } catch (e) {
      console.warn("Firestore updateCustomer failed, using local:", e);
    }
  }

  const list = await getCustomers();
  const index = list.findIndex(c => c.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...data };
    setLocalData(STORAGE_KEY_CUSTOMERS, list);
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "customers", id));
      return;
    } catch (e) {
      console.warn("Firestore deleteCustomer failed, using local:", e);
    }
  }

  const list = await getCustomers();
  setLocalData(STORAGE_KEY_CUSTOMERS, list.filter(c => c.id !== id));
}

/* ========================================================
 * 3. MODUL PESANAN (Engine Transaksi, Snapshot & State Machine)
 * ======================================================== */

export async function getOrders(): Promise<Order[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      }
    } catch (e) {
      console.warn("Firestore fetch orders failed, using local:", e);
    }
  }

  return getLocalData<Order[]>(STORAGE_KEY_ORDERS, []);
}

export async function createOrder(payload: {
  customerId: string;
  customerName: string;
  customerWhatsapp: string;
  customerAddress: string;
  items: { menuId: string; qty: number }[];
  shippingFee: number;
  orderDate?: string;
  notes?: string;
}): Promise<Order> {
  if (!payload.items || payload.items.length === 0) {
    throw new Error("Pesanan harus memiliki minimal satu item menu.");
  }
  if (payload.shippingFee < 0) {
    throw new Error("Ongkos kirim tidak boleh bernilai negatif.");
  }

  const currentMenus = await getMenus();
  const menuMap = new Map(currentMenus.map(m => [m.id, m]));

  let subtotal = 0;
  const orderItemSnapshots: Order["items"] = [];

  // Invariant 2 & Snapshot: Validasi porsi dan kunci harga snapshot
  for (const item of payload.items) {
    if (item.qty <= 0) {
      throw new Error("Jumlah porsi tidak boleh 0 atau minus.");
    }
    const menu = menuMap.get(item.menuId);
    if (!menu) {
      throw new Error(`Menu dengan ID ${item.menuId} tidak ditemukan.`);
    }
    if (item.qty > menu.remainingPortions) {
      throw new Error(
        `Pesanan ditolak: porsi "${menu.name}" diminta ${item.qty}, tetapi sisa hanya ${menu.remainingPortions}.`
      );
    }

    const itemSubtotal = menu.price * item.qty;
    subtotal += itemSubtotal;

    orderItemSnapshots.push({
      menuId: menu.id,
      menuName: menu.name,
      priceAtOrder: menu.price,
      qty: item.qty,
      subtotal: itemSubtotal
    });
  }

  // Invariant 1: Total = Subtotal + Ongkir (selalu >= 0)
  const totalAmount = subtotal + Number(payload.shippingFee);
  if (totalAmount < 0) {
    throw new Error("Total tagihan tidak boleh bernilai negatif.");
  }

  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
  const orderDate = payload.orderDate || getTodayDateString();

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber,
    customerId: payload.customerId,
    customerName: payload.customerName,
    customerWhatsapp: payload.customerWhatsapp,
    customerAddress: payload.customerAddress,
    items: orderItemSnapshots,
    subtotal,
    shippingFee: Number(payload.shippingFee),
    totalAmount,
    status: "menunggu_pembayaran",
    orderDate,
    notes: payload.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Kurangi stok menu terkait
  for (const item of payload.items) {
    const menu = menuMap.get(item.menuId)!;
    const newPortions = menu.remainingPortions - item.qty;
    await updateMenu(menu.id, { remainingPortions: newPortions });
  }

  if (isFirebaseConfigured && db) {
    try {
      const ref = await addDoc(collection(db, "orders"), cleanPayload({
        ...newOrder,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }));
      newOrder.id = ref.id;
    } catch (e) {
      console.warn("Firestore createOrder failed, saved locally:", e);
    }
  }

  const existingOrders = await getOrders();
  setLocalData(STORAGE_KEY_ORDERS, [newOrder, ...existingOrders]);
  return newOrder;
}

// Invariant 3: Finite State Machine Transisi Status Linier
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  menunggu_pembayaran: ["dikonfirmasi", "dibatalkan"],
  dikonfirmasi: ["diproses", "dibatalkan"],
  diproses: ["dikirim"],
  dikirim: ["selesai"],
  selesai: [],
  dibatalkan: []
};

export async function updateOrderStatus(orderId: string, nextStatus: OrderStatus): Promise<void> {
  const orders = await getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) throw new Error("Pesanan tidak ditemukan.");

  const currentStatus = order.status;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(nextStatus)) {
    throw new Error(
      `Transisi status tidak sah: Tidak boleh mengubah dari "${currentStatus}" langsung ke "${nextStatus}".`
    );
  }

  // Stock Rollback jika pesanan dibatalkan
  if (nextStatus === "dibatalkan") {
    const menus = await getMenus();
    const menuMap = new Map(menus.map(m => [m.id, m]));
    for (const item of order.items) {
      const menu = menuMap.get(item.menuId);
      if (menu) {
        await updateMenu(menu.id, {
          remainingPortions: menu.remainingPortions + item.qty
        });
      }
    }
  }

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });
      return;
    } catch (e) {
      console.warn("Firestore updateOrderStatus failed, using local:", e);
    }
  }

  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index] = {
      ...orders[index],
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };
    setLocalData(STORAGE_KEY_ORDERS, orders);
  }
}

/* ========================================================
 * 4. MODUL LAPORAN HARIAN (Agregasi Penjualan)
 * ======================================================== */

export async function getDailyReport(dateString: string): Promise<DailyReportSummary> {
  const allOrders = await getOrders();

  // Filter berdasarkan tanggal dan buang pesanan dibatalkan
  const validOrders = allOrders.filter(
    o => o.orderDate === dateString && o.status !== "dibatalkan"
  );

  let totalPortionsSold = 0;
  let totalRevenue = 0;
  const salesMap = new Map<string, { menuId: string; menuName: string; portionsSold: number; revenue: number }>();

  for (const order of validOrders) {
    totalRevenue += order.totalAmount;
    for (const item of order.items) {
      totalPortionsSold += item.qty;
      const existing = salesMap.get(item.menuId);
      if (existing) {
        existing.portionsSold += item.qty;
        existing.revenue += item.subtotal;
      } else {
        salesMap.set(item.menuId, {
          menuId: item.menuId,
          menuName: item.menuName,
          portionsSold: item.qty,
          revenue: item.subtotal
        });
      }
    }
  }

  return {
    date: dateString,
    totalOrders: validOrders.length,
    totalPortionsSold,
    totalRevenue,
    menuSales: Array.from(salesMap.values())
  };
}

export async function resetAllDataToDemo(): Promise<void> {
  const demoMenus = INITIAL_MENUS.map((m, idx) => ({ ...m, id: `menu-${idx + 1}` }));
  const demoCustomers = INITIAL_CUSTOMERS.map((c, idx) => ({ ...c, id: `cust-${idx + 1}` }));

  setLocalData(STORAGE_KEY_MENUS, demoMenus);
  setLocalData(STORAGE_KEY_CUSTOMERS, demoCustomers);
  setLocalData(STORAGE_KEY_ORDERS, []);

  if (isFirebaseConfigured && db) {
    try {
      // Hapus menu lama di Firestore & isi ulang dengan initial menus
      const snap = await getDocs(collection(db, "menus"));
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
      for (const item of INITIAL_MENUS) {
        await addDoc(collection(db, "menus"), cleanPayload({
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }));
      }
    } catch (e) {
      console.warn("Firestore reset error:", e);
    }
  }
}
