import React from 'react';
import { CLASSES } from '../constants';
import { ClassTabType } from '../types';

interface ClassHeaderProps {
  selectedClassId: string;
  onClassChange: (classId: string) => void;
  activeTab: ClassTabType;
  onTabChange: (tab: ClassTabType) => void;
}

const ClassHeader: React.FC<ClassHeaderProps> = ({ 
  selectedClassId, 
  onClassChange,
  activeTab,
  onTabChange
}) => {
  const currentClass = CLASSES.find(c => c.id === selectedClassId) || CLASSES[0];

  return (
    <div className="h-[60px] px-6 flex items-center justify-between border-b border-gray-200 bg-white">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-text-main">我的班级</span>
          <span className="text-gray-400 text-xs ml-2">切换班级:</span>
          <select 
            value={selectedClassId}
            onChange={(e) => onClassChange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 bg-white focus:outline-none focus:border-primary cursor-pointer hover:border-primary transition-colors"
          >
            {CLASSES.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} | {cls.timeSlot}
              </option>
            ))}
          </select>
          <span className="text-gray-400 text-xs ml-2">{currentClass.description}</span>
        </div>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-md">
        <div 
          onClick={() => onTabChange('tasks')}
          className={`px-4 py-1.5 rounded text-sm font-medium cursor-pointer transition-all ${
            activeTab === 'tasks' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          任务概览
        </div>
        <div 
          onClick={() => onTabChange('schedule')}
          className={`px-4 py-1.5 rounded text-sm font-medium cursor-pointer transition-all ${
            activeTab === 'schedule' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          班级课表
        </div>
      </div>
    </div>
  );
};

export default ClassHeader;
