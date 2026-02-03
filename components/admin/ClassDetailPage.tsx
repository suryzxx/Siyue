import React, { useState } from 'react';
import { ClassInfo, Lesson } from '../../types';
import { COURSES, TEACHERS, ADMIN_STUDENTS } from '../../constants';

interface ClassDetailPageProps {
  classId: string;
  classes: ClassInfo[];
  lessons: Lesson[];
  onBack: () => void;
  onEdit?: (classInfo: ClassInfo) => void;
}

const ClassDetailPage: React.FC<ClassDetailPageProps> = ({ 
  classId, 
  classes, 
  lessons, 
  onBack,
  onEdit 
}) => {
  const [activeDetailTab, setActiveDetailTab] = useState<'basic' | 'course' | 'sales' | 'changes' | 'students'>('basic');
  
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
  
  const mockChanges = [
    { id: 1, info: '修改了上课时间', time: '2025-06-20 10:00:00', operator: '管理员A' },
    { id: 2, info: '创建班级', time: '2025-06-15 09:30:00', operator: '管理员B' },
  ];

  const enrolledStudents = ADMIN_STUDENTS.slice(0, selectedClass.studentCount || 3);

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
            {['basic', 'course', 'sales', 'changes', 'students'].map(tab => (
              <div 
                key={tab}
                onClick={() => setActiveDetailTab(tab as any)}
                className={`px-6 py-3 text-sm font-medium cursor-pointer relative ${
                  activeDetailTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'basic' && '基本信息'}
                {tab === 'course' && '产品信息'}
                {tab === 'sales' && '售卖信息'}
                {tab === 'changes' && '变动信息'}
                {tab === 'students' && '班级学员'}
                {activeDetailTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-6">
            {activeDetailTab === 'basic' && (
              <div className="grid grid-cols-2 gap-y-6 text-sm text-gray-600">
                <div className="col-span-2"><span className="text-gray-400 w-24 inline-block">产品名称：</span><span className="text-gray-900">{course?.name}</span></div>
                <div className="col-span-2"><span className="text-gray-400 w-24 inline-block">班级名称：</span><span className="text-gray-900">{selectedClass.name}</span></div>
                <div><span className="text-gray-400 w-24 inline-block">年份：</span><span className="text-gray-900">{selectedClass.year || course?.year}</span></div>
                <div><span className="text-gray-400 w-24 inline-block">学期：</span><span className="text-gray-900">{selectedClass.semester || '-'}</span></div>
                <div><span className="text-gray-400 w-24 inline-block">面授老师：</span><span className="text-gray-900">{teacher?.name}</span></div>
                <div><span className="text-gray-400 w-24 inline-block">校区：</span><span className="text-gray-900">{selectedClass.campus}</span></div>
                <div><span className="text-gray-400 w-24 inline-block">预招人数：</span><span className="text-gray-900">{selectedClass.capacity}</span></div>
                <div><span className="text-gray-400 w-24 inline-block">调课位：</span><span className="text-gray-900">{selectedClass.virtualSeats || 0}</span></div>
                <div><span className="text-gray-400 w-24 inline-block">教室：</span><span className="text-gray-900">{selectedClass.classroom || '-'}</span></div>
                <div><span className="text-gray-400 w-24 inline-block">助教：</span><span className="text-gray-900">{selectedClass.assistant || '0'}</span></div>
                <div><span className="text-gray-400 w-24 inline-block">年级：</span><span className="text-gray-900">{selectedClass.grade || '-'}</span></div>
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
                      <th className="p-3">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {classLessons.map((l, idx) => (
                      <tr key={l.id}>
                        <td className="p-3 text-gray-600">{idx + 1}</td>
                        <td className="p-3 text-gray-800">{l.name}</td>
                        <td className="p-3 text-gray-600">{l.date}</td>
                        <td className="p-3 text-gray-600">{l.startTime} - {l.endTime}</td>
                        <td className="p-3">
                          {l.status === 'completed' && <span className="text-green-500">已完成</span>}
                          {l.status === 'pending' && <span className="text-orange-500">未开始</span>}
                        </td>
                      </tr>
                    ))}
                    {classLessons.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-400">暂无课节信息</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {activeDetailTab === 'sales' && (
              <div className="grid grid-cols-1 gap-y-6 text-sm text-gray-600 max-w-2xl">
                <div className="flex"><span className="text-gray-400 w-32 inline-block">收费模式：</span><span className="text-gray-900">{selectedClass.chargeMode === 'whole' ? '整期' : '分期'}</span></div>
                <div className="flex"><span className="text-gray-400 w-32 inline-block">产品费用：</span><span className="text-red-500 font-bold">¥{selectedClass.price}</span></div>
                <div className="flex"><span className="text-gray-400 w-32 inline-block">教辅费用：</span><span className="text-red-500 font-bold">¥{selectedClass.materialPrice || 0}</span></div>
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
                <table className="w-full text-sm text-left border border-gray-100 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="p-3">学员姓名</th>
                      <th className="p-3">性别</th>
                      <th className="p-3">登录账号</th>
                      <th className="p-3">入班时间</th>
                      <th className="p-3">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enrolledStudents.map((s) => (
                      <tr key={s.id}>
                        <td className="p-3 text-gray-800 font-medium">{s.name}</td>
                        <td className="p-3 text-gray-600">{s.gender}</td>
                        <td className="p-3 text-gray-600">{s.account}</td>
                        <td className="p-3 text-gray-600">2025-07-01 10:00</td>
                        <td className="p-3"><span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs">在读</span></td>
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
    </div>
  );
};

export default ClassDetailPage;