import React, { useState } from 'react';
import { ClassInfo, Lesson, Course, Teacher } from '../../types';
import { COURSES, TEACHERS, CAMPUSES } from '../../constants';

interface ClassManagementProps {
  classes: ClassInfo[];
  lessons: Lesson[];
  onAddClass: (newClass: ClassInfo, newLessons: Lesson[]) => void;
  onUpdateLessons: (updatedLessons: Lesson[]) => void;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ classes, lessons, onAddClass, onUpdateLessons }) => {
  // Modal State
  const [createStep, setCreateStep] = useState<1 | 2 | null>(null);
  const [showQueueModal, setShowQueueModal] = useState<string | null>(null); // holds class ID
  
  // Filter States
  const [filterCampus, setFilterCampus] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');

  // Create Modal Form State
  const [formData, setFormData] = useState({
    name: '',
    campus: CAMPUSES[0],
    courseId: COURSES[0]?.id || '',
    teacherId: TEACHERS[0]?.id || '',
    assistantId: '',
    capacity: 20,
    startDate: '2025-07-15',
    startTime: '14:00',
  });
  
  // Generated Lessons Preview State
  const [previewLessons, setPreviewLessons] = useState<Lesson[]>([]);

  // Helpers
  const calculateEndTime = (start: string) => {
    if (!start) return '00:00';
    const [h, m] = start.split(':').map(Number);
    const endH = h + 2;
    return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const generateSchedule = () => {
    if (!formData.startDate || !formData.startTime || !formData.courseId) return;
    
    const course = COURSES.find(c => c.id === formData.courseId);
    if (!course) return;

    const newLessons: Lesson[] = [];
    const start = new Date(formData.startDate);
    const lessonsCount = course.lessons && course.lessons.length > 0 ? course.lessons.length : course.lessonCount;
    
    // Short-term: Push all at the very beginning
    const batchPushTime = `${formData.startDate} ${formData.startTime}`;

    for (let i = 0; i < lessonsCount; i++) {
      const lessonDate = new Date(start);
      
      // Schedule Logic
      if (course.type === 'long-term') {
        // Weekly
        lessonDate.setDate(start.getDate() + i * 7);
      } else {
        // Daily (Short-term)
        lessonDate.setDate(start.getDate() + i);
      }
      
      const dateStr = lessonDate.toISOString().split('T')[0];
      
      // Push Time Logic
      let pushTime = '';
      if (course.type === 'short-term') {
        // All pushed at start
        pushTime = batchPushTime;
      } else {
        // Pushed at lesson start time
        pushTime = `${dateStr} ${formData.startTime}`;
      }

      // Lesson Name
      const lessonName = course.lessons?.[i]?.name || `${course.name} - Lesson ${i + 1}`;

      newLessons.push({
        id: `preview-${Date.now()}-${i}`,
        classId: 'temp',
        name: lessonName,
        date: dateStr,
        startTime: formData.startTime,
        endTime: calculateEndTime(formData.startTime),
        status: 'pending',
        teacherId: formData.teacherId,
        pushTime: pushTime,
        pushStatus: 'pending'
      });
    }
    setPreviewLessons(newLessons);
  };

  const handleNextStep = () => {
    if (!formData.name) {
      alert("请输入班级名称");
      return;
    }
    generateSchedule();
    setCreateStep(2);
  };

  const handleCreateClass = () => {
    const course = COURSES.find(c => c.id === formData.courseId);
    const teacher = TEACHERS.find(t => t.id === formData.teacherId);
    const assistant = TEACHERS.find(t => t.id === formData.assistantId);

    // Generate ID
    const randomId = Math.floor(550 + Math.random() * 100).toString();

    const newClass: ClassInfo = {
      id: randomId,
      name: formData.name,
      timeSlot: formData.startTime,
      description: course?.name || '',
      color: '#2DA194',
      campus: formData.campus,
      teacherId: formData.teacherId,
      assistant: assistant?.name || '无', // store name for display or ID if strictly relational
      capacity: formData.capacity,
      studentCount: 0,
      courseId: formData.courseId,
      startDate: formData.startDate,
      status: 'pending',
      createdTime: new Date().toLocaleString()
    };

    const finalLessons = previewLessons.map(l => ({
      ...l,
      classId: newClass.id,
      id: `l-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    onAddClass(newClass, finalLessons);
    setCreateStep(null);
  };

  const handleUpdatePreview = (index: number, field: keyof Lesson, value: string) => {
    const updated = [...previewLessons];
    if (field === 'startTime') {
        updated[index].startTime = value;
        updated[index].endTime = calculateEndTime(value);
    } else {
        (updated[index] as any)[field] = value;
    }
    setPreviewLessons(updated);
  };

  // Push Queue Logic
  const classLessons = showQueueModal ? lessons.filter(l => l.classId === showQueueModal) : [];
  const selectedClassForQueue = classes.find(c => c.id === showQueueModal);
  const selectedCourseForQueue = COURSES.find(c => c.id === selectedClassForQueue?.courseId);

  const handlePush = (lessonId: string) => {
    const updated = lessons.map(l => {
      if (l.id === lessonId) return { ...l, pushStatus: 'success' as const };
      return l;
    });
    onUpdateLessons(updated);
  };

  // Filter Logic
  const filteredClasses = classes.filter(cls => {
    const matchCampus = !filterCampus || cls.campus === filterCampus;
    const matchName = !filterName || cls.name.includes(filterName);
    const matchTeacher = !filterTeacher || cls.teacherId === filterTeacher;
    return matchCampus && matchName && matchTeacher;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': return <span className="bg-[#EAF6F5] text-[#2DA194] border border-[#B2E2D3] px-2 py-0.5 rounded text-xs">已开班</span>;
      case 'full': return <span className="bg-[#FF4D4F] text-white px-2 py-0.5 rounded text-xs border border-[#FF4D4F]">已满员</span>;
      case 'pending':
      default: return <span className="bg-[#999] text-white px-2 py-0.5 rounded text-xs">未开班</span>;
    }
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Title */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">班级管理</h2>
      </div>

      {/* Filter Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">校区:</span>
           <select 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40 text-gray-600 focus:outline-none focus:border-primary"
             value={filterCampus}
             onChange={e => setFilterCampus(e.target.value)}
           >
             <option value="">请选择校区</option>
             {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">班级名称:</span>
           <input 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-primary"
             placeholder="请输入班级名称"
             value={filterName}
             onChange={e => setFilterName(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">主教:</span>
           <select 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40 text-gray-600 focus:outline-none focus:border-primary"
             value={filterTeacher}
             onChange={e => setFilterTeacher(e.target.value)}
           >
             <option value="">请选择主教</option>
             {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
           </select>
        </div>
        
        <div className="flex items-center gap-3 ml-2">
          <button className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors">搜索</button>
          <button 
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-1.5 rounded text-sm transition-colors"
            onClick={() => { setFilterCampus(''); setFilterName(''); setFilterTeacher(''); }}
          >
            重置
          </button>
          <button 
            onClick={() => {
              // Reset form and start step 1
              setFormData({
                name: '',
                campus: CAMPUSES[0],
                courseId: COURSES[0]?.id || '',
                teacherId: TEACHERS[0]?.id || '',
                assistantId: '',
                capacity: 20,
                startDate: new Date().toISOString().split('T')[0],
                startTime: '14:00',
              });
              setCreateStep(1);
            }}
            className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors ml-2"
          >
            新增
          </button>
        </div>
      </div>

      {/* Export Bar */}
      <div className="px-6 pb-4 pt-2 flex items-center gap-4 bg-white border-b border-gray-100">
        <span className="text-sm font-bold text-gray-800">数据导出:</span>
        <select className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 text-gray-400 focus:outline-none focus:border-primary">
          <option>请选择课程/班级</option>
        </select>
        <button className="bg-gray-100 text-gray-500 border border-gray-200 px-4 py-1.5 rounded text-sm hover:bg-gray-200">导出班级数据</button>
        <button className="bg-gray-100 text-gray-500 border border-gray-200 px-4 py-1.5 rounded text-sm hover:bg-gray-200">导出班级学生数据</button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="border-t border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="p-4 whitespace-nowrap">班级ID</th>
                <th className="p-4 whitespace-nowrap">班级名称</th>
                <th className="p-4 whitespace-nowrap">校区</th>
                <th className="p-4 whitespace-nowrap">主教老师</th>
                <th className="p-4 whitespace-nowrap">助教</th>
                <th className="p-4 whitespace-nowrap">学生数量</th>
                <th className="p-4 whitespace-nowrap">最大人数</th>
                <th className="p-4 whitespace-nowrap">绑定课程</th>
                <th className="p-4 whitespace-nowrap">上课日期</th>
                <th className="p-4 whitespace-nowrap">上课时间</th>
                <th className="p-4 whitespace-nowrap">开班状态</th>
                <th className="p-4 whitespace-nowrap">创建时间</th>
                <th className="p-4 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClasses.map(cls => {
                const teacher = TEACHERS.find(t => t.id === cls.teacherId);
                const course = COURSES.find(c => c.id === cls.courseId);
                // assistant stored as name string in previous mock, but logic might vary.
                
                return (
                  <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-600">{cls.id}</td>
                    <td className="p-4 text-gray-800">{cls.name}</td>
                    <td className="p-4 text-gray-600">{cls.campus}</td>
                    <td className="p-4">
                      <div className="text-gray-800">{teacher?.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">性别：{teacher?.gender || '未知'}</div>
                    </td>
                    <td className="p-4 text-gray-600">{cls.assistant}</td>
                    <td className="p-4">
                      <span className="text-primary font-bold border-b border-primary cursor-pointer hover:opacity-80">
                        {cls.studentCount}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{cls.capacity}</td>
                    <td className="p-4">
                      <div className="text-gray-800 mb-1">{course?.name}</div>
                      <div className="flex gap-1">
                        {course?.tags?.map(tag => (
                          <span key={tag} className="bg-[#EAF6F5] text-primary px-1.5 py-0.5 rounded text-xs">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{cls.startDate}</td>
                    <td className="p-4 text-gray-600">{cls.timeSlot.split(' ').pop()}</td>
                    <td className="p-4">{getStatusBadge(cls.status || 'pending')}</td>
                    <td className="p-4 text-gray-600 text-xs">{cls.createdTime}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex gap-3 text-primary text-sm">
                        <button className="hover:opacity-80">编辑</button>
                        <button className="hover:opacity-80">学员管理</button>
                        <button className="hover:opacity-80">状态变更</button>
                        <button className="hover:opacity-80" onClick={() => setShowQueueModal(cls.id)}>查看推送队列</button>
                        <button className="text-red-500 hover:opacity-80">删除</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL: STEP 1 (Class Info) */}
      {createStep === 1 && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[800px] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">新建班级 - 班级信息</h3>
              <button onClick={() => setCreateStep(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-8 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">班级名称</label>
                <input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="请输入班级名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">绑定课程</label>
                <select 
                  value={formData.courseId}
                  onChange={e => setFormData({...formData, courseId: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                >
                  {COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">主教老师</label>
                <select 
                  value={formData.teacherId}
                  onChange={e => setFormData({...formData, teacherId: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                >
                  {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">校区</label>
                <select 
                  value={formData.campus}
                  onChange={e => setFormData({...formData, campus: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                >
                  {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">助教</label>
                <select 
                  value={formData.assistantId}
                  onChange={e => setFormData({...formData, assistantId: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                >
                  <option value="">请选择助教</option>
                  {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最大人数</label>
                <input 
                  type="number"
                  value={formData.capacity}
                  onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">首课日期</label>
                <input 
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">上课时间</label>
                <input 
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button onClick={() => setCreateStep(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50">取消</button>
              <button onClick={handleNextStep} className="px-6 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600">下一步</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL: STEP 2 (Preview Schedule) */}
      {createStep === 2 && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[900px] flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">新建班级 - 班级课表预览</h3>
              <button onClick={() => setCreateStep(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
               <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                 <table className="w-full text-xs text-left">
                   <thead className="bg-gray-100 text-gray-600 font-semibold">
                     <tr>
                       <th className="p-3">课节名</th>
                       <th className="p-3">主教老师</th>
                       <th className="p-3">上课日期</th>
                       <th className="p-3">上课时间</th>
                       <th className="p-3">课节推送时间</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200">
                     {previewLessons.map((l, idx) => (
                       <tr key={idx} className="hover:bg-gray-50">
                         <td className="p-3 text-gray-800 font-medium">{l.name}</td>
                         <td className="p-3 text-gray-600">{TEACHERS.find(t => t.id === l.teacherId)?.name}</td>
                         <td className="p-3">
                           <input 
                             type="date"
                             value={l.date}
                             onChange={e => handleUpdatePreview(idx, 'date', e.target.value)}
                             className="bg-transparent border-b border-gray-300 focus:border-primary w-[110px] text-gray-700"
                           />
                         </td>
                         <td className="p-3">
                           <input 
                             type="time"
                             value={l.startTime}
                             onChange={e => handleUpdatePreview(idx, 'startTime', e.target.value)}
                             className="bg-transparent border-b border-gray-300 focus:border-primary w-[70px] text-gray-700"
                           />
                         </td>
                         <td className="p-3">
                           <input 
                             type="text"
                             value={l.pushTime}
                             onChange={e => handleUpdatePreview(idx, 'pushTime', e.target.value)}
                             className="bg-transparent border-b border-gray-300 focus:border-primary w-[140px] text-gray-700"
                           />
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-xl">
              <button onClick={() => setCreateStep(1)} className="px-4 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50">上一步</button>
              <button onClick={handleCreateClass} className="px-6 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600">确认创建</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PUSH QUEUE MODAL */}
      {showQueueModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-2xl w-[900px] max-h-[80vh] flex flex-col">
             <div className="p-5 border-b border-gray-100 flex justify-between items-center">
               <h3 className="text-lg font-bold text-gray-800">推送队列</h3>
               <button onClick={() => setShowQueueModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
             </div>
             <div className="flex-1 overflow-auto p-0">
               <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                   <tr>
                     <th className="p-4 whitespace-nowrap">班级</th>
                     <th className="p-4 whitespace-nowrap">课程</th>
                     <th className="p-4 whitespace-nowrap">课节</th>
                     <th className="p-4 whitespace-nowrap">推送时间</th>
                     <th className="p-4 whitespace-nowrap">推送状态</th>
                     <th className="p-4 whitespace-nowrap text-right">操作</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {classLessons.map(l => (
                      <tr key={l.id}>
                        <td className="p-4 text-gray-700">{selectedClassForQueue?.name}</td>
                        <td className="p-4 text-gray-700">{selectedCourseForQueue?.name}</td>
                        <td className="p-4 text-gray-800 font-medium">{l.name}</td>
                        <td className="p-4 text-gray-600">{l.pushTime}</td>
                        <td className="p-4">
                          {l.pushStatus === 'success' && <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">推送成功</span>}
                          {l.pushStatus === 'pending' && <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded text-xs">待推送</span>}
                          {l.pushStatus === 'failed' && <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded text-xs">推送失败</span>}
                        </td>
                        <td className="p-4 text-right">
                          {l.pushStatus === 'pending' && (
                            <button onClick={() => handlePush(l.id)} className="text-primary hover:underline text-xs bg-white border border-primary px-2 py-0.5 rounded">立即推送</button>
                          )}
                          {l.pushStatus === 'failed' && (
                            <button onClick={() => handlePush(l.id)} className="text-primary hover:underline text-xs bg-white border border-primary px-2 py-0.5 rounded">重新推送</button>
                          )}
                          {l.pushStatus === 'success' && <span className="text-gray-400 text-xs">-</span>}
                        </td>
                      </tr>
                    ))}
                    {classLessons.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-400">暂无队列信息</td></tr>}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
