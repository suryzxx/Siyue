
import React, { useState, useEffect } from 'react';
import { ClassInfo, Lesson, Course, Product, StudentProfile } from '../../types';
import { PRODUCTS, ADMIN_STUDENTS } from '../../constants';
import ClassManagement from './ClassManagement';
import ClassDetailPage from './ClassDetailPage';
import CoursePath from './CoursePath';
import TeacherManagement from './TeacherManagement';
import AddressManagement from './AddressManagement';
import SystemSettings from './SystemSettings';
import StudentManagement from './StudentManagement';
import StudentDetailPage from './StudentDetailPage';
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
  const [activePanel, setActivePanel] = useState<string>('class');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);

  useEffect(() => {
    const handleNavigateToClassDetail = (event: CustomEvent<{ classId: string }>) => {
      const { classId } = event.detail;
      setSelectedClassId(classId);
      setActivePanel('class-detail');
    };

    const handleNavigateToStudentDetail = (event: CustomEvent<{ studentId: string }>) => {
      const { studentId } = event.detail;
      const student = ADMIN_STUDENTS.find(s => s.id === studentId);
      if (student) {
        setSelectedStudent(student);
        setActivePanel('student-detail');
      }
    };

    window.addEventListener('navigate-to-class-detail', handleNavigateToClassDetail as EventListener);
    window.addEventListener('navigate-to-student-detail', handleNavigateToStudentDetail as EventListener);

    return () => {
      window.removeEventListener('navigate-to-class-detail', handleNavigateToClassDetail as EventListener);
      window.removeEventListener('navigate-to-student-detail', handleNavigateToStudentDetail as EventListener);
    };
  }, []);

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

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
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
           <NavItem id="course" label="产品" />
           <NavItem id="class" label="班级管理" />
           
           <NavItem id="student" label="学生管理" />
          <NavItem id="order" label="订单管理" />
          
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
            onUpdateCourse={handleUpdateCourse}
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
          <StudentManagement onStudentSelect={(student) => {
            setSelectedStudent(student);
            setActivePanel('student-detail');
          }} />
        )}
        {activePanel === 'student-detail' && selectedStudent && (
          <StudentDetailPage student={selectedStudent} onBack={() => setActivePanel('student')} />
        )}
         {activePanel === 'order' && (
           <OrderManagement 
             onNavigateToClass={(classId) => {
               setSelectedClassId(classId);
               setActivePanel('class-detail');
             }}
             onNavigateToStudent={(studentId) => {
               const student = ADMIN_STUDENTS.find(s => s.id === studentId);
               if (student) {
                 setSelectedStudent(student);
                 setActivePanel('student-detail');
               }
             }}
           />
         )}
        {activePanel === 'class-detail' && selectedClassId && (
          <ClassDetailPage 
            classId={selectedClassId}
            classes={classes}
            lessons={lessons}
            onBack={() => {
              setSelectedClassId(null);
              setActivePanel('class');
            }}
          />
        )}
        {![ 'class', 'course', 'employee', 'address', 'system', 'student', 'student-detail', 'order', 'class-detail' ].includes(activePanel) && (
          <div className="flex items-center justify-center h-full text-gray-400">
            {activePanel} 功能模块开发中...
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
