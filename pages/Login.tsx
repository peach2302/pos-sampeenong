import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(pin)) {
      setError('รหัส PIN ไม่ถูกต้อง (ลองใช้ 1234 หรือ 0000)');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96 text-center">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="text-blue-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-800">ร้านสามพี่น้อง POS</h1>
        <p className="text-gray-500 mb-6">กรุณาใส่รหัส PIN เพื่อเข้าใช้งาน</p>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            maxLength={4}
            className="w-full text-center text-4xl tracking-widest border-2 border-gray-300 rounded-lg p-4 mb-4 focus:border-blue-500 focus:outline-none"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError('');
            }}
            placeholder="••••"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            เข้าสู่ระบบ
          </button>
        </form>
        <div className="mt-4 text-xs text-gray-400">
          Default Admin: 1234 | Staff: 0000
        </div>
      </div>
    </div>
  );
};