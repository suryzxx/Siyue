import React, { useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceStatus, Lesson, Student } from '../types';
import { STUDENTS } from '../constants';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson | null;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, lesson }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Initialize records with default 'present' for all students
      const initialRecords: AttendanceRecord[] = STUDENTS.map(s => ({
        studentId: s.id,
        status: 'present'
      }));
      setRecords(initialRecords);
    }
  }, [isOpen]);

  if (!isOpen || !lesson) return null;

  const toggleStatus = (studentId: string) => {
    setRecords(prev => prev.map(r => {
      if (r.studentId !== studentId) return r;
      
      const statusCycle: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];
      const currentIndex = statusCycle.indexOf(r.status);
      const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
      
      return { ...r, status: nextStatus };
    }));
  };

  const getStatusStyle = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'bg-green-50 text-green-600 border-green-200';
      case 'absent': return 'bg-red-50 text-red-600 border-red-200';
      case 'late': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'excused': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return '出勤';
      case 'absent': return '缺勤';
      case 'late': return '迟到';
      case 'excused': return '请假';
      default: return '未定';
    }
  };

  const handleSave = () => {
    // In a real app, save to backend here
    alert(`成功保存 ${lesson.name} 的考勤记录`);
    onClose();
  };

  // Calculate stats
  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-[700px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{lesson.name} - 考勤</h3>
            <p className="text-sm text-gray-500 mt-1">{lesson.date} ({lesson.startTime}-{lesson.endTime})</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-3 bg-white border-b border-gray-100 flex gap-4 text-sm">
          <div className="text-green-600"><span className="font-bold">{presentCount}</span> 出勤</div>
          <div className="text-red-600"><span className="font-bold">{absentCount}</span> 缺勤</div>
          <div className="text-gray-400 ml-auto">点击状态可切换</div>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-4 gap-4">
             {STUDENTS.map(student => {
               const record = records.find(r => r.studentId === student.id);
               const status = record?.status || 'none';
               
               return (
                 <div key={student.id} className="border border-gray-100 rounded-lg p-3 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all">
                    <div className="font-medium text-gray-700">{student.name}</div>
                    <button 
                      onClick={() => toggleStatus(student.id)}
                      className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors w-full ${getStatusStyle(status)}`}
                    >
                      {getStatusLabel(status)}
                    </button>
                 </div>
               );
             })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 rounded-lg text-white bg-primary hover:bg-teal-600 shadow-sm shadow-teal-200 text-sm font-medium"
          >
            保存考勤
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
