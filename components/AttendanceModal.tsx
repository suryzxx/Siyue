import React, { useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceStatus, Lesson } from '../types';
import { ADMIN_STUDENTS } from '../constants';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson | null;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, lesson }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingRemark, setEditingRemark] = useState<string | null>(null);
  const [remarkInput, setRemarkInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initialRecords: AttendanceRecord[] = ADMIN_STUDENTS.slice(0, 4).map(s => ({
        studentId: s.id,
        status: 'none',
        remark: ''
      }));
      setRecords(initialRecords);
      setSelectedStudents(new Set());
      setOpenDropdown(null);
    }
  }, [isOpen]);

  if (!isOpen || !lesson) return null;

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => prev.map(r => 
      r.studentId === studentId ? { ...r, status } : r
    ));
    setOpenDropdown(null);
  };

  const toggleSelect = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const toggleSelectAll = () => {
    const allIds = records.map(r => r.studentId);
    if (selectedStudents.size === allIds.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(allIds));
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return '出勤';
      case 'absent': return '旷课';
      case 'late': return '迟到';
      case 'excused': return '请假';
      default: return '未考勤';
    }
  };

  const getAttendanceStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return '已出勤';
      case 'absent': return '旷课';
      case 'late': return '迟到';
      case 'excused': return '请假';
      default: return '未考勤';
    }
  };

  const startEditRemark = (studentId: string, currentRemark: string = '') => {
    setEditingRemark(studentId);
    setRemarkInput(currentRemark);
  };

  const saveRemark = (studentId: string) => {
    setRecords(prev => prev.map(r => 
      r.studentId === studentId ? { ...r, remark: remarkInput } : r
    ));
    setEditingRemark(null);
    setRemarkInput('');
  };

  const handleSave = () => {
    alert(`成功保存 ${lesson.name} 的考勤记录`);
    onClose();
  };

  const formatPhone = (account: string) => {
    if (account.length === 11) {
      return account.slice(0, 3) + '****' + account.slice(7);
    }
    return account;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[900px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">讲次考勤</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Lesson Info */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          <div className="text-lg text-gray-800 font-medium">{lesson.name}</div>
          <div className="text-sm text-gray-500">
            上课时间 {lesson.date} {lesson.startTime}-{lesson.endTime}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-3 text-left w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedStudents.size === records.length && records.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="p-3 text-left font-medium">学生ID</th>
                <th className="p-3 text-left font-medium">学生姓名</th>
                <th className="p-3 text-left font-medium">联系电话</th>
                <th className="p-3 text-left font-medium">考勤状态</th>
                <th className="p-3 text-left font-medium">出勤情况</th>
                <th className="p-3 text-left font-medium">备注</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record) => {
                const student = ADMIN_STUDENTS.find(s => s.id === record.studentId);
                if (!student) return null;
                
                return (
                  <tr key={record.studentId} className="hover:bg-gray-50">
                    <td className="p-3">
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.has(record.studentId)}
                        onChange={() => toggleSelect(record.studentId)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3 text-gray-600">{student.id}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 font-medium">{student.name}</span>
                        {student.id === '4991' && (
                          <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-600 rounded">调班</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{formatPhone(student.account)}</td>
                    <td className="p-3 text-gray-600">
                      {getAttendanceStatusText(record.status)}
                    </td>
                    <td className="p-3">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === record.studentId ? null : record.studentId)}
                          className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-200 rounded hover:border-gray-300 bg-white text-sm min-w-[80px]"
                        >
                          <span>{getStatusLabel(record.status)}</span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {openDropdown === record.studentId && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg">
                            {(['present', 'late', 'excused', 'absent'] as AttendanceStatus[]).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(record.studentId, status)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                                  record.status === status ? 'text-blue-600 font-medium' : 'text-gray-700'
                                }`}
                              >
                                {getStatusLabel(status)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {editingRemark === record.studentId ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={remarkInput}
                            onChange={(e) => setRemarkInput(e.target.value)}
                            onBlur={() => saveRemark(record.studentId)}
                            onKeyDown={(e) => e.key === 'Enter' && saveRemark(record.studentId)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-24 focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditRemark(record.studentId, record.remark)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {record.remark ? (
                            <span className="text-sm text-gray-600">{record.remark}</span>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium min-w-[80px]"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium min-w-[80px]"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
