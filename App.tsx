import React, { useState } from 'react';
import AdminDashboard from './components/admin/AdminDashboard';
import { ClassInfo, Lesson, Course } from './types';
import { CLASSES as MOCK_CLASSES, LESSONS as MOCK_LESSONS, COURSES as MOCK_COURSES } from './constants';

const App: React.FC = () => {
  // Global Data State
  const [classes, setClasses] = useState<ClassInfo[]>(MOCK_CLASSES);
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  
  return (
    <div className="h-screen w-screen bg-white text-text-main overflow-hidden">
      <AdminDashboard 
        classes={classes}
        lessons={lessons}
        courses={courses}
        setClasses={setClasses}
        setLessons={setLessons}
        setCourses={setCourses}
      />
    </div>
  );
};

export default App;