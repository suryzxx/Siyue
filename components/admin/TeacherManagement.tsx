
import React, { useState } from 'react';
import { Teacher } from '../../types';
import { TEACHERS, CAMPUSES } from '../../constants';

const TeacherManagement: React.FC = () => {
  const [filterName, setFilterName] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterCampus, setFilterCampus] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    gender: '女',
    phone: '',
    campus: '',
    position: '全职教师',
    avatar: '',
    poster: ''
  });

  // Local State for Teachers to simulate CRUD
  const [localTeachers, setLocalTeachers] = useState<Teacher[]>(TEACHERS);

  // Pagination (mock)
  const [currentPage, setCurrentPage] = useState(2);
  const itemsPerPage = 20;
  const totalItems = localTeachers.length;

  // Filter teachers based on criteria
  const filteredTeachers = localTeachers.filter(teacher => {
      const matchName = !filterName || teacher.name.includes(filterName);
      const matchPhone = !filterPhone || (teacher.phone && teacher.phone.includes(filterPhone));
      const matchCampus = !filterCampus || teacher.campus === filterCampus;
      const matchPosition = !filterPosition || teacher.position === filterPosition;
      const matchStatus = !filterStatus || teacher.status === filterStatus;
      return matchName && matchPhone && matchCampus && matchPosition && matchStatus;
  });

  // Limit for display (mock pagination just takes the first X for this demo if not fully implemented)
  const displayTeachers = filteredTeachers; 

  const handleOpenModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        name: teacher.name,
        gender: teacher.gender || '女',
        phone: teacher.phone || '',
        campus: teacher.campus || '',
        position: teacher.position || '全职教师',
        avatar: teacher.avatar || '',
        poster: teacher.poster || ''
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        name: '',
        gender: '女',
        phone: '',
        campus: '',
        position: '全职教师',
        avatar: '',
        poster: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.campus) {
      alert('请填写完整信息 (姓名、电话、校区为必填)');
      return;
    }

    if (editingTeacher) {
      // Update
      const updatedList = localTeachers.map(t => t.id === editingTeacher.id ? {
        ...t,
        ...formData,
        gender: formData.gender as '男' | '女',
        updatedTime: new Date().toLocaleString().replace(/\//g, '-')
      } : t);
      setLocalTeachers(updatedList);
    } else {
      // Create
      const newTeacher: Teacher = {
        id: `t-${Date.now()}`,
        ...formData,
        gender: formData.gender as '男' | '女',
        status: 'active',
        createdTime: new Date().toLocaleString().replace(/\//g, '-'),
        updatedTime: new Date().toLocaleString().replace(/\//g, '-')
      };
      setLocalTeachers([newTeacher, ...localTeachers]);
    }
    handleCloseModal();
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">员工管理</h2>
      </div>

      {/* Filter Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">姓名:</span>
           <input 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 focus:outline-none focus:border-primary"
             placeholder="请输入姓名"
             value={filterName}
             onChange={e => setFilterName(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">联系电话:</span>
           <input 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:border-primary"
             placeholder="请输入电话"
             value={filterPhone}
             onChange={e => setFilterPhone(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">所属校区:</span>
           <select 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-36 text-gray-600 focus:outline-none focus:border-primary"
             value={filterCampus}
             onChange={e => setFilterCampus(e.target.value)}
           >
             <option value="">全部校区</option>
             {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">用户职位:</span>
           <select 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 text-gray-600 focus:outline-none focus:border-primary"
             value={filterPosition}
             onChange={e => setFilterPosition(e.target.value)}
           >
             <option value="">全部职位</option>
             <option value="全职教师">全职教师</option>
             <option value="兼职教师">兼职教师</option>
             <option value="助教">助教</option>
             <option value="教务">教务</option>
             <option value="校区主管">校区主管</option>
             <option value="教学主管">教学主管</option>
           </select>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">状态:</span>
           <select 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28 text-gray-600 focus:outline-none focus:border-primary"
             value={filterStatus}
             onChange={e => setFilterStatus(e.target.value)}
           >
             <option value="">全部状态</option>
             <option value="active">启用</option>
             <option value="disabled">禁用</option>
           </select>
        </div>
        
        <div className="flex items-center gap-3 ml-auto">
          <button className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors">搜索</button>
          <button 
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-1.5 rounded text-sm transition-colors"
            onClick={() => { setFilterName(''); setFilterPhone(''); setFilterCampus(''); setFilterPosition(''); setFilterStatus(''); }}
          >
            重置
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors ml-2"
          >
            新增员工
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="border-t border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="p-4 whitespace-nowrap">员工ID</th>
                <th className="p-4 whitespace-nowrap">姓名</th>
                <th className="p-4 whitespace-nowrap">联系电话</th>
                <th className="p-4 whitespace-nowrap">所属校区</th>
                <th className="p-4 whitespace-nowrap">用户职位</th>
                <th className="p-4 whitespace-nowrap">头像</th>
                <th className="p-4 whitespace-nowrap">宣传海报</th>
                <th className="p-4 whitespace-nowrap">状态</th>
                <th className="p-4 whitespace-nowrap">创建时间</th>
                <th className="p-4 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayTeachers.map(teacher => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600">{teacher.id}</td>
                  <td className="p-4 text-gray-800 font-medium">{teacher.name}</td>
                  <td className="p-4 text-gray-600">{teacher.phone || '-'}</td>
                  <td className="p-4 text-gray-600">{teacher.campus || '-'}</td>
                  <td className="p-4 text-gray-600">{teacher.position || '-'}</td>
                  <td className="p-4 text-gray-600 text-xs">{teacher.avatar || '-'}</td>
                  <td className="p-4 text-gray-600 text-xs">{teacher.poster || '-'}</td>
                  <td className="p-4">
                     {teacher.status === 'active' ? (
                         <span className="border border-green-500 text-green-500 bg-white px-2 py-0.5 rounded text-xs">启用</span>
                     ) : (
                         <span className="border border-gray-300 text-gray-400 bg-white px-2 py-0.5 rounded text-xs">禁用</span>
                     )}
                  </td>
                  <td className="p-4 text-gray-600 text-xs">{teacher.createdTime || '-'}</td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex gap-3 text-sm">
                      <button onClick={() => handleOpenModal(teacher)} className="text-primary hover:opacity-80">编辑</button>
                      <button className="text-orange-400 hover:opacity-80">重置密码</button>
                      <button className="text-red-500 hover:opacity-80">禁用</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end text-sm text-gray-600 bg-white gap-2">
         <span>总计 {totalItems} 条</span>
         <button className="px-2 hover:text-primary">&lt;</button>
         <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">1</button>
         <button className="w-7 h-7 flex items-center justify-center rounded bg-primary text-white border border-primary">2</button>
         <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">3</button>
         <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">4</button>
         <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">5</button>
         <span>...</span>
         <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">251</button>
         <button className="px-2 hover:text-primary">&gt;</button>
         <select className="border border-gray-300 rounded px-2 py-1 ml-2 text-xs">
            <option>20 条/页</option>
            <option>50 条/页</option>
         </select>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-[600px] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{editingTeacher ? '编辑员工' : '新增员工'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-center">
                <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4"><span className="text-red-500 mr-1">*</span>姓名</label>
                <input 
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="请输入员工姓名"
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4"><span className="text-red-500 mr-1">*</span>性别</label>
                <div className="flex gap-6 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      checked={formData.gender === '男'} 
                      onChange={() => setFormData({...formData, gender: '男'})}
                      className="text-primary"
                    /> 男
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      checked={formData.gender === '女'} 
                      onChange={() => setFormData({...formData, gender: '女'})}
                      className="text-primary"
                    /> 女
                  </label>
                </div>
              </div>

              <div className="flex items-center">
                <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4"><span className="text-red-500 mr-1">*</span>联系电话</label>
                <input 
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="请输入手机号码"
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4"><span className="text-red-500 mr-1">*</span>所属校区</label>
                <select 
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                  value={formData.campus}
                  onChange={e => setFormData({...formData, campus: e.target.value})}
                >
                  <option value="">请选择校区</option>
                  {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4"><span className="text-red-500 mr-1">*</span>用户职位</label>
                <select 
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                  value={formData.position}
                  onChange={e => setFormData({...formData, position: e.target.value})}
                >
                  <option value="全职教师">全职教师</option>
                  <option value="兼职教师">兼职教师</option>
                  <option value="助教">助教</option>
                  <option value="教务">教务</option>
                  <option value="校区主管">校区主管</option>
                  <option value="教学主管">教学主管</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">头像</label>
                <input 
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={formData.avatar}
                  onChange={e => setFormData({...formData, avatar: e.target.value})}
                  placeholder="点击上传头像 (模拟)"
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">宣传海报</label>
                <input 
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={formData.poster}
                  onChange={e => setFormData({...formData, poster: e.target.value})}
                  placeholder="点击上传海报 (模拟)"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={handleCloseModal}
                className="px-6 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm"
              >
                取消
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm"
              >
                {editingTeacher ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
