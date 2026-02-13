import React from 'react';
import { DebtReceiptData } from '../types';

interface DebtReceiptProps {
  data: DebtReceiptData | null;
}

export const DebtReceipt: React.FC<DebtReceiptProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="print-only text-black bg-white text-[12px] leading-tight font-mono p-0">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold mb-1">ร้านสามพี่น้อง</h2>
        <p className="text-[10px]">ใบเสร็จรับเงินชำระหนี้</p>
        <p className="text-[10px] mt-1 text-gray-500">***************************</p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between">
            <span>วันที่:</span>
            <span>{new Date(data.date).toLocaleString('th-TH')}</span>
        </div>
        <div className="flex justify-between">
            <span>เลขที่รายการ:</span>
            <span>{data.id.slice(-6)}</span>
        </div>
        <div className="flex justify-between">
            <span>ลูกค้า:</span>
            <span>{data.customerName}</span>
        </div>
        <div className="flex justify-between">
            <span>ผู้รับเงิน:</span>
            <span>{data.cashierName}</span>
        </div>
      </div>

      <div className="border-t border-b border-black border-dashed py-2 mb-4">
         <div className="flex justify-between text-lg font-bold">
            <span>ยอดชำระ:</span>
            <span>฿{data.amount.toLocaleString()}</span>
         </div>
      </div>

      <div className="mb-6">
         <div className="flex justify-between">
            <span>หนี้คงเหลือ:</span>
            <span className="font-bold">฿{data.remainingDebt.toLocaleString()}</span>
         </div>
      </div>

      <div className="flex justify-between mt-8 pt-4">
         <div className="text-center w-1/2">
            <div className="border-b border-black w-20 mx-auto mb-1"></div>
            <span>ผู้รับเงิน</span>
         </div>
         <div className="text-center w-1/2">
            <div className="border-b border-black w-20 mx-auto mb-1"></div>
            <span>ผู้ชำระเงิน</span>
         </div>
      </div>

      <div className="mt-4 text-center">
        <p className="font-bold">ขอบคุณที่ใช้บริการ</p>
      </div>
    </div>
  );
};