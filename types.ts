export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  pin: string; // Simplified auth
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number; // Reorder point
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  creditLimit: number;
  currentDebt: number;
  history: CustomerHistory[];
}

export interface CustomerHistory {
  id: string;
  date: string;
  action: 'PURCHASE' | 'PAYMENT';
  amount: number;
  note?: string;
}

export interface CartItem extends Product {
  qty: number;
}

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CREDIT';

export interface Order {
  id: string;
  date: string; // ISO string
  items: CartItem[];
  subtotal: number;
  total: number;
  profit: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
  customerId?: string; // If credit
  cashierName: string;
}

export interface DebtReceiptData {
  id: string;
  date: string;
  customerName: string;
  amount: number;
  remainingDebt: number;
  cashierName: string;
}

export interface DashboardStats {
  todaySales: number;
  todayProfit: number;
  totalDebt: number;
  lowStockCount: number;
}