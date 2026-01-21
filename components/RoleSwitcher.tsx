import React, { useState, useRef, useEffect } from 'react';
import { Role } from '../types';

interface RoleSwitcherProps {
  currentRole: Role;
  onSwitch: (role: Role) => void;
  isCollapsed?: boolean;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onSwitch, isCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: { id: Role; label: string; icon: string }[] = [
    { id: 'teacher', label: 'Teacher', icon: '👩‍🏫' },
    { id: 'admin', label: 'Admin', icon: '⚙️' },
    { id: 'parents', label: 'Parents', icon: '👨‍👩‍👧' },
    { id: 'student', label: 'Student', icon: '🎓' },
  ];

  const currentRoleLabel = roles.find(r => r.id === currentRole)?.label || currentRole;

  return (
    <div className="relative" ref={wrapperRef}>
      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => {
                onSwitch(role.id);
                setIsOpen(false);
              }}
              className={`px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                currentRole === role.id ? 'bg-primary-light text-primary' : 'text-gray-700'
              }`}
            >
              <span>{role.icon}</span>
              <span className="text-sm font-medium">{role.label}</span>
            </div>
          ))}
        </div>
      )}

      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 border-t border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between group"
        title="Switch Role"
      >
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs">
             {currentRoleLabel.charAt(0)}
           </div>
           <div className="flex flex-col">
             <span className="font-bold text-sm text-gray-800">{currentRoleLabel}</span>
             <span className="text-[10px] text-gray-400">点击切换角色</span>
           </div>
        </div>
        <span className="text-gray-400 text-xs">▲</span>
      </div>
    </div>
  );
};

export default RoleSwitcher;
