import React, { useState } from 'react';
import { Product, Course, ClassInfo } from '../../types';
import { TEACHERS } from '../../constants';

interface ProductManagementProps {
  products: Product[];
  courses: Course[];
  classes: ClassInfo[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ 
  products, 
  courses, 
  classes, 
  onAddProduct,
  onUpdateProduct
}) => {
  const [showModal, setShowModal] = useState(false);
  
  // Filter states
  const [filterName, setFilterName] = useState('');
  const [filterCourseId, setFilterCourseId] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Form data for modal
  const [formData, setFormData] = useState({
    name: '',
    courseId: '',
    classId: '',
    price: ''
  });

  // Filter logic
  const filteredProducts = products.filter(p => {
    const matchName = !filterName || p.name.toLowerCase().includes(filterName.toLowerCase());
    const matchCourse = !filterCourseId || p.courseId === filterCourseId;
    const matchClass = !filterClassId || p.classId === filterClassId;
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchName && matchCourse && matchClass && matchStatus;
  });

  // Dependent options for search
  const searchClassOptions = filterCourseId 
    ? classes.filter(c => c.courseId === filterCourseId) 
    : classes;

  const handleCreate = () => {
    if (!formData.name || !formData.courseId || !formData.classId || !formData.price) {
      alert("请填写完整信息");
      return;
    }
    
    // Auto-detect delivery type for demo, or could be a field. Defaulting to offline if not specified.
    // In a real app this might be selected or derived from class/course attributes.
    const newProduct: Product = {
      id: `P${String(products.length + 1).padStart(3, '0')}`,
      name: formData.name,
      price: parseFloat(formData.price),
      courseId: formData.courseId,
      classId: formData.classId,
      deliveryType: 'offline', // Default for new creations in this demo
      description: '暂无介绍',
      status: 'active',
      createdTime: new Date().toISOString().split('T')[0]
    };

    onAddProduct(newProduct);
    setShowModal(false);
    setFormData({ name: '', courseId: '', classId: '', price: '' });
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return '-';
    return TEACHERS.find(t => t.id === teacherId)?.name || teacherId;
  };

  // Filter classes based on selected course in modal
  const modalClasses = classes.filter(c => !formData.courseId || c.courseId === formData.courseId);

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Title */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">商品管理</h2>
      </div>

      {/* Filter Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">商品名称:</span>
           <input 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40 focus:outline-none focus:border-primary"
             placeholder="请输入商品名称"
             value={filterName}
             onChange={e => setFilterName(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">绑定课程:</span>
           <select 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40 text-gray-600 focus:outline-none focus:border-primary"
             value={filterCourseId}
             onChange={e => {
               setFilterCourseId(e.target.value);
               setFilterClassId('');
             }}
           >
             <option value="">请选择课程</option>
             {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </select>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">班级:</span>
           <select 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40 text-gray-600 focus:outline-none focus:border-primary"
             value={filterClassId}
             onChange={e => setFilterClassId(e.target.value)}
           >
             <option value="">请选择班级</option>
             {searchClassOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </select>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">状态:</span>
           <select 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40 text-gray-600 focus:outline-none focus:border-primary"
             value={filterStatus}
             onChange={e => setFilterStatus(e.target.value)}
           >
             <option value="">请选择状态</option>
             <option value="active">已上架</option>
             <option value="disabled">已下架</option>
           </select>
        </div>

        <div className="flex items-center gap-3 ml-2">
          <button className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors">搜索</button>
          <button 
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-1.5 rounded text-sm transition-colors"
            onClick={() => {
              setFilterName('');
              setFilterCourseId('');
              setFilterClassId('');
              setFilterStatus('');
            }}
          >
            重置
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors ml-2"
          >
            新增
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="border-t border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="p-4 whitespace-nowrap">商品ID</th>
                <th className="p-4 whitespace-nowrap">商品名称</th>
                <th className="p-4 whitespace-nowrap">价格</th>
                <th className="p-4 whitespace-nowrap">绑定课程</th>
                <th className="p-4 whitespace-nowrap">课程类型</th>
                <th className="p-4 whitespace-nowrap">班级</th>
                <th className="p-4 whitespace-nowrap">主教</th>
                <th className="p-4 whitespace-nowrap">上课时间</th>
                <th className="p-4 whitespace-nowrap">校区</th>
                <th className="p-4 whitespace-nowrap">商品详情</th>
                <th className="p-4 whitespace-nowrap">人数限制</th>
                <th className="p-4 whitespace-nowrap">创建时间</th>
                <th className="p-4 whitespace-nowrap">状态</th>
                <th className="p-4 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(p => {
                const course = courses.find(c => c.id === p.courseId);
                const cls = classes.find(c => c.id === p.classId);
                
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-600">{p.id}</td>
                    <td className="p-4 text-gray-800">{p.name}</td>
                    <td className="p-4 text-red-500 font-bold">¥{p.price}</td>
                    <td className="p-4 text-gray-800">{course?.name || '-'}</td>
                    <td className="p-4">
                      {p.deliveryType === 'online' ? (
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">线上</span>
                      ) : (
                        <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs">面授</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-800">{cls?.name || '-'}</td>
                    <td className="p-4 text-gray-800">{getTeacherName(cls?.teacherId)}</td>
                    <td className="p-4 text-gray-600 max-w-[200px] leading-tight text-xs">
                        {cls?.scheduleDescription || '-'}
                    </td>
                    <td className="p-4 text-gray-600">{cls?.campus || '-'}</td>
                    <td className="p-4 text-gray-600 truncate max-w-[150px]">{p.description}</td>
                    <td className="p-4 text-gray-600">{cls?.studentCount}/{cls?.capacity}</td>
                    <td className="p-4 text-gray-600">{p.createdTime}</td>
                    <td className="p-4">
                      {p.status === 'active' ? (
                        <span className="border border-green-500 text-green-500 bg-white px-2 py-0.5 rounded text-xs">已上架</span>
                      ) : (
                        <span className="bg-gray-400 text-white px-2 py-0.5 rounded text-xs">已下架</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex gap-2 text-sm">
                        {p.status === 'active' ? (
                           <button 
                             onClick={() => onUpdateProduct(p.id, { status: 'disabled' })}
                             className="text-primary hover:opacity-80"
                           >
                             下架
                           </button>
                        ) : (
                           <button 
                             onClick={() => onUpdateProduct(p.id, { status: 'active' })}
                             className="text-primary hover:opacity-80"
                           >
                             上架
                           </button>
                        )}
                        <button className="text-primary hover:opacity-80">编辑</button>
                        <button className="text-red-500 hover:opacity-80">删除</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-[500px] flex flex-col">
             <div className="p-5 border-b border-gray-100 flex justify-between items-center">
               <h3 className="text-lg font-bold text-gray-800">创建商品</h3>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
             </div>
             
             <div className="p-6 space-y-5">
               <div>
                 <label className="block text-sm font-medium text-gray-600 mb-1.5">商品名称</label>
                 <input 
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   placeholder="商品A"
                   className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-600 mb-1.5">绑定课程</label>
                 <select 
                   value={formData.courseId}
                   onChange={e => setFormData({...formData, courseId: e.target.value, classId: ''})}
                   className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                 >
                   <option value="">请选择课程</option>
                   {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-600 mb-1.5">绑定班级</label>
                 <select 
                   value={formData.classId}
                   onChange={e => setFormData({...formData, classId: e.target.value})}
                   className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                   disabled={!formData.courseId}
                 >
                   <option value="">请选择班级</option>
                   {modalClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-600 mb-1.5">价格 (元)</label>
                 <div className="relative">
                    <input 
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm focus:outline-none"
                    />
                    <div className="absolute right-0 top-0 h-full flex flex-col border-l border-blue-500">
                      <button className="flex-1 px-1 hover:bg-gray-100 text-[8px] leading-none text-gray-500">▲</button>
                      <button className="flex-1 px-1 hover:bg-gray-100 text-[8px] leading-none text-gray-500 border-t border-gray-300">▼</button>
                    </div>
                 </div>
               </div>

             </div>

             <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
               <button onClick={() => setShowModal(false)} className="px-5 py-2 rounded text-sm text-gray-600 border border-gray-300 hover:bg-gray-50">取消</button>
               <button onClick={handleCreate} className="px-6 py-2 rounded text-sm text-white bg-primary hover:bg-teal-600 shadow-sm">创建商品</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
