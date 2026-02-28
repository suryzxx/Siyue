import React, { useState } from 'react';
import { ClassInfo, Lesson } from '../../types';
import { COURSES, TEACHERS, ADMIN_STUDENTS } from '../../constants';
import AttendanceModal from '../AttendanceModal';

interface ClassDetailPageProps {
  classId: string;
  classes: ClassInfo[];
  lessons: Lesson[];
  onBack: () => void;
  onEdit?: (classInfo: ClassInfo) => void;
  onNavigateToStudent?: (studentId: string) => void;
}

const ClassDetailPage: React.FC<ClassDetailPageProps> = ({ 
  classId, 
  classes, 
  lessons, 
  onBack,
  onEdit,
  onNavigateToStudent
}) => {
  const [activeDetailTab, setActiveDetailTab] = useState<'basic' | 'course' | 'sales' | 'students' | 'changes'>('basic');
  const [studentTab, setStudentTab] = useState<'current' | 'history'>('current');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  const selectedClass = classes.find(c => c.id === classId);
  
  if (!selectedClass) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center text-sm">
          <span className="text-gray-500 cursor-pointer hover:text-primary" onClick={onBack}>班级管理</span>
          <span className="mx-2 text-gray-400">|</span>
          <span className="text-gray-800">班级详情</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-500">未找到班级信息</p>
            <button 
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              onClick={onBack}
            >
              返回班级管理
            </button>
          </div>
        </div>
      </div>
    );
  }

  const course = COURSES.find(c => c.id === selectedClass.courseId);
  const teacher = TEACHERS.find(t => t.id === selectedClass.teacherId);
  const classLessons = lessons.filter(l => l.classId === selectedClass.id).sort((a, b) => a.date.localeCompare(b.date));

  // Calculate start and end dates
  const startDate = classLessons.length > 0 ? classLessons[0].date : selectedClass.startDate || '-';
  const endDate = classLessons.length > 0 ? classLessons[classLessons.length - 1].date : '-';

  const mockChanges = [
    { id: 1, info: '修改了上课时间', time: '2025-06-20 10:00:00', operator: '管理员A' },
    { id: 2, info: '创建班级', time: '2025-06-15 09:30:00', operator: '管理员B' },
  ];

  // Mock current and history students
  const currentStudents = ADMIN_STUDENTS.slice(0, selectedClass.studentCount || 3);
  const historyStudents = ADMIN_STUDENTS.slice(3, 6); // Mock history students
  const enrolledStudents = studentTab === 'current' ? currentStudents : historyStudents;

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center text-sm">
        <span className="text-gray-500 cursor-pointer hover:text-primary" onClick={onBack}>班级管理</span>
        <span className="mx-2 text-gray-400">|</span>
        <span className="text-gray-800">班级详情</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedClass.name}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">{selectedClass.grade}</span>
                <span>ID: {selectedClass.id}</span>
                <span>{course?.name}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <button 
                  onClick={() => onEdit(selectedClass)}
                  className="px-4 py-1.5 border border-primary text-primary rounded text-sm hover:bg-primary-light"
                >
                  编辑
                </button>
              )}
            </div>
          </div>
          
          <div className="flex border-b border-gray-100">
            {['basic', 'course', 'sales', 'students', 'changes'].map(tab => (
              <div
                key={tab}
                onClick={() => setActiveDetailTab(tab as any)}
                className={`px-6 py-3 text-sm font-medium cursor-pointer relative ${
                  activeDetailTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'basic' && '基本信息'}
                {tab === 'course' && '讲次信息'}
                {tab === 'sales' && '售卖信息'}
                {tab === 'students' && '班级学员'}
                {tab === 'changes' && '变动信息'}
                {activeDetailTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-6">
            {activeDetailTab === 'basic' && (
              <div className="space-y-3 text-sm text-gray-600">
                {/* Row 1: 产品名称 */}
                <div className="flex items-center">
                  <span className="text-gray-400 w-20 inline-block">产品名称：</span>
                  <span className="text-gray-900">{course?.name}</span>
                </div>
                {/* Row 2: 班级名称 */}
                <div className="flex items-center">
                  <span className="text-gray-400 w-20 inline-block">班级名称：</span>
                  <span className="text-gray-900">{selectedClass.name}</span>
                </div>
                {/* Row 3: 年份、学期、年级、班型 */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <span className="text-gray-400 w-20 inline-block">年份：</span>
                    <span className="text-gray-900">{selectedClass.year || course?.year || '-'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 w-20 inline-block">学期：</span>
                    <span className="text-gray-900">{selectedClass.semester || '-'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 w-20 inline-block">年级：</span>
                    <span className="text-gray-900">{selectedClass.grade || '-'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 w-20 inline-block">班型：</span>
                    <span className="text-gray-900">{selectedClass.studentTag || course?.classType || '-'}</span>
                  </div>
                </div>
                {/* Row 4: 主讲老师、助教、开课时间、结课时间 */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <span className="text-gray-400 w-20 inline-block">主讲老师：</span>
                    <span className="text-gray-900">{teacher?.name || '-'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 w-20 inline-block">助教：</span>
                    <span className="text-gray-900">{selectedClass.assistant || '-'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 w-20 inline-block">开课时间：</span>
                    <span className="text-gray-900">{startDate}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 w-20 inline-block">结课时间：</span>
                    <span className="text-gray-900">{endDate}</span>
                  </div>
                </div>
                {/* Row 5: 校区、教室、预招人数、调课位 */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <span className="text-gray-400 w-20 inline-block">校区：</span>
                    <span className="text-gray-900">{selectedClass.campus || '-'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 w-20 inline-block">教室：</span>
                    <span className="text-gray-900">{selectedClass.classroom || '-'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 w-20 inline-block">预招人数：</span>
                    <span className="text-gray-900">{selectedClass.capacity || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 w-20 inline-block">调课位：</span>
                    <span className="text-gray-900">{selectedClass.virtualSeats || 0}</span>
                  </div>
                </div>
                {/* Row 6: 是否需要入学资格、允许老师、教室时间冲突 */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <span className="text-gray-400 w-26 inline-block">是否需要入学资格：</span>
                    <span className="text-gray-900">{selectedClass.needQualification ? '是' : '否'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 w-26 inline-block">允许老师、教室冲突：</span>
                    <span className="text-gray-900">{selectedClass.allowConflict ? '是' : '否'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeDetailTab === 'course' && (
              <div>
                <table className="w-full text-sm text-left border border-gray-100 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="p-3">序号</th>
                      <th className="p-3">课节名称</th>
                      <th className="p-3">上课日期</th>
                      <th className="p-3">上课时间</th>
                      <th className="p-3">讲次学生数</th>
                      <th className="p-3">状态</th>
                      <th className="p-3">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {classLessons.map((l, idx) => (
                      <tr key={l.id}>
                        <td className="p-3 text-gray-600">{idx + 1}</td>
                        <td className="p-3 text-gray-800">{l.name}</td>
                        <td className="p-3 text-gray-600">{l.date}</td>
                        <td className="p-3 text-gray-600">{l.startTime} - {l.endTime}</td>
                        <td className="p-3 text-gray-600">{selectedClass.studentCount || 0}</td>
                        <td className="p-3">
                          {l.status === 'completed' && <span className="text-green-500">已完成</span>}
                          {l.status === 'pending' && <span className="text-orange-500">未开始</span>}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedLesson(l);
                              setShowAttendanceModal(true);
                            }}
                            className="text-primary hover:text-teal-600 text-sm font-medium"
                          >
                            考勤
                          </button>
                        </td>
                      </tr>
                    ))}
                    {classLessons.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-gray-400">暂无课节信息</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {activeDetailTab === 'sales' && (
              <div className="grid grid-cols-1 gap-y-6 text-sm text-gray-600 max-w-2xl">
                <div className="flex"><span className="text-gray-400 w-32 inline-block">售卖模式：</span><span className={selectedClass.saleMode === 'presale' ? 'text-purple-600 font-bold' : 'text-gray-900'}>{selectedClass.saleMode === 'presale' ? '预售班' : '普通班'}</span></div>
                <div className="flex"><span className="text-gray-400 w-32 inline-block">收费模式：</span><span className="text-gray-900">{selectedClass.chargeMode === 'whole' ? '整期' : '分期'}</span></div>
                <div className="flex"><span className="text-gray-400 w-32 inline-block">产品费用：</span><span className="text-red-500 font-bold">¥{selectedClass.price}</span></div>
                <div className="flex"><span className="text-gray-400 w-32 inline-block">教辅费用：</span><span className="text-red-500 font-bold">¥{selectedClass.materialPrice || 0}</span></div>
                
                {selectedClass.saleMode === 'presale' && selectedClass.presaleInfo && (
                  <>
                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-gray-800 font-medium mb-4">预售信息</div>
                    </div>
                    <div className="flex"><span className="text-gray-400 w-32 inline-block">定金：</span><span className="text-purple-600 font-bold">¥{selectedClass.presaleInfo.deposit}</span></div>
                    <div className="flex"><span className="text-gray-400 w-32 inline-block">最低开班人数：</span><span className="text-gray-900">{selectedClass.presaleInfo.minStudents}人</span></div>
                    <div className="flex"><span className="text-gray-400 w-32 inline-block">已付定金人数：</span><span className="text-gray-900">{selectedClass.presaleInfo.depositedCount}人</span></div>
                    <div className="flex"><span className="text-gray-400 w-32 inline-block">组班截止时间：</span><span className="text-gray-900">{selectedClass.presaleInfo.deadline}</span></div>
                    <div className="flex">
                      <span className="text-gray-400 w-32 inline-block">预售状态：</span>
                      <span className={`font-medium ${selectedClass.presaleInfo.status === 'success' ? 'text-green-600' : selectedClass.presaleInfo.status === 'preparing' ? 'text-orange-600' : 'text-red-600'}`}>
                        {selectedClass.presaleInfo.status === 'success' ? '预售成功' : selectedClass.presaleInfo.status === 'preparing' ? '预售中' : '预售失败'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeDetailTab === 'changes' && (
              <div>
                <table className="w-full text-sm text-left border border-gray-100 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="p-3">序号</th>
                      <th className="p-3">变动信息</th>
                      <th className="p-3">变动时间</th>
                      <th className="p-3">操作人</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockChanges.map((log) => (
                      <tr key={log.id}>
                        <td className="p-3 text-gray-600">{log.id}</td>
                        <td className="p-3 text-gray-800">{log.info}</td>
                        <td className="p-3 text-gray-600">{log.time}</td>
                        <td className="p-3 text-gray-600">{log.operator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeDetailTab === 'students' && (
              <div>
                {/* Student Tab Switcher */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex border border-gray-200 rounded overflow-hidden">
                    <button
                      onClick={() => setStudentTab('current')}
                      className={`px-4 py-2 text-sm font-medium ${
                        studentTab === 'current'
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      在班学生
                    </button>
                    <button
                      onClick={() => setStudentTab('history')}
                      className={`px-4 py-2 text-sm font-medium border-l border-gray-200 ${
                        studentTab === 'history'
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      历史在班学生
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    共计{enrolledStudents.length}人
                  </span>
                </div>

                <table className="w-full text-sm text-left border border-gray-100 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="p-3">学员ID</th>
                      <th className="p-3">学员姓名</th>
                      <th className="p-3">性别</th>
                      <th className="p-3">登录账号</th>
                      <th className="p-3">入班时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enrolledStudents.map((s) => (
                      <tr key={s.id}>
                        <td className="p-3 text-gray-600">{s.id}</td>
                        <td className="p-3">
                          <span
                            className="text-gray-800 font-medium cursor-pointer hover:text-primary hover:underline"
                            onClick={() => {
                              if (onNavigateToStudent) {
                                onNavigateToStudent(s.id);
                              }
                            }}
                          >
                            {s.name}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{s.gender}</td>
                        <td className="p-3 text-gray-600">{s.account}</td>
                        <td className="p-3 text-gray-600">2025-07-01 10:00</td>
                      </tr>
                    ))}
                    {enrolledStudents.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-400">暂无学员</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        lesson={selectedLesson}
      />
    </div>
  );
};

export default ClassDetailPage;