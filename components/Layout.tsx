import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { user, logout } = useStore();

  const menuItems = [
    { id: 'pos', label: 'จุดขาย (POS)', icon: ShoppingCart, allowed: ['ADMIN', 'STAFF'] },
    { id: 'dashboard', label: 'ภาพรวม', icon: LayoutDashboard, allowed: ['ADMIN'] },
    { id: 'products', label: 'คลังสินค้า', icon: Package, allowed: ['ADMIN'] },
    { id: 'customers', label: 'สมาชิก/ลูกหนี้', icon: Users, allowed: ['ADMIN', 'STAFF'] },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - Hide on print */}
      <div className="w-64 bg-slate-800 text-white flex flex-col no-print">
        <div className="p-6">
          <h1 className="text-2xl font-bold">ร้านสามพี่น้อง</h1>
          <p className="text-sm text-slate-400 mt-1">ยินดีต้อนรับ, {user?.name}</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.filter(item => item.allowed.includes(user?.role || '')).map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};