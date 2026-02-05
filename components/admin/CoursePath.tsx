
import React, { useState, useEffect } from 'react';
import { Course, CourseType, CourseLesson } from '../../types';

interface CoursePathProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onUpdateCourse: (updatedCourse: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
}

const GRADE_CLASS_TYPES: Record<string, string[]> = {
  'K1': ['K1启蒙'],
  'K2': ['K2启蒙', 'K2进阶'],
  'K3': ['K3启蒙', 'K3进阶', 'K3飞跃'],
  'G1': ['1A', '1A+', '1S', '1S+', '1R', '1R预备'],
  'G2': ['2A', '2A+', '2S', '2S+', '2R', '2R预备'],
  'G3': ['3A', '3A+', '3S', '3S+', '3R'],
  'G4': ['4A', '4A+', '4S', '4S+', '4R'],
  'G5': ['5A', '5A+', '5S', '5S+', '5R'],
  'G6': ['6A', '6A+', '6S', '6S+', '6R'],
  'G7': ['G7国际托管班', 'G7国际菁英班', 'G7国际英才'],
  'G8': ['G8国际托管班', 'G8国际菁英班', 'G8国际英才'],
  'G9': ['G9国际托管班', 'G9国际菁英班', 'G9国际英才'],
};

const CoursePath: React.FC<CoursePathProps> = ({ courses, onAddCourse, onUpdateCourse }) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[1]?.id || courses[0]?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Lesson Modal State
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [newLessonName, setNewLessonName] = useState('');

  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Course Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'long-term' as CourseType,
    semester: '暑期',
    subject: '英语',
    grade: '',
    classType: '',
    description: '',
    tags: '',
    lessonCount: 0,
  });

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  const filteredCourses = courses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSaveCourse = () => {
    if (!formData.name) {
      alert('请输入产品名称');
      return;
    }

    if (!formData.lessonCount || formData.lessonCount <= 0) {
      alert('请输入课节数量');
      return;
    }

    setIsSaving(true);
    try {
      const lessonCount = formData.lessonCount;
      const lessons = lessonCount > 0 ? Array.from({ length: lessonCount }, (_, index) => ({
        id: `cl-${Date.now()}-${index}`,
        name: `第${index + 1}讲`,
        taskCount: 0,
        order: index + 1,
        isOnlineBound: true
      })) : [];

      const newCourse: Course = {
        id: `new-${Date.now()}`,
        name: formData.name,
        type: formData.type,
        lessonCount: lessonCount,
        semester: formData.semester,
        subject: formData.subject,
        grade: formData.grade,
        classType: formData.classType,
        description: formData.description,
        tags: formData.tags.split(' ').filter(t => t),
        lessons: lessons
      };

      onAddCourse(newCourse);
      setShowModal(false);
      setSelectedCourseId(newCourse.id);
      resetForm();
      alert('产品创建成功！');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('创建失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLesson = () => {
    if (!newLessonName) {
        alert('请输入课节名称');
        return;
    }

    const currentLessons = selectedCourse.lessons || [];
    const nextOrder = currentLessons.length + 1;
    
    const newLesson: CourseLesson = {
        id: `cl-${Date.now()}`,
        name: newLessonName,
        taskCount: 0,
        order: nextOrder,
        isOnlineBound: false
    };

    const updatedCourse: Course = {
        ...selectedCourse,
        lessons: [...currentLessons, newLesson],
        lessonCount: (selectedCourse.lessonCount || 0) + 1
    };

    onUpdateCourse(updatedCourse);
    setShowLessonModal(false);
    setNewLessonName('');
  };

  const resetForm = () => {
    setFormData({
        name: '',
        type: 'long-term',
        semester: '暑期',
        subject: '英语',
        grade: '',
        classType: '',
        description: '',
        tags: '',
        lessonCount: 0,
    });
  };

  const handleGradeChange = (grade: string) => {
      setFormData({
          ...formData,
          grade,
          classType: '' // reset class type when grade changes
      });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.relative')) {
        setShowDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(null);
        setShowModal(false);
        setShowLessonModal(false);
        setIsEditing(false);
        setEditingCourseId(null);
        resetForm();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDropdown]);

  const handleEditCourse = (course: Course) => {
    setIsEditing(true);
    setEditingCourseId(course.id);
    setFormData({
      name: course.name,
      type: course.type,
      semester: course.semester,
      subject: course.subject,
      grade: course.grade,
      classType: course.classType,
      description: course.description,
      tags: course.tags.join(' '),
      lessonCount: course.lessonCount,
    });
    setShowModal(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('确定要删除这个产品吗？')) {
      setIsDeleting(true);
      try {
        if (onDeleteCourse) {
          onDeleteCourse(courseId);
        } else {
          // Fallback to local state if onDeleteCourse is not provided
          const updatedCourses = courses.filter(c => c.id !== courseId);
          if (updatedCourses.length > 0 && selectedCourseId === courseId) {
            setSelectedCourseId(updatedCourses[0].id);
          }
        }
        setShowDropdown(null);
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('删除失败，请重试');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleUpdateCourse = () => {
    if (!formData.name) {
      alert('请输入产品名称');
      return;
    }

    if (!formData.lessonCount || formData.lessonCount <= 0) {
      alert('请输入讲次数量');
      return;
    }

    setIsSaving(true);
    try {
      const updatedCourse: Course = {
        id: editingCourseId || `updated-${Date.now()}`,
        name: formData.name,
        type: formData.type,
        lessonCount: formData.lessonCount,
        semester: formData.semester,
        subject: formData.subject,
        grade: formData.grade,
        classType: formData.classType,
        description: formData.description,
        tags: formData.tags.split(' ').filter(t => t),
        lessons: selectedCourse.lessons || [], // Keep existing lessons
      };

      onUpdateCourse(updatedCourse);
      setShowModal(false);
      setIsEditing(false);
      setEditingCourseId(null);
      resetForm();
      alert('产品更新成功！');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('更新失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full bg-bg-gray overflow-hidden">
      {/* Left Sidebar: Course List */}
      <div className="w-[280px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">产品</h2>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-primary hover:bg-teal-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1"
          >
            <span>+</span> 新建产品
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative">
             <input 
               type="text" 
               placeholder="搜索产品" 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm pl-8 focus:outline-none focus:border-primary"
             />
             <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">🔍</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredCourses.map(course => (
            <div 
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={`px-6 py-4 cursor-pointer border-b border-gray-50 flex items-center justify-between group transition-colors ${
                selectedCourseId === course.id ? 'bg-[#EAF6F5] text-primary' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium text-sm truncate">{course.name}</span>
              <div className="relative">
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(showDropdown === course.id ? null : course.id);
                  }}
                  className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  •••
                </span>
                
                {showDropdown === course.id && (
                  <div className="absolute right-0 top-6 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCourse(course);
                          setShowDropdown(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        编辑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id);
                          setShowDropdown(null);
                        }}
                        disabled={isDeleting}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? '删除中...' : '删除'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content: Lesson Grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">{selectedCourse.name}</h2>
          <button 
            onClick={() => { setNewLessonName(''); setShowLessonModal(true); }}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-1.5 rounded text-sm transition-colors flex items-center gap-1"
          >
             <span>+</span> 新建额外任务
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
           {selectedCourse.lessons && selectedCourse.lessons.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {selectedCourse.lessons.map((lesson) => (
                  <div key={lesson.id} className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="flex items-start gap-3">
                       <div className="w-8 h-8 rounded-full bg-[#EAF6F5] text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                         {lesson.order}
                       </div>
                       <div className="flex-1">
                         <h4 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2" title={lesson.name}>{lesson.name}</h4>
                         <div className="flex items-center gap-2">
                            <p className="text-gray-400 text-xs">{lesson.taskCount} 任务</p>
                            {lesson.isOnlineBound !== undefined && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${lesson.isOnlineBound ? 'border-blue-200 text-blue-500 bg-blue-50' : 'border-gray-200 text-gray-400 bg-gray-50'}`}>
                                    {lesson.isOnlineBound ? '正式讲次' : '额外任务'}
                                </span>
                            )}
                         </div>
                       </div>
                       <button className="text-gray-300 hover:text-gray-600">⋮</button>
                    </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <div className="text-4xl mb-4">📭</div>
               <p>暂无课节，请点击右上角新建</p>
             </div>
           )}
        </div>
      </div>

      {/* New Lesson Modal (Based on Screenshot) */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-[500px] flex flex-col overflow-hidden animate-fade-in">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">新建额外课节</h3>
                    <button onClick={() => setShowLessonModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                
                <div className="p-8">
                    <div className="flex items-center">
                        <label className="w-24 text-sm text-gray-600 text-right mr-4 font-medium whitespace-nowrap">
                            <span className="text-red-500 mr-1">*</span>额外任务名称：
                        </label>
                        <input 
                            className="flex-1 border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary placeholder-gray-400"
                            placeholder="请输入额外任务名称"
                            value={newLessonName}
                            onChange={e => setNewLessonName(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button 
                        onClick={() => setShowLessonModal(false)}
                        className="px-6 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm font-medium"
                    >
                        取 消
                    </button>
                    <button 
                        onClick={handleAddLesson}
                        className="px-6 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm font-medium"
                    >
                        确 定
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-lg shadow-xl w-[600px] flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-gray-800">{isEditing ? '编辑产品' : '新建产品'}</h3>
                <button onClick={() => {
        setShowModal(false);
        setIsEditing(false);
        setEditingCourseId(null);
        resetForm();
      }} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
              </div>
             
             <div className="p-6 overflow-y-auto space-y-5">
               
               <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5"><span className="text-red-500 mr-1">*</span>产品名称 :</label>
                 <input 
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="请输入产品名称"
                   className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                 />
               </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5"><span className="text-red-500 mr-1">*</span>产品类型 :</label>
                      <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as CourseType})}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                      >
                        <option value="long-term">体系课</option>
                        <option value="short-term">专项课</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5"><span className="text-red-500 mr-1">*</span>讲次数量 :</label>
                      <input 
                        type="number"
                        min="1"
                        max="100"
                        value={formData.lessonCount || ''}
                        onChange={e => setFormData({...formData, lessonCount: parseInt(e.target.value) || 0})}
                        placeholder="请输入课节数量"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        disabled={isEditing}
                      />
                    </div>
                </div>

               <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-600 mb-1.5"><span className="text-red-500 mr-1">*</span>学期 :</label>
                     <select 
                       value={formData.semester}
                       onChange={e => setFormData({...formData, semester: e.target.value})}
                       className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                     >
                       <option value="春季">春季</option>
                       <option value="暑期">暑期</option>
                       <option value="秋季">秋季</option>
                       <option value="寒假">寒假</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-600 mb-1.5"><span className="text-red-500 mr-1">*</span>学科 :</label>
                     <select 
                       value={formData.subject}
                       onChange={e => setFormData({...formData, subject: e.target.value})}
                       className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                     >
                       <option value="英语">英语</option>
                       <option value="其他">其他</option>
                     </select>
                   </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-600 mb-1.5"><span className="text-red-500 mr-1">*</span>班层 :</label>
                 <div className="grid grid-cols-2 gap-4">
                     <select 
                       value={formData.grade}
                       onChange={e => handleGradeChange(e.target.value)}
                       className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                     >
                       <option value="">请选择年级</option>
                       {Object.keys(GRADE_CLASS_TYPES).map(g => <option key={g} value={g}>{g}</option>)}
                     </select>
                     <select 
                       value={formData.classType}
                       onChange={e => setFormData({...formData, classType: e.target.value})}
                       className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                       disabled={!formData.grade}
                     >
                       <option value="">请选择班型</option>
                       {formData.grade && GRADE_CLASS_TYPES[formData.grade]?.map(t => (
                           <option key={t} value={t}>{t}</option>
                       ))}
                     </select>
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-600 mb-1.5"><span className="text-red-500 mr-1">*</span>封面 :</label>
                 <div className="w-[100px] h-[100px] border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-gray-50 text-gray-400">
                   <span className="text-2xl mb-1">+</span>
                   <span className="text-xs">上传图片</span>
                 </div>
               </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5"><span className="text-red-500 mr-1">*</span>产品介绍 :</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="请输入产品介绍"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">标签 :</label>
                  <input 
                    value={formData.tags}
                    onChange={e => setFormData({...formData, tags: e.target.value})}
                    placeholder="请输入标签 (空格分隔)"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

             </div>

              <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={() => {
        setShowModal(false);
        setIsEditing(false);
        setEditingCourseId(null);
        resetForm();
      }} className="px-5 py-2 rounded text-sm text-gray-600 border border-gray-300 hover:bg-gray-50">取消</button>
                <button 
                  onClick={isEditing ? handleUpdateCourse : handleSaveCourse}
                  disabled={isSaving}
                  className="px-6 py-2 rounded text-sm text-white bg-primary hover:bg-teal-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? '处理中...' : (isEditing ? '更新' : '保存')}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CoursePath;
