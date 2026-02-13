import React from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Users, AlertTriangle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { orders, products, customers } = useStore();

  // 1. Stats Calculation
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.date.startsWith(today));

  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const todayProfit = todayOrders.reduce((sum, o) => sum + o.profit, 0);
  const totalDebt = customers.reduce((sum, c) => sum + c.currentDebt, 0);
  const lowStockItems = products.filter(p => p.stock <= p.minStock).length;

  // 2. Chart Data Preparation
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const salesData = last7Days.map(date => {
    const dayOrders = orders.filter(o => o.date.startsWith(date));
    return {
      name: date,
      ยอดขาย: dayOrders.reduce((sum, o) => sum + o.total, 0),
      กำไร: dayOrders.reduce((sum, o) => sum + o.profit, 0)
    };
  });

  const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderColor: color }}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1" style={{ color }}>{value}</h3>
          {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-full bg-opacity-10`} style={{ backgroundColor: color }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">ภาพรวมธุรกิจ</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="ยอดขายวันนี้"
          value={`฿${todaySales.toLocaleString()}`}
          icon={TrendingUp}
          color="#2563eb"
          subValue={`${todayOrders.length} ออเดอร์`}
        />
        <StatCard
          title="กำไรวันนี้"
          value={`฿${todayProfit.toLocaleString()}`}
          icon={DollarSign}
          color="#16a34a"
        />
        <StatCard
          title="ยอดลูกหนี้คงค้าง"
          value={`฿${totalDebt.toLocaleString()}`}
          icon={Users}
          color="#ea580c"
          subValue={`${customers.filter(c => c.currentDebt > 0).length} คน`}
        />
        <StatCard
          title="สินค้าต้องสั่งเพิ่ม"
          value={`${lowStockItems} รายการ`}
          icon={AlertTriangle}
          color="#dc2626"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm h-80">
          <h3 className="text-lg font-bold mb-4">แนวโน้มยอดขาย 7 วันล่าสุด</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ยอดขาย" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="กำไร" stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm h-80">
          <h3 className="text-lg font-bold mb-4">เปรียบเทียบยอดขาย vs กำไร</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ยอดขาย" fill="#3b82f6" />
              <Bar dataKey="กำไร" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};