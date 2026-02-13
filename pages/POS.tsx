import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, User as UserIcon, Printer, ShoppingCart, X, CheckCircle, Wallet } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, CartItem, Customer, Order, PaymentMethod } from '../types';
import { Receipt } from '../components/Receipt';

export const POS: React.FC = () => {
  const { products, customers, processPayment } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH'); // Track active tab
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Focus reference
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- BARCODE SCANNER LOGIC ---
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = 0;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
        if (document.activeElement !== searchInputRef.current) {
            return; 
        }
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100 && buffer.length > 0) {
         buffer = ''; 
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        const codeToSearch = buffer.length > 0 ? buffer : searchTerm;
        if (codeToSearch) {
           const product = products.find(p => p.barcode === codeToSearch);
           if (product) {
              addToCart(product);
              setSearchTerm(''); 
              buffer = '';       
              if (searchInputRef.current) searchInputRef.current.value = '';
           }
        }
        buffer = '';
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [products, searchTerm]); 

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('สินค้าหมดสต็อก!');
      return;
    }
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        if (exists.qty >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty > item.stock) return item;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    if (cart.length > 0 && window.confirm('ต้องการล้างตะกร้าสินค้าทั้งหมดหรือไม่?')) {
      setCart([]);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.salePrice * item.qty), 0);

  // Initialize Modal
  const openPaymentModal = () => {
    setPaymentMethod('CASH'); // Default to cash
    setCashReceived('');
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (cart.length === 0) return;

    try {
      // VALIDATION
      if (paymentMethod === 'CASH') {
        const cash = parseFloat(cashReceived);
        if (isNaN(cash) || cash < totalAmount) {
          alert('ยอดเงินไม่เพียงพอ');
          return;
        }
      } else if (paymentMethod === 'CREDIT') {
        if (!selectedCustomer) {
          alert('กรุณาเลือกลูกค้าทางด้านขวา เพื่อทำรายการค้างชำระ'); 
          return;
        }
        if (selectedCustomer.creditLimit - selectedCustomer.currentDebt < totalAmount) {
          alert(`วงเงินเครดิตไม่พอ (ขาดอีก ${(totalAmount - (selectedCustomer.creditLimit - selectedCustomer.currentDebt)).toLocaleString()} บาท)`);
          return;
        }
        // REMOVED window.confirm here to prevent blocking issues
      }

      // PROCESS
      const order = await processPayment(
        cart,
        totalAmount,
        paymentMethod,
        paymentMethod === 'CASH' ? parseFloat(cashReceived) : 0,
        selectedCustomer?.id
      );

      setLastOrder(order);
      setShowPaymentModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Payment Error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกรายการ");
    }
  };

  const handleNewOrder = () => {
    setShowSuccessModal(false);
    setCart([]);
    setCashReceived('');
    setSelectedCustomer(null);
    setLastOrder(null);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handlePrint = () => {
    // Call print directly without timeout to avoid browser blocking
    window.print();
  };

  const handleOpenDrawerOnly = () => {
    if (lastOrder) {
      window.print();
    } else {
      alert("ไม่มีรายการล่าสุดให้พิมพ์");
    }
  };

  return (
    <div className="h-full">
      {/* Visible UI - Hidden on Print */}
      <div className="flex h-full gap-4 no-print">
        {/* Product Grid */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-lg shadow flex items-center gap-2">
            <Search className="text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="ค้นหาชื่อสินค้า, บาร์โค้ด หรือ หมวดหมู่... (สแกนได้เลย)"
              className="flex-1 outline-none text-lg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4 no-scrollbar">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow flex flex-col ${product.stock === 0 ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="h-32 bg-gray-100 rounded mb-2 overflow-hidden relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                    {product.category}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 line-clamp-2 leading-tight">{product.name}</h3>
                <div className="mt-auto flex justify-between items-end">
                  <span className={`text-xs ${product.stock <= product.minStock ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                    คงเหลือ: {product.stock}
                  </span>
                  <span className="text-blue-600 font-bold text-lg">฿{product.salePrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-96 bg-white rounded-lg shadow flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart /> ตะกร้า ({cart.reduce((a,c) => a+c.qty, 0)})
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 p-2 border rounded-lg bg-white hover:bg-red-50 transition-colors"
                title="ล้างตะกร้า"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={handleOpenDrawerOnly}
                className="text-gray-500 hover:text-blue-600 p-2 border rounded-lg bg-white hover:bg-blue-50 transition-colors" 
                title="พิมพ์ใบเสร็จล่าสุด / เปิดลิ้นชัก"
              >
                <Printer size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <ShoppingCart size={48} className="mb-2" />
                <p>สแกนสินค้า หรือ เลือกจากรายการ</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center justify-between border-b pb-2 group">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="flex justify-between w-2/3">
                      <div className="text-gray-500 text-sm">@{item.salePrice}</div>
                      <div className="text-blue-600 font-bold">฿{item.salePrice * item.qty}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-600">
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center font-bold text-lg">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-gray-100 rounded text-green-600">
                      <Plus size={16} />
                    </button>
                    <button onClick={() => removeFromCart(item.id)} className="ml-2 p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100" title="ลบรายการ">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-gray-50 border-t rounded-b-lg">
            <div className="flex justify-between text-3xl font-bold mb-4 text-gray-800">
              <span>รวม</span>
              <span className="text-blue-600">฿{totalAmount.toLocaleString()}</span>
            </div>
            <button
              disabled={cart.length === 0}
              onClick={openPaymentModal}
              className="w-full bg-blue-600 text-white py-4 rounded-lg text-2xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-lg flex items-center justify-center gap-3"
            >
              <Banknote size={28} /> รับเงิน / ชำระ
            </button>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-[800px] max-w-full overflow-hidden flex flex-col md:flex-row h-[500px]">
              
              {/* Left Side: Method Selection & Input */}
              <div className="flex-1 p-6 flex flex-col">
                <h3 className="text-2xl font-bold mb-4">เลือกวิธีชำระเงิน</h3>
                
                {/* Payment Methods Tabs */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <button 
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'CASH' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Banknote size={24} />
                    <span className="font-bold text-sm">เงินสด</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('TRANSFER')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'TRANSFER' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <CreditCard size={24} />
                    <span className="font-bold text-sm">โอนเงิน</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('CREDIT')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'CREDIT' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <UserIcon size={24} />
                    <span className="font-bold text-sm">ค้างชำระ</span>
                  </button>
                </div>

                {/* Dynamic Content */}
                <div className="flex-1">
                  {paymentMethod === 'CASH' && (
                    <div className="animate-in fade-in duration-300">
                      <div className="mb-2 font-medium text-gray-700">รับเงินสดมา (บาท):</div>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full border-2 border-gray-300 p-4 rounded-lg text-3xl text-right focus:border-green-500 outline-none mb-3"
                        value={cashReceived}
                        onChange={e => setCashReceived(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleConfirmPayment()}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        {[100, 500, 1000].map(amt => (
                          <button key={amt} onClick={() => setCashReceived(amt.toString())} className="flex-1 py-2 bg-gray-100 rounded hover:bg-gray-200 font-medium">
                            {amt}
                          </button>
                        ))}
                        <button onClick={() => setCashReceived(totalAmount.toString())} className="flex-1 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium">
                           พอดี
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'TRANSFER' && (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-300 text-gray-500">
                      <CreditCard size={48} className="mb-2 text-purple-300" />
                      <p>กรุณาตรวจสอบสลิปโอนเงิน</p>
                      <p className="text-sm">ยอดเงิน: ฿{totalAmount.toLocaleString()}</p>
                    </div>
                  )}

                  {paymentMethod === 'CREDIT' && (
                    <div className="h-full flex flex-col justify-center animate-in fade-in duration-300">
                      {!selectedCustomer ? (
                        <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg border border-red-100">
                          <UserIcon size={48} className="mx-auto mb-2 opacity-50" />
                          <p className="font-bold">กรุณาเลือกลูกค้าทางด้านขวา</p>
                          <p className="text-sm">เพื่อทำรายการค้างชำระ</p>
                        </div>
                      ) : (
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                           <h4 className="font-bold text-orange-800 border-b border-orange-200 pb-2 mb-2">ตรวจสอบวงเงินเครดิต</h4>
                           <div className="flex justify-between mb-1">
                             <span>วงเงินทั้งหมด:</span>
                             <span className="font-bold">{selectedCustomer.creditLimit.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between mb-1 text-red-600">
                             <span>หนี้เดิม:</span>
                             <span>- {selectedCustomer.currentDebt.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between mb-1 text-blue-600">
                             <span>ยอดซื้อครั้งนี้:</span>
                             <span>- {totalAmount.toLocaleString()}</span>
                           </div>
                           <div className="border-t border-orange-200 pt-2 flex justify-between font-bold text-lg mt-2">
                             <span>คงเหลือหลังซื้อ:</span>
                             <span className={selectedCustomer.creditLimit - selectedCustomer.currentDebt - totalAmount < 0 ? 'text-red-500' : 'text-green-600'}>
                               {(selectedCustomer.creditLimit - selectedCustomer.currentDebt - totalAmount).toLocaleString()}
                             </span>
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Summary & Actions */}
              <div className="w-80 bg-gray-50 p-6 border-l flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-500">เลือกลูกค้า (Optional)</label>
                    <select
                      className="w-full border p-2 rounded bg-white shadow-sm"
                      onChange={e => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                      value={selectedCustomer?.id || ''}
                    >
                      <option value="">-- ลูกค้าทั่วไป --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                     <div className="flex justify-between">
                        <span>ยอดรวมสินค้า:</span>
                        <span className="font-bold text-black">฿{totalAmount.toLocaleString()}</span>
                     </div>
                     {paymentMethod === 'CASH' && (
                       <div className="flex justify-between items-center text-lg mt-4 pt-4 border-t">
                          <span>เงินทอน:</span>
                          <span className={`font-bold text-xl ${parseFloat(cashReceived) - totalAmount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                             {cashReceived ? (parseFloat(cashReceived) - totalAmount).toLocaleString() : '0.00'}
                          </span>
                       </div>
                     )}
                  </div>
                </div>

                <div>
                   <button
                     onClick={handleConfirmPayment}
                     className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all flex items-center justify-center gap-2
                       ${paymentMethod === 'CASH' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                       ${paymentMethod === 'TRANSFER' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
                       ${paymentMethod === 'CREDIT' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                     `}
                   >
                     {paymentMethod === 'CASH' && <><Banknote /> ยืนยันรับเงินสด</>}
                     {paymentMethod === 'TRANSFER' && <><CreditCard /> ยืนยันเงินโอน</>}
                     {paymentMethod === 'CREDIT' && <><Wallet /> ยืนยันค้างชำระ</>}
                   </button>
                   
                   <button
                     onClick={() => setShowPaymentModal(false)}
                     className="w-full mt-3 text-gray-500 hover:text-gray-700 font-medium"
                   >
                     ยกเลิก / กลับไปแก้ไข
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && lastOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-[400px] text-center p-8 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">ชำระเงินสำเร็จ</h3>
                <p className="text-gray-500 mb-6">บันทึกรายการขายเรียบร้อยแล้ว</p>
                
                {lastOrder.paymentMethod === 'CASH' && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-dashed border-gray-300">
                      <div className="text-sm text-gray-500">เงินทอน</div>
                      <div className="text-4xl font-bold text-blue-600">฿{lastOrder.change?.toLocaleString()}</div>
                  </div>
                )}
                
                {lastOrder.paymentMethod === 'CREDIT' && (
                   <div className="bg-orange-50 rounded-lg p-4 mb-6 border border-orange-200 text-orange-800 text-sm">
                      บันทึกยอดหนี้ในบัญชีลูกค้าแล้ว
                   </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handlePrint}
                      className="flex items-center justify-center gap-2 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      <Printer size={20} /> พิมพ์ใบเสร็จ
                    </button>
                    <button 
                      onClick={handleNewOrder}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold"
                    >
                      รายการต่อไป &rarr;
                    </button>
                </div>
              </div>
          </div>
        )}
      </div>

      {/* Hidden Receipt for Printing */}
      <Receipt order={lastOrder} />
    </div>
  );
};