
import React, { useState } from 'react';
import { Course, CourseType, CourseLesson } from '../../types';

interface CoursePathProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onUpdateCourse: (updatedCourse: Course) => void;
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
  const [isOnlineBound, setIsOnlineBound] = useState(true);

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
  });

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  const filteredCourses = courses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSaveCourse = () => {
    if (!formData.name) {
      alert('请输入课程名称');
      return;
    }

    const newCourse: Course = {
      id: `new-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      lessonCount: 0,
      semester: formData.semester,
      subject: formData.subject,
      grade: formData.grade,
      classType: formData.classType,
      description: formData.description,
      tags: formData.tags.split(' ').filter(t => t),
      lessons: []
    };

    onAddCourse(newCourse);
    setShowModal(false);
    setSelectedCourseId(newCourse.id);
    resetForm();
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
        isOnlineBound: isOnlineBound
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
    });
  };

  const handleGradeChange = (grade: string) => {
      setFormData({
          ...formData,
          grade,
          classType: '' // reset class type when grade changes
      });
  };

  return (
    <div className="flex h-full bg-bg-gray overflow-hidden">
      {/* Left Sidebar: Course List */}
      <div className="w-[280px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">课程产品</h2>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-primary hover:bg-teal-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1"
          >
            <span>+</span> 新建课程
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative">
             <input 
               type="text" 
               placeholder="搜索课程产品" 
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
              <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">•••</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content: Lesson Grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">{selectedCourse.name}</h2>
          <button 
            onClick={() => { setNewLessonName(''); setIsOnlineBound(true); setShowLessonModal(true); }}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-1.5 rounded text-sm transition-colors flex items-center gap-1"
          >
             <span>+</span> 新建课节
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
                                    {lesson.isOnlineBound ? '绑定线上' : '未绑定'}
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
                    <h3 className="text-lg font-bold text-gray-800">新建课节</h3>
                    <button onClick={() => setShowLessonModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                
                <div className="p-8">
                    <div className="flex items-center">
                        <label className="w-24 text-sm text-gray-600 text-right mr-4 font-medium whitespace-nowrap">
                            <span className="text-red-500 mr-1">*</span>课节名称：
                        </label>
                        <input 
                            className="flex-1 border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary placeholder-gray-400"
                            placeholder="请输入课节名称"
                            value={newLessonName}
                            onChange={e => setNewLessonName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    
                    <div className="flex items-center mt-5">
                        <label className="w-64 text-sm text-gray-600 text-right mr-4 font-medium whitespace-nowrap">
                            线上课节是否与面授课节绑定：
                        </label>
                        <div 
                            onClick={() => setIsOnlineBound(!isOnlineBound)}
                            className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${isOnlineBound ? 'bg-primary' : 'bg-gray-200'}`}
                        >
                            <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all shadow-sm ${isOnlineBound ? 'left-[20px]' : 'left-[2px]'}`}></div>
                        </div>
                        <span className="text-xs text-gray-400 ml-2">{isOnlineBound ? '是' : '否'}</span>
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
               <h3 className="text-lg font-bold text-gray-800">新建课程</h3>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
             </div>
             
             <div className="p-6 overflow-y-auto space-y-5">
               
               <div>
                 <label className="block text-sm font-medium text-gray-600 mb-1.5"><span className="text-red-500 mr-1">*</span>课程名称 :</label>
                 <input 
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   placeholder="请输入课程名称"
                   className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-600 mb-1.5"><span className="text-red-500 mr-1">*</span>课程类型 :</label>
                 <select 
                   value={formData.type}
                   onChange={e => setFormData({...formData, type: e.target.value as CourseType})}
                   className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                 >
                   <option value="long-term">长期课程</option>
                   <option value="short-term">短期课程</option>
                 </select>
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
                 <label className="block text-sm font-medium text-gray-600 mb-1.5"><span className="text-red-500 mr-1">*</span>路径描述 :</label>
                 <textarea 
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   placeholder="请输入路径描述"
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
               <button onClick={() => setShowModal(false)} className="px-5 py-2 rounded text-sm text-gray-600 border border-gray-300 hover:bg-gray-50">取消</button>
               <button onClick={handleSaveCourse} className="px-6 py-2 rounded text-sm text-white bg-primary hover:bg-teal-600 shadow-sm">保存</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CoursePath;
