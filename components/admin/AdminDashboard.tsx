
import React, { useState } from 'react';
import { ClassInfo, Lesson, Course, Product } from '../../types';
import { PRODUCTS } from '../../constants';
import ClassManagement from './ClassManagement';
import CoursePath from './CoursePath';
import TeacherManagement from './TeacherManagement';
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

  const NavItem = ({ id, label }: { id: string, label: string }) => (
    <div 
      onClick={() => setActivePanel(id)}
      className={`px-6 py-3 cursor-pointer transition-colors flex items-center text-sm font-medium ${
        activePanel === id 
          ? 'bg-primary-light text-primary border-r-4 border-primary' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
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
        
        <div className="flex-1 flex flex-col">
          <NavItem id="course" label="课程路径" />
          <NavItem id="class" label="班级管理" />
          <NavItem id="teacher" label="教师管理" />
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
        {activePanel === 'teacher' && (
          <TeacherManagement />
        )}
        {activePanel === 'student' && (
          <StudentManagement />
        )}
        {activePanel === 'order' && (
          <OrderManagement />
        )}
        {activePanel !== 'class' && activePanel !== 'course' && activePanel !== 'teacher' && activePanel !== 'student' && activePanel !== 'order' && (
          <div className="flex items-center justify-center h-full text-gray-400">
            {activePanel} 功能模块开发中...
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
