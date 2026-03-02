
import React, { useState } from 'react';
import { CAMPUSES, TEACHERS } from '../../constants';

interface AttendanceProps {
  classes?: any[];
  lessons?: any[];
}

type AttendanceTab = 'class' | 'allStudents';

interface ClassAttendance {
  id: string;
  campus: string;
  courseName: string;
  className: string;
  subject: string;
  semester: string;
  grade: string;
  teacher: string;
  classType: string;
  startDate: string;
  startTime: string;
  studentCount: number;
  notAttended: number;
}

interface StudentAttendance {
  id: string;
  campus: string;
  teachingMethod: string;
  courseName: string;
  className: string;
  startTime: string;
  teacher: string;
  assistant: string;
  studentName: string;
  phone: string;
  attendanceStatus: string;
  attendanceResult: string;
}

const Attendance: React.FC<AttendanceProps> = () => {
  const [activeTab, setActiveTab] = useState<AttendanceTab>('class');
  
  // 面授班课筛选状态
  const [classFilter, setClassFilter] = useState({
    campus: '',
    grade: '',
    subject: '',
    semester: '',
    classType: '',
    teacher: '',
    dateRange: { start: '', end: '' }
  });

  // 全部学生筛选状态
  const [studentFilter, setStudentFilter] = useState({
    teacherName: '',
    studentName: '',
    campus: '',
    teachingMethod: '',
    notAttended: '',
    dateRange: { start: '', end: '' }
  });

  // 选中的学生（用于批量考勤）
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // 模拟面授班课数据
  const classData: ClassAttendance[] = [
    {
      id: '1',
      campus: '五台山校区',
      courseName: '2026年寒假中班英语启蒙课程',
      className: '寒K2-启蒙衔接班',
      subject: '英语',
      semester: '寒假',
      grade: '中班',
      teacher: 'Emily张文莉',
      classType: '无',
      startDate: '2026-02-15',
      startTime: '18:00-20:00',
      studentCount: 7,
      notAttended: 7
    },
    {
      id: '2',
      campus: '辰龙校区',
      courseName: '寒G3-S | Zoey宋雅琴',
      className: '寒G3-S | Zoey宋雅琴',
      subject: '英语',
      semester: '寒假',
      grade: '3年级',
      teacher: 'Zoey宋雅琴',
      classType: '领航S',
      startDate: '2026-02-15',
      startTime: '18:00-20:30',
      studentCount: 11,
      notAttended: 10
    },
    {
      id: '3',
      campus: '奥南校区',
      courseName: '寒K3-进阶 | Flora顾晓燕',
      className: '寒K3-进阶 | Flora顾晓燕',
      subject: '英语',
      semester: '寒假',
      grade: '大班',
      teacher: 'Flora顾晓燕',
      classType: '进阶',
      startDate: '2026-02-14',
      startTime: '18:00-20:00',
      studentCount: 4,
      notAttended: 4
    },
    {
      id: '4',
      campus: '大行宫校区',
      courseName: '寒G2-S | Katrina李婷',
      className: '寒G2-S | Katrina李婷',
      subject: '英语',
      semester: '寒假',
      grade: '2年级',
      teacher: 'Katrina李婷',
      classType: '领航S',
      startDate: '2026-02-13',
      startTime: '18:00-20:30',
      studentCount: 7,
      notAttended: 7
    }
  ];

  // 模拟全部学生数据
  const studentData: StudentAttendance[] = [
    {
      id: '1',
      campus: '奥体网球中心校区',
      teachingMethod: '面授班课',
      courseName: '寒K3-进阶 | Alin陈桂莲',
      className: '寒K3-进阶 | Alin陈桂莲',
      startTime: '2026-02-15 18:00',
      teacher: 'Alin陈桂莲',
      assistant: '无',
      studentName: '伏曦槿',
      phone: '186****3033',
      attendanceStatus: '未考勤',
      attendanceResult: '出勤'
    },
    {
      id: '2',
      campus: '五台山校区',
      teachingMethod: '面授班课',
      courseName: '2026年寒假中班英语启蒙课程',
      className: '寒K2-启蒙衔接班',
      startTime: '2026-02-15 18:00',
      teacher: 'Emily张文莉',
      assistant: '无',
      studentName: '隋牧南',
      phone: '189****0737',
      attendanceStatus: '未考勤',
      attendanceResult: '出勤'
    },
    {
      id: '3',
      campus: '奥体网球中心校区',
      teachingMethod: '面授班课',
      courseName: '寒K3-进阶 | Alin陈桂莲',
      className: '寒K3-进阶 | Alin陈桂莲',
      startTime: '2026-02-14 18:00',
      teacher: 'Alin陈桂莲',
      assistant: '无',
      studentName: '姚鸣乔',
      phone: '136****1789',
      attendanceStatus: '未考勤',
      attendanceResult: '出勤'
    },
    {
      id: '4',
      campus: '奥体网球中心校区',
      teachingMethod: '面授班课',
      courseName: '寒K3-进阶 | Alin陈桂莲',
      className: '寒K3-进阶 | Alin陈桂莲',
      startTime: '2026-02-13 18:00',
      teacher: 'Alin陈桂莲',
      assistant: '无',
      studentName: '杨尚霖',
      phone: '186****2366',
      attendanceStatus: '未考勤',
      attendanceResult: '出勤'
    }
  ];

  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudents(studentData.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">考勤</h2>
        <a href="#" className="text-primary text-sm">使用手册</a>
      </div>

      {/* Warning Banner */}
      <div className="mx-6 mt-4 p-3 bg-orange-50 border border-orange-200 rounded flex items-center gap-2">
        <span className="text-orange-500">⚠️</span>
        <span className="text-orange-600 text-sm">每天24点，将锁定当天已考勤学生的考勤情况，请谨慎操作</span>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-gray-200 mt-4">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('class')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'class'
                ? 'text-primary border-primary'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            面授班课
          </button>
          <button
            onClick={() => setActiveTab('allStudents')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'allStudents'
                ? 'text-primary border-primary'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            全部学生
          </button>
        </div>
      </div>

      {/* 面授班课 */}
      {activeTab === 'class' && (
        <>
          {/* Filter Bar */}
          <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
            <select 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 text-gray-600 focus:outline-none focus:border-primary"
              value={classFilter.campus}
              onChange={e => setClassFilter({...classFilter, campus: e.target.value})}
            >
              <option value="">校区</option>
              {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <select 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28 text-gray-600 focus:outline-none focus:border-primary"
              value={classFilter.grade}
              onChange={e => setClassFilter({...classFilter, grade: e.target.value})}
            >
              <option value="">年级</option>
              <option value="小班">小班</option>
              <option value="中班">中班</option>
              <option value="大班">大班</option>
              <option value="一年级">一年级</option>
              <option value="二年级">二年级</option>
              <option value="三年级">三年级</option>
            </select>
            
            <select 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28 text-gray-600 focus:outline-none focus:border-primary"
              value={classFilter.subject}
              onChange={e => setClassFilter({...classFilter, subject: e.target.value})}
            >
              <option value="">学科</option>
              <option value="英语">英语</option>
              <option value="数学">数学</option>
            </select>
            
            <select 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28 text-gray-600 focus:outline-none focus:border-primary"
              value={classFilter.semester}
              onChange={e => setClassFilter({...classFilter, semester: e.target.value})}
            >
              <option value="">学期</option>
              <option value="寒假">寒假</option>
              <option value="春季">春季</option>
              <option value="暑假">暑假</option>
              <option value="秋季">秋季</option>
            </select>
            
            <select 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28 text-gray-600 focus:outline-none focus:border-primary"
              value={classFilter.classType}
              onChange={e => setClassFilter({...classFilter, classType: e.target.value})}
            >
              <option value="">班型</option>
              <option value="领航S">领航S</option>
              <option value="进阶">进阶</option>
            </select>
            
            <select 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 text-gray-600 focus:outline-none focus:border-primary"
              value={classFilter.teacher}
              onChange={e => setClassFilter({...classFilter, teacher: e.target.value})}
            >
              <option value="">授课老师</option>
              {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            
            <div className="flex items-center gap-2">
              <input 
                type="date"
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                value={classFilter.dateRange.start}
                onChange={e => setClassFilter({...classFilter, dateRange: {...classFilter.dateRange, start: e.target.value}})}
              />
              <span className="text-gray-400">至</span>
              <input 
                type="date"
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                value={classFilter.dateRange.end}
                onChange={e => setClassFilter({...classFilter, dateRange: {...classFilter.dateRange, end: e.target.value}})}
              />
            </div>
            
            <button className="px-4 py-1.5 bg-primary text-white rounded text-sm hover:bg-primary-dark ml-auto">
              导出
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto p-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">校区</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">课程名称</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">班级名称</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">学科</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">学期</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">年级</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">授课老师</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">班型</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">开课日期</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">开课时间</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">学生人数</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">未考勤</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {classData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                      <td className="px-4 py-3 text-gray-700">{item.campus}</td>
                      <td className="px-4 py-3 text-gray-700">{item.courseName}</td>
                      <td className="px-4 py-3 text-gray-700">{item.className}</td>
                      <td className="px-4 py-3 text-gray-700">{item.subject}</td>
                      <td className="px-4 py-3 text-gray-700">{item.semester}</td>
                      <td className="px-4 py-3 text-gray-700">{item.grade}</td>
                      <td className="px-4 py-3 text-gray-700">{item.teacher}</td>
                      <td className="px-4 py-3 text-gray-700">{item.classType}</td>
                      <td className="px-4 py-3 text-gray-700">{item.startDate}</td>
                      <td className="px-4 py-3 text-gray-700">{item.startTime}</td>
                      <td className="px-4 py-3 text-gray-700">{item.studentCount}</td>
                      <td className="px-4 py-3 text-gray-700">{item.notAttended}</td>
                      <td className="px-4 py-3">
                        <button className="text-primary hover:underline text-sm">考勤</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">共{classData.length}条数据</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                上一页
              </button>
              <button className="px-3 py-1 bg-primary text-white rounded text-sm">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm">2</button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm">3</button>
              <span className="text-gray-400">...</span>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm">16</button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm">下一页</button>
              <span className="text-sm text-gray-500 ml-2">共16页</span>
            </div>
          </div>
        </>
      )}

      {/* 全部学生 */}
      {activeTab === 'allStudents' && (
        <>
          {/* Filter Bar */}
          <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
            <div className="flex items-center gap-2">
              <input 
                className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 focus:outline-none focus:border-primary"
                placeholder="授课老师姓名"
                value={studentFilter.teacherName}
                onChange={e => setStudentFilter({...studentFilter, teacherName: e.target.value})}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 focus:outline-none focus:border-primary"
                placeholder="学生姓名"
                value={studentFilter.studentName}
                onChange={e => setStudentFilter({...studentFilter, studentName: e.target.value})}
              />
            </div>
            
            <select 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28 text-gray-600 focus:outline-none focus:border-primary"
              value={studentFilter.campus}
              onChange={e => setStudentFilter({...studentFilter, campus: e.target.value})}
            >
              <option value="">校区</option>
              {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <select 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28 text-gray-600 focus:outline-none focus:border-primary"
              value={studentFilter.teachingMethod}
              onChange={e => setStudentFilter({...studentFilter, teachingMethod: e.target.value})}
            >
              <option value="">授课方式</option>
              <option value="面授班课">面授班课</option>
            </select>
            
            <select 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28 text-gray-600 focus:outline-none focus:border-primary"
              value={studentFilter.notAttended}
              onChange={e => setStudentFilter({...studentFilter, notAttended: e.target.value})}
            >
              <option value="">未考勤</option>
              <option value="yes">是</option>
              <option value="no">否</option>
            </select>
            
            <div className="flex items-center gap-2">
              <input 
                type="date"
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                value={studentFilter.dateRange.start}
                onChange={e => setStudentFilter({...studentFilter, dateRange: {...studentFilter.dateRange, start: e.target.value}})}
              />
              <span className="text-gray-400">至</span>
              <input 
                type="date"
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                value={studentFilter.dateRange.end}
                onChange={e => setStudentFilter({...studentFilter, dateRange: {...studentFilter.dateRange, end: e.target.value}})}
              />
            </div>
            
            <div className="flex gap-2 ml-auto">
              <button className="px-4 py-1.5 bg-primary text-white rounded text-sm hover:bg-primary-dark">
                导出
              </button>
              <button className="px-4 py-1.5 bg-primary text-white rounded text-sm hover:bg-primary-dark">
                确定考勤
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto p-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">
                      <input 
                        type="checkbox" 
                        className="mr-2"
                        onChange={handleSelectAll}
                        checked={selectedStudents.length === studentData.length && studentData.length > 0}
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">校区</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">授课方式</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">课程名称</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">班级名称</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">开课时间</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">授课老师</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">辅导老师</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">学生姓名</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">手机号</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">考勤状态</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">出勤情况</th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox" 
                          checked={selectedStudents.includes(item.id)}
                          onChange={() => handleSelectStudent(item.id)}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-700">{item.campus}</td>
                      <td className="px-4 py-3 text-gray-700">{item.teachingMethod}</td>
                      <td className="px-4 py-3 text-gray-700">{item.courseName}</td>
                      <td className="px-4 py-3 text-gray-700">{item.className}</td>
                      <td className="px-4 py-3 text-gray-700">{item.startTime}</td>
                      <td className="px-4 py-3 text-gray-700">{item.teacher}</td>
                      <td className="px-4 py-3 text-gray-700">{item.assistant}</td>
                      <td className="px-4 py-3 text-gray-700">{item.studentName}</td>
                      <td className="px-4 py-3 text-gray-700">{item.phone}</td>
                      <td className="px-4 py-3 text-gray-700">{item.attendanceStatus}</td>
                      <td className="px-4 py-3">
                        <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                          <option value="出勤">出勤</option>
                          <option value="缺勤">缺勤</option>
                          <option value="请假">请假</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">共{studentData.length}条数据</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                上一页
              </button>
              <button className="px-3 py-1 bg-primary text-white rounded text-sm">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm">2</button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm">3</button>
              <span className="text-gray-400">...</span>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm">106</button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm">下一页</button>
              <span className="text-sm text-gray-500 ml-2">共106页</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;
