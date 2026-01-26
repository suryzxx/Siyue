
import React, { useState } from 'react';
import { ClassInfo, Lesson, Course, Product } from '../../types';
import { PRODUCTS } from '../../constants';
import ClassManagement from './ClassManagement';
import CoursePath from './CoursePath';
import TeacherManagement from './TeacherManagement'; // Using this as Employee Management
import AddressManagement from './AddressManagement';
import SystemSettings from './SystemSettings';
import StudentManagement from './StudentManagement';
import OrderManagement from './OrderManagement';

interface AdminDashboardProps {
  classes: ClassInfo[];
  lessons: Lesson[];
  courses: Course[];
  setClasses: (c: ClassInfo[]) => void;
  setLessons: (l: Lesson[]) => void;
  setCourses: (c: Course[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  classes, 
  lessons, 
  courses,
  setClasses, 
  setLessons,
  setCourses
}) => {
  const [activePanel, setActivePanel] = useState<string>('class'); // Default to class management
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);

  const handleAddClass = (newClass: ClassInfo, newLessons: Lesson[]) => {
    // Check if class exists (update mode)
    const exists = classes.some(c => c.id === newClass.id);
    if (exists) {
        setClasses(classes.map(c => c.id === newClass.id ? newClass : c));
        // For lessons: remove old lessons for this class and add new ones
        const otherLessons = lessons.filter(l => l.classId !== newClass.id);
        setLessons([...otherLessons, ...newLessons]);
    } else {
        // Create mode
        setClasses([newClass, ...classes]);
        setLessons([...lessons, ...newLessons]);
    }
  };

  const handleUpdateLessons = (updatedLessons: Lesson[]) => {
    setLessons(updatedLessons);
  };

  const handleAddCourse = (newCourse: Course) => {
    setCourses([newCourse, ...courses]);
  };

  const NavItem = ({ id, label, indent = false }: { id: string, label: string, indent?: boolean }) => (
    <div 
      onClick={() => setActivePanel(id)}
      className={`px-6 py-3 cursor-pointer transition-colors flex items-center text-sm font-medium ${
        activePanel === id 
          ? 'bg-primary-light text-primary border-r-4 border-primary' 
          : 'text-gray-600 hover:bg-gray-50'
      } ${indent ? 'pl-10' : ''}`}
    >
      {label}
    </div>
  );

  return (
    <div className="flex h-screen w-screen bg-white text-text-main overflow-hidden">
      {/* Admin Sidebar */}
      <div className="w-[200px] border-r border-gray-200 flex flex-col flex-shrink-0 bg-white h-full z-10 relative">
        <div className="px-5 pb-8 pt-5 font-bold text-lg text-primary">
          思悦教育 <span className="text-xs text-gray-400 font-normal block mt-1">后台管理</span>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
          <NavItem id="course" label="课程路径" />
          <NavItem id="class" label="班级管理" />
          
          {/* Basic Settings Group */}
          <div 
            onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
            className="px-6 py-3 cursor-pointer transition-colors flex items-center justify-between text-sm font-medium text-gray-600 hover:bg-gray-50 select-none"
          >
             <span>基础设置</span>
             <span className="text-[10px] text-gray-400">{isSettingsExpanded ? '▼' : '▶'}</span>
          </div>
          
          {isSettingsExpanded && (
            <>
              <NavItem id="employee" label="员工管理" indent />
              <NavItem id="address" label="地址管理" indent />
              <NavItem id="system" label="系统设置" indent />
            </>
          )}

          <div className="my-2 border-t border-gray-100 mx-4"></div>
          
          <NavItem id="student" label="学生管理" />
          <NavItem id="order" label="订单管理" />
        </div>
      </div>

      {/* Admin Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-gray relative">
        {activePanel === 'class' && (
          <ClassManagement 
            classes={classes} 
            lessons={lessons} 
            onAddClass={handleAddClass}
            onUpdateLessons={handleUpdateLessons}
          />
        )}
        {activePanel === 'course' && (
          <CoursePath 
            courses={courses}
            onAddCourse={handleAddCourse}
          />
        )}
        {activePanel === 'employee' && (
          <TeacherManagement />
        )}
        {activePanel === 'address' && (
          <AddressManagement />
        )}
        {activePanel === 'system' && (
          <SystemSettings />
        )}
        {activePanel === 'student' && (
          <StudentManagement />
        )}
        {activePanel === 'order' && (
          <OrderManagement />
        )}
        {![ 'class', 'course', 'employee', 'address', 'system', 'student', 'order' ].includes(activePanel) && (
          <div className="flex items-center justify-center h-full text-gray-400">
            {activePanel} 功能模块开发中...
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
