import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Customer, Order, User, CartItem, PaymentMethod } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_USERS } from '../constants';

interface StoreContextType {
  user: User | null;
  login: (pin: string) => boolean;
  logout: () => void;
  products: Product[];
  customers: Customer[];
  orders: Order[];
  categories: string[]; // New
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: string) => void; // New
  deleteCategory: (category: string) => void; // New
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  processPayment: (items: CartItem[], total: number, method: PaymentMethod, cashReceived: number, customerId?: string) => Promise<Order>;
  payDebt: (customerId: string, amount: number) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    const loadedProducts = localStorage.getItem('pos_products');
    const loadedCustomers = localStorage.getItem('pos_customers');
    const loadedOrders = localStorage.getItem('pos_orders');
    const loadedUser = localStorage.getItem('pos_user');
    const loadedCategories = localStorage.getItem('pos_categories');

    if (loadedProducts) setProducts(JSON.parse(loadedProducts));
    else setProducts(INITIAL_PRODUCTS);

    if (loadedCustomers) setCustomers(JSON.parse(loadedCustomers));
    else setCustomers(INITIAL_CUSTOMERS);

    if (loadedOrders) setOrders(JSON.parse(loadedOrders));

    if (loadedUser) setUser(JSON.parse(loadedUser));

    if (loadedCategories) {
      setCategories(JSON.parse(loadedCategories));
    } else {
      // Extract unique categories from initial products if no saved categories
      const initialCats = Array.from(new Set(INITIAL_PRODUCTS.map(p => p.category)));
      setCategories(initialCats);
    }
  }, []);

  // Save on change
  useEffect(() => localStorage.setItem('pos_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('pos_customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('pos_orders', JSON.stringify(orders)), [orders]);
  useEffect(() => {
    if (user) localStorage.setItem('pos_user', JSON.stringify(user));
    else localStorage.removeItem('pos_user');
  }, [user]);
  useEffect(() => localStorage.setItem('pos_categories', JSON.stringify(categories)), [categories]);

  const login = (pin: string) => {
    const foundUser = INITIAL_USERS.find(u => u.pin === pin);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category].sort());
    }
  };

  const deleteCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
  };

  const updateCustomer = (customer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
  };

  const processPayment = async (items: CartItem[], total: number, method: PaymentMethod, cashReceived: number, customerId?: string): Promise<Order> => {
    // 1. Calculate profit
    let totalCost = 0;
    items.forEach(item => totalCost += (item.costPrice * item.qty));
    const profit = total - totalCost;

    // 2. Create Order
    const newOrder: Order = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items,
      subtotal: total, 
      total,
      profit,
      paymentMethod: method,
      cashReceived: method === 'CASH' ? cashReceived : total,
      change: method === 'CASH' ? cashReceived - total : 0,
      customerId,
      cashierName: user?.name || 'Unknown'
    };

    // 3. Update Inventory
    const updatedProducts = products.map(p => {
      const soldItem = items.find(i => i.id === p.id);
      if (soldItem) {
        return { ...p, stock: p.stock - soldItem.qty };
      }
      return p;
    });
    setProducts(updatedProducts);

    // 4. Update Customer Credit (if needed)
    if (method === 'CREDIT' && customerId) {
      const updatedCustomers = customers.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            currentDebt: c.currentDebt + total,
            history: [...c.history, {
              id: Date.now().toString(),
              date: new Date().toISOString(),
              action: 'PURCHASE',
              amount: total,
              note: `ซื้อสินค้า Order #${newOrder.id}`
            }]
          } as Customer;
        }
        return c;
      });
      setCustomers(updatedCustomers);
    }

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const payDebt = (customerId: string, amount: number) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          currentDebt: Math.max(0, c.currentDebt - amount),
          history: [...c.history, {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            action: 'PAYMENT',
            amount: amount,
            note: 'ชำระหนี้คงค้าง'
          }]
        } as Customer;
      }
      return c;
    }));
  };

  return (
    <StoreContext.Provider value={{
      user, login, logout,
      products, customers, orders, categories,
      addProduct, updateProduct, deleteProduct,
      addCategory, deleteCategory,
      addCustomer, updateCustomer,
      processPayment, payDebt
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};