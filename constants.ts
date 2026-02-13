import { Product, Customer, User } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    barcode: '8850001',
    name: 'น้ำดื่มตราสิงห์ 600ml',
    category: 'เครื่องดื่ม',
    costPrice: 5,
    salePrice: 10,
    stock: 100,
    minStock: 20,
    image: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: '2',
    barcode: '8850002',
    name: 'เลย์ รสมันฝรั่งแท้ 50g',
    category: 'ขนมขบเคี้ยว',
    costPrice: 15,
    salePrice: 20,
    stock: 45,
    minStock: 10,
    image: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: '3',
    barcode: '8850003',
    name: 'มาม่า รสหมูสับ',
    category: 'อาหารแห้ง',
    costPrice: 5,
    salePrice: 7,
    stock: 200,
    minStock: 50,
    image: 'https://picsum.photos/200/200?random=3'
  },
  {
    id: '4',
    barcode: '8850004',
    name: 'กาแฟกระป๋อง เบอร์ดี้',
    category: 'เครื่องดื่ม',
    costPrice: 12,
    salePrice: 15,
    stock: 12,
    minStock: 24,
    image: 'https://picsum.photos/200/200?random=4'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'คุณสมชาย ใจดี',
    phone: '081-234-5678',
    address: '123 หมู่ 1 ต.ในเมือง',
    creditLimit: 1000,
    currentDebt: 0,
    history: []
  },
  {
    id: 'c2',
    name: 'ป้าแดง ร้านข้าวแกง',
    phone: '089-999-8888',
    address: 'ตลาดสดเทศบาล',
    creditLimit: 5000,
    currentDebt: 1200,
    history: []
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    username: 'admin',
    name: 'เจ้าของร้าน (Admin)',
    role: 'ADMIN',
    pin: '1234'
  },
  {
    id: 'u2',
    username: 'staff',
    name: 'พนักงานขาย (Staff)',
    role: 'STAFF',
    pin: '0000'
  }
];