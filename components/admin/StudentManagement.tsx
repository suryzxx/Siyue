import React, { useState, useEffect } from 'react';
import { ADMIN_STUDENTS, CAMPUSES, GRADE_OPTIONS, SCHOOL_OPTIONS } from '../../constants';
import { StudentProfile, StudentStatus, FollowUpStatus } from '../../types';
import SearchableMultiSelect from '../common/SearchableMultiSelect';
import { exportToExcel, ExcelFormatters } from '../../utils/excelExport';

interface StudentManagementProps {
  onStudentSelect: (student: StudentProfile) => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ onStudentSelect }) => {
  // 筛选状态
  const [filterName, setFilterName] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterCampus, setFilterCampus] = useState<string[]>([]);
  const [filterStudentStatus, setFilterStudentStatus] = useState<string[]>([]);
  const [filterFollowUpStatus, setFilterFollowUpStatus] = useState<string[]>([]);

   // 模态框状态
   const [showEditModal, setShowEditModal] = useState(false);
   const [showNewStudentModal, setShowNewStudentModal] = useState(false);
  
   // 编辑表单数据
   const [editFormData, setEditFormData] = useState({
     name: '',
     account: '',
     gender: '男' as '男' | '女',
     birthDate: '',
     evaluationLevel: '',
     campus: '',
     className: '',
     studentStatus: '在读学生' as StudentStatus,
     followUpStatus: '待跟进' as FollowUpStatus,
     englishName: '',
     grade: '',
     school: '',
   });

   // 新生录入表单数据
   const [newStudentFormData, setNewStudentFormData] = useState({
     name: '',
     account: '',
     gender: '男' as '男' | '女',
     birthDate: '',
     evaluationLevel: '',
     campus: '',
     className: '',
     studentStatus: '潜在学生' as StudentStatus,
     followUpStatus: '待跟进' as FollowUpStatus,
     englishName: '',
     grade: '',
     school: '',
     parentName: '',
     parentPhone: '',
     emergencyContact: '',
     emergencyPhone: '',
   });

   // 学生状态选项
  const studentStatusOptions: StudentStatus[] = ['在读学生', '潜在学生', '历史学生'];
  const followUpStatusOptions: FollowUpStatus[] = ['待跟进', '跟进中', '已邀约', '已签约', '退费&流失'];

  // 筛选逻辑
  const filteredStudents = ADMIN_STUDENTS.filter(student => {
    const matchName = !filterName || student.name.toLowerCase().includes(filterName.toLowerCase());
    const matchAccount = !filterAccount || student.account.includes(filterAccount);
    const matchCampus = filterCampus.length === 0 || (student.campus && filterCampus.includes(student.campus));
    const matchStudentStatus = filterStudentStatus.length === 0 || (student.studentStatus && filterStudentStatus.includes(student.studentStatus));
    const matchFollowUpStatus = filterFollowUpStatus.length === 0 || (student.followUpStatus && filterFollowUpStatus.includes(student.followUpStatus));
    
    return matchName && matchAccount && matchCampus && matchStudentStatus && matchFollowUpStatus;
  });

  // 重置筛选
  const resetFilters = () => {
    setFilterName('');
    setFilterAccount('');
    setFilterCampus([]);
    setFilterStudentStatus([]);
    setFilterFollowUpStatus([]);
  };

  // 导出学生列表
  const exportStudentList = async () => {
    try {
       const columns = [
         { key: 'id', label: '学生ID', width: 12 },
         { key: 'name', label: '学生姓名', width: 15 },
         { key: 'englishName', label: '英文名', width: 15 },
         { key: 'account', label: '联系电话', width: 15 },
         { key: 'gender', label: '性别', width: 8 },
         { key: 'birthDate', label: '出生年月', width: 12, format: ExcelFormatters.date },
         { key: 'evaluationLevel', label: '评测等级', width: 10 },
         { key: 'campus', label: '所属校区', width: 15 },
         { key: 'grade', label: '在读年级', width: 12 },
         { key: 'school', label: '在读学校', width: 20 },
         { key: 'studentStatus', label: '学生状态', width: 12, format: ExcelFormatters.status },
         { key: 'followUpStatus', label: '跟进状态', width: 12, format: ExcelFormatters.status },
         { key: 'createdTime', label: '注册时间', width: 18, format: ExcelFormatters.datetime },
         { key: 'updatedTime', label: '更新时间', width: 18, format: ExcelFormatters.datetime },
       ];

      await exportToExcel({
        data: filteredStudents,
        columns,
        sheetName: '学生列表',
        fileName: '学生列表',
        headerStyle: {
          bold: true,
          fillColor: 'FFE8F5E9' // 绿色调
        }
      });
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请稍后重试');
    }
  };

   // 操作处理函数
   const handleEdit = (student: StudentProfile) => {
     setEditFormData({
       name: student.name,
       account: student.account,
       gender: student.gender,
       birthDate: student.birthDate || '',
       evaluationLevel: student.evaluationLevel || '',
       campus: student.campus || '',
       className: student.className || '',
       studentStatus: student.studentStatus || '在读学生',
       followUpStatus: student.followUpStatus || '待跟进',
       englishName: student.englishName || '',
       grade: student.grade || '',
       school: student.school || '',
     });
     setShowEditModal(true);
   };



  const handleGetTempCode = (student: StudentProfile) => {
    const tempCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiryTime = new Date(Date.now() + 30 * 60 * 1000).toLocaleString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    alert(`学生 ${student.name} 的临时验证码: ${tempCode}\n有效期: 30分钟 (至 ${expiryTime})`);
    // 实际应用中这里会调用API生成验证码并记录到数据库
  };

   const handleAddNewStudent = () => {
     setNewStudentFormData({
       name: '',
       account: '',
       gender: '男',
     birthDate: '',
     evaluationLevel: '',
       campus: '',
       className: '',
       studentStatus: '潜在学生',
       followUpStatus: '待跟进',
       englishName: '',
       grade: '',
       school: '',
       parentName: '',
       parentPhone: '',
       emergencyContact: '',
       emergencyPhone: '',
     });
     setShowNewStudentModal(true);
   };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editFormData.name || !editFormData.account) {
      alert('请填写学生姓名和联系电话');
      return;
    }
    
    // 实际应用中这里会调用API更新学生信息
    alert(`学生 ${editFormData.name} 的信息已更新`);
    setShowEditModal(false);
  };

   // 保存新生录入
  const handleSaveNewStudent = () => {
    if (!newStudentFormData.name || !newStudentFormData.account || !newStudentFormData.parentPhone) {
      alert('请填写必填信息（学生姓名、联系电话、家长电话）');
      return;
    }
    
    // 实际应用中这里会调用API创建新学生
    alert(`新生 ${newStudentFormData.name} 已成功录入`);
    setShowNewStudentModal(false);
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">学生管理</h2>
      </div>

      {/* Filter Bar */}
      <div className="p-6 pb-2 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
        {/* 学生姓名筛选 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">学生姓名:</span>
          <input 
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-primary"
            placeholder="请输入学生姓名"
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
          />
        </div>

        {/* 联系电话筛选 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">联系电话:</span>
          <input 
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-primary"
            placeholder="请输入联系电话"
            value={filterAccount}
            onChange={e => setFilterAccount(e.target.value)}
          />
        </div>

        {/* 校区筛选 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">校区:</span>
          <SearchableMultiSelect
            options={CAMPUSES}
            selected={filterCampus}
            onChange={setFilterCampus}
            placeholder="选择校区"
            width="w-[140px]"
            searchPlaceholder="搜索校区..."
          />
        </div>

        {/* 学生状态筛选 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">学生状态:</span>
          <SearchableMultiSelect
            options={studentStatusOptions}
            selected={filterStudentStatus}
            onChange={setFilterStudentStatus}
            placeholder="选择状态"
            width="w-[140px]"
            searchPlaceholder="搜索状态..."
          />
        </div>

        {/* 跟进状态筛选 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">跟进状态:</span>
          <SearchableMultiSelect
            options={followUpStatusOptions}
            selected={filterFollowUpStatus}
            onChange={setFilterFollowUpStatus}
            placeholder="选择状态"
            width="w-[140px]"
            searchPlaceholder="搜索状态..."
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-3 ml-2">
          <button 
            className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors"
            onClick={() => {}} // 搜索逻辑已在筛选器中实时处理
          >
            搜索
          </button>
           <button 
             className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors flex-shrink-0 h-[34px] shadow-sm font-medium"
             onClick={resetFilters}
           >
             重置
           </button>

        </div>
      </div>

       {/* ACTION BAR - 新生录入和导出按钮 */}
       <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
             <button 
               onClick={handleAddNewStudent}
               className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors"
             >
               新生录入
             </button>
             <button 
               onClick={exportStudentList}
               className="border border-primary text-primary hover:bg-primary-light px-4 py-1.5 rounded text-sm transition-colors"
             >
               导出学生列表
             </button>
          </div>
       </div>

      {/* Table - 优化边距和操作栏固定 */}
      <div className="flex-1 overflow-hidden bg-white flex flex-col">
        <div className="flex-1 overflow-auto mx-4 my-4 border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm min-w-max">
            <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200 sticky top-0 z-10">
               <tr>
                 <th className="p-4 whitespace-nowrap">学生ID</th>
                 <th className="p-4 whitespace-nowrap">学生姓名</th>
                 <th className="p-4 whitespace-nowrap">英文名</th>
                 <th className="p-4 whitespace-nowrap">联系电话</th>
                 <th className="p-4 whitespace-nowrap">性别</th>
                 <th className="p-4 whitespace-nowrap">出生年月</th>
                 <th className="p-4 whitespace-nowrap">评测等级</th>
                 <th className="p-4 whitespace-nowrap">所属校区</th>
                 <th className="p-4 whitespace-nowrap">在读年级</th>
                 <th className="p-4 whitespace-nowrap">在读学校</th>
                 <th className="p-4 whitespace-nowrap">学生状态</th>
                 <th className="p-4 whitespace-nowrap">跟进状态</th>
                 <th className="p-4 whitespace-nowrap">注册时间</th>
                 <th className="p-4 whitespace-nowrap">更新时间</th>
                 <th className="p-4 whitespace-nowrap sticky right-0 bg-[#F9FBFA] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">操作</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600 whitespace-nowrap">{student.id}</td>
                   <td 
                     className="p-4 text-primary font-medium whitespace-nowrap cursor-pointer hover:underline"
                     onClick={() => onStudentSelect(student)}
                   >
                     {student.name}
                   </td>
                   <td className="p-4 text-gray-600 whitespace-nowrap">{student.englishName || '-'}</td>
                   <td className="p-4 text-gray-600 whitespace-nowrap">{student.account}</td>
                   <td className="p-4 text-gray-600 whitespace-nowrap">{student.gender}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{student.birthDate || '-'}</td>
                    <td className="p-4 whitespace-nowrap">
                     {student.evaluationLevel ? (
                       <span className={`px-2 py-0.5 rounded text-xs ${
                         student.evaluationLevel.includes('A+') ? 'bg-red-50 text-red-600 border border-red-200' :
                         student.evaluationLevel.includes('A') ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                         student.evaluationLevel.includes('B+') ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                         student.evaluationLevel.includes('B') ? 'bg-green-50 text-green-600 border border-green-200' :
                         'bg-gray-50 text-gray-600 border border-gray-200'
                       }`}>
                         {student.evaluationLevel}
                       </span>
                     ) : '-'}
                   </td>
                   <td className="p-4 text-gray-600 whitespace-nowrap">{student.campus || '-'}</td>
                   <td className="p-4 text-gray-600 whitespace-nowrap">{student.grade || '-'}</td>
                   <td className="p-4 text-gray-600 whitespace-nowrap">{student.school || '-'}</td>
                  <td className="p-4 whitespace-nowrap">
                    {student.studentStatus ? (
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        student.studentStatus === '在读学生' ? 'bg-green-50 text-green-600 border border-green-200' :
                        student.studentStatus === '潜在学生' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                        'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {student.studentStatus}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {student.followUpStatus ? (
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        student.followUpStatus === '已签约' ? 'bg-green-50 text-green-600 border border-green-200' :
                        student.followUpStatus === '已邀约' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                        student.followUpStatus === '跟进中' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                        student.followUpStatus === '待跟进' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                        'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {student.followUpStatus}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-gray-600 text-xs whitespace-nowrap">{student.createdTime}</td>
                  <td className="p-4 text-gray-600 text-xs whitespace-nowrap">{student.updatedTime}</td>
                  <td className="p-4 sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                     <div className="flex flex-col gap-1.5 text-xs whitespace-nowrap">
                       <div className="flex gap-3">
                         <span 
                           className="text-primary cursor-pointer hover:opacity-80"
                           onClick={() => handleEdit(student)}
                         >
                           编辑
                         </span>
                       </div>
                       <div 
                         className="text-orange-400 cursor-pointer hover:opacity-80"
                         onClick={() => handleGetTempCode(student)}
                       >
                         获取临时验证码
                       </div>
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
        <span>总计 {filteredStudents.length} 条</span>
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

       {/* 编辑学生模态框 */}
       {showEditModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-[600px] flex flex-col overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="text-lg font-bold text-gray-800">编辑学生信息</h3>
               <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
             </div>
             
             <div className="p-6 space-y-4">
               <div className="flex items-center">
                 <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4"><span className="text-red-500 mr-1">*</span>学生姓名</label>
                 <input 
                   className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                   value={editFormData.name}
                   onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                   placeholder="请输入学生姓名"
                 />
               </div>

               <div className="flex items-center">
                 <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4"><span className="text-red-500 mr-1">*</span>联系电话</label>
                 <input 
                   className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                   value={editFormData.account}
                   onChange={e => setEditFormData({...editFormData, account: e.target.value})}
                   placeholder="请输入联系电话"
                 />
               </div>

               <div className="flex items-center">
                 <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">性别</label>
                 <div className="flex gap-6 text-sm">
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                       type="radio" 
                       name="gender" 
                       checked={editFormData.gender === '男'} 
                       onChange={() => setEditFormData({...editFormData, gender: '男'})}
                       className="text-primary"
                     /> 男
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                       type="radio" 
                       name="gender" 
                       checked={editFormData.gender === '女'} 
                       onChange={() => setEditFormData({...editFormData, gender: '女'})}
                       className="text-primary"
                     /> 女
                   </label>
                 </div>
               </div>

               <div className="flex items-center">
                 <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">出生年月</label>
                 <input 
                   type="date"
                   className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                   value={editFormData.birthDate}
                   onChange={e => setEditFormData({...editFormData, birthDate: e.target.value})}
                 />
               </div>

                <div className="flex items-center">
                 <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">评测等级</label>
                 <select 
                   className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                   value={editFormData.evaluationLevel}
                   onChange={e => setEditFormData({...editFormData, evaluationLevel: e.target.value})}
                 >
                   <option value="">请选择评测等级</option>
                   <option value="A+">A+</option>
                   <option value="A">A</option>
                   <option value="A-">A-</option>
                   <option value="B+">B+</option>
                   <option value="B">B</option>
                   <option value="B-">B-</option>
                   <option value="C+">C+</option>
                   <option value="C">C</option>
                 </select>
               </div>

               <div className="flex items-center">
                 <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">所属校区</label>
                 <select 
                   className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                   value={editFormData.campus}
                   onChange={e => setEditFormData({...editFormData, campus: e.target.value})}
                 >
                   <option value="">请选择校区</option>
                   {CAMPUSES.map(campus => <option key={campus} value={campus}>{campus}</option>)}
                 </select>
               </div>

                <div className="flex items-center">
                  <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">英文名</label>
                  <input 
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    value={editFormData.englishName}
                    onChange={e => setEditFormData({...editFormData, englishName: e.target.value})}
                    placeholder="请输入英文名"
                  />
                </div>

                <div className="flex items-center">
                  <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">在读年级</label>
                  <select 
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                    value={editFormData.grade}
                    onChange={e => setEditFormData({...editFormData, grade: e.target.value})}
                  >
                    <option value="">请选择在读年级</option>
                    {GRADE_OPTIONS.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">在读学校</label>
                  <select 
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                    value={editFormData.school}
                    onChange={e => setEditFormData({...editFormData, school: e.target.value})}
                  >
                    <option value="">请选择在读学校</option>
                    {SCHOOL_OPTIONS.map(school => <option key={school} value={school}>{school}</option>)}
                  </select>
                </div>

                <div className="flex items-center">
                 <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">学生状态</label>
                 <select 
                   className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                   value={editFormData.studentStatus}
                   onChange={e => setEditFormData({...editFormData, studentStatus: e.target.value as StudentStatus})}
                 >
                   {studentStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                 </select>
               </div>

               <div className="flex items-center">
                 <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">跟进状态</label>
                 <select 
                   className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                   value={editFormData.followUpStatus}
                   onChange={e => setEditFormData({...editFormData, followUpStatus: e.target.value as FollowUpStatus})}
                 >
                   {followUpStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                 </select>
               </div>
             </div>

             <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
               <button 
                 onClick={() => setShowEditModal(false)}
                 className="px-6 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm"
               >
                 取消
               </button>
               <button 
                 onClick={handleSaveEdit}
                 className="px-6 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm"
               >
                 保存
                </button>
              </div>
            </div>
          </div>
        )}





        {/* 新生录入模态框 */}
        {showNewStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">新生录入</h3>
                <button onClick={() => setShowNewStudentModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>
              
              <div className="flex-1 overflow-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600"><span className="text-red-500 mr-1">*</span>学生姓名</label>
                    <input 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      value={newStudentFormData.name}
                      onChange={e => setNewStudentFormData({...newStudentFormData, name: e.target.value})}
                      placeholder="请输入学生姓名"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600"><span className="text-red-500 mr-1">*</span>联系电话</label>
                    <input 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      value={newStudentFormData.account}
                      onChange={e => setNewStudentFormData({...newStudentFormData, account: e.target.value})}
                      placeholder="请输入联系电话"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">性别</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                      value={newStudentFormData.gender}
                      onChange={e => setNewStudentFormData({...newStudentFormData, gender: e.target.value as '男' | '女'})}
                    >
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">出生年月</label>
                    <input 
                      type="date"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      value={newStudentFormData.birthDate}
                      onChange={e => setNewStudentFormData({...newStudentFormData, birthDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">评测等级</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                      value={newStudentFormData.evaluationLevel}
                      onChange={e => setNewStudentFormData({...newStudentFormData, evaluationLevel: e.target.value})}
                    >
                      <option value="">请选择评测等级</option>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="B-">B-</option>
                      <option value="C+">C+</option>
                      <option value="C">C</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">所属校区</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                      value={newStudentFormData.campus}
                      onChange={e => setNewStudentFormData({...newStudentFormData, campus: e.target.value})}
                    >
                      <option value="">请选择校区</option>
                      {CAMPUSES.map(campus => <option key={campus} value={campus}>{campus}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">英文名</label>
                    <input 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      value={newStudentFormData.englishName}
                      onChange={e => setNewStudentFormData({...newStudentFormData, englishName: e.target.value})}
                      placeholder="请输入英文名"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">在读年级</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                      value={newStudentFormData.grade}
                      onChange={e => setNewStudentFormData({...newStudentFormData, grade: e.target.value})}
                    >
                      <option value="">请选择在读年级</option>
                      {GRADE_OPTIONS.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">在读学校</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                      value={newStudentFormData.school}
                      onChange={e => setNewStudentFormData({...newStudentFormData, school: e.target.value})}
                    >
                      <option value="">请选择在读学校</option>
                      {SCHOOL_OPTIONS.map(school => <option key={school} value={school}>{school}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">学生状态</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                      value={newStudentFormData.studentStatus}
                      onChange={e => setNewStudentFormData({...newStudentFormData, studentStatus: e.target.value as StudentStatus})}
                    >
                      {studentStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">跟进状态</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                      value={newStudentFormData.followUpStatus}
                      onChange={e => setNewStudentFormData({...newStudentFormData, followUpStatus: e.target.value as FollowUpStatus})}
                    >
                      {followUpStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600"><span className="text-red-500 mr-1">*</span>家长姓名</label>
                    <input 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      value={newStudentFormData.parentName}
                      onChange={e => setNewStudentFormData({...newStudentFormData, parentName: e.target.value})}
                      placeholder="请输入家长姓名"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600"><span className="text-red-500 mr-1">*</span>家长电话</label>
                    <input 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      value={newStudentFormData.parentPhone}
                      onChange={e => setNewStudentFormData({...newStudentFormData, parentPhone: e.target.value})}
                      placeholder="请输入家长电话"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">紧急联系人</label>
                    <input 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      value={newStudentFormData.emergencyContact}
                      onChange={e => setNewStudentFormData({...newStudentFormData, emergencyContact: e.target.value})}
                      placeholder="请输入紧急联系人"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">紧急联系电话</label>
                    <input 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      value={newStudentFormData.emergencyPhone}
                      onChange={e => setNewStudentFormData({...newStudentFormData, emergencyPhone: e.target.value})}
                      placeholder="请输入紧急联系电话"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button 
                  onClick={() => setShowNewStudentModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm"
                >
                  取消
                </button>
                <button 
                  onClick={handleSaveNewStudent}
                  className="px-6 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

export default StudentManagement;