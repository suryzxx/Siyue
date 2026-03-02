import React, { useState, useEffect } from 'react';
import { ADMIN_STUDENTS, CAMPUSES, GRADE_OPTIONS, SCHOOL_OPTIONS, STUDY_CITY_OPTIONS, REGISTRATION_CHANNEL_OPTIONS, ACQUISITION_CHANNEL_OPTIONS } from '../../constants';
import { StudentProfile, StudentStatus, FollowUpStatus } from '../../types';
import SearchableMultiSelect from '../common/SearchableMultiSelect';
import { exportToExcel, ExcelFormatters } from '../../utils/excelExport';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';

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
   const [showBatchImportModal, setShowBatchImportModal] = useState(false);
   const [showBatchEnrollmentModal, setShowBatchEnrollmentModal] = useState(false);
   
   // 批量导入状态
   const [batchImportStep, setBatchImportStep] = useState<1 | 2>(1);
   const [importResults, setImportResults] = useState<{
     success: Array<{row: number, studentName: string, message: string}>;
     failed: Array<{row: number, studentName: string, error: string}>;
   }>({ success: [], failed: [] });
   const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
    // 编辑表单数据
    const [editFormData, setEditFormData] = useState({
      name: '',
      account: '',
      gender: '男' as '男' | '女',
      englishName: '',
      grade: '',
      school: '',
      studyCity: '',
      acquisitionChannel: '' as '' | '朋友/熟人推荐' | '小红书' | '思悦社群' | '思悦公众号/视频号',
    });

    // 新生录入表单数据
    const [newStudentFormData, setNewStudentFormData] = useState({
      name: '',
      account: '',
      gender: '男' as '男' | '女',
      englishName: '',
      grade: '',
      school: '',
      studyCity: '',
      acquisitionChannel: '' as '' | '朋友/熟人推荐' | '小红书' | '思悦社群' | '思悦公众号/视频号',
    });

   // 学生状态选项
  const studentStatusOptions: StudentStatus[] = ['在读学生', '潜在学生', '历史学生'];
  const followUpStatusOptions: FollowUpStatus[] = ['待跟进', '跟进中', '已邀约', '已签约', '退费&流失'];
  
  // 新生录入专用选项
  const newStudentStudyCityOptions = ['南京', '深圳'];
  const newStudentAcquisitionChannelOptions = [
    '朋友/熟人推荐',
    '小红书',
    '思悦社群',
    '思悦公众号/视频号'
  ];

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
          { key: 'registrationChannel', label: '注册渠道', width: 15 },
          { key: 'acquisitionChannel', label: '获客渠道', width: 20 },
          { key: 'studyCity', label: '就读城市', width: 15 },
          { key: 'studentStatus', label: '学生状态', width: 12, format: ExcelFormatters.status },
          { key: 'followUpStatus', label: '跟进状态', width: 12, format: ExcelFormatters.status },
          { key: 'createdTime', label: '注册时间', width: 18, format: ExcelFormatters.datetime },
          { key: 'updatedTime', label: '更新时间', width: 18, format: ExcelFormatters.datetime },
          { key: 'grade', label: '在读年级', width: 12 },
          { key: 'school', label: '在读学校', width: 20 },
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
        englishName: student.englishName || '',
        grade: student.grade || '',
        school: student.school || '',
        studyCity: student.studyCity || '',
        acquisitionChannel: student.acquisitionChannel || '',
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
        englishName: '',
        grade: '',
        school: '',
        studyCity: '',
        acquisitionChannel: '',
      });
      setShowNewStudentModal(true);
    };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editFormData.name || !editFormData.account || !editFormData.grade) {
      alert('请填写必填信息（学生姓名、联系电话、在读年级）');
      return;
    }
    
    // 实际应用中这里会调用API更新学生信息
    alert(`学生 ${editFormData.name} 的信息已更新`);
    setShowEditModal(false);
  };

    // 保存新生录入
  const handleSaveNewStudent = () => {
    if (!newStudentFormData.name || !newStudentFormData.account || !newStudentFormData.grade) {
      alert('请填写必填信息（学生姓名、联系电话、在读年级）');
      return;
    }
    
    // 实际应用中这里会调用API创建新学生
    alert(`新生 ${newStudentFormData.name} 已成功录入`);
    setShowNewStudentModal(false);
  };

  // --- 批量导入学生功能 ---
  const generateStudentTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('学生导入模板');

    // 表头定义 - 对应新生录入表单字段
    worksheet.columns = [
      { header: '学生姓名*', key: 'name', width: 15 },
      { header: '联系电话*', key: 'phone', width: 15 },
      { header: '在读年级*', key: 'grade', width: 12 },
      { header: '性别', key: 'gender', width: 8 },
      { header: '英文名', key: 'englishName', width: 15 },
      { header: '在读学校', key: 'school', width: 20 },
      { header: '就读城市', key: 'studyCity', width: 12 },
      { header: '获客渠道', key: 'acquisitionChannel', width: 18 },
    ];

    // 设置表头样式
    worksheet.getRow(1).font = { bold: true };

    // 添加表头注释
    worksheet.getCell('A1').note = { texts: [{ text: '必填，学生姓名' }] };
    worksheet.getCell('B1').note = { texts: [{ text: '必填，11位手机号' }] };
    worksheet.getCell('C1').note = { texts: [{ text: '必填，从下拉列表选择' }] };
    worksheet.getCell('D1').note = { texts: [{ text: '可选，男/女，可不填' }] };
    worksheet.getCell('E1').note = { texts: [{ text: '可选，英文名，可不填' }] };
    worksheet.getCell('F1').note = { texts: [{ text: '可选，在读学校，可不填' }] };
    worksheet.getCell('G1').note = { texts: [{ text: '可选，从下拉列表选择，可不填' }] };
    worksheet.getCell('H1').note = { texts: [{ text: '可选，从下拉列表选择，可不填' }] };
    worksheet.getCell('H1').note = { texts: [{ text: '可选，从下拉列表选择' }] };

    // 创建数据验证工作表（隐藏）
    const dataSheet = workbook.addWorksheet('Data');
    dataSheet.state = 'hidden';

    // 填充验证数据
    const gradeOptions = GRADE_OPTIONS;
    const genderOptions = ['男', '女'];
    const cityOptions = ['南京', '深圳'];
    const channelOptions = ACQUISITION_CHANNEL_OPTIONS as unknown as string[];

    // 辅助函数：添加数据列
    const addDataCol = (data: string[], colIndex: number) => {
      data.forEach((val, idx) => {
        dataSheet.getCell(idx + 1, colIndex).value = val;
      });
      const colLetter = String.fromCharCode(65 + colIndex - 1);
      return `Data!$${colLetter}$1:$${colLetter}$${data.length}`;
    };

    const gradeRange = addDataCol(gradeOptions, 1);
    const genderRange = addDataCol(genderOptions, 2);
    const cityRange = addDataCol(cityOptions, 3);
    const channelRange = addDataCol(channelOptions, 4);

    // 为模板列添加数据验证（第2-1000行）
    for (let i = 2; i <= 1000; i++) {
      // C: 在读年级
      worksheet.getCell(`C${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [gradeRange] };
      // D: 性别
      worksheet.getCell(`D${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [genderRange] };
      // G: 就读城市
      worksheet.getCell(`G${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [cityRange] };
      // H: 获客渠道
      worksheet.getCell(`H${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [channelRange] };
    }

    // 生成并下载
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, '学生批量导入模板.xlsx');
  };

  // 处理文件上传
  const handleStudentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.name.endsWith('.xlsx')) {
      alert('请上传.xlsx格式的文件');
      return;
    }

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB');
      return;
    }

    setUploadedFile(file);

    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      alert('无法读取工作表，请确保使用正确模板');
      return;
    }

    const successResults: Array<{row: number, studentName: string, message: string}> = [];
    const failedResults: Array<{row: number, studentName: string, error: string}> = [];

    worksheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber === 1) return; // 跳过表头

      // 检查是否超过1000行限制
      if (rowNumber > 1001) {
        failedResults.push({
          row: rowNumber,
          studentName: '',
          error: '超过1000行限制，此行及之后的数据将被忽略'
        });
        return;
      }

      // 提取单元格数据
      const name = row.getCell(1).text?.trim();
      const phone = row.getCell(2).text?.trim();
      const grade = row.getCell(3).text?.trim();
      const gender = row.getCell(4).text?.trim();
      const englishName = row.getCell(5).text?.trim();
      const school = row.getCell(6).text?.trim();
      const studyCity = row.getCell(7).text?.trim();
      const acquisitionChannel = row.getCell(8).text?.trim();

      // 跳过空行
      if (!name && !phone && !grade) return;

      // 验证必填字段
      if (!name) {
        failedResults.push({ row: rowNumber, studentName: name || '未知', error: '缺少必填字段：学生姓名' });
        return;
      }
      if (!phone) {
        failedResults.push({ row: rowNumber, studentName: name, error: '缺少必填字段：联系电话' });
        return;
      }
      if (!grade) {
        failedResults.push({ row: rowNumber, studentName: name, error: '缺少必填字段：在读年级' });
        return;
      }

      // 验证电话格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        failedResults.push({ row: rowNumber, studentName: name, error: '联系电话格式不正确，应为11位手机号' });
        return;
      }

      // 验证年级是否有效
      if (!GRADE_OPTIONS.includes(grade)) {
        failedResults.push({ row: rowNumber, studentName: name, error: `在读年级“${grade}”不在有效选项中` });
        return;
      }

      // 验证性别
      if (gender && gender !== '男' && gender !== '女') {
        failedResults.push({ row: rowNumber, studentName: name, error: '性别应为“男”或“女”' });
        return;
      }

      // 验证就读城市
      if (studyCity && !['南京', '深圳'].includes(studyCity)) {
        failedResults.push({ row: rowNumber, studentName: name, error: '就读城市应为“南京”或“深圳”' });
        return;
      }

      // 验证获客渠道
      const validChannels = ACQUISITION_CHANNEL_OPTIONS as unknown as string[];
      if (acquisitionChannel && !validChannels.includes(acquisitionChannel)) {
        failedResults.push({ row: rowNumber, studentName: name, error: `获客渠道“${acquisitionChannel}”不在有效选项中` });
        return;
      }

      // 验证通过，添加到成功列表
      successResults.push({
        row: rowNumber,
        studentName: name,
        message: `学生 ${name} (${phone}) 导入成功`
      });
    });

    setImportResults({ success: successResults, failed: failedResults });
    setBatchImportStep(2);
    e.target.value = ''; // 重置文件输入
  };

  // 确认批量导入
  const handleBatchImportConfirm = () => {
    if (importResults.success.length === 0) {
      alert('没有可导入的数据');
      return;
    }
    
    // 实际应用中这里会调用API批量创建学生
    alert(`成功导入 ${importResults.success.length} 名学生`);
    setShowBatchImportModal(false);
    setBatchImportStep(1);
    setImportResults({ success: [], failed: [] });
    setUploadedFile(null);
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
               onClick={() => setShowBatchImportModal(true)}
               className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors"
             >
               批量导入学生
             </button>
             <button 
               onClick={() => setShowBatchEnrollmentModal(true)}
               className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors"
             >
               批量报名
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
                  <th className="p-4 whitespace-nowrap">注册渠道</th>
                  <th className="p-4 whitespace-nowrap">获客渠道</th>
                  <th className="p-4 whitespace-nowrap">就读城市</th>
                  <th className="p-4 whitespace-nowrap">学生状态</th>
                  <th className="p-4 whitespace-nowrap">跟进状态</th>
                  <th className="p-4 whitespace-nowrap">注册时间</th>
                  <th className="p-4 whitespace-nowrap">更新时间</th>
                  <th className="p-4 whitespace-nowrap">在读年级</th>
                  <th className="p-4 whitespace-nowrap">在读学校</th>
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
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                     {student.evaluationLevel || '-'}
                   </td>
                   <td className="p-4 text-gray-600 whitespace-nowrap">{student.campus || '-'}</td>
                   <td className="p-4 text-gray-600 whitespace-nowrap">{student.registrationChannel || '-'}</td>
                   <td className="p-4 text-gray-600 whitespace-nowrap">{student.acquisitionChannel || '-'}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{student.studyCity || '-'}</td>
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
                   <td className="p-4 text-gray-600 whitespace-nowrap">{student.grade || '-'}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{student.school || '-'}</td>
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
                {/* 1. 学生姓名（必填） */}
                <div className="flex items-center">
                  <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4"><span className="text-red-500 mr-1">*</span>学生姓名</label>
                  <input 
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    value={editFormData.name}
                    onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                    placeholder="请输入学生姓名"
                  />
                </div>

                {/* 2. 联系电话（必填） */}
                <div className="flex items-center">
                  <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4"><span className="text-red-500 mr-1">*</span>联系电话</label>
                  <input 
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    value={editFormData.account}
                    onChange={e => setEditFormData({...editFormData, account: e.target.value})}
                    placeholder="请输入联系电话"
                  />
                </div>

                {/* 3. 在读年级（必填） */}
                <div className="flex items-center">
                  <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4"><span className="text-red-500 mr-1">*</span>在读年级</label>
                  <select 
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                    value={editFormData.grade}
                    onChange={e => setEditFormData({...editFormData, grade: e.target.value})}
                  >
                    <option value="">请选择在读年级</option>
                    {GRADE_OPTIONS.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                  </select>
                </div>

                {/* 4. 性别（非必填） */}
                <div className="flex items-center">
                  <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">性别</label>
                  <select 
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                    value={editFormData.gender}
                    onChange={e => setEditFormData({...editFormData, gender: e.target.value as '男' | '女'})}
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>

                {/* 5. 英文名（非必填） */}
                <div className="flex items-center">
                  <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">英文名</label>
                  <input 
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    value={editFormData.englishName}
                    onChange={e => setEditFormData({...editFormData, englishName: e.target.value})}
                    placeholder="请输入英文名"
                  />
                </div>

                {/* 6. 在读学校（非必填） */}
                <div className="flex items-center">
                  <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">在读学校</label>
                  <input 
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    value={editFormData.school}
                    onChange={e => setEditFormData({...editFormData, school: e.target.value})}
                    placeholder="请输入在读学校"
                  />
                </div>

                {/* 7. 就读城市（非必填） */}
                <div className="flex items-center">
                  <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">就读城市</label>
                  <select 
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                    value={editFormData.studyCity}
                    onChange={e => setEditFormData({...editFormData, studyCity: e.target.value})}
                  >
                    <option value="">请选择就读城市</option>
                    {newStudentStudyCityOptions.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>

                {/* 8. 获客渠道（非必填） */}
                <div className="flex items-center">
                  <label className="w-24 text-sm font-medium text-gray-600 text-right mr-4">获客渠道</label>
                  <select 
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                    value={
                      editFormData.acquisitionChannel === '朋友/熟人推荐' ? '朋友/熟人推荐' :
                      editFormData.acquisitionChannel === '小红书' ? '小红书' :
                      editFormData.acquisitionChannel === '思悦社群' ? '思悦社群' :
                      editFormData.acquisitionChannel === '思悦公众号/视频号' ? '思悦公众号/视频号' :
                      ''
                    }
                    onChange={e => {
                      const displayValue = e.target.value;
                      let originalValue: '' | '朋友/熟人推荐' | '小红书' | '思悦社群' | '思悦公众号/视频号' = '';
                      
                      if (displayValue === '朋友/熟人推荐') originalValue = '朋友/熟人推荐';
                      else if (displayValue === '小红书') originalValue = '小红书';
                      else if (displayValue === '思悦社群') originalValue = '思悦社群';
                      else if (displayValue === '思悦公众号/视频号') originalValue = '思悦公众号/视频号';
                      
                      setEditFormData({...editFormData, acquisitionChannel: originalValue});
                    }}
                  >
                    <option value="">请选择获客渠道</option>
                    {newStudentAcquisitionChannelOptions.map(channel => (
                      <option key={channel} value={channel}>{channel}</option>
                    ))}
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
             <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">新生录入</h3>
                <button onClick={() => setShowNewStudentModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>
               
               <div className="p-6 space-y-4">
                 {/* 学生姓名 */}
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       学生姓名 <span className="text-red-500">*</span>
                     </label>
                     <input
                       type="text"
                       value={newStudentFormData.studentName}
                       onChange={(e) => setNewStudentFormData({...newStudentFormData, studentName: e.target.value})}
                       className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                       placeholder="请输入学生姓名"
                     />
                   </div>
                   
                   {/* 联系电话 */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       联系电话 <span className="text-red-500">*</span>
                     </label>
                     <input
                       type="text"
                       value={newStudentFormData.phone}
                       onChange={(e) => setNewStudentFormData({...newStudentFormData, phone: e.target.value})}
                       className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                       placeholder="请输入联系电话"
                     />
                   </div>
                 </div>
                 
                 {/* 在读年级 */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     在读年级 <span className="text-red-500">*</span>
                   </label>
                   <select
                     value={newStudentFormData.grade}
                     onChange={(e) => setNewStudentFormData({...newStudentFormData, grade: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                   >
                     <option value="">请选择在读年级</option>
                     {GRADE_OPTIONS.map(grade => (
                       <option key={grade} value={grade}>{grade}</option>
                     ))}
                   </select>
                 </div>
                 
                 {/* 性别 */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     性别
                   </label>
                   <select
                     value={newStudentFormData.gender}
                     onChange={(e) => setNewStudentFormData({...newStudentFormData, gender: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                   >
                     <option value="">请选择性别</option>
                     <option value="男">男</option>
                     <option value="女">女</option>
                   </select>
                 </div>
                 
                 {/* 英文名 */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     英文名
                   </label>
                   <input
                     type="text"
                     value={newStudentFormData.englishName}
                     onChange={(e) => setNewStudentFormData({...newStudentFormData, englishName: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                     placeholder="请输入英文名"
                   />
                 </div>
                 
                 {/* 在读学校 */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     在读学校
                   </label>
                   <input
                     type="text"
                     value={newStudentFormData.school}
                     onChange={(e) => setNewStudentFormData({...newStudentFormData, school: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                     placeholder="请输入在读学校"
                   />
                 </div>
                 
                 {/* 就读城市 */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     就读城市
                   </label>
                   <select
                     value={newStudentFormData.city}
                     onChange={(e) => setNewStudentFormData({...newStudentFormData, city: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                   >
                     <option value="">请选择就读城市</option>
                     <option value="南京">南京</option>
                     <option value="深圳">深圳</option>
                   </select>
                 </div>
                 
                 {/* 获客渠道 */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     获客渠道
                   </label>
                   <select
                     value={newStudentFormData.channel}
                     onChange={(e) => setNewStudentFormData({...newStudentFormData, channel: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                   >
                     <option value="">请选择获客渠道</option>
                     {ACQUISITION_CHANNEL_OPTIONS.map(channel => (
                       <option key={channel} value={channel}>
                         {channel}
                       </option>
                     ))}
                   </select>
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

        {/* 批量导入学生模态框 */}
        {showBatchImportModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-[800px] h-[600px] flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">批量导入学生</h3>
                <button 
                  onClick={() => {
                    setShowBatchImportModal(false);
                    setBatchImportStep(1);
                    setImportResults({ success: [], failed: [] });
                    setUploadedFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
              
              <div className="p-8 pb-0">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`flex items-center gap-2 ${batchImportStep === 1 ? 'text-black font-bold text-xl' : 'text-gray-400 text-lg'}`}>
                    <span>第1步导入文件</span>
                    {batchImportStep === 1 && <div className="h-1 w-8 rounded-full bg-primary"></div>}
                  </div>
                  <div className={`flex items-center gap-2 ${batchImportStep === 2 ? 'text-black font-bold text-xl' : 'text-gray-400 text-lg'}`}>
                    <span>第2步查看导入情况</span>
                    {batchImportStep === 2 && <div className="h-1 w-8 rounded-full bg-primary"></div>}
                  </div>
                </div>
              </div>

              <div className="flex-1 px-8 overflow-hidden">
                {batchImportStep === 1 ? (
                  <div className="h-full flex flex-col">
                    <div className="mb-4">
                      <button 
                        onClick={generateStudentTemplate}
                        className="bg-primary hover:bg-teal-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2 transition-colors"
                      >
                        <span>⬇</span> 下载模板
                      </button>
                    </div>
                    
                    <div className="flex-1 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center relative hover:border-primary transition-colors bg-gray-50">
                      <input 
                        type="file" 
                        accept=".xlsx" 
                        onChange={handleStudentFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-white text-2xl">
                        ↑
                      </div>
                      <div className="text-gray-500 text-sm font-medium">点击或拖拽上传文件</div>
                    </div>

                    <div className="mt-6 text-xs text-gray-500 space-y-1.5 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="font-bold text-gray-700 mb-2">导入须知</div>
                      <p>1、需要下载模板，按照模板格式内容上传；</p>
                      <p>2、请认真阅读表头内需注意的问题；</p>
                      <p>3、一次最大导入 10M 大小以内；</p>
                      <p>4、表格内最多仅能支持1000行，空行后的数据不可导入；</p>
                      <p>5、仅支持.xlsx 后缀文件格式。</p>
                      <p>6、请勿改动模板格式，否则将无法导入</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="mb-4 flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-600">导入结果：</span>
                        <span className="ml-2 text-green-600 font-medium">成功 {importResults.success.length} 条</span>
                        <span className="ml-4 text-red-600 font-medium">失败 {importResults.failed.length} 条</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="p-3 text-left font-medium text-gray-600 w-16">行号</th>
                            <th className="p-3 text-left font-medium text-gray-600">学生姓名</th>
                            <th className="p-3 text-left font-medium text-gray-600">状态</th>
                            <th className="p-3 text-left font-medium text-gray-600">详情</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {importResults.success.map((item, idx) => (
                            <tr key={`success-${idx}`} className="hover:bg-green-50">
                              <td className="p-3 text-gray-600">{item.row}</td>
                              <td className="p-3 text-gray-800">{item.studentName}</td>
                              <td className="p-3">
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">成功</span>
                              </td>
                              <td className="p-3 text-gray-600 text-sm">{item.message}</td>
                            </tr>
                          ))}
                          {importResults.failed.map((item, idx) => (
                            <tr key={`failed-${idx}`} className="hover:bg-red-50">
                              <td className="p-3 text-gray-600">{item.row}</td>
                              <td className="p-3 text-gray-800">{item.studentName}</td>
                              <td className="p-3">
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">失败</span>
                              </td>
                              <td className="p-3 text-red-600 text-sm">{item.error}</td>
                            </tr>
                          ))}
                          {importResults.success.length === 0 && importResults.failed.length === 0 && (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-gray-400">暂无导入数据</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 flex justify-center gap-4 border-t border-gray-100 mt-4">
                {batchImportStep === 1 ? (
                  <button 
                    onClick={() => {
                      setShowBatchImportModal(false);
                      setBatchImportStep(1);
                      setImportResults({ success: [], failed: [] });
                      setUploadedFile(null);
                    }}
                    className="px-10 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    关闭
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setBatchImportStep(1);
                        setImportResults({ success: [], failed: [] });
                        setUploadedFile(null);
                      }}
                      className="px-10 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      重新上传
                    </button>
                    <button 
                      onClick={handleBatchImportConfirm}
                      className="px-10 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600 transition-colors"
                    >
                      确认
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 批量报名模态框 */}
        {showBatchEnrollmentModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-[800px] h-[600px] flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">批量报名</h3>
                <button 
                  onClick={() => {
                    setShowBatchEnrollmentModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
              
              <div className="p-8 pb-0">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-2 text-black font-bold text-xl">
                    <span>批量报名功能开发中</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 px-8 overflow-hidden flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="mb-4">批量报名功能正在开发中...</p>
                  <p>该功能将允许您批量将学生报名到班级中。</p>
                </div>
              </div>
              
              <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setShowBatchEnrollmentModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

export default StudentManagement;