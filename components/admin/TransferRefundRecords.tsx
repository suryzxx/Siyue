import React, { useState } from 'react';
import { ADMIN_STUDENTS, CLASSES, CAMPUSES } from '../../constants';

interface TransferRefundRecordsProps {
  onNavigateToClass?: (classId: string) => void;
}

const TransferRefundRecords: React.FC<TransferRefundRecordsProps> = ({
  onNavigateToClass,
}) => {
  const [activeTab, setActiveTab] = useState<'transfer-class' | 'change-class' | 'refund'>('transfer-class');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showStudentSelectModal, setShowStudentSelectModal] = useState(false);
  const [showClassSelectModal, setShowClassSelectModal] = useState(false);
  const [showLessonSelectModal, setShowLessonSelectModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [transferForm, setTransferForm] = useState({
    fromClassId: '', fromClassName: '', fromLesson: '',
    toClassId: '', toClassName: '', toLesson: '',
  });
  const [lessonSelectType, setLessonSelectType] = useState<'from' | 'to'>('from');

  const [showChangeClassModal, setShowChangeClassModal] = useState(false);
  const [showChangeStudentSelectModal, setShowChangeStudentSelectModal] = useState(false);
  const [changeSelectedStudent, setChangeSelectedStudent] = useState<any>(null);
  const [changeForm, setChangeForm] = useState({
    fromClassId: '', fromClassName: '', toClassId: '', toClassName: '',
    handleCampus: '', handler: '', remark: '',
  });

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showRefundStudentSelectModal, setShowRefundStudentSelectModal] = useState(false);
  const [refundSelectedStudent, setRefundSelectedStudent] = useState<any>(null);
  const [refundClassId, setRefundClassId] = useState('');
  const [refundForm, setRefundForm] = useState({
    handleCampus: '',
    handler: '',
    remark: '',
    refundAmount: '',
    actualRefund: '',
    paymentMethod: '',
    useOriginalDiscount: false,
    discountWithRefund: false,
  });

  const transferClassData = [
    { id: 1, studentId: '4994', studentName: '朱维茜', phone: '18262568828', fromClassId: '546', fromClass: '25暑-K3-进阶-1班', fromLesson: '第1讲', fromCampus: '奥南校区', fromSemester: '暑假', fromTime: '2025.07.10-2025.08.30', toClassId: 'c_p1', toClass: '25暑-K3-进阶--一期', toLesson: '第1讲', toCampus: '龙江校区', toSemester: '暑假', toTime: '2025.07.16-2025.07.30', toTeacher: 'Melody老师', operator: '管理员A', time: '2026-02-13 20:09:19' },
    { id: 2, studentId: '4993', studentName: 'Randi丁柔', phone: '13921447652', fromClassId: 'c_p2', fromClass: '25寒-G5-A+--二期', fromLesson: '第3讲', fromCampus: '大行宫校区', fromSemester: '寒假', fromTime: '2025.01.16-2025.01.30', toClassId: 'c_p3', toClass: '25暑-G1-A+--一期', toLesson: '第2讲', toCampus: '大行宫校区', toSemester: '暑假', toTime: '2025.08.01-2025.08.15', toTeacher: 'Linda老师', operator: '管理员B', time: '2026-02-13 20:09:00' },
  ];

  const changeClassData = [
    { id: 1, studentId: '4992', studentName: 'Grace吴悦', phone: '18260360314', fromClassId: 'c_p4', fromClass: '25暑-G2-A+--一期', fromLesson: '第5讲', fromCampus: '五台山校区', fromSemester: '暑假', fromTime: '2025.07.20-2025.08.05', toClassId: 'c_p5', toClass: '25暑-G2-S--一期', toLesson: '第5讲', toCampus: '辰龙校区', toSemester: '暑假', toTime: '2025.07.20-2025.08.05', toTeacher: 'Justin老师', handleCampus: '五台山校区', operator: '管理员C', time: '2026-02-13 18:30:00' },
    { id: 2, studentId: '4991', studentName: '钱晶', phone: '15250965218', fromClassId: '601', fromClass: '25暑-G3-领航S--一期', fromLesson: '第1讲', fromCampus: '大行宫校区', fromSemester: '暑假', fromTime: '2025.08.01-2025.08.20', toClassId: '602', toClass: '25暑-G3-A+--一期', toLesson: '第1讲', toCampus: '龙江校区', toSemester: '暑假', toTime: '2025.08.01-2025.08.20', toTeacher: 'Nicole老师', handleCampus: '大行宫校区', operator: '管理员D', time: '2026-02-13 15:20:00' },
  ];

  const refundData = [
    { id: 1, studentId: '4990', studentName: '张璟秋', phone: '13149918395', classId: '603', className: '25暑-G4-A+--一期', campus: '奥南校区', semester: '暑假', teacher: 'Ophelia老师', courseType: '长期班', followTeacher: '无', handleCampus: '奥南校区', operator: '管理员E', time: '2026-02-13 16:45:00' },
    { id: 2, studentId: '4989', studentName: 'Sara薛蓉', phone: '13801597148', classId: '604', className: '25暑-G5-S--一期', campus: '仙林校区', semester: '暑假', teacher: 'Iris老师', courseType: '长期班', followTeacher: '无', handleCampus: '仙林校区', operator: '管理员F', time: '2026-02-13 14:10:00' },
  ];

  const lessons = [
    { id: 1, name: '第1讲', status: '未开课', time: '2026-03-07 18:00-20:30' },
    { id: 2, name: '第2讲', status: '未开课', time: '2026-03-14 18:00-20:30' },
    { id: 3, name: '第3讲', status: '未开课', time: '2026-03-21 18:00-20:30' },
    { id: 4, name: '第4讲', status: '未开课', time: '2026-03-28 18:00-20:30' },
    { id: 5, name: '第5讲', status: '未开课', time: '2026-04-04 18:00-20:30' },
    { id: 6, name: '第6讲', status: '未开课', time: '2026-04-11 18:00-20:30' },
  ];

  const renderFilterBar = () => {
    if (activeTab === 'transfer-class') {
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="学生姓名/电话/班级名称" className="border border-gray-300 rounded px-3 py-1.5 text-sm w-[180px] focus:outline-none focus:border-primary" />
            <span className="absolute right-2 top-2 text-gray-400">🔍</span>
          </div>
          <div className="flex items-center gap-2 border border-gray-300 rounded px-2 py-1.5 text-sm">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-none focus:outline-none w-[100px]" />
            <span className="text-gray-400">至</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-none focus:outline-none w-[100px]" />
          </div>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] focus:outline-none focus:border-primary">
            <option value="">调出班校区</option>
            {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] focus:outline-none focus:border-primary">
            <option value="">调出班学期</option>
            <option value="春季">春季</option><option value="暑假">暑假</option><option value="秋季">秋季</option><option value="寒假">寒假</option>
          </select>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] focus:outline-none focus:border-primary">
            <option value="">调入班校区</option>
            {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] focus:outline-none focus:border-primary">
            <option value="">调入班学期</option>
            <option value="春季">春季</option><option value="暑假">暑假</option><option value="秋季">秋季</option><option value="寒假">寒假</option>
          </select>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] focus:outline-none focus:border-primary">
            <option value="">调入班老师</option>
          </select>
          <button className="bg-primary hover:bg-teal-600 text-white px-4 py-1.5 rounded text-sm transition-colors">导出</button>
        </div>
      );
    } else if (activeTab === 'change-class') {
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="学生姓名/电话/班级名称" className="border border-gray-300 rounded px-3 py-1.5 text-sm w-[180px] focus:outline-none focus:border-primary" />
            <span className="absolute right-2 top-2 text-gray-400">🔍</span>
          </div>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] focus:outline-none focus:border-primary">
            <option value="">经办校区</option>
            {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-2 border border-gray-300 rounded px-2 py-1.5 text-sm">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-none focus:outline-none w-[100px]" />
            <span className="text-gray-400">至</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-none focus:outline-none w-[100px]" />
          </div>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] focus:outline-none focus:border-primary"><option value="">转出班校区</option>{CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] focus:outline-none focus:border-primary"><option value="">转出班学期</option><option value="春季">春季</option><option value="暑假">暑假</option><option value="秋季">秋季</option><option value="寒假">寒假</option></select>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] focus:outline-none focus:border-primary"><option value="">转入班校区</option>{CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] focus:outline-none focus:border-primary"><option value="">转入班学期</option><option value="春季">春季</option><option value="暑假">暑假</option><option value="秋季">秋季</option><option value="寒假">寒假</option></select>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] focus:outline-none focus:border-primary"><option value="">转入班老师</option></select>
          <button className="bg-primary hover:bg-teal-600 text-white px-4 py-1.5 rounded text-sm transition-colors">导出</button>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="学生姓名/电话/班级名称" className="border border-gray-300 rounded px-3 py-1.5 text-sm w-[180px] focus:outline-none focus:border-primary" />
            <span className="absolute right-2 top-2 text-gray-400">🔍</span>
          </div>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] focus:outline-none focus:border-primary"><option value="">经办校区</option>{CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <div className="flex items-center gap-2 border border-gray-300 rounded px-2 py-1.5 text-sm">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-none focus:outline-none w-[100px]" />
            <span className="text-gray-400">至</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-none focus:outline-none w-[100px]" />
          </div>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] focus:outline-none focus:border-primary"><option value="">老师</option></select>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] focus:outline-none focus:border-primary"><option value="">课程类型</option><option value="长期班">长期班</option><option value="短期班">短期班</option></select>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] focus:outline-none focus:border-primary"><option value="">跟进老师</option></select>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] focus:outline-none focus:border-primary"><option value="">校区</option></select>
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] focus:outline-none focus:border-primary"><option value="">学期</option><option value="春季">春季</option><option value="暑假">暑假</option><option value="秋季">秋季</option><option value="寒假">寒假</option></select>
          <button className="bg-primary hover:bg-teal-600 text-white px-4 py-1.5 rounded text-sm transition-colors">导出</button>
        </div>
      );
    }
  };

  const renderTable = () => {
    if (activeTab === 'transfer-class') {
      return (
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="p-4">学生姓名</th><th className="p-4">联系电话</th><th className="p-4">调出班级</th><th className="p-4">调出讲次</th>
              <th className="p-4">调出班校区</th><th className="p-4">调出班学期</th><th className="p-4">调出班上课时间</th>
              <th className="p-4">调入班级</th><th className="p-4">调入讲次</th><th className="p-4">调入班校区</th>
              <th className="p-4">调入班学期</th><th className="p-4">调入班上课时间</th><th className="p-4">调入班老师</th>
              <th className="p-4">经办人</th><th className="p-4">时间</th><th className="p-4">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transferClassData.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4"><button onClick={() => {const event = new CustomEvent('navigate-to-student-detail', {detail: { studentId: record.studentId }}); window.dispatchEvent(event);}} className="text-primary hover:underline">{record.studentName}</button></td>
                <td className="p-4 text-gray-600">{record.phone}</td>
                <td className="p-4"><button onClick={() => onNavigateToClass?.(record.fromClassId)} className="text-primary hover:underline">{record.fromClass}</button></td>
                <td className="p-4 text-gray-600">{record.fromLesson}</td>
                <td className="p-4 text-gray-600">{record.fromCampus}</td>
                <td className="p-4 text-gray-600">{record.fromSemester}</td>
                <td className="p-4 text-gray-600">{record.fromTime}</td>
                <td className="p-4"><button onClick={() => onNavigateToClass?.(record.toClassId)} className="text-primary hover:underline">{record.toClass}</button></td>
                <td className="p-4 text-gray-600">{record.toLesson}</td>
                <td className="p-4 text-gray-600">{record.toCampus}</td>
                <td className="p-4 text-gray-600">{record.toSemester}</td>
                <td className="p-4 text-gray-600">{record.toTime}</td>
                <td className="p-4 text-gray-600">{record.toTeacher}</td>
                <td className="p-4 text-gray-600">{record.operator}</td>
                <td className="p-4 text-gray-600">{record.time}</td>
                <td className="p-4"><button className="text-primary hover:opacity-80 text-sm">撤销</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (activeTab === 'change-class') {
      return (
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="p-4">学生姓名</th><th className="p-4">联系电话</th><th className="p-4">转出班级</th><th className="p-4">转出讲次</th>
              <th className="p-4">转出班校区</th><th className="p-4">转出班学期</th><th className="p-4">转出班上课时间</th>
              <th className="p-4">转入班级</th><th className="p-4">转入讲次</th><th className="p-4">转入班校区</th>
              <th className="p-4">转入班学期</th><th className="p-4">转入班上课时间</th><th className="p-4">转入班老师</th>
              <th className="p-4">经办校区</th><th className="p-4">经办人</th><th className="p-4">时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {changeClassData.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4"><button onClick={() => {const event = new CustomEvent('navigate-to-student-detail', {detail: { studentId: record.studentId }}); window.dispatchEvent(event);}} className="text-primary hover:underline">{record.studentName}</button></td>
                <td className="p-4 text-gray-600">{record.phone}</td>
                <td className="p-4"><button onClick={() => onNavigateToClass?.(record.fromClassId)} className="text-primary hover:underline">{record.fromClass}</button></td>
                <td className="p-4 text-gray-600">{record.fromLesson}</td>
                <td className="p-4 text-gray-600">{record.fromCampus}</td>
                <td className="p-4 text-gray-600">{record.fromSemester}</td>
                <td className="p-4 text-gray-600">{record.fromTime}</td>
                <td className="p-4"><button onClick={() => onNavigateToClass?.(record.toClassId)} className="text-primary hover:underline">{record.toClass}</button></td>
                <td className="p-4 text-gray-600">{record.toLesson}</td>
                <td className="p-4 text-gray-600">{record.toCampus}</td>
                <td className="p-4 text-gray-600">{record.toSemester}</td>
                <td className="p-4 text-gray-600">{record.toTime}</td>
                <td className="p-4 text-gray-600">{record.toTeacher}</td>
                <td className="p-4 text-gray-600">{record.handleCampus}</td>
                <td className="p-4 text-gray-600">{record.operator}</td>
                <td className="p-4 text-gray-600">{record.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      return (
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="p-4">学生姓名</th><th className="p-4">联系电话</th><th className="p-4">退班班级</th>
              <th className="p-4">校区</th><th className="p-4">学期</th><th className="p-4">班级老师</th>
              <th className="p-4">课程类型</th><th className="p-4">跟进老师</th><th className="p-4">经办校区</th>
              <th className="p-4">经办人</th><th className="p-4">时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {refundData.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4"><button onClick={() => {const event = new CustomEvent('navigate-to-student-detail', {detail: { studentId: record.studentId }}); window.dispatchEvent(event);}} className="text-primary hover:underline">{record.studentName}</button></td>
                <td className="p-4 text-gray-600">{record.phone}</td>
                <td className="p-4"><button onClick={() => onNavigateToClass?.(record.classId)} className="text-primary hover:underline">{record.className}</button></td>
                <td className="p-4 text-gray-600">{record.campus}</td>
                <td className="p-4 text-gray-600">{record.semester}</td>
                <td className="p-4 text-gray-600">{record.teacher}</td>
                <td className="p-4 text-gray-600">{record.courseType}</td>
                <td className="p-4 text-gray-600">{record.followTeacher}</td>
                <td className="p-4 text-gray-600">{record.handleCampus}</td>
                <td className="p-4 text-gray-600">{record.operator}</td>
                <td className="p-4 text-gray-600">{record.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  const renderStudentSelectModal = () => {
    if (!showStudentSelectModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-[900px] h-[600px] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">选择学生</h3>
            <button onClick={() => setShowStudentSelectModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <input type="text" placeholder="请输入学生姓名、联系电话、ID" className="border border-gray-300 rounded px-3 py-2 text-sm w-[300px]" />
              <select className="border border-gray-300 rounded px-3 py-2 text-sm w-[150px]">
                <option value="">请选择校区</option>
                {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">选择</th>
                  <th className="p-3 text-left">学生ID</th>
                  <th className="p-3 text-left">学生姓名</th>
                  <th className="p-3 text-left">联系电话</th>
                  <th className="p-3 text-left">所属校区</th>
                  <th className="p-3 text-left">已在班级</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ADMIN_STUDENTS.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-3"><input type="radio" name="selectedStudent" onChange={() => setSelectedStudent(s)} /></td>
                    <td className="p-3">{s.id}</td>
                    <td className="p-3">{s.name}</td>
                    <td className="p-3">{s.account}</td>
                    <td className="p-3">{s.campus}</td>
                    <td className="p-3">1</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
            <button onClick={() => setShowStudentSelectModal(false)} className="px-6 py-2 border border-gray-300 rounded text-gray-600">取消</button>
            <button onClick={() => setShowStudentSelectModal(false)} className="px-6 py-2 bg-primary text-white rounded">确定</button>
          </div>
        </div>
      </div>
    );
  };

  const renderClassSelectModal = () => {
    if (!showClassSelectModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-[800px] h-[500px] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">班级选择</h3>
            <button onClick={() => setShowClassSelectModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">选择</th>
                  <th className="p-3 text-left">班级名称</th>
                  <th className="p-3 text-left">授课老师</th>
                  <th className="p-3 text-left">校区</th>
                  <th className="p-3 text-left">学期</th>
                  <th className="p-3 text-left">学科</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {CLASSES.slice(0, 3).map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <input type="radio" name="selectedClass" onChange={() => {
                        if (lessonSelectType === 'from') {
                          setTransferForm({...transferForm, fromClassId: c.id, fromClassName: c.name});
                        } else {
                          setTransferForm({
                            ...transferForm,
                            toClassId: c.id,
                            toClassName: c.name,
                            toLesson: transferForm.fromLesson
                          });
                        }
                      }} />
                    </td>
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.teacherId}</td>
                    <td className="p-3">{c.campus}</td>
                    <td className="p-3">{c.semester}</td>
                    <td className="p-3">{c.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
            <button onClick={() => setShowClassSelectModal(false)} className="px-6 py-2 border border-gray-300 rounded text-gray-600">取消</button>
            <button onClick={() => setShowClassSelectModal(false)} className="px-6 py-2 bg-primary text-white rounded">确定</button>
          </div>
        </div>
      </div>
    );
  };

  const renderLessonSelectModal = () => {
    if (!showLessonSelectModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-[500px] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">选择讲次</h3>
            <button onClick={() => setShowLessonSelectModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr><th className="p-3 text-left">讲次</th><th className="p-3 text-left">状态</th><th className="p-3 text-left">开课时间</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lessons.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => {
                    if (lessonSelectType === 'from') {
                      setTransferForm({...transferForm, fromLesson: l.name});
                    } else {
                      setTransferForm({...transferForm, toLesson: l.name});
                    }
                    setShowLessonSelectModal(false);
                  }}>
                    <td className="p-3">{l.name}</td>
                    <td className="p-3">{l.status}</td>
                    <td className="p-3">{l.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const resetTransferForm = () => {
    setSelectedStudent(null);
    setTransferForm({
      fromClassId: '',
      fromClassName: '',
      fromLesson: '',
      toClassId: '',
      toClassName: '',
      toLesson: '',
    });
  };

  const handleCloseTransferModal = () => {
    setShowTransferModal(false);
    resetTransferForm();
  };

  const renderTransferModal = () => {
    if (!showTransferModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-[1000px] h-[700px] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">调课</h3>
            <button onClick={handleCloseTransferModal} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            {!selectedStudent ? (
              <button onClick={() => setShowStudentSelectModal(true)} className="bg-primary text-white px-4 py-2 rounded">选择学生</button>
            ) : (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-medium">{selectedStudent.name}</span>
                    <span className="text-gray-500">{selectedStudent.account}</span>
                    <span className="text-primary">1个已在班级</span>
                  </div>
                  <button onClick={() => {setSelectedStudent(null); setTransferForm({fromClassId: '', fromClassName: '', fromLesson: '', toClassId: '', toClassName: '', toLesson: ''});}} className="border border-primary text-primary px-4 py-1 rounded">重新选择</button>
                </div>
                <div className="text-gray-500">{selectedStudent.campus}</div>
              </div>
            )}
            {selectedStudent && (
              <div className="flex gap-8">
                <div className="flex-1 bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium mb-4">调出信息</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500">*</span> 选择班级</label>
                      <div className="border border-gray-300 rounded px-3 py-2 bg-white cursor-pointer" onClick={() => {setLessonSelectType('from'); setShowClassSelectModal(true);}}>{transferForm.fromClassName || '请选择班级'}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500">*</span> 选择讲次</label>
                      <div className="border border-gray-300 rounded px-3 py-2 bg-white cursor-pointer" onClick={() => {setLessonSelectType('from'); setShowLessonSelectModal(true);}}>{transferForm.fromLesson || '请选择讲次'}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center"><span className="text-3xl text-gray-400">→</span></div>
                <div className="flex-1 bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium mb-4">调入信息</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500">*</span> 选择班级</label>
                      <div className="border border-gray-300 rounded px-3 py-2 bg-white cursor-pointer" onClick={() => {setLessonSelectType('to'); setShowClassSelectModal(true);}}>{transferForm.toClassName || '请选择班级'}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500">*</span> 选择讲次</label>
                      <div className="border border-gray-300 rounded px-3 py-2 bg-white cursor-pointer" onClick={() => {setLessonSelectType('to'); setShowLessonSelectModal(true);}}>{transferForm.toLesson || '请选择讲次'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-center gap-3">
            <button onClick={handleCloseTransferModal} className="px-8 py-2 border border-gray-300 rounded text-gray-600">取消</button>
            <button onClick={() => setShowTransferModal(false)} className="px-8 py-2 bg-primary text-white rounded">确定</button>
          </div>
        </div>
      </div>
    );
  };

  const renderChangeClassModal = () => {
    if (!showChangeClassModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-[900px] h-[700px] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">转班</h3>
            <button onClick={() => setShowChangeClassModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            {!changeSelectedStudent ? (
              <button onClick={() => setShowChangeStudentSelectModal(true)} className="bg-primary text-white px-4 py-2 rounded">选择学生</button>
            ) : (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-medium">{changeSelectedStudent.name}</span>
                    <span className="text-gray-500">{changeSelectedStudent.account}</span>
                    <span className="text-primary">1个已在课程/班</span>
                  </div>
                  <button onClick={() => {setChangeSelectedStudent(null); setChangeForm({fromClassId: '', fromClassName: '', toClassId: '', toClassName: '', handleCampus: '', handler: '', remark: ''});}} className="border border-primary text-primary px-4 py-1 rounded">重新选择</button>
                </div>
                <div className="text-gray-500">{changeSelectedStudent.campus}</div>
              </div>
            )}
            {changeSelectedStudent && (
              <>
                <div className="flex gap-8 mb-6">
                  <div className="flex-1">
                    <h4 className="font-medium mb-4">转出信息</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500">*</span> 选择课程/班级</label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2" value={changeForm.fromClassId} onChange={(e) => {const cls = CLASSES.find(c => c.id === e.target.value); setChangeForm({...changeForm, fromClassId: e.target.value, fromClassName: cls?.name || ''});}}>
                          <option value="">请选择转出课程/班级</option>
                          {CLASSES.slice(0, 3).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    {changeForm.fromClassId && (
                      <div className="bg-gray-50 p-4 rounded-lg mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span>总剩余学费</span>
                          <button className="border border-primary text-primary px-3 py-1 rounded text-sm">考勤明细</button>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between"><span>原价</span><span className="text-primary">5475.00元</span><span className="text-gray-400">（共15讲次，已报15讲次）</span></div>
                          <div className="flex justify-between"><span>实收</span><span className="text-primary">5475.00元</span><span className="text-gray-400">（已上0讲次）</span></div>
                          <div className="flex justify-between"><span>剩余学费</span><span className="text-primary">5475.00元</span></div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-sm text-gray-500 mb-2">教辅费（退费规则：报名后不退）</div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between"><span>应收</span><span className="text-primary">0.00元</span></div>
                            <div className="flex justify-between"><span>实收</span><span className="text-primary">0.00元</span></div>
                          </div>
                          <div className="mt-2 text-primary text-sm">班级未开课</div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between font-medium"><span>总剩余学费</span><span className="text-primary">5475.00元</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center pt-8"><span className="text-3xl text-gray-400">→</span></div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-4">转入信息</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500">*</span> 选择课程/班级</label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2" value={changeForm.toClassId} onChange={(e) => {const cls = CLASSES.find(c => c.id === e.target.value); setChangeForm({...changeForm, toClassId: e.target.value, toClassName: cls?.name || ''});}}>
                          <option value="">请选择转入课程/班级</option>
                          {CLASSES.slice(3, 6).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    {changeForm.toClassId && (
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-3">学费</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">当前进入</span>
                            <select className="border border-gray-300 rounded px-2 py-1 text-sm w-32">
                              <option>第1讲</option>
                            </select>
                          </div>
                          <div className="flex justify-between"><span className="text-gray-600">总学费</span><span><span className="text-primary">5475.00元</span><span className="text-gray-400 ml-2">（共15讲次，剩余15讲次）</span></span></div>
                          <div className="flex justify-between"><span className="text-gray-600">应收学费</span><span className="text-primary">5475.00元</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {changeForm.fromClassId && changeForm.toClassId && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="text-sm text-gray-500 mb-3">原价（根据未上讲次退费）</div>
                      <div className="text-right text-xl font-medium">5475.00 <span className="text-sm text-gray-500">元</span></div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <span>优惠</span>
                        <div className="flex gap-2">
                          <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                            <option>不优惠</option>
                          </select>
                          <input type="text" placeholder="请输入" className="border border-gray-300 rounded px-2 py-1 text-sm w-24" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span>应收</span>
                        <span className="text-xl font-medium">5475.00 <span className="text-sm text-gray-500">元</span></span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="text-sm font-medium mb-3">教辅费</div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">应收（退费说明：报名后不退）</span>
                        <span>0.00 <span className="text-gray-500">元</span></span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="text-sm font-medium mb-3">支付信息</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>总价</span><span className="text-primary">5475.00 <span className="text-gray-500">元</span></span></div>
                        <div className="flex justify-between"><span>优惠</span><span className="text-primary">0.00 <span className="text-gray-500">元</span></span></div>
                        <div className="flex justify-between"><span>应收</span><span className="text-primary">5475.00 <span className="text-gray-500">元</span></span></div>
                        <div className="flex justify-between"><span>实付金额</span><span className="text-primary">无需支付</span></div>
                      </div>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500">*</span> 经办校区</label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2" value={changeForm.handleCampus} onChange={(e) => setChangeForm({...changeForm, handleCampus: e.target.value})}>
                      <option value="">请选择校区</option>
                      {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500">*</span> 经办人</label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2" value={changeForm.handler} onChange={(e) => setChangeForm({...changeForm, handler: e.target.value})}>
                      <option value="">产品</option>
                      <option value="管理员A">管理员A</option>
                      <option value="管理员B">管理员B</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">备注</label>
                  <textarea className="w-full border border-gray-300 rounded px-3 py-2 h-20" placeholder="请输入50字以内备注内容（非必填）" value={changeForm.remark} onChange={(e) => setChangeForm({...changeForm, remark: e.target.value})} />
                </div>
              </>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-center gap-3">
            <button onClick={() => setShowChangeClassModal(false)} className="px-8 py-2 border border-gray-300 rounded text-gray-600">取消</button>
            <button onClick={() => setShowChangeClassModal(false)} className="px-8 py-2 bg-primary text-white rounded">确定</button>
          </div>
        </div>
      </div>
    );
  };

  const renderChangeStudentSelectModal = () => {
    if (!showChangeStudentSelectModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-[900px] h-[600px] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">选择学生</h3>
            <button onClick={() => setShowChangeStudentSelectModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <input type="text" placeholder="请输入学生姓名、联系电话、ID" className="border border-gray-300 rounded px-3 py-2 text-sm w-[300px]" />
              <select className="border border-gray-300 rounded px-3 py-2 text-sm w-[150px]">
                <option value="">请选择校区</option>
                {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">选择</th>
                  <th className="p-3 text-left">学生ID</th>
                  <th className="p-3 text-left">学生姓名</th>
                  <th className="p-3 text-left">联系电话</th>
                  <th className="p-3 text-left">所属校区</th>
                  <th className="p-3 text-left">已在课程/班</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ADMIN_STUDENTS.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-3"><input type="radio" name="changeSelectedStudent" onChange={() => setChangeSelectedStudent(s)} /></td>
                    <td className="p-3">{s.id}</td>
                    <td className="p-3">{s.name}</td>
                    <td className="p-3">{s.account}</td>
                    <td className="p-3">{s.campus}</td>
                    <td className="p-3">1</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
            <button onClick={() => setShowChangeStudentSelectModal(false)} className="px-6 py-2 border border-gray-300 rounded text-gray-600">取消</button>
            <button onClick={() => setShowChangeStudentSelectModal(false)} className="px-6 py-2 bg-primary text-white rounded">确定</button>
          </div>
        </div>
      </div>
    );
  };

  const resetRefundForm = () => {
    setRefundSelectedStudent(null);
    setRefundClassId('');
    setRefundForm({
      handleCampus: '',
      handler: '',
      remark: '',
      refundAmount: '',
      actualRefund: '',
      paymentMethod: '',
      useOriginalDiscount: false,
      discountWithRefund: false,
    });
  };

  const handleCloseRefundModal = () => {
    setShowRefundModal(false);
    resetRefundForm();
  };

  const renderRefundModal = () => {
    if (!showRefundModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-[900px] h-[700px] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">退费</h3>
            <button onClick={handleCloseRefundModal} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            {!refundSelectedStudent ? (
              <button onClick={() => setShowRefundStudentSelectModal(true)} className="bg-primary text-white px-4 py-2 rounded">选择学生</button>
            ) : (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-medium">{refundSelectedStudent.name}</span>
                    <span className="text-gray-500">{refundSelectedStudent.account}</span>
                    <span className="text-primary">1个已在班级</span>
                  </div>
                  <button onClick={() => {setRefundSelectedStudent(null); setRefundClassId(''); setRefundForm({handleCampus: '', handler: '', remark: '', refundAmount: '', actualRefund: '', paymentMethod: '', useOriginalDiscount: false, discountWithRefund: false});}} className="border border-primary text-primary px-4 py-1 rounded">重新选择</button>
                </div>
                <div className="text-gray-500">{refundSelectedStudent.campus}</div>
              </div>
            )}
            {refundSelectedStudent && (
              <>
                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500">*</span> 选择课程/班级</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2" value={refundClassId} onChange={(e) => setRefundClassId(e.target.value)}>
                    <option value="">请选择课程/班级</option>
                    {CLASSES.slice(0, 3).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {refundClassId && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">学费剩余</span>
                        <button className="border border-primary text-primary px-3 py-1 rounded text-sm">考勤明细</button>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between"><span>原价</span><span className="text-primary">5475.00元</span><span className="text-gray-400">（共15讲次，已报15讲次）</span></div>
                        <div className="flex justify-between"><span>优惠</span><span className="text-primary">0.00元</span></div>
                        <div className="flex justify-between"><span>应收</span><span className="text-primary">5475.00元</span></div>
                        <div className="flex justify-between"><span>实收</span><span className="text-primary">5475.00元</span><span className="text-gray-400">（已上0讲次）</span></div>
                        <div className="flex justify-between"><span>剩余学费</span><span className="text-primary">5475.00元</span></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="font-medium mb-3">优惠设置</div>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={refundForm.useOriginalDiscount} onChange={(e) => setRefundForm({...refundForm, useOriginalDiscount: e.target.checked})} className="rounded" />
                          <span className="text-sm text-gray-600">退费是否延用报课/班优惠</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={refundForm.discountWithRefund} onChange={(e) => setRefundForm({...refundForm, discountWithRefund: e.target.checked})} className="rounded" />
                          <span className="text-sm text-gray-600">退费是否与优惠同时享用</span>
                        </label>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">应退费金额</span>
                          <div className="flex items-center gap-2">
                            <input type="text" placeholder="请输入" className="border border-gray-300 rounded px-2 py-1 text-sm w-32 text-right" value={refundForm.refundAmount} onChange={(e) => setRefundForm({...refundForm, refundAmount: e.target.value})} />
                            <span className="text-sm text-gray-500">元</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="font-medium mb-3">教辅费</div>
                      <div className="text-sm text-gray-500 mb-2">退费规则：报名后不退</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between"><span>应收</span><span className="text-primary">0.00元</span></div>
                        <div className="flex justify-between"><span>实收</span><span className="text-primary">0.00元</span></div>
                      </div>
                      <div className="mt-2 text-primary text-sm">班级未开课</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="font-medium mb-3">支付信息</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>应退总计</span><span className="text-primary">{refundForm.refundAmount || '0.00'} <span className="text-gray-500">元</span></span></div>
                        <div className="flex justify-between items-center"><span>实退总计</span>
                          <div className="flex items-center gap-2">
                            <input type="text" placeholder="请输入" className="border border-gray-300 rounded px-2 py-1 text-sm w-32 text-right" value={refundForm.actualRefund} onChange={(e) => setRefundForm({...refundForm, actualRefund: e.target.value})} />
                            <span className="text-gray-500">元</span>
                          </div>
                        </div>
                        <div className="flex justify-between"><span>余额</span><span className="text-primary">0.00 <span className="text-gray-500">元</span></span></div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span>支付方式</span>
                          <select className="border border-gray-300 rounded px-2 py-1 text-sm w-32" value={refundForm.paymentMethod} onChange={(e) => setRefundForm({...refundForm, paymentMethod: e.target.value})}>
                            <option value="">请选择</option>
                            <option value="现金">现金</option>
                            <option value="微信">微信</option>
                            <option value="支付宝">支付宝</option>
                            <option value="银行卡">银行卡</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500">*</span> 经办校区</label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2" value={refundForm.handleCampus} onChange={(e) => setRefundForm({...refundForm, handleCampus: e.target.value})}>
                          <option value="">请选择校区</option>
                          {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1"><span className="text-red-500">*</span> 经办人</label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2" value={refundForm.handler} onChange={(e) => setRefundForm({...refundForm, handler: e.target.value})}>
                          <option value="">请选择</option>
                          <option value="管理员A">管理员A</option>
                          <option value="管理员B">管理员B</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-600 mb-1">备注</label>
                      <textarea className="w-full border border-gray-300 rounded px-3 py-2 h-20" placeholder="请输入50字以内备注内容（非必填）" value={refundForm.remark} onChange={(e) => setRefundForm({...refundForm, remark: e.target.value})} />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-center gap-3">
            <button onClick={handleCloseRefundModal} className="px-8 py-2 border border-gray-300 rounded text-gray-600">取消</button>
            <button onClick={() => setShowRefundModal(false)} className="px-8 py-2 bg-primary text-white rounded">确定</button>
          </div>
        </div>
      </div>
    );
  };

  const renderRefundStudentSelectModal = () => {
    if (!showRefundStudentSelectModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-[900px] h-[600px] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">选择学生</h3>
            <button onClick={() => setShowRefundStudentSelectModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <input type="text" placeholder="请输入学生姓名、联系电话、ID" className="border border-gray-300 rounded px-3 py-2 text-sm w-[300px]" />
              <select className="border border-gray-300 rounded px-3 py-2 text-sm w-[150px]">
                <option value="">请选择校区</option>
                {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">选择</th>
                  <th className="p-3 text-left">学生ID</th>
                  <th className="p-3 text-left">学生姓名</th>
                  <th className="p-3 text-left">联系电话</th>
                  <th className="p-3 text-left">所属校区</th>
                  <th className="p-3 text-left">已在课程/班</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ADMIN_STUDENTS.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-3"><input type="radio" name="refundSelectedStudent" onChange={() => setRefundSelectedStudent(s)} /></td>
                    <td className="p-3">{s.id}</td>
                    <td className="p-3">{s.name}</td>
                    <td className="p-3">{s.account}</td>
                    <td className="p-3">{s.campus}</td>
                    <td className="p-3">1</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
            <button onClick={() => setShowRefundStudentSelectModal(false)} className="px-6 py-2 border border-gray-300 rounded text-gray-600">取消</button>
            <button onClick={() => setShowRefundStudentSelectModal(false)} className="px-6 py-2 bg-primary text-white rounded">确定</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">调转退记录</h2>
        <div className="flex gap-3">
          <button onClick={() => setShowTransferModal(true)} className="bg-primary hover:bg-teal-600 text-white px-4 py-2 rounded text-sm transition-colors">调课</button>
          <button onClick={() => setShowChangeClassModal(true)} className="bg-primary hover:bg-teal-600 text-white px-4 py-2 rounded text-sm transition-colors">转班</button>
          <button onClick={() => setShowRefundModal(true)} className="bg-primary hover:bg-teal-600 text-white px-4 py-2 rounded text-sm transition-colors">退费</button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-6 mb-4">
          <button onClick={() => setActiveTab('transfer-class')} className={`text-sm font-medium pb-2 relative ${activeTab === 'transfer-class' ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
            调课记录
            {activeTab === 'transfer-class' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
          </button>
          <button onClick={() => setActiveTab('change-class')} className={`text-sm font-medium pb-2 relative ${activeTab === 'change-class' ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
            转班记录
            {activeTab === 'change-class' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
          </button>
          <button onClick={() => setActiveTab('refund')} className={`text-sm font-medium pb-2 relative ${activeTab === 'refund' ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
            退班记录
            {activeTab === 'refund' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
          </button>
        </div>
        {renderFilterBar()}
      </div>

      <div className="flex-1 overflow-hidden bg-white flex flex-col">
        <div className="flex-1 overflow-auto mx-4 my-4 border border-gray-200 rounded-lg">
          {renderTable()}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
        <span className="text-sm text-gray-500">共 10 条数据</span>
        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">&lt;</button>
        <button className="px-3 py-1 text-sm bg-primary text-white rounded">1</button>
        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">2</button>
        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">3</button>
        <span className="text-sm text-gray-600">...</span>
        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">&gt;</button>
        <span className="text-sm text-gray-500">共 1 页</span>
      </div>

      {renderTransferModal()}
      {renderStudentSelectModal()}
      {renderClassSelectModal()}
      {renderLessonSelectModal()}
      {renderChangeClassModal()}
      {renderChangeStudentSelectModal()}
      {renderRefundModal()}
      {renderRefundStudentSelectModal()}
    </div>
  );
};

export default TransferRefundRecords;
