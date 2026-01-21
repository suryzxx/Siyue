import React, { useState } from 'react';
import { LESSONS } from '../constants';
import { Lesson } from '../types';
import AttendanceModal from './AttendanceModal';

interface ClassScheduleProps {
  classId: string;
}

const ClassSchedule: React.FC<ClassScheduleProps> = ({ classId }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  // Filter lessons for this class and sort by date
  const classLessons = LESSONS
    .filter(l => l.classId === classId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getStatusBadge = (status: Lesson['status']) => {
    switch (status) {
      case 'completed':
        return <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs border border-green-100">已完成</span>;
      case 'pending':
        return <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded text-xs border border-orange-100">未开始</span>;
      default:
        return <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">已取消</span>;
    }
  };

  return (
    <div className="flex-1 bg-bg-gray p-8 overflow-y-auto h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <th className="py-4 px-6 font-semibold">课节名称</th>
              <th className="py-4 px-6 font-semibold">上课时间</th>
              <th className="py-4 px-6 font-semibold">状态</th>
              <th className="py-4 px-6 font-semibold text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {classLessons.length > 0 ? (
              classLessons.map((lesson) => (
                <tr key={lesson.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0">
                  <td className="py-4 px-6 text-sm font-medium text-gray-800">{lesson.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {lesson.date} <span className="text-gray-400 mx-1">|</span> {lesson.startTime}-{lesson.endTime}
                  </td>
                  <td className="py-4 px-6">{getStatusBadge(lesson.status)}</td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => setSelectedLesson(lesson)}
                      className="text-primary border border-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded text-xs transition-all"
                    >
                      考勤
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-400 text-sm">暂无课程安排</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AttendanceModal 
        isOpen={!!selectedLesson} 
        onClose={() => setSelectedLesson(null)} 
        lesson={selectedLesson}
      />
    </div>
  );
};

export default ClassSchedule;
