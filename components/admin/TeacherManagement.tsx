import React, { useState } from 'react';
import { Teacher } from '../../types';
import { TEACHERS } from '../../constants';

const TeacherManagement: React.FC = () => {
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination (mock)
  const [currentPage, setCurrentPage] = useState(2);
  const itemsPerPage = 20;
  const totalItems = 97;

  // Filter teachers based on criteria
  const filteredTeachers = TEACHERS.filter(teacher => {
      const matchName = teacher.name.includes(filterName);
      const matchStatus = !filterStatus || teacher.status === filterStatus;
      return matchName && matchStatus;
  });

  // Limit for display (mock pagination just takes the first X for this demo if not fully implemented)
  const displayTeachers = filteredTeachers; 

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">教师管理</h2>
      </div>

      {/* Filter Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">姓名:</span>
           <input 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-primary"
             placeholder="请输入姓名"
             value={filterName}
             onChange={e => setFilterName(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">状态:</span>
           <select 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40 text-gray-400 focus:outline-none focus:border-primary"
             value={filterStatus}
             onChange={e => setFilterStatus(e.target.value)}
           >
             <option value="">请选择状态</option>
             <option value="active">启用</option>
             <option value="disabled">禁用</option>
           </select>
        </div>
        
        <div className="flex items-center gap-3 ml-2">
          <button className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors">搜索</button>
          <button 
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-1.5 rounded text-sm transition-colors"
            onClick={() => { setFilterName(''); setFilterStatus(''); }}
          >
            重置
          </button>
          <button className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors ml-2">
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
                <th className="p-4 whitespace-nowrap">教师ID</th>
                <th className="p-4 whitespace-nowrap">姓名</th>
                <th className="p-4 whitespace-nowrap">登录账号</th>
                <th className="p-4 whitespace-nowrap">性别</th>
                <th className="p-4 whitespace-nowrap">状态</th>
                <th className="p-4 whitespace-nowrap">创建时间</th>
                <th className="p-4 whitespace-nowrap">更新时间</th>
                <th className="p-4 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayTeachers.map(teacher => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600">{teacher.id}</td>
                  <td className="p-4 text-gray-800 font-medium">{teacher.name}</td>
                  <td className="p-4 text-gray-600">{teacher.account}</td>
                  <td className="p-4 text-gray-600">{teacher.gender}</td>
                  <td className="p-4">
                     {teacher.status === 'active' ? (
                         <span className="border border-green-500 text-green-500 bg-white px-2 py-0.5 rounded text-xs">启用</span>
                     ) : (
                         <span className="border border-gray-300 text-gray-400 bg-white px-2 py-0.5 rounded text-xs">禁用</span>
                     )}
                  </td>
                  <td className="p-4 text-gray-600 text-xs">{teacher.createdTime}</td>
                  <td className="p-4 text-gray-600 text-xs">{teacher.updatedTime}</td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex gap-3 text-sm">
                      <button className="text-primary hover:opacity-80">编辑</button>
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
    </div>
  );
};

export default TeacherManagement;
