import React, { useState } from 'react';
import { ADMIN_STUDENTS } from '../../constants';

const StudentManagement: React.FC = () => {
  const [filterName, setFilterName] = useState('');
  const [filterAccount, setFilterAccount] = useState('');

  // Pagination (mock)
  const totalItems = 5013;

  // Filter 
  const filteredStudents = ADMIN_STUDENTS.filter(s => {
      const matchName = s.name.includes(filterName);
      const matchAccount = s.account.includes(filterAccount);
      return matchName && matchAccount;
  });

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">学生管理</h2>
      </div>

      {/* Filter Bar */}
      <div className="p-6 pb-2 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
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
           <span className="text-sm text-gray-700">登录账号:</span>
           <input 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-primary"
             placeholder="请输入登录账号"
             value={filterAccount}
             onChange={e => setFilterAccount(e.target.value)}
           />
        </div>
        
        <div className="flex items-center gap-3 ml-2">
          <button className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors">搜索</button>
          <button 
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-1.5 rounded text-sm transition-colors"
            onClick={() => { setFilterName(''); setFilterAccount(''); }}
          >
            重置
          </button>
          <button className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors ml-2">
            新增
          </button>
        </div>
      </div>

      {/* Export Section */}
      <div className="px-6 pb-4 pt-4 flex items-center gap-4 bg-white border-b border-gray-100">
         <span className="text-sm font-bold text-gray-800">数据导出</span>
         <button className="bg-white text-gray-600 border border-gray-300 px-4 py-1.5 rounded text-sm hover:bg-gray-50">一键导出在班学员</button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="border-t border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="p-4 whitespace-nowrap">学生ID</th>
                <th className="p-4 whitespace-nowrap">姓名</th>
                <th className="p-4 whitespace-nowrap">登录账号</th>
                <th className="p-4 whitespace-nowrap">性别</th>
                <th className="p-4 whitespace-nowrap">所属班级</th>
                <th className="p-4 whitespace-nowrap">创建时间</th>
                <th className="p-4 whitespace-nowrap">更新时间</th>
                <th className="p-4 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600">{student.id}</td>
                  <td className="p-4 text-gray-800 font-medium">{student.name}</td>
                  <td className="p-4 text-gray-600">{student.account}</td>
                  <td className="p-4 text-gray-600">{student.gender}</td>
                  <td className="p-4">
                     <span className="bg-blue-50 text-blue-500 border border-blue-200 px-2 py-0.5 rounded text-xs">
                        {student.className}
                     </span>
                  </td>
                  <td className="p-4 text-gray-600 text-xs">{student.createdTime}</td>
                  <td className="p-4 text-gray-600 text-xs">{student.updatedTime}</td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1.5 text-xs">
                      <div className="flex gap-3">
                         <span className="text-primary cursor-pointer hover:opacity-80">编辑</span>
                         <span className="text-blue-500 cursor-pointer hover:opacity-80">转班</span>
                         <span className="text-purple-600 cursor-pointer hover:opacity-80">操作记录</span>
                      </div>
                      <div className="text-orange-400 cursor-pointer hover:opacity-80">获取临时验证码</div>
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

export default StudentManagement;
