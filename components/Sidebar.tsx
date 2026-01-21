import React from 'react';
import { ViewType, Role } from '../types';
import RoleSwitcher from './RoleSwitcher';

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
  currentRole: Role;
  onSwitchRole: (role: Role) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, currentRole, onSwitchRole }) => {
  return (
    <div className="w-[200px] border-r border-gray-200 flex flex-col flex-shrink-0 bg-white h-full">
      <div className="px-5 pb-8 pt-5 font-bold text-lg text-primary">
        思悦教育
      </div>
      
      <div className="flex-1 flex flex-col">
        <div 
          onClick={() => onChangeView('class')}
          className={`px-6 py-3 cursor-pointer transition-colors flex items-center text-sm font-medium ${
            currentView === 'class' 
              ? 'bg-primary-light text-primary border-r-4 border-primary' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="mr-3">🎓</span>
          我的班级
        </div>
        
        <div 
          onClick={() => onChangeView('schedule')}
          className={`px-6 py-3 cursor-pointer transition-colors flex items-center text-sm font-medium ${
            currentView === 'schedule' 
              ? 'bg-primary-light text-primary border-r-4 border-primary' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="mr-3">📅</span>
          我的课表
        </div>
      </div>

      <RoleSwitcher currentRole={currentRole} onSwitch={onSwitchRole} />
    </div>
  );
};

export default Sidebar;
