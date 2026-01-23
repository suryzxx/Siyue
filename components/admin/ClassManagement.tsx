
import React, { useState, useEffect, useRef } from 'react';
import { ClassInfo, Lesson, Course, Teacher } from '../../types';
import { COURSES, TEACHERS, CAMPUSES, ADMIN_STUDENTS } from '../../constants';

interface ClassManagementProps {
  classes: ClassInfo[];
  lessons: Lesson[];
  onAddClass: (newClass: ClassInfo, newLessons: Lesson[]) => void;
  onUpdateLessons: (updatedLessons: Lesson[]) => void;
  createTrigger?: number;
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const CLASSROOMS = ['101教室', '102教室', '201教室', '202教室', '301多功能厅', '大行宫305', '大行宫201', '奥南202', '龙江105', '仙林303', '五台山101'];
const YEARS = ['2024', '2025', '2026'];
const SUBJECTS = ['英语', '数学', '编程', '美术'];
const GRADES = ['K1', 'K2', 'K3', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
const CLASS_TYPES = ['启蒙', '进阶', '飞跃', 'A', 'A+', 'S', 'S+', 'R', 'R预备'];
const SEMESTERS = ['春季', '暑假', '秋季', '寒假'];

interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  mandatory?: boolean;
}

const INITIAL_COLUMNS: ColumnConfig[] = [
  { id: 'id', label: '班级ID', visible: true, mandatory: true },
  { id: 'name', label: '班级名称', visible: true, mandatory: true },
  { id: 'mode', label: '授课方式', visible: true },
  { id: 'courseName', label: '课程名称', visible: true },
  { id: 'courseType', label: '课程类型', visible: true },
  { id: 'progress', label: '进度', visible: true },
  { id: 'enrolled', label: '已报人数', visible: true },
  { id: 'capacity', label: '预招人数', visible: true },
  { id: 'year', label: '年份', visible: true },
  { id: 'semester', label: '学期', visible: true },
  { id: 'grade', label: '班层', visible: true },
  { id: 'teacher', label: '班级老师', visible: true },
  { id: 'assistant', label: '助教', visible: false },
  { id: 'city', label: '城市', visible: false },
  { id: 'campus', label: '校区', visible: true },
  { id: 'classroom', label: '教室', visible: true },
  { id: 'price', label: '课程费用', visible: true },
  { id: 'status', label: '班级状态', visible: true },
  { id: 'startDate', label: '首课日期', visible: true },
  { id: 'timeSlot', label: '上课时间', visible: true },
  { id: 'createdTime', label: '创建时间', visible: true },
];

const ClassManagement: React.FC<ClassManagementProps> = ({ 
  classes, 
  lessons, 
  onAddClass, 
  onUpdateLessons,
  createTrigger = 0
}) => {
  // Navigation State
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [showQueueModal, setShowQueueModal] = useState<string | null>(null); // holds class ID
  
  // Custom List State
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [showColumnDrawer, setShowColumnDrawer] = useState(false);
  const [tempColumns, setTempColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Filter States
  const [filterName, setFilterName] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterClassType, setFilterClassType] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterCampus, setFilterCampus] = useState('');
  const [filterClassroom, setFilterClassroom] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCourseType, setFilterCourseType] = useState('');
  
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Listen for trigger from parent to open modal
  useEffect(() => {
    if (createTrigger > 0) {
      resetForm();
      setShowCreateModal(true);
    }
  }, [createTrigger]);

  // Handle opening drawer
  const handleOpenDrawer = () => {
    setTempColumns([...columns]);
    setShowColumnDrawer(true);
  };

  // Handle drawer confirm
  const handleConfirmColumns = () => {
    setColumns(tempColumns);
    setShowColumnDrawer(false);
  };

  // Handle column toggle
  const handleColumnToggle = (id: string) => {
    setTempColumns(prev => prev.map(col => {
      if (col.id === id && !col.mandatory) {
        return { ...col, visible: !col.visible };
      }
      return col;
    }));
  };

  // Handle Select All
  const handleSelectAll = (checked: boolean) => {
    setTempColumns(prev => prev.map(col => 
      col.mandatory ? col : { ...col, visible: checked }
    ));
  };

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newCols = [...tempColumns];
    const draggedItem = newCols[draggedItemIndex];
    newCols.splice(draggedItemIndex, 1);
    newCols.splice(index, 0, draggedItem);
    setTempColumns(newCols);
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  // Create Modal Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    courseId: '',
    name: '',
    campus: '',
    classroom: '',
    capacity: 20,
    teacherId: '',
    assistantId: '', // Used for "调课虚位" placeholder in UI
    semester: '暑假',
    subject: '英语',
    grade: '1年级',
    studentGrade: '1年级',
    studentTag: '',
    allowStudentSchedule: false,

    // Step 2: Session Info
    startDate: new Date().toISOString().split('T')[0],
    startTime: '14:00', // Added startTime
    skipHolidays: true,
    frequency: [] as string[], // ['周六', '周日']

    // Step 3: Pricing / Sales Info
    chargeMode: 'whole' as 'whole' | 'single', // 收费模式
    price: '',
    refundPolicy: 'unused' as 'unused' | 'full' | 'partial', // 根据未上讲次退费
    materialPrice: '',
    materialRefundPolicy: 'no_return' as 'no_return' | 'return', // 报后不退
  });
  
  // Generated Lessons Preview State
  const [previewLessons, setPreviewLessons] = useState<Lesson[]>([]);

  const resetForm = () => {
    setFormData({
      courseId: '',
      name: '',
      campus: '',
      classroom: '',
      capacity: 20,
      teacherId: '',
      assistantId: '',
      semester: '暑假',
      subject: '英语',
      grade: '1年级',
      studentGrade: '1年级',
      studentTag: '',
      allowStudentSchedule: false,
      startDate: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      skipHolidays: true,
      frequency: [],
      chargeMode: 'whole',
      price: '',
      refundPolicy: 'unused',
      materialPrice: '',
      materialRefundPolicy: 'no_return',
    });
    setCreateStep(1);
    setPreviewLessons([]);
  };

  const generateSchedule = () => {
    if (!formData.startDate || !formData.courseId) return;
    
    const course = COURSES.find(c => c.id === formData.courseId);
    if (!course) return;

    const newLessons: Lesson[] = [];
    const start = new Date(formData.startDate);
    const lessonsCount = course.lessons && course.lessons.length > 0 ? course.lessons.length : course.lessonCount;
    
    let currentDate = new Date(start);
    let count = 0;
    
    // Convert frequency strings to day index (0-6)
    const targetDays = formData.frequency.map(d => WEEKDAYS.indexOf(d));

    // Calculate End Time based on Start Time (Assuming 2 hours)
    const [sh, sm] = formData.startTime.split(':').map(Number);
    let eh = sh + 2;
    if (eh >= 24) eh -= 24;
    const endTime = `${eh.toString().padStart(2, '0')}:${sm.toString().padStart(2, '0')}`;

    while (count < lessonsCount) {
        // If frequency is set, check if current day matches
        if (targetDays.length > 0) {
            if (!targetDays.includes(currentDate.getDay())) {
                currentDate.setDate(currentDate.getDate() + 1);
                continue;
            }
        }

        const dateStr = currentDate.toISOString().split('T')[0];
        const lessonName = course.lessons?.[count]?.name || `${course.name} - Lesson ${count + 1}`;

        newLessons.push({
            id: `preview-${Date.now()}-${count}`,
            classId: 'temp',
            name: lessonName,
            date: dateStr,
            startTime: formData.startTime,
            endTime: endTime,
            status: 'pending',
            teacherId: formData.teacherId,
            pushTime: `${dateStr} ${formData.startTime}`,
            pushStatus: 'pending'
        });

        currentDate.setDate(currentDate.getDate() + 1);
        count++;
    }
    
    setPreviewLessons(newLessons);
  };

  useEffect(() => {
      if (createStep === 2) {
          generateSchedule();
      }
  }, [createStep, formData.frequency, formData.startDate, formData.startTime, formData.courseId]);

  const handleNextStep = () => {
    if (createStep === 1) {
        if (!formData.name || !formData.courseId || !formData.campus) {
            alert("请完善基本信息");
            return;
        }
        setCreateStep(2);
    } else if (createStep === 2) {
        setCreateStep(3);
    }
  };

  const handlePrevStep = () => {
    if (createStep > 1) {
        setCreateStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleCreateClass = () => {
    const course = COURSES.find(c => c.id === formData.courseId);
    const teacher = TEACHERS.find(t => t.id === formData.teacherId);

    const randomId = Math.floor(550 + Math.random() * 100).toString();

    // Auto-generate schedule description
    const endDate = previewLessons.length > 0 ? previewLessons[previewLessons.length - 1].date : formData.startDate;
    const freqStr = formData.frequency.length > 0 ? formData.frequency.join(' ') : '每天';
    const scheduleDesc = `${formData.startDate.replace(/-/g, '.')} - ${endDate.replace(/-/g, '.')} ${freqStr} ${formData.startTime}`;

    const newClass: ClassInfo = {
      id: randomId,
      name: formData.name,
      timeSlot: formData.startTime || '每周固定时间',
      description: course?.name || '',
      color: '#2DA194',
      campus: formData.campus,
      teacherId: formData.teacherId,
      assistant: formData.assistantId, 
      capacity: formData.capacity,
      studentCount: 0,
      courseId: formData.courseId,
      startDate: formData.startDate,
      status: 'pending',
      createdTime: new Date().toLocaleString(),
      scheduleDescription: scheduleDesc,
      
      // Extended fields
      semester: formData.semester,
      subject: formData.subject,
      grade: formData.grade,
      studentGrade: formData.studentGrade,
      classroom: formData.classroom,
      studentTag: formData.studentTag,
      allowStudentSchedule: formData.allowStudentSchedule,
      chargeMode: formData.chargeMode,
      price: parseFloat(formData.price) || 0,
      refundPolicy: formData.refundPolicy,
      materialPrice: parseFloat(formData.materialPrice) || 0,
      materialRefundPolicy: formData.materialRefundPolicy
    };

    const finalLessons = previewLessons.map(l => ({
      ...l,
      classId: newClass.id,
      id: `l-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    onAddClass(newClass, finalLessons);
    setShowCreateModal(false);
    resetForm();
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
    const course = COURSES.find(c => c.id === cls.courseId);

    // 1. Text Search
    const matchName = !filterName || cls.name.toLowerCase().includes(filterName.toLowerCase());
    
    // 2. Dropdown Filters
    const matchMode = !filterMode || '面授' === filterMode; // Static for demo as '面授'
    const matchYear = !filterYear || course?.year === filterYear;
    const matchSubject = !filterSubject || cls.subject === filterSubject || course?.subject === filterSubject;
    const matchGrade = !filterGrade || cls.grade === filterGrade || course?.grade === filterGrade;
    const matchClassType = !filterClassType || cls.studentTag === filterClassType;
    const matchSemester = !filterSemester || cls.semester === filterSemester;
    const matchTeacher = !filterTeacher || cls.teacherId === filterTeacher;
    const matchCampus = !filterCampus || cls.campus === filterCampus;
    const matchClassroom = !filterClassroom || cls.classroom === filterClassroom;
    
    // Status Dropdown Filter
    let matchStatus = true;
    if (filterStatus) {
        if (filterStatus === 'pending') matchStatus = cls.status === 'pending';
        else if (filterStatus === 'active') matchStatus = ['active', 'full'].includes(cls.status || '');
        else if (filterStatus === 'closed') matchStatus = ['closed', 'disabled'].includes(cls.status || '');
    }

    const matchCourseType = !filterCourseType || course?.type === filterCourseType;

    // 3. Checkbox Active Only
    let matchCheckbox = true;
    if (showActiveOnly) {
        // Show pending, active, full. Hide closed/disabled.
        matchCheckbox = ['pending', 'active', 'full'].includes(cls.status || 'pending');
    }

    return matchName && matchMode && matchYear && matchSubject && matchGrade && matchClassType && matchSemester && matchTeacher && matchCampus && matchClassroom && matchStatus && matchCourseType && matchCheckbox;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': 
      case 'full':
        return <span className="bg-[#EAF6F5] text-[#2DA194] border border-[#B2E2D3] px-2 py-0.5 rounded text-xs">开课中</span>;
      case 'closed':
      case 'disabled':
        return <span className="bg-gray-100 text-gray-400 border border-gray-200 px-2 py-0.5 rounded text-xs">已结课</span>;
      case 'pending':
      default: 
        return <span className="bg-orange-50 text-orange-500 border border-orange-200 px-2 py-0.5 rounded text-xs">未开课</span>;
    }
  };

  const getCellContent = (colId: string, cls: ClassInfo) => {
    const teacher = TEACHERS.find(t => t.id === cls.teacherId);
    const course = COURSES.find(c => c.id === cls.courseId);
    const assistant = TEACHERS.find(t => t.id === cls.assistant);
    
    // Calculate Progress
    const classLessonList = lessons.filter(l => l.classId === cls.id);
    const totalLessons = classLessonList.length > 0 ? classLessonList.length : (course?.lessonCount || 0);
    const completedLessons = classLessonList.filter(l => l.status === 'completed').length;
    const progressText = `${completedLessons}/${totalLessons}`;

    // Class Level Tags (Grade & Type)
    const displayGrade = cls.grade || course?.grade || '-';
    const displayClassType = cls.studentTag || course?.classType || '-';

    switch(colId) {
        case 'id': return <span className="text-gray-600">{cls.id}</span>;
        case 'name': return (
            <span 
                className="text-primary cursor-pointer hover:underline font-medium"
                onClick={() => { setSelectedClass(cls); setView('detail'); }}
            >
                {cls.name}
            </span>
        );
        case 'mode': return <span className="text-gray-600">面授</span>;
        case 'courseName': return <span className="text-gray-800">{course?.name}</span>;
        case 'courseType': return <span className="text-gray-600">{course?.type === 'long-term' ? '长期班' : course?.type === 'short-term' ? '短期班' : '体验课'}</span>;
        case 'progress': return <span className="text-gray-600">{progressText}</span>;
        case 'enrolled': return (
            <span className="text-primary font-bold border-b border-primary cursor-pointer hover:opacity-80">
                {cls.studentCount}
            </span>
        );
        case 'capacity': return <span className="text-gray-600">{cls.capacity}</span>;
        case 'year': return <span className="text-gray-600">{course?.year || '-'}</span>;
        case 'semester': return <span className="text-gray-600">{cls.semester || course?.semester || '-'}</span>;
        case 'grade': return (
            <div className="flex gap-1">
                {displayGrade !== '-' && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{displayGrade}</span>}
                {displayClassType !== '-' && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{displayClassType}</span>}
            </div>
        );
        case 'teacher': return <span className="text-gray-800">{teacher?.name || '-'}</span>;
        case 'assistant': return <span className="text-gray-600">{assistant?.name || cls.assistant || '-'}</span>;
        case 'city': return <span className="text-gray-600">南京</span>;
        case 'campus': return <span className="text-gray-600">{cls.campus}</span>;
        case 'classroom': return <span className="text-gray-600">{cls.classroom || '-'}</span>;
        case 'price': return <span className="text-gray-600">¥{cls.price || 0}</span>;
        case 'status': return getStatusBadge(cls.status || 'pending');
        case 'startDate': return <span className="text-gray-600">{cls.startDate}</span>;
        case 'timeSlot': return <span className="text-gray-600">{cls.timeSlot}</span>;
        case 'createdTime': return <span className="text-gray-600 text-xs">{cls.createdTime}</span>;
        default: return null;
    }
  };

  // --- DETAIL VIEW ---
  if (view === 'detail' && selectedClass) {
      const course = COURSES.find(c => c.id === selectedClass.courseId);
      const teacher = TEACHERS.find(t => t.id === selectedClass.teacherId);
      // For demo, if class is 'c_p2' (the one in screenshots), show specific mock students
      // otherwise, show standard mock list or empty
      const displayStudents = selectedClass.id === 'c_p2' 
          ? ADMIN_STUDENTS.slice(7) 
          : []; 

      return (
          <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center text-sm">
                  <span className="text-gray-500 cursor-pointer hover:text-primary" onClick={() => setView('list')}>班级管理</span>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="text-gray-800">班级详情</span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="bg-white p-6 rounded shadow-sm relative">
                      <div className="border-l-4 border-primary pl-3 mb-6">
                          <h3 className="font-bold text-gray-800">基本信息</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-4 text-sm text-gray-600">
                          <div className="col-span-2">课程名称：<span className="text-gray-900">{course?.name}</span></div>
                          <div className="col-span-2">班级名称：<span className="text-gray-900">{selectedClass.name}</span></div>
                          
                          <div>面授老师：<span className="text-gray-900">{teacher?.name}</span></div>
                          <div>校区：<span className="text-gray-900">{selectedClass.campus}</span></div>
                          
                          <div>学期：<span className="text-gray-900">{selectedClass.semester || '-'}</span></div>
                          
                          <div>学生人数上限：<span className="text-gray-900">{selectedClass.capacity}</span></div>
                          <div>教室：<span className="text-gray-900">{selectedClass.classroom || '-'}</span></div>
                          
                          <div>调课虚位：<span className="text-gray-900">{selectedClass.assistant || '0'}</span></div>
                          
                          <div className="col-span-2">年级：<span className="text-gray-900">{selectedClass.grade || '-'}</span></div>
                      </div>
                  </div>

                  {/* Pricing Info */}
                  <div className="bg-white p-6 rounded shadow-sm">
                      <div className="border-l-4 border-primary pl-3 mb-6">
                          <h3 className="font-bold text-gray-800">收费标准</h3>
                      </div>
                      <div className="space-y-6 text-sm text-gray-600">
                          <div>
                              <div className="font-bold text-gray-800 mb-2">课程费</div>
                              <div className="flex gap-12">
                                  <div>收费模式：<span className="text-gray-900">{selectedClass.chargeMode === 'whole' ? '整期' : '单次'}</span></div>
                                  <div>
                                      课程费：
                                      <span className="text-gray-900 mr-2">{selectedClass.price?.toFixed(2)}元/人/期</span>
                                      <span className="text-gray-400">
                                          ({selectedClass.refundPolicy === 'unused' ? '根据未上讲次退费' : selectedClass.refundPolicy === 'full' ? '前1讲全退' : '后1讲不退'})
                                      </span>
                                  </div>
                              </div>
                          </div>
                          <div>
                              <div className="font-bold text-gray-800 mb-2">教辅费</div>
                              <div>
                                  教辅费：
                                  <span className="text-gray-900 mr-2">{selectedClass.materialPrice?.toFixed(2)}元/人</span>
                                  <span className="text-gray-400">
                                      ({selectedClass.materialRefundPolicy === 'no_return' ? '报名后不退' : '开课后不退'})
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Students / Sessions Tabs */}
                  <div className="bg-white rounded shadow-sm min-h-[400px]">
                      <div className="border-b border-gray-100 flex">
                          <div className="px-6 py-4 text-gray-500 cursor-pointer hover:bg-gray-50">讲次信息</div>
                          <div className="px-6 py-4 text-primary font-bold border-b-2 border-primary cursor-pointer">学生</div>
                      </div>
                      
                      <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                              <div className="flex gap-4">
                                  <button className="px-4 py-1.5 border border-primary text-primary bg-primary-light text-sm rounded">在班学生</button>
                                  <button className="px-4 py-1.5 border border-gray-200 text-gray-600 bg-white text-sm rounded hover:bg-gray-50">历史在班学生</button>
                                  <span className="text-sm text-gray-600 self-center">共计<span className="text-red-500 font-bold mx-1">{displayStudents.length}</span>人</span>
                              </div>
                              <div className="flex gap-3">
                                  <div className="relative">
                                      <input className="pl-3 pr-8 py-1.5 border border-gray-200 rounded text-sm w-64" placeholder="请输入学生姓名、联系电话" />
                                      <span className="absolute right-2 top-2 text-gray-400">🔍</span>
                                  </div>
                                  <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-teal-600">添加学生</button>
                                  <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-teal-600">批量导入学生</button>
                                  <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-teal-600">整班续报</button>
                                  <button className="border border-primary text-primary px-4 py-1.5 rounded text-sm hover:bg-primary-light">导出</button>
                              </div>
                          </div>

                          {/* Student Table */}
                          <div className="border-t border-gray-100">
                              <table className="w-full text-left text-sm">
                                  <thead className="bg-[#F9FBFA] text-gray-500 font-medium">
                                      <tr>
                                          <th className="p-4">学生ID</th>
                                          <th className="p-4">学生姓名</th>
                                          <th className="p-4">联系电话</th>
                                          <th className="p-4">当前停课日期</th>
                                          <th className="p-4 text-center">操作</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                      {displayStudents.length > 0 ? displayStudents.map(student => (
                                          <tr key={student.id} className="hover:bg-gray-50">
                                              <td className="p-4 text-gray-600">{student.id}</td>
                                              <td className="p-4 text-gray-800">{student.name}</td>
                                              <td className="p-4 text-gray-600">{student.account}</td>
                                              <td className="p-4 text-gray-600">无</td>
                                              <td className="p-4 text-center">
                                                  <button className="text-primary hover:underline mx-1">转班</button>
                                                  <span className="text-gray-300">|</span>
                                                  <button className="text-primary hover:underline mx-1">退班</button>
                                                  <span className="text-gray-300">|</span>
                                                  <button className="text-primary hover:underline mx-1">停课</button>
                                              </td>
                                          </tr>
                                      )) : (
                                          <tr>
                                              <td colSpan={5} className="p-8 text-center text-gray-400">暂无学生数据</td>
                                          </tr>
                                      )}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- LIST VIEW ---

  const renderStepIndicator = () => (
      <div className="flex justify-center items-center py-8 bg-white border-b border-gray-100 mb-6">
          {[1, 2, 3, 4].map((step, idx) => (
              <div key={step} className="flex items-center">
                  <div className={`flex items-center gap-2 ${createStep >= step ? 'text-primary' : 'text-gray-300'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          createStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                          {step}
                      </div>
                      <span className="font-bold text-sm">
                          {step === 1 && '基本信息'}
                          {step === 2 && '讲次信息'}
                          {step === 3 && '收费标准'}
                          {step === 4 && '完成'}
                      </span>
                  </div>
                  {idx < 3 && (
                      <div className="w-24 h-[1px] border-t border-dashed border-gray-300 mx-4"></div>
                  )}
              </div>
          ))}
      </div>
  );

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden relative">
      {/* Title */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">班级管理</h2>
      </div>

      {/* FILTER BAR - Row 1 */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2 w-full overflow-x-auto no-scrollbar">
            {/* 1. Name Search */}
            <div className="relative flex-1 min-w-[100px]">
               <input 
                 className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full pl-8 focus:outline-none focus:border-primary placeholder-gray-400"
                 placeholder="班级名称"
                 value={filterName}
                 onChange={e => setFilterName(e.target.value)}
               />
               <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
            </div>

            {/* 2-7. Dropdowns loop */}
            {[
                { value: filterMode, set: setFilterMode, placeholder: '授课方式', options: ['面授', '网课'] },
                { value: filterYear, set: setFilterYear, placeholder: '年份', options: YEARS },
                { value: filterSubject, set: setFilterSubject, placeholder: '学科', options: SUBJECTS },
                { value: filterGrade, set: setFilterGrade, placeholder: '年级', options: GRADES },
                { value: filterClassType, set: setFilterClassType, placeholder: '班型', options: CLASS_TYPES },
                { value: filterSemester, set: setFilterSemester, placeholder: '学期', options: SEMESTERS },
            ].map((f, i) => (
                <div key={i} className="flex-1 min-w-[80px]">
                    <select 
                        className={`border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-primary ${f.value ? 'text-gray-800' : 'text-gray-400'}`}
                        value={f.value}
                        onChange={e => f.set(e.target.value)}
                    >
                        <option value="">{f.placeholder}</option>
                        {f.options.map(o => <option key={o} value={o} className="text-gray-800">{o}</option>)}
                    </select>
                </div>
            ))}

            {/* 8. Teacher */}
            <div className="flex-1 min-w-[80px]">
                <select 
                    className={`border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-primary ${filterTeacher ? 'text-gray-800' : 'text-gray-400'}`}
                    value={filterTeacher}
                    onChange={e => setFilterTeacher(e.target.value)}
                >
                    <option value="">老师</option>
                    {TEACHERS.map(t => <option key={t.id} value={t.id} className="text-gray-800">{t.name}</option>)}
                </select>
            </div>

            {/* 9. Campus */}
            <div className="flex-1 min-w-[80px]">
                <select 
                    className={`border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-primary ${filterCampus ? 'text-gray-800' : 'text-gray-400'}`}
                    value={filterCampus}
                    onChange={e => setFilterCampus(e.target.value)}
                >
                    <option value="">校区</option>
                    {CAMPUSES.map(c => <option key={c} value={c} className="text-gray-800">{c}</option>)}
                </select>
            </div>

            {/* 10. Classroom */}
            <div className="flex-1 min-w-[80px]">
                <select 
                    className={`border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-primary ${filterClassroom ? 'text-gray-800' : 'text-gray-400'}`}
                    value={filterClassroom}
                    onChange={e => setFilterClassroom(e.target.value)}
                >
                    <option value="">教室</option>
                    {CLASSROOMS.map(c => <option key={c} value={c} className="text-gray-800">{c}</option>)}
                </select>
            </div>

            {/* 11. Status */}
            <div className="flex-1 min-w-[80px]">
                <select 
                    className={`border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-primary ${filterStatus ? 'text-gray-800' : 'text-gray-400'}`}
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                >
                    <option value="">班级状态</option>
                    <option value="pending" className="text-gray-800">未开课</option>
                    <option value="active" className="text-gray-800">开课中</option>
                    <option value="closed" className="text-gray-800">已结课</option>
                </select>
            </div>

            {/* 12. Course Type (excluding 'experience') */}
            <div className="flex-1 min-w-[80px]">
                <select 
                    className={`border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-primary ${filterCourseType ? 'text-gray-800' : 'text-gray-400'}`}
                    value={filterCourseType}
                    onChange={e => setFilterCourseType(e.target.value)}
                >
                    <option value="">课程类型</option>
                    <option value="long-term" className="text-gray-800">长期课程</option>
                    <option value="short-term" className="text-gray-800">短期课程</option>
                </select>
            </div>
            
            {/* Reset Button */}
            <button 
                className="text-gray-400 hover:text-primary text-sm whitespace-nowrap px-2"
                onClick={() => {
                    setFilterName(''); setFilterMode(''); setFilterYear(''); setFilterSubject('');
                    setFilterGrade(''); setFilterClassType(''); setFilterSemester(''); setFilterTeacher('');
                    setFilterCampus(''); setFilterClassroom(''); setFilterStatus(''); setFilterCourseType('');
                }}
            >
                重置
            </button>
        </div>
      </div>

      {/* ACTION BAR - Row 2 */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
         <div className="flex items-center gap-3">
            <button 
                onClick={() => { resetForm(); setShowCreateModal(true); }}
                className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors"
            >
                创建班级
            </button>
            <button className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors">
                批量建班
            </button>
            <button className="border border-primary text-primary hover:bg-primary-light px-4 py-1.5 rounded text-sm transition-colors ml-2">
                导出班级列表
            </button>
            <button className="border border-primary text-primary hover:bg-primary-light px-4 py-1.5 rounded text-sm transition-colors">
                导出班级学生
            </button>
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700 ml-4">
                <input 
                    type="checkbox" 
                    checked={showActiveOnly} 
                    onChange={e => setShowActiveOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                仅展示“未开课、开课中”的班级
            </label>
         </div>
         
         {/* Custom List Button */}
         <button 
            onClick={handleOpenDrawer}
            className="border border-primary text-primary hover:bg-primary-light px-4 py-1.5 rounded text-sm transition-colors font-medium"
         >
            自定义列表
         </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="border-t border-gray-100">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                {columns.filter(c => c.visible).map(col => (
                    <th key={col.id} className="p-4">{col.label}</th>
                ))}
                <th className="p-4 text-center sticky right-0 bg-[#F9FBFA]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClasses.map(cls => {
                return (
                  <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                    {columns.filter(c => c.visible).map(col => (
                        <td key={col.id} className="p-4">
                            {getCellContent(col.id, cls)}
                        </td>
                    ))}
                    <td className="p-4 sticky right-0 bg-white hover:bg-gray-50">
                      <div className="flex gap-2 justify-center text-primary text-sm">
                        <button className="hover:opacity-80">编辑</button>
                        <button className="hover:opacity-80" onClick={() => { setSelectedClass(cls); setView('detail'); }}>学员管理</button>
                        <button className="hover:opacity-80" onClick={() => setShowQueueModal(cls.id)}>推送</button>
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

      {/* COLUMN CONFIG DRAWER */}
      {showColumnDrawer && (
        <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowColumnDrawer(false)}></div>
            <div className="fixed top-0 right-0 h-full w-[320px] bg-white z-50 shadow-2xl flex flex-col animate-slide-left">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">自定义列表</h3>
                    <button onClick={() => setShowColumnDrawer(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                
                <div className="p-4 border-b border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                            checked={tempColumns.filter(c => !c.mandatory).every(c => c.visible)}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        <span className="text-sm font-medium text-gray-700">全选</span>
                    </label>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {tempColumns.map((col, index) => (
                        <div 
                            key={col.id}
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${draggedItemIndex === index ? 'bg-primary-light border border-primary' : 'hover:bg-gray-50'}`}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <div className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-primary rounded focus:ring-primary disabled:opacity-50"
                                    checked={col.visible}
                                    disabled={col.mandatory}
                                    onChange={() => handleColumnToggle(col.id)}
                                />
                                <span className={`text-sm ${col.mandatory ? 'text-gray-400' : 'text-gray-700'}`}>
                                    {col.label}
                                </span>
                            </div>
                            <div className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing">
                                <svg width="16" height="16" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4">
                                    <path d="M8 12h32M8 24h32M8 36h32" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-5 border-t border-gray-100 flex gap-3">
                    <button 
                        onClick={() => setShowColumnDrawer(false)}
                        className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleConfirmColumns}
                        className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-teal-600"
                    >
                        确定
                    </button>
                </div>
            </div>
        </>
      )}

      {/* CREATE CLASS MODAL */}
      {showCreateModal && (
        <div className="absolute inset-0 bg-white z-50 overflow-y-auto">
          {/* ... existing modal content ... */}
          <div className="max-w-[1200px] mx-auto min-h-screen flex flex-col">
            {/* Header */}
            <div className="py-4 border-b border-gray-100 flex gap-2 text-sm text-gray-500 mb-4 px-6">
                <span 
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setShowCreateModal(false)}
                >
                  班级管理
                </span>
                <span>|</span>
                <span className="text-gray-800 font-bold">创建班级</span>
            </div>

            {/* Stepper */}
            {renderStepIndicator()}

            {/* Content Area */}
            <div className="flex-1 px-32 pb-20">
                {/* STEP 1: BASIC INFO */}
                {createStep === 1 && (
                    <div className="space-y-6">
                        <div className="border-l-4 border-primary pl-3 mb-6">
                            <h3 className="font-bold text-gray-800">基本信息</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6 max-w-[800px]">
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>课程名称</label>
                                <div className="flex-1 flex gap-2">
                                    <select 
                                        value={formData.courseId}
                                        onChange={e => setFormData({...formData, courseId: e.target.value})}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="">请选择课程</option>
                                        {COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <button className="px-4 py-2 border border-primary text-primary rounded text-sm hover:bg-primary-light">选择课程</button>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>班级名称</label>
                                <input 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" 
                                    placeholder="请填写班级名称"
                                />
                            </div>

                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>校区</label>
                                <select 
                                    value={formData.campus}
                                    onChange={e => setFormData({...formData, campus: e.target.value})}
                                    className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="">请选择校区</option>
                                    {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>教室</label>
                                <div className="flex-1 flex gap-2 items-center">
                                    <select 
                                        value={formData.classroom}
                                        onChange={e => setFormData({...formData, classroom: e.target.value})}
                                        className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="">请选择教室</option>
                                        {CLASSROOMS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <span className="text-primary text-sm cursor-pointer whitespace-nowrap">查看教室课表</span>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>学生人数上限</label>
                                <div className="flex-1 relative">
                                    <input 
                                        type="number"
                                        value={formData.capacity}
                                        onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                    />
                                    <span className="absolute right-3 top-2 text-sm text-gray-400">人</span>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>主教老师</label>
                                <div className="flex-1 flex gap-2 items-center">
                                    <select 
                                        value={formData.teacherId}
                                        onChange={e => setFormData({...formData, teacherId: e.target.value})}
                                        className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="">请选择主教老师</option>
                                        {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <span className="text-primary text-sm cursor-pointer whitespace-nowrap">查看老师课表</span>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4">调课虚位</label>
                                <input 
                                    value={formData.assistantId}
                                    onChange={e => setFormData({...formData, assistantId: e.target.value})}
                                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" 
                                    placeholder="请输入调课虚位"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: SESSION INFO */}
                {createStep === 2 && (
                    <div className="space-y-6">
                        <div className="border-l-4 border-primary pl-3 mb-2">
                            <h3 className="font-bold text-gray-800">讲次信息</h3>
                        </div>
                        
                        <div className="pl-4">
                            <div className="text-xs text-red-500 mb-6">
                                重要提醒：修改上课日期、频率、时间段都将重置课表的日期及时间，请慎重操作!!!
                            </div>

                            <div className="grid grid-cols-1 gap-6 max-w-[900px]">
                                <div className="flex items-center">
                                    <label className="w-24 text-sm text-gray-500 text-left mr-4"><span className="text-red-500 mr-1">*</span>首课日期</label>
                                    <div className="flex-1 flex items-center gap-4">
                                        <input 
                                            type="date"
                                            value={formData.startDate}
                                            onChange={e => setFormData({...formData, startDate: e.target.value})}
                                            className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm w-40"
                                        />
                                        <input 
                                            type="time"
                                            value={formData.startTime}
                                            onChange={e => setFormData({...formData, startTime: e.target.value})}
                                            className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm w-32"
                                        />
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <input type="checkbox" checked={formData.skipHolidays} onChange={e => setFormData({...formData, skipHolidays: e.target.checked})} className="rounded text-primary" />
                                            跳过停课日
                                        </label>
                                        <span className="text-primary text-sm cursor-pointer">设置停课日</span>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <label className="w-24 text-sm text-gray-500 text-left mr-4"><span className="text-red-500 mr-1">*</span>频率</label>
                                    <div className="flex-1 flex gap-4 flex-wrap">
                                        {WEEKDAYS.map(day => (
                                            <label key={day} className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.frequency.includes(day)}
                                                    onChange={e => {
                                                        const newFreq = e.target.checked 
                                                            ? [...formData.frequency, day]
                                                            : formData.frequency.filter(d => d !== day);
                                                        setFormData({...formData, frequency: newFreq});
                                                    }}
                                                    className="text-primary"
                                                />
                                                <span className="text-sm text-gray-600">{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview Table */}
                        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="p-3 font-medium">讲次</th>
                                        <th className="p-3 font-medium">讲次名称</th>
                                        <th className="p-3 font-medium text-right">上课日期</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {previewLessons.length > 0 ? previewLessons.map((l, idx) => (
                                        <tr key={l.id}>
                                            <td className="p-3 text-gray-600">第 {idx + 1} 讲</td>
                                            <td className="p-3 text-gray-800">{l.name}</td>
                                            <td className="p-3 text-right text-gray-600">{l.date} <span className="text-xs text-gray-400 ml-1">{l.startTime}-{l.endTime}</span></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-gray-400">暂无数据</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* STEP 3: PRICING INFO (Included Sales Info) */}
                {createStep === 3 && (
                    <div className="space-y-6">
                        <div className="border-l-4 border-primary pl-3 mb-6">
                            <h3 className="font-bold text-gray-800">售卖信息</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6 max-w-[800px]">
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>收费模式</label>
                                <select 
                                    value={formData.chargeMode}
                                    onChange={e => setFormData({...formData, chargeMode: e.target.value as any})}
                                    className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="whole">整期</option>
                                    <option value="single">单次</option>
                                </select>
                            </div>

                            <div className="flex items-start">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4 pt-2"><span className="text-red-500 mr-1">*</span>课程费</label>
                                <div className="flex-1 space-y-3">
                                    <div className="relative">
                                        <input 
                                            value={formData.price}
                                            onChange={e => setFormData({...formData, price: e.target.value})}
                                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" 
                                            placeholder="请输入"
                                        />
                                        <span className="absolute right-3 top-2 text-sm text-gray-400">元/人</span>
                                    </div>
                                    
                                    {/* Refund Policy Radio */}
                                    <div className="flex items-center gap-6 text-sm text-gray-600">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={formData.refundPolicy === 'unused'} onChange={() => setFormData({...formData, refundPolicy: 'unused'})} name="refund" className="text-primary" />
                                            根据未上讲次退费
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={formData.refundPolicy === 'full'} onChange={() => setFormData({...formData, refundPolicy: 'full'})} name="refund" className="text-primary" />
                                            前 1 讲退班，全额退费
                                            <span className="text-gray-300 text-xs">修改</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={formData.refundPolicy === 'partial'} onChange={() => setFormData({...formData, refundPolicy: 'partial'})} name="refund" className="text-primary" />
                                            后 1 讲退班，不退费用
                                            <span className="text-gray-300 text-xs">修改</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4 pt-2">教辅费</label>
                                <div className="flex-1 space-y-3">
                                    <div className="relative">
                                        <input 
                                            value={formData.materialPrice}
                                            onChange={e => setFormData({...formData, materialPrice: e.target.value})}
                                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" 
                                            placeholder="请输入"
                                        />
                                        <span className="absolute right-3 top-2 text-sm text-gray-400">元/人</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-6 text-sm text-gray-600">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={formData.materialRefundPolicy === 'no_return'} onChange={() => setFormData({...formData, materialRefundPolicy: 'no_return'})} name="materialRefund" className="text-primary" />
                                            报名后不退
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={formData.materialRefundPolicy === 'return'} onChange={() => setFormData({...formData, materialRefundPolicy: 'return'})} name="materialRefund" className="text-primary" />
                                            开课后不退
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-100 p-6 flex justify-center gap-4 sticky bottom-0">
                <button 
                    onClick={() => { setShowCreateModal(false); resetForm(); }} 
                    className="px-12 py-2.5 border border-gray-200 text-gray-600 bg-white rounded hover:bg-gray-50 text-sm"
                >
                    取消
                </button>
                
                {createStep > 1 && (
                    <button 
                        onClick={handlePrevStep} 
                        className="px-12 py-2.5 border border-gray-200 text-gray-600 bg-white rounded hover:bg-gray-50 text-sm"
                    >
                        上一步
                    </button>
                )}

                {createStep < 3 ? (
                    <button 
                        onClick={handleNextStep} 
                        className="px-12 py-2.5 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm"
                    >
                        下一步
                    </button>
                ) : (
                    <button 
                        onClick={handleCreateClass} 
                        className="px-12 py-2.5 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm"
                    >
                        创建
                    </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW PUSH QUEUE MODAL (Existing) */}
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
