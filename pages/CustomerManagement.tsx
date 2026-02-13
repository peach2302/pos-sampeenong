import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Customer, CustomerHistory, DebtReceiptData } from '../types';
import { Plus, Search, DollarSign, History, X, Printer, FileText } from 'lucide-react';
import { DebtReceipt } from '../components/DebtReceipt';

export const CustomerManagement: React.FC = () => {
  const { customers, addCustomer, payDebt, user } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  
  // Printing State
  const [printingDebtData, setPrintingDebtData] = useState<DebtReceiptData | null>(null);
  const [printingHistoryCustomer, setPrintingHistoryCustomer] = useState<Customer | null>(null);

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '', phone: '', address: '', creditLimit: 1000, currentDebt: 0
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer({
      ...newCustomer,
      id: Date.now().toString(),
      currentDebt: 0,
      history: []
    } as Customer);
    setShowAddModal(false);
  };

  const handlePayDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewCustomer) return;
    const amount = Number(payAmount);
    if (amount <= 0 || amount > viewCustomer.currentDebt) {
      alert('ยอดชำระไม่ถูกต้อง');
      return;
    }

    const confirmMessage = `ยืนยันการรับชำระหนี้\n\nลูกค้า: ${viewCustomer.name}\nยอดชำระ: ฿${amount.toLocaleString()}\n\nคุณแน่ใจหรือไม่?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    payDebt(viewCustomer.id, amount);

    // Mock immediate update for local view and printing
    const receiptData: DebtReceiptData = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      customerName: viewCustomer.name,
      amount: amount,
      remainingDebt: viewCustomer.currentDebt - amount,
      cashierName: user?.name || 'Staff'
    };

    if (window.confirm('บันทึกสำเร็จ! ต้องการพิมพ์ใบเสร็จรับเงินหรือไม่?')) {
        setPrintingDebtData(receiptData);
        setTimeout(() => {
            window.print();
            setPrintingDebtData(null);
        }, 500);
    }
    
    setPayAmount('');
    // Close modal to refresh or simple re-fetch, but let's update local state to keep modal open
    const newHistoryItem: CustomerHistory = {
        id: receiptData.id,
        date: receiptData.date,
        action: 'PAYMENT',
        amount: amount,
        note: 'ชำระหนี้คงค้าง'
    };
    setViewCustomer(prev => prev ? ({
        ...prev, 
        currentDebt: prev.currentDebt - amount,
        history: [...prev.history, newHistoryItem]
    }) : null);
  };

  // Function to print a specific debt payment transaction
  const handlePrintDebtReceipt = (customer: Customer, historyItem: CustomerHistory) => {
    if (historyItem.action !== 'PAYMENT') return;
    const data: DebtReceiptData = {
      id: historyItem.id,
      date: historyItem.date,
      customerName: customer.name,
      amount: historyItem.amount,
      remainingDebt: customer.currentDebt, // Approx current debt
      cashierName: user?.name || 'Admin'
    };

    setPrintingDebtData(data);
    setTimeout(() => {
      window.print();
      setPrintingDebtData(null); 
    }, 500);
  };
  
  const handlePrintHistory = () => {
    if (viewCustomer) {
        setPrintingHistoryCustomer(viewCustomer);
        setTimeout(() => {
            window.print();
            setPrintingHistoryCustomer(null);
        }, 500);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div>
       {/* Screen UI - Hidden on Print */}
       <div className="no-print">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">ลูกค้า / ลูกหนี้</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus size={20} /> เพิ่มสมาชิก
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ หรือ เบอร์โทร..."
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
                <tr>
                  <th className="p-4">ชื่อลูกค้า</th>
                  <th className="p-4">เบอร์โทร</th>
                  <th className="p-4 text-right">วงเงินเครดิต</th>
                  <th className="p-4 text-right">หนี้คงค้าง</th>
                  <th className="p-4 text-center">สถานะ</th>
                  <th className="p-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      ไม่พบข้อมูลลูกค้า
                    </td>
                  </tr>
                ) : (
                  filtered.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium">{c.name}</td>
                      <td className="p-4">{c.phone}</td>
                      <td className="p-4 text-right">{c.creditLimit.toLocaleString()}</td>
                      <td className="p-4 text-right font-bold text-red-600">{c.currentDebt.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          c.currentDebt > 0 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {c.currentDebt > 0 ? 'มียอดค้าง' : 'ปกติ'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setViewCustomer(c)}
                          className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 mx-auto hover:underline"
                        >
                          <History size={16} /> ประวัติ/ชำระ
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
       </div>

      {/* Customer Detail / Payment Modal - Screen UI (no-print) */}
      {viewCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
           <div className="bg-white rounded-lg w-[700px] max-w-full flex flex-col max-h-[90vh] shadow-2xl">
              <div className="p-6 border-b flex justify-between items-center">
                 <h3 className="text-xl font-bold">{viewCustomer.name}</h3>
                 <button onClick={() => setViewCustomer(null)} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                   <X size={24} />
                 </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                 <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-xl border mb-6 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">หนี้คงค้างปัจจุบัน</div>
                      <div className="text-3xl font-bold text-red-600">฿{viewCustomer.currentDebt.toLocaleString()}</div>
                    </div>
                    {viewCustomer.currentDebt > 0 && (
                      <form onSubmit={handlePayDebt} className="flex gap-2 items-end">
                         <div>
                            <label className="block text-xs mb-1 font-medium text-gray-700">ระบุยอดชำระ</label>
                            <input
                              type="number"
                              className="border p-2 rounded w-32 focus:ring-2 focus:ring-green-500 focus:outline-none"
                              value={payAmount}
                              onChange={e => setPayAmount(e.target.value)}
                              placeholder="0.00"
                              autoFocus
                            />
                         </div>
                         <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow font-medium">
                           ชำระหนี้
                         </button>
                      </form>
                    )}
                 </div>

                 <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <History size={18} /> ประวัติการทำรายการ
                    </h4>
                    <button 
                        onClick={handlePrintHistory}
                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded flex items-center gap-1"
                    >
                        <Printer size={16} /> พิมพ์ประวัติ
                    </button>
                 </div>
                 
                 <div className="border rounded-lg divide-y bg-white overflow-hidden">
                    {viewCustomer.history.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 bg-gray-50">ยังไม่มีประวัติการทำรายการ</div>
                    ) : (
                      viewCustomer.history.slice().reverse().map(h => (
                        <div key={h.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors group">
                           <div>
                              <div className={`font-bold flex items-center gap-2 ${h.action === 'PAYMENT' ? 'text-green-600' : 'text-blue-600'}`}>
                                {h.action === 'PAYMENT' ? <DollarSign size={16} /> : <History size={16} />}
                                {h.action === 'PAYMENT' ? 'ชำระหนี้' : 'ซื้อเชื่อ'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{new Date(h.date).toLocaleString('th-TH')}</div>
                              <div className="text-sm text-gray-600 mt-1">{h.note}</div>
                           </div>
                           <div className="text-right">
                               <div className={`font-bold text-lg ${h.action === 'PAYMENT' ? 'text-green-600' : 'text-red-500'}`}>
                                 {h.action === 'PAYMENT' ? '-' : '+'}{h.amount.toLocaleString()}
                               </div>
                               {h.action === 'PAYMENT' && (
                                   <button 
                                      onClick={() => handlePrintDebtReceipt(viewCustomer, h)}
                                      className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                   >
                                      <Printer size={12} /> พิมพ์ใบเสร็จ
                                   </button>
                               )}
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Add Customer Modal - Screen UI (no-print) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[500px] max-w-full">
            <h3 className="text-xl font-bold mb-6 text-gray-800">เพิ่มลูกค้าใหม่</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">ชื่อ-นามสกุล</label>
                  <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">เบอร์โทรศัพท์</label>
                  <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">ที่อยู่</label>
                  <textarea className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={2}
                    value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
                  ></textarea>
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">วงเงินเครดิต</label>
                  <input required type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={newCustomer.creditLimit} onChange={e => setNewCustomer({...newCustomer, creditLimit: Number(e.target.value)})}
                  />
               </div>
               <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">ยกเลิก</button>
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow transition-colors">บันทึก</button>
               </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Hidden Debt Receipt */}
      <DebtReceipt data={printingDebtData} />
      
      {/* Printable History View */}
      {printingHistoryCustomer && (
        <div className="print-only text-black bg-white p-8">
            <h1 className="text-2xl font-bold mb-2">ประวัติการซื้อ-ขาย / ชำระหนี้</h1>
            <div className="mb-4 border-b pb-4">
                <div className="flex justify-between">
                    <span className="font-bold">ลูกค้า:</span> <span>{printingHistoryCustomer.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-bold">เบอร์โทร:</span> <span>{printingHistoryCustomer.phone}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="font-bold">พิมพ์วันที่:</span> <span>{new Date().toLocaleString('th-TH')}</span>
                </div>
            </div>
            
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="text-left py-2">วันที่</th>
                        <th className="text-left py-2">รายการ</th>
                        <th className="text-right py-2">ยอดเงิน</th>
                    </tr>
                </thead>
                <tbody>
                    {printingHistoryCustomer.history.map(h => (
                        <tr key={h.id} className="border-b border-gray-300">
                            <td className="py-2">{new Date(h.date).toLocaleDateString('th-TH')} {new Date(h.date).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}</td>
                            <td className="py-2">
                                <div>{h.action === 'PAYMENT' ? 'ชำระหนี้' : 'ซื้อเชื่อ'}</div>
                                <div className="text-xs text-gray-500">{h.note}</div>
                            </td>
                            <td className={`py-2 text-right font-bold ${h.action === 'PAYMENT' ? 'text-green-600' : 'text-red-600'}`}>
                                {h.action === 'PAYMENT' ? '-' : '+'}{h.amount.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="mt-8 text-right font-bold text-xl">
                หนี้คงค้างปัจจุบัน: {printingHistoryCustomer.currentDebt.toLocaleString()} บาท
            </div>
        </div>
      )}
    </div>
  );
};