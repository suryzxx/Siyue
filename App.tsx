import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ClassHeader from './components/ClassHeader';
import TaskOverview from './components/TaskOverview';
import ClassSchedule from './components/ClassSchedule';
import Calendar from './components/Calendar';
import AdminDashboard from './components/admin/AdminDashboard';
import ParentsApp from './components/parents/ParentsApp';
import StudentApp from './components/student/StudentApp';
import RoleSwitcher from './components/RoleSwitcher'; // Ensure import if needed for global use, though used in Sidebar
import { ViewType, ClassTabType, ClassInfo, Lesson, Course, Role } from './types';
import { CLASSES as MOCK_CLASSES, LESSONS as MOCK_LESSONS, COURSES as MOCK_COURSES } from './constants';

const App: React.FC = () => {
  // Global Data State
  const [classes, setClasses] = useState<ClassInfo[]>(MOCK_CLASSES);
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  
  // Role State
  const [currentRole, setCurrentRole] = useState<Role>('teacher');

  // User View Navigation State
  const [currentView, setCurrentView] = useState<ViewType>('class');
  
  // User Class View State
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'c1');
  const [activeTab, setActiveTab] = useState<ClassTabType>('tasks');

  // Handlers
  const handleNavigateToClass = (classId: string) => {
    setSelectedClassId(classId);
    setCurrentView('class');
    setActiveTab('schedule');
  };

  if (currentRole === 'admin') {
    return (
      <AdminDashboard 
        currentRole={currentRole}
        onSwitchRole={setCurrentRole}
        classes={classes}
        lessons={lessons}
        courses={courses}
        setClasses={setClasses}
        setLessons={setLessons}
        setCourses={setCourses}
      />
    );
  }

  if (currentRole === 'parents') {
    return (
        <div className="h-screen w-screen flex relative">
            <ParentsApp />
            {/* Overlay Role Switcher for Mobile Simulation Context */}
            <div className="absolute bottom-10 left-10">
                 <RoleSwitcher currentRole={currentRole} onSwitch={setCurrentRole} />
            </div>
        </div>
    );
  }

  if (currentRole === 'student') {
    return (
        <div className="h-screen w-screen flex relative">
            <StudentApp />
             <div className="absolute bottom-10 left-10">
                 <RoleSwitcher currentRole={currentRole} onSwitch={setCurrentRole} />
            </div>
        </div>
    );
  }

  // Default: Teacher View
  return (
    <div className="flex h-screen w-screen bg-white text-text-main overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        currentRole={currentRole}
        onSwitchRole={setCurrentRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {currentView === 'class' ? (
          <>
            <ClassHeader 
              selectedClassId={selectedClassId}
              onClassChange={setSelectedClassId}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            
            <div className="flex-1 overflow-hidden relative">
              {activeTab === 'tasks' ? (
                <TaskOverview />
              ) : (
                <ClassSchedule classId={selectedClassId} />
              )}
            </div>
          </>
        ) : (
          <Calendar onLessonClick={handleNavigateToClass} />
        )}
        
      </div>
    </div>
  );
};

export default App;
