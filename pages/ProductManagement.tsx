import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { Plus, Edit, Trash2, Search, Filter, Upload, Image as ImageIcon, X, Save, Settings } from 'lucide-react';

export const ProductManagement: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false); // New modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Reference for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', barcode: '', category: '', costPrice: 0, salePrice: 0, stock: 0, minStock: 5, image: ''
  });

  // Helper: Resize Image
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSize = 300; 

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const resizedBase64 = await resizeImage(file);
        setFormData(prev => ({ ...prev, image: resizedBase64 }));
      } catch (error) {
        console.error("Error resizing image", error);
        alert("ไม่สามารถอัปโหลดรูปภาพได้");
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = formData.image || ''; 

    const productData = {
      ...formData,
      image: finalImage,
      id: editingProduct ? editingProduct.id : Date.now().toString(),
    } as Product;

    // Auto-add category if it doesn't exist
    if (productData.category && !categories.includes(productData.category)) {
      addCategory(productData.category);
    }

    if (editingProduct) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }
    
    closeModal();
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', barcode: '', category: '', costPrice: 0, salePrice: 0, stock: 0, minStock: 5, image: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) {
      deleteProduct(id);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">จัดการสินค้า</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 shadow"
          >
            <Settings size={20} /> จัดการหมวดหมู่
          </button>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow"
          >
            <Plus size={20} /> เพิ่มสินค้า
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="ค้นหาชื่อสินค้า หรือ รหัสบาร์โค้ด..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64 flex items-center gap-2">
          <Filter className="text-gray-400" size={20} />
          <select
            className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">ทุกหมวดหมู่</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
            <tr>
              <th className="p-4">รูปสินค้า</th>
              <th className="p-4">รหัส / ชื่อสินค้า</th>
              <th className="p-4">หมวดหมู่</th>
              <th className="p-4 text-right">ต้นทุน</th>
              <th className="p-4 text-right">ราคาขาย</th>
              <th className="p-4 text-center">คงเหลือ</th>
              <th className="p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.length === 0 ? (
               <tr><td colSpan={7} className="p-8 text-center text-gray-500">ไม่พบสินค้า</td></tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center border">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-gray-400" size={20} />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.barcode}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded text-xs">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 text-right text-gray-500">฿{product.costPrice}</td>
                  <td className="p-4 text-right font-bold text-blue-600">฿{product.salePrice}</td>
                  <td className="p-4 text-center">
                    <span className={`font-bold ${product.stock <= product.minStock ? 'text-red-500' : 'text-green-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(product)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="แก้ไข"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="ลบ"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[700px] max-w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex flex-col items-center mb-6 p-4 border-2 border-dashed rounded-lg bg-gray-50">
                <div className="relative w-32 h-32 bg-gray-200 rounded-lg overflow-hidden mb-3 border shadow-sm flex items-center justify-center group">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-400" size={48} />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                       onClick={() => fileInputRef.current?.click()}>
                     <Upload className="text-white" />
                  </div>
                </div>

                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                />

                <div className="flex gap-2">
                  <button type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 font-medium">
                    {formData.image ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปภาพ'}
                  </button>
                  {formData.image && (
                    <button type="button" 
                      onClick={handleRemoveImage}
                      className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 font-medium">
                      ลบรูป
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700">ชื่อสินค้า <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">รหัสบาร์โค้ด <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input
                      required
                      type="text"
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={formData.barcode}
                      onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    />
                    <button type="button" 
                      onClick={() => setFormData({...formData, barcode: Date.now().toString().slice(-8)})}
                      className="bg-gray-100 px-2 rounded border text-xs hover:bg-gray-200" title="สุ่มรหัส">
                      สุ่ม
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">หมวดหมู่</label>
                  <input
                    list="categories"
                    type="text"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="เลือกหรือพิมพ์ใหม่..."
                  />
                  <datalist id="categories">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">ราคาทุน</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">ราคาขาย <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.salePrice}
                    onChange={e => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">จำนวนสต็อก</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">แจ้งเตือนขั้นต่ำ</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.minStock}
                    onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow transition-colors flex items-center gap-2"
                >
                  <Save size={18} /> บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] max-w-full">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-800">จัดการหมวดหมู่</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
               <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                 <input 
                   type="text" 
                   className="flex-1 border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                   placeholder="ชื่อหมวดหมู่ใหม่..."
                   value={newCategoryName}
                   onChange={e => setNewCategoryName(e.target.value)}
                 />
                 <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                   <Plus size={18} />
                 </button>
               </form>

               <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                 {categories.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">ยังไม่มีหมวดหมู่</div>
                 ) : (
                    categories.map(cat => (
                      <div key={cat} className="flex justify-between items-center p-2 border-b last:border-0 hover:bg-gray-50">
                        <span>{cat}</span>
                        <button onClick={() => deleteCategory(cat)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                 )}
               </div>
               
               <p className="text-xs text-gray-500 mt-2">* การลบหมวดหมู่จะไม่ลบสินค้าในหมวดหมู่นั้น</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};