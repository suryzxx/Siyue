
import React, { useState } from 'react';
import { Course, CourseType, CourseLesson } from '../../types';

interface SelfBuiltCourseProps {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  onNavigateToCreateClass?: () => void;
}

const SelfBuiltCourse: React.FC<SelfBuiltCourseProps> = ({ courses, setCourses, onNavigateToCreateClass }) => {
  const [filterName, setFilterName] = useState('');
  
  // Create/Edit Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    courseType: 'short-term' as CourseType, // 课程类型
    year: '2026', // 年份
    semester: '寒假', // 学期
    subject: '英语', // 学科
    grade: '小学组', // 年级
    classType: '无', // 班型
    name: '', // 课程名称
  });
  const [sessions, setSessions] = useState<CourseLesson[]>([]);

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2>(1);

  // Filter Logic
  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(filterName.toLowerCase())
  );

  const handleCreateCourse = () => {
    if (createStep === 1) {
        if (!formData.name) {
            alert('请输入课程名称');
            return;
        }
        setCreateStep(2);
    } else if (createStep === 2) {
        // Finalize creation or update
        if (editingId) {
            // Update Existing
            const updatedCourses = courses.map(c => {
                if (c.id === editingId) {
                    return {
                        ...c,
                        name: formData.name,
                        type: formData.courseType,
                        lessonCount: sessions.length,
                        year: formData.year,
                        semester: formData.semester,
                        subject: formData.subject,
                        grade: formData.grade,
                        classType: formData.classType,
                        lessons: sessions
                    };
                }
                return c;
            });
            setCourses(updatedCourses);
        } else {
            // Create New
            const newCourse: Course = {
                id: `course-${Date.now()}`,
                name: formData.name,
                type: formData.courseType,
                lessonCount: sessions.length,
                year: formData.year,
                semester: formData.semester,
                subject: formData.subject,
                grade: formData.grade,
                classType: formData.classType,
                status: 'active',
                lessons: sessions
            };
            setCourses([newCourse, ...courses]);
        }
        setCreateStep(3);
    } else {
        // Reset and close
        setShowCreateModal(false);
        resetForm();
    }
  };

  const handleEdit = (course: Course) => {
      setEditingId(course.id);
      setFormData({
          courseType: course.type || 'short-term',
          year: course.year || '2026',
          semester: course.semester || '寒假',
          subject: course.subject || '英语',
          grade: course.grade || '小学组',
          classType: course.classType || '无',
          name: course.name,
      });
      setSessions(course.lessons ? [...course.lessons] : []);
      setCreateStep(1);
      setShowCreateModal(true);
  };

  const handleAddSession = () => {
      const newSession: CourseLesson = {
          id: `sess-${Date.now()}`,
          name: `${formData.name} - 第${sessions.length + 1}讲`,
          taskCount: 0,
          order: sessions.length + 1
      };
      setSessions([...sessions, newSession]);
  };

  const resetForm = () => {
      setEditingId(null);
      setFormData({
        courseType: 'short-term',
        year: '2026',
        semester: '寒假',
        subject: '英语',
        grade: '小学组',
        classType: '无',
        name: '',
      });
      setSessions([]);
      setCreateStep(1);
  };

  // --- Render Steps ---

  const renderStepIndicator = (current: number, total: number, labels: string[]) => (
      <div className="flex justify-center items-center py-8 bg-white border-b border-gray-100 mb-6">
          {labels.map((label, idx) => {
              const step = idx + 1;
              return (
                <div key={step} className="flex items-center">
                    <div className={`flex items-center gap-2 ${current >= step ? 'text-primary' : 'text-gray-300'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                            current >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                            {step}
                        </div>
                        <span className="font-bold text-sm">{label}</span>
                    </div>
                    {idx < total - 1 && (
                        <div className="w-24 h-[1px] border-t border-dashed border-gray-300 mx-4"></div>
                    )}
                </div>
              );
          })}
      </div>
  );

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">自建课程</h2>
      </div>

      {/* Filter/Action Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">课程名称:</span>
           <div className="relative">
               <input 
                 className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-primary pl-8"
                 placeholder="请输入课程名称"
                 value={filterName}
                 onChange={e => setFilterName(e.target.value)}
               />
               <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3 ml-auto">
          <button 
            className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors"
          >
            搜索
          </button>
          <button 
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-1.5 rounded text-sm transition-colors"
            onClick={() => setFilterName('')}
          >
            重置
          </button>
          <button 
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors ml-2"
          >
            创建面授课程
          </button>
          <button 
            onClick={() => { setShowImportModal(true); setImportStep(1); }}
            className="border border-primary text-primary hover:bg-primary-light px-5 py-1.5 rounded text-sm transition-colors"
          >
            导入课程
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="border-t border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="p-4 whitespace-nowrap">课程名称</th>
                <th className="p-4 whitespace-nowrap">课程类型</th>
                <th className="p-4 whitespace-nowrap">学科</th>
                <th className="p-4 whitespace-nowrap">年级</th>
                <th className="p-4 whitespace-nowrap">学期</th>
                <th className="p-4 whitespace-nowrap">班型</th>
                <th className="p-4 whitespace-nowrap">状态</th>
                <th className="p-4 whitespace-nowrap text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCourses.map(course => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-blue-600 font-medium cursor-pointer hover:underline">{course.name}</td>
                  <td className="p-4 text-gray-600">
                      {course.type === 'long-term' ? '长期班' : course.type === 'short-term' ? '短期班' : '体验课'}
                  </td>
                  <td className="p-4 text-gray-600">{course.subject || '-'}</td>
                  <td className="p-4 text-gray-600">{course.grade || '-'}</td>
                  <td className="p-4 text-gray-600">{course.semester || '-'}</td>
                  <td className="p-4 text-gray-600">{course.classType || '无'}</td>
                  <td className="p-4">
                      {course.status === 'active' ? (
                          <span className="text-gray-600">已启用</span>
                      ) : (
                          <span className="text-gray-400">已禁用</span>
                      )}
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-3 text-primary text-sm">
                      <button 
                        onClick={onNavigateToCreateClass}
                        className="hover:opacity-80"
                      >
                        创建班级
                      </button>
                      <span className="text-gray-300">|</span>
                      <button 
                        onClick={() => handleEdit(course)}
                        className="hover:opacity-80"
                      >
                        编辑
                      </button>
                      <span className="text-gray-300">|</span>
                      <button className="hover:opacity-80">禁用</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCourses.length === 0 && (
                  <tr>
                      <td colSpan={8} className="p-10 text-center text-gray-400">暂无课程数据</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end text-sm text-gray-600 bg-white gap-2">
         <span className="text-primary mr-auto">共{filteredCourses.length}条数据</span>
         <button className="w-7 h-7 flex items-center justify-center rounded bg-primary text-white">1</button>
         <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">2</button>
         <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">3</button>
         <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">4</button>
         <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">5</button>
         <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">6</button>
         <span>...</span>
         <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">523</button>
         <button className="px-2 hover:text-primary">&gt;</button>
         <span className="ml-2">共523页</span>
      </div>

      {/* CREATE/EDIT COURSE MODAL */}
      {showCreateModal && (
        <div className="absolute inset-0 bg-white z-50 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto min-h-screen flex flex-col">
            {/* Header */}
            <div className="py-4 border-b border-gray-100 flex gap-2 text-sm text-gray-500 mb-4 px-6">
                <span 
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setShowCreateModal(false)}
                >
                  自建课程
                </span>
                <span>|</span>
                <span className="text-gray-800 font-bold">{editingId ? '编辑面授课程' : '创建面授课程'}</span>
            </div>

            {/* Stepper */}
            {renderStepIndicator(createStep, 3, ['基本信息', '讲次信息', '完成'])}

            {/* Content Area */}
            <div className="flex-1 px-32 pb-20">
                {/* STEP 1: BASIC INFO */}
                {createStep === 1 && (
                    <div className="space-y-6">
                        <div className="border-l-4 border-blue-600 pl-3 mb-6">
                            <h3 className="font-bold text-gray-800">基本信息</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6 max-w-[800px]">
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>课程类型</label>
                                <select 
                                    value={formData.courseType}
                                    onChange={e => setFormData({...formData, courseType: e.target.value as any})}
                                    className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="long-term">长期班</option>
                                    <option value="short-term">短期班</option>
                                    <option value="experience">体验课</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>年份</label>
                                <select 
                                    value={formData.year}
                                    onChange={e => setFormData({...formData, year: e.target.value})}
                                    className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="2026">2026</option>
                                    <option value="2025">2025</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>学期</label>
                                <select 
                                    value={formData.semester}
                                    onChange={e => setFormData({...formData, semester: e.target.value})}
                                    className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="春季">春季</option>
                                    <option value="暑假">暑假</option>
                                    <option value="秋季">秋季</option>
                                    <option value="寒假">寒假</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>学科</label>
                                <select 
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                    className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="英语">英语</option>
                                    <option value="数学">数学</option>
                                    <option value="语文">语文</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4">班型</label>
                                <select 
                                    value={formData.classType}
                                    onChange={e => setFormData({...formData, classType: e.target.value})}
                                    className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="无">无</option>
                                    <option value="尖子班">尖子班</option>
                                    <option value="提高班">提高班</option>
                                    <option value="领航A+">领航A+</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>年级</label>
                                <select 
                                    value={formData.grade}
                                    onChange={e => setFormData({...formData, grade: e.target.value})}
                                    className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="小学组">小学组</option>
                                    <option value="初中组">初中组</option>
                                    <option value="1年级">1年级</option>
                                    <option value="2年级">2年级</option>
                                    <option value="3年级">3年级</option>
                                    <option value="4年级">4年级</option>
                                    <option value="5年级">5年级</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>课程名称</label>
                                <input 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                                    placeholder="请输入课程名称"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: SESSION INFO */}
                {createStep === 2 && (
                    <div className="space-y-6">
                        <div className="border-l-4 border-blue-600 pl-3 mb-6">
                            <h3 className="font-bold text-gray-800">讲次信息</h3>
                        </div>

                        <div className="mb-4">
                            <button 
                                onClick={handleAddSession}
                                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                                添加讲次
                            </button>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="p-3 font-medium w-24">讲次</th>
                                        <th className="p-3 font-medium">讲次名称</th>
                                        <th className="p-3 font-medium text-right w-24">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sessions.length > 0 ? sessions.map((s, idx) => (
                                        <tr key={s.id}>
                                            <td className="p-3 text-gray-600">第 {idx + 1} 讲</td>
                                            <td className="p-3">
                                                <input 
                                                    value={s.name}
                                                    onChange={e => {
                                                        const newSessions = [...sessions];
                                                        newSessions[idx].name = e.target.value;
                                                        setSessions(newSessions);
                                                    }}
                                                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="p-3 text-right">
                                                <button 
                                                    onClick={() => setSessions(sessions.filter((_, i) => i !== idx))}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    删除
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-gray-400">暂无讲次信息，请添加</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* STEP 3: COMPLETE */}
                {createStep === 3 && (
                    <div className="flex flex-col items-center justify-center pt-20">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <span className="text-4xl text-green-500">✓</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">{editingId ? '课程修改成功!' : '课程创建成功!'}</h2>
                        <p className="text-gray-500 mb-8">您可以在课程列表中查看并管理该课程</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-100 p-6 flex justify-center gap-4 sticky bottom-0">
                {createStep === 3 ? (
                    <button 
                        onClick={handleCreateCourse} 
                        className="px-12 py-2.5 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 text-sm"
                    >
                        关闭
                    </button>
                ) : (
                    <>
                        <button 
                            onClick={() => { setShowCreateModal(false); resetForm(); }} 
                            className="px-12 py-2.5 border border-gray-200 text-gray-600 bg-white rounded hover:bg-gray-50 text-sm"
                        >
                            取消
                        </button>
                        <button 
                            onClick={handleCreateCourse} 
                            className="px-12 py-2.5 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 text-sm"
                        >
                            {createStep === 2 ? '确定' : '下一步'}
                        </button>
                    </>
                )}
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-2xl w-[900px] h-[500px] flex flex-col relative">
             <button 
                onClick={() => setShowImportModal(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
             >
                &times;
             </button>
             
             <div className="p-8 pb-0">
                 <h3 className="text-lg font-bold text-gray-700 mb-6">自建课程</h3>
                 
                 <div className="flex items-center gap-4 mb-8">
                     <div className={`flex items-center gap-2 ${importStep >= 1 ? 'text-black font-bold text-xl' : 'text-gray-400'}`}>
                         <span>第1步导入文件</span>
                         <div className={`h-1 w-8 rounded-full ${importStep >= 1 ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                     </div>
                     <div className={`flex items-center gap-2 ${importStep >= 2 ? 'text-black font-bold text-xl' : 'text-gray-400 text-lg'}`}>
                         <span>第2步查看导入情况</span>
                     </div>
                 </div>
             </div>

             <div className="flex-1 px-8">
                 {importStep === 1 && (
                     <div className="h-full flex flex-col">
                         <div className="mb-4">
                             <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
                                 <span>⬇</span> 下载模板
                             </button>
                         </div>
                         
                         <div className="flex-1 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
                             <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4 text-white text-3xl shadow-lg shadow-blue-200">
                                 ↑
                             </div>
                             <div className="text-gray-500 text-sm">上传文件</div>
                         </div>

                         <div className="mt-6 text-xs text-gray-500 space-y-1">
                             <div className="font-bold text-gray-700 mb-2">导入须知</div>
                             <p>1、需要下载模板，按照模板格式内容上传；</p>
                             <p>2、请认真阅读表头内需注意的问题；</p>
                             <p>3、一次最大导入 10M 大小以内；</p>
                             <p>4、表格内最多仅能支持 1000 行；</p>
                             <p>5、仅支持 .xlsx 后缀文件格式。</p>
                         </div>
                     </div>
                 )}
                 {importStep === 2 && (
                     <div className="h-full flex flex-col items-center justify-center">
                         <div className="text-green-500 text-6xl mb-4">✓</div>
                         <h3 className="text-xl font-bold text-gray-800">导入完成</h3>
                         <p className="text-gray-500 mt-2">成功导入 0 条数据</p>
                     </div>
                 )}
             </div>

             <div className="p-6 flex justify-center border-t border-gray-100 mt-4">
                 <button 
                    onClick={() => setShowImportModal(false)}
                    className="px-10 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                 >
                    取消
                 </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SelfBuiltCourse;
