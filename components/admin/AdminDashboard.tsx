import React, { useState } from 'react';
import { ViewType, ClassInfo, Lesson, Course, Product, Role } from '../../types';
import { PRODUCTS } from '../../constants';
import ClassManagement from './ClassManagement';
import CoursePath from './CoursePath';
import TeacherManagement from './TeacherManagement';
import StudentManagement from './StudentManagement';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import RoleSwitcher from '../RoleSwitcher';

interface AdminDashboardProps {
  currentRole: Role;
  onSwitchRole: (role: Role) => void;
  classes: ClassInfo[];
  lessons: Lesson[];
  courses: Course[];
  setClasses: (c: ClassInfo[]) => void;
  setLessons: (l: Lesson[]) => void;
  setCourses: (c: Course[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  currentRole,
  onSwitchRole,
  classes, 
  lessons, 
  courses,
  setClasses, 
  setLessons,
  setCourses
}) => {
  const [activePanel, setActivePanel] = useState<string>('order');
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  const handleAddClass = (newClass: ClassInfo, newLessons: Lesson[]) => {
    setClasses([newClass, ...classes]);
    setLessons([...lessons, ...newLessons]);
  };

  const handleUpdateLessons = (updatedLessons: Lesson[]) => {
    setLessons(updatedLessons);
  };

  const handleAddCourse = (newCourse: Course) => {
    setCourses([newCourse, ...courses]);
  };
  
  const handleAddProduct = (newProduct: Product) => {
    setProducts([...products, newProduct]);
  };

  const handleUpdateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(products.map(p => p.id === productId ? { ...p, ...updates } : p));
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
      <div className="w-[200px] border-r border-gray-200 flex flex-col flex-shrink-0 bg-white h-full z-10">
        <div className="px-5 pb-8 pt-5 font-bold text-lg text-primary">
          思悦教育 <span className="text-xs text-gray-400 font-normal block mt-1">后台管理</span>
        </div>
        
        <div className="flex-1 flex flex-col">
          <NavItem id="course" label="课程路径" />
          <NavItem id="class" label="班级管理" />
          <NavItem id="teacher" label="教师管理" />
          <NavItem id="student" label="学生管理" />
          <NavItem id="product" label="商品管理" />
          <NavItem id="order" label="订单管理" />
        </div>

        <RoleSwitcher currentRole={currentRole} onSwitch={onSwitchRole} />
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
        {activePanel === 'product' && (
          <ProductManagement 
            products={products}
            courses={courses}
            classes={classes}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
          />
        )}
        {activePanel === 'order' && (
          <OrderManagement />
        )}
        {activePanel !== 'class' && activePanel !== 'course' && activePanel !== 'teacher' && activePanel !== 'student' && activePanel !== 'product' && activePanel !== 'order' && (
          <div className="flex items-center justify-center h-full text-gray-400">
            {activePanel} 功能模块开发中...
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
