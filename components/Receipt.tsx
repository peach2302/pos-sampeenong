import React from 'react';
import { Order } from '../types';

interface ReceiptProps {
  order: Order | null;
}

export const Receipt: React.FC<ReceiptProps> = ({ order }) => {
  if (!order) return null;

  return (
    <div className="print-only text-black bg-white text-[12px] leading-tight font-mono p-0">
      {/* 
         NOTE: For Cash Drawer to open, please configure your Printer Driver settings:
         Properties > Device Settings > Cash Drawer > Open Before Printing
      */}
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold mb-1">ร้านสามพี่น้อง</h2>
        <p className="text-[10px]">123 ถนนสุขใจ ต.ในเมือง อ.เมือง</p>
        <p className="text-[10px]">โทร. 089-123-4567</p>
        <p className="mt-1 text-[10px] font-bold border-b border-black inline-block pb-0.5">ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ</p>
      </div>

      <div className="mb-2 border-b border-black border-dashed pb-1">
        <div className="flex justify-between">
            <span>เลขที่: {order.id.slice(-6)}</span>
            <span>{new Date(order.date).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</span>
        </div>
        <div className="flex justify-between">
            <span>พนักงาน: {order.cashierName}</span>
        </div>
        {order.customerId && (
            <div className="flex justify-between">
                <span>ลูกค้า: {order.customerId}</span>
            </div>
        )}
      </div>

      <table className="w-full mb-2">
        <thead>
          <tr className="text-left border-b border-black">
            <th className="py-1 w-[55%]">สินค้า</th>
            <th className="py-1 text-right w-[15%]">จ.น.</th>
            <th className="py-1 text-right w-[30%]">รวม</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-0.5 align-top break-words pr-1">{item.name}</td>
              <td className="py-0.5 text-right align-top">{item.qty}</td>
              <td className="py-0.5 text-right align-top">{item.salePrice * item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-black border-dashed pt-2 space-y-0.5">
        <div className="flex justify-between font-bold text-sm">
          <span>ยอดรวม</span>
          <span>{order.total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>ชำระโดย</span>
          <span>
            {order.paymentMethod === 'CASH' ? 'เงินสด' :
             order.paymentMethod === 'TRANSFER' ? 'เงินโอน' : 'เครดิต'}
          </span>
        </div>
        {order.paymentMethod === 'CASH' && (
          <>
            <div className="flex justify-between text-[10px]">
              <span>รับเงิน</span>
              <span>{order.cashReceived?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>เงินทอน</span>
              <span>{order.change?.toLocaleString()}</span>
            </div>
          </>
        )}
         {order.paymentMethod === 'CREDIT' && (
          <div className="text-center text-[10px] mt-1 italic">
            * บันทึกยอดค้างชำระแล้ว *
          </div>
        )}
      </div>

      <div className="mt-4 text-center border-t border-black border-dashed pt-2">
        <p className="font-bold">ขอบคุณที่อุดหนุน</p>
        <p className="text-[10px] mt-0.5">Thank you for your purchase</p>
        <p className="text-[10px] mt-1 text-gray-500">***************************</p>
      </div>
    </div>
  );
};