
import React, { useState, useEffect, useRef } from 'react';
import { ClassInfo, Lesson, Course, Teacher, StudentProfile } from '../../types';
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
const SEMESTERS = ['春季', '暑假', '秋季', '寒假'];

// Cascading Data Structures
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

const LOCATION_DATA: Record<string, Record<string, string[]>> = {
  '南京': {
    '鼓楼区': ['龙江校区', '辰龙校区', '五台山校区'],
    '建邺区': ['奥南校区', '奥体网球中心校区'],
    '玄武区': ['大行宫校区'],
    '栖霞区': ['仙林校区', '爱邦中心校区']
  },
  '深圳': {
    '南山区': ['深圳湾校区'],
    '宝安区': ['宝安中心校区']
  }
};

// Updated Column Structure
const DISPLAY_COLUMNS = [
  { id: 'id', label: '班级ID' },
  { id: 'name', label: '班级名称' },
  { id: 'mode', label: '授课方式' },
  { id: 'courseName', label: '课程名称' },
  { id: 'courseType', label: '课程类型' },
  { id: 'progress', label: '教学进度' },
  { id: 'capacity', label: '预招人数' },
  { id: 'enrolled', label: '已报人数' },
  { id: 'remaining', label: '余位' },
  { id: 'year', label: '年份' },
  { id: 'semester', label: '学期' },
  { id: 'grade', label: '班层' },
  { id: 'teacher', label: '主教老师' },
  { id: 'assistant', label: '助教' },
  { id: 'city', label: '城市' },
  { id: 'district', label: '区域' },
  { id: 'campus', label: '校区' },
  { id: 'classroom', label: '教室' },
  { id: 'price', label: '课程费用' },
  { id: 'status', label: '班级状态' },
  { id: 'saleStatus', label: '售卖状态' },
  { id: 'schedule', label: '上课时间' },
  { id: 'createdTime', label: '创建时间' },
];

// --- Classroom Schedule Modal Component ---
const ClassroomScheduleModal: React.FC<{ 
  campus: string, 
  onClose: () => void 
}> = ({ campus, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate Week Days based on currentDate
  const getWeekDays = (date: Date) => {
    const day = date.getDay(); 
    // Adjust so week starts on Monday (1) - Standard in China business
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(date.setDate(diff));
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const weekDays = getWeekDays(new Date(currentDate));
  
  // Formatters
  const formatDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;
  const formatWeekDay = (date: Date) => ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
  const formatHeaderDate = (date: Date) => `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

  // Mock Classrooms for the selected campus
  // In real app, fetch from API. Here we generate some based on campus name.
  const shortCampusName = campus.replace('校区', '');
  const mockClassrooms = [`${shortCampusName}101`, `${shortCampusName}102`, `${shortCampusName}201`, `${shortCampusName}202`, `${shortCampusName}301`];

  // Helper to change week
  const changeWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (offset * 7));
    setCurrentDate(newDate);
  };

  // Mock Schedule Generator
  const getScheduleFor = (classroom: string, date: Date) => {
    // Deterministic random for demo consistency
    const seed = classroom.length + date.getDate();
    if (seed % 3 === 0) {
       return [
         { time: '08:30-11:00', name: '寒G2-A | Ophelia', type: '面授' },
         { time: '14:50-17:20', name: '寒G1-A | Linda', type: '面授' },
       ];
    } 
    if (seed % 5 === 0) {
       return [
         { time: '18:00-20:30', name: '寒G5-S | Justin', type: '面授' }
       ];
    }
    return [];
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-[1100px] h-[800px] flex flex-col shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl">
           <h3 className="text-lg font-bold text-gray-800">教室课表 - {campus}</h3>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-gray-200 rounded text-gray-500">◀</button>
                 <span className="text-lg font-bold text-gray-800">
                    {formatHeaderDate(weekDays[0])} - {formatHeaderDate(weekDays[6]).split('年')[1]}
                 </span>
                 <button onClick={() => changeWeek(1)} className="p-1 hover:bg-gray-200 rounded text-gray-500">▶</button>
              </div>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100"
              >
                今
              </button>
           </div>
           
           <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>
                 <span className="text-gray-600">冲突</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-blue-50 border border-blue-200"></div>
                 <span className="text-gray-600">已占用</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
                 <span className="text-gray-600">空闲</span>
              </div>
           </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto p-6">
           <div className="border border-gray-200 rounded-lg overflow-hidden min-w-[900px]">
              {/* Grid Header */}
              <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
                 <div className="p-4 font-bold text-gray-600 border-r border-gray-200 flex items-center justify-center">教室</div>
                 {weekDays.map((date, i) => (
                    <div key={i} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                       <div className="text-xs text-gray-500 mb-1">{formatDate(date)}</div>
                       <div className="font-bold text-gray-700">{formatWeekDay(date)}</div>
                    </div>
                 ))}
              </div>

              {/* Grid Rows */}
              {mockClassrooms.map((room, rIdx) => (
                 <div key={room} className={`grid grid-cols-8 ${rIdx !== mockClassrooms.length -1 ? 'border-b border-gray-200' : ''}`}>
                    {/* Room Name Column */}
                    <div className="p-4 bg-gray-50/30 border-r border-gray-200 flex flex-col justify-center gap-1">
                       <div className="font-bold text-gray-700 text-sm text-center">{room}</div>
                       <div className="text-xs text-gray-400 text-center">用途：面授</div>
                    </div>
                    
                    {/* Schedule Columns */}
                    {weekDays.map((date, cIdx) => {
                       const items = getScheduleFor(room, date);
                       return (
                          <div key={cIdx} className="p-2 border-r border-gray-200 last:border-r-0 min-h-[120px] relative hover:bg-gray-50 transition-colors">
                             {items.length > 0 ? (
                                <div className="space-y-2">
                                   {items.map((item, idx) => (
                                      <div key={idx} className="bg-blue-50 border border-blue-100 rounded p-2 text-xs hover:shadow-md transition-shadow cursor-default group">
                                         <div className="font-bold text-gray-800 mb-1">{item.time}</div>
                                         <div className="text-blue-600 mb-0.5"><span className="text-orange-500 mr-1">[{item.type}]</span>{item.name.split('|')[0]}</div>
                                         <div className="text-gray-500 opacity-80 scale-90 origin-left">{item.name.split('|')[1]}</div>
                                      </div>
                                   ))}
                                </div>
                             ) : (
                                <div className="h-full flex items-center justify-center text-gray-300 text-sm select-none">
                                   无
                                </div>
                             )}
                          </div>
                       );
                    })}
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Teacher Schedule Modal Component ---
const TeacherScheduleModal: React.FC<{ 
  teacherId: string, 
  onClose: () => void 
}> = ({ teacherId, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const teacher = TEACHERS.find(t => t.id === teacherId);
  const teacherName = teacher?.name || '未知老师';

  // Generate Week Days based on currentDate
  const getWeekDays = (date: Date) => {
    const day = date.getDay(); 
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(date.setDate(diff));
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const weekDays = getWeekDays(new Date(currentDate));
  
  const formatDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;
  const formatWeekDay = (date: Date) => ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
  const formatHeaderDate = (date: Date) => `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

  const changeWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (offset * 7));
    setCurrentDate(newDate);
  };

  // Mock Schedule Generator for Teacher
  const getScheduleFor = (date: Date) => {
    // Deterministic random
    const seed = teacherId.length + date.getDate();
    if (seed % 4 === 0) {
       return [
         { time: '09:00-11:00', name: '暑G1-S | 龙江校区', type: '面授' },
       ];
    }
    if (seed % 3 === 0) {
       return [
         { time: '14:00-16:00', name: '暑G2-A | 奥南校区', type: '面授' },
         { time: '18:00-20:00', name: '暑G3-A+ | 仙林校区', type: '面授' },
       ];
    }
    return [];
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-[1100px] h-[800px] flex flex-col shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl">
           <h3 className="text-lg font-bold text-gray-800">老师课表 - {teacherName}</h3>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-gray-200 rounded text-gray-500">◀</button>
                 <span className="text-lg font-bold text-gray-800">
                    {formatHeaderDate(weekDays[0])} - {formatHeaderDate(weekDays[6]).split('年')[1]}
                 </span>
                 <button onClick={() => changeWeek(1)} className="p-1 hover:bg-gray-200 rounded text-gray-500">▶</button>
              </div>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100"
              >
                今
              </button>
           </div>
           
           <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>
                 <span className="text-gray-600">冲突</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-blue-50 border border-blue-200"></div>
                 <span className="text-gray-600">已占用</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
                 <span className="text-gray-600">空闲</span>
              </div>
           </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto p-6">
           <div className="border border-gray-200 rounded-lg overflow-hidden min-w-[900px]">
              {/* Grid Header */}
              <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
                 <div className="p-4 font-bold text-gray-600 border-r border-gray-200 flex items-center justify-center">老师</div>
                 {weekDays.map((date, i) => (
                    <div key={i} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                       <div className="text-xs text-gray-500 mb-1">{formatDate(date)}</div>
                       <div className="font-bold text-gray-700">{formatWeekDay(date)}</div>
                    </div>
                 ))}
              </div>

              {/* Grid Rows - Single Row for Selected Teacher */}
              <div className="grid grid-cols-8">
                 {/* Teacher Name Column */}
                 <div className="p-4 bg-gray-50/30 border-r border-gray-200 flex flex-col justify-center gap-1 min-h-[150px]">
                    <div className="font-bold text-gray-700 text-sm text-center">{teacherName}</div>
                    <div className="text-xs text-gray-400 text-center">ID: {teacherId}</div>
                 </div>
                 
                 {/* Schedule Columns */}
                 {weekDays.map((date, cIdx) => {
                    const items = getScheduleFor(date);
                    return (
                       <div key={cIdx} className="p-2 border-r border-gray-200 last:border-r-0 relative hover:bg-gray-50 transition-colors">
                          {items.length > 0 ? (
                             <div className="space-y-2">
                                {items.map((item, idx) => (
                                   <div key={idx} className="bg-blue-50 border border-blue-100 rounded p-2 text-xs hover:shadow-md transition-shadow cursor-default group">
                                      <div className="font-bold text-gray-800 mb-1">{item.time}</div>
                                      <div className="text-blue-600 mb-0.5"><span className="text-orange-500 mr-1">[{item.type}]</span>{item.name.split('|')[0]}</div>
                                      <div className="text-gray-500 opacity-80 scale-90 origin-left">{item.name.split('|')[1]}</div>
                                   </div>
                                ))}
                             </div>
                          ) : (
                             <div className="h-full flex items-center justify-center text-gray-300 text-sm select-none">
                                无
                             </div>
                          )}
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

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
  const [activeDetailTab, setActiveDetailTab] = useState<'basic' | 'course' | 'sales' | 'changes' | 'students'>('basic');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [showQueueModal, setShowQueueModal] = useState<string | null>(null); // holds class ID
  const [editingId, setEditingId] = useState<string | null>(null); // New: Editing ID
  
  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTeacherScheduleModal, setShowTeacherScheduleModal] = useState(false);

  // Student Management Modal State
  const [showStudentManageModal, setShowStudentManageModal] = useState(false);
  const [studentManageClass, setStudentManageClass] = useState<ClassInfo | null>(null);
  const [enrolledList, setEnrolledList] = useState<StudentProfile[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string[]>([]);
  const [selectedRight, setSelectedRight] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  // Filter States
  const [filterName, setFilterName] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  
  // Class Level Filter
  const [filterGrade, setFilterGrade] = useState('');
  const [filterClassType, setFilterClassType] = useState('');

  // Address Filter
  const [filterCity, setFilterCity] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterCampus, setFilterCampus] = useState('');
  const [filterClassroom, setFilterClassroom] = useState('');

  // Teacher Filter
  const [filterTeacher, setFilterTeacher] = useState(''); 

  const [filterStatus, setFilterStatus] = useState('');
  const [filterCourseType, setFilterCourseType] = useState('');
  
  // NEW FILTERS
  const [filterRemaining, setFilterRemaining] = useState('');
  const [filterSaleStatus, setFilterSaleStatus] = useState('');
  
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Dynamic Options
  const allClassTypes = Array.from(new Set(Object.values(GRADE_CLASS_TYPES).flat()));
  const availableClassTypes = filterGrade ? GRADE_CLASS_TYPES[filterGrade] : allClassTypes;

  const allDistricts = Array.from(new Set(Object.values(LOCATION_DATA).flatMap(city => Object.keys(city))));
  const availableDistricts = filterCity ? Object.keys(LOCATION_DATA[filterCity]) : allDistricts;

  const allCampusesFromData = Array.from(new Set(Object.values(LOCATION_DATA).flatMap(city => Object.values(city).flat())));
  let availableCampuses = allCampusesFromData;
  if (filterDistrict && filterCity) {
      availableCampuses = LOCATION_DATA[filterCity][filterDistrict] || [];
  } else if (filterCity) {
      availableCampuses = Object.values(LOCATION_DATA[filterCity]).flat();
  } else if (filterDistrict) {
       // Find district anywhere
       for (const city in LOCATION_DATA) {
           if (LOCATION_DATA[city][filterDistrict]) {
               availableCampuses = LOCATION_DATA[city][filterDistrict];
               break;
           }
       }
  }

  // Listen for trigger from parent to open modal
  useEffect(() => {
    if (createTrigger > 0) {
      resetForm();
      setShowCreateModal(true);
    }
  }, [createTrigger]);

  // Create Modal Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    courseId: '',
    name: '',
    year: '2025',
    campus: '',
    classroom: '',
    capacity: 20,
    virtualSeats: 0,
    teacherId: '',
    assistantId: '', 
    semester: '暑假',
    subject: '英语',
    grade: '1年级',
    studentGrade: '1年级',
    studentTag: '',
    allowStudentSchedule: false,
    allowConflict: false, 
    needQualification: false, 

    // Step 2: Session Info
    startDate: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:00', // Added endTime
    skipHolidays: true,
    frequency: [] as string[], 

    // Step 3: Pricing / Sales Info
    chargeMode: 'whole' as 'whole' | 'installment', 
    price: '',
    refundPolicy: 'unused' as 'unused' | 'full' | 'partial',
    materialPrice: '',
    materialRefundPolicy: 'no_return' as 'no_return' | 'return',
  });
  
  // Generated Lessons Preview State
  const [previewLessons, setPreviewLessons] = useState<Lesson[]>([]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      courseId: '',
      name: '',
      year: '2025',
      campus: '',
      classroom: '',
      capacity: 20,
      virtualSeats: 0,
      teacherId: '',
      assistantId: '',
      semester: '暑假',
      subject: '英语',
      grade: '1年级',
      studentGrade: '1年级',
      studentTag: '',
      allowStudentSchedule: false,
      allowConflict: false,
      needQualification: false,
      startDate: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '16:00',
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

  // Student Management Handlers
  const handleOpenStudentManage = (cls: ClassInfo) => {
      setStudentManageClass(cls);
      // Mock existing students: For demo, grab the first N students from ADMIN_STUDENTS
      // In a real app, you would fetch by classId
      const count = cls.studentCount || 0;
      const current = ADMIN_STUDENTS.slice(0, count);
      setEnrolledList(current);
      setShowStudentManageModal(true);
      setSelectedLeft([]);
      setSelectedRight([]);
      setStudentSearch('');
  };

  const toggleLeftSelection = (id: string) => {
      setSelectedLeft(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleRightSelection = (id: string) => {
      setSelectedRight(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAddStudents = () => {
      // Find students in left selection that are NOT in enrolled list (double check)
      const available = ADMIN_STUDENTS.filter(s => !enrolledList.find(e => e.id === s.id));
      const toAdd = available.filter(s => selectedLeft.includes(s.id));
      setEnrolledList([...enrolledList, ...toAdd]);
      setSelectedLeft([]);
  };

  const handleRemoveStudents = () => {
      setEnrolledList(enrolledList.filter(s => !selectedRight.includes(s.id)));
      setSelectedRight([]);
  };

  const handleSaveStudentManage = () => {
      if (studentManageClass) {
          // In a real app, update backend. Here we update local state if needed.
          const updatedClass = { ...studentManageClass, studentCount: enrolledList.length };
          onAddClass(updatedClass, lessons.filter(l => l.classId === updatedClass.id));
      }
      setShowStudentManageModal(false);
  };

  const handleEditClass = (cls: ClassInfo) => {
    setEditingId(cls.id);
    
    // Parse time slot
    let start = '14:00';
    let end = '16:00';
    if (cls.timeSlot && cls.timeSlot.includes('-')) {
        const parts = cls.timeSlot.split('-');
        start = parts[0];
        end = parts[1];
    }

    // Find existing lessons for this class
    const existingLessons = lessons.filter(l => l.classId === cls.id);
    setPreviewLessons(existingLessons);

    setFormData({
        courseId: cls.courseId || '',
        name: cls.name,
        year: cls.year || '2025',
        campus: cls.campus || '',
        classroom: cls.classroom || '',
        capacity: cls.capacity || 20,
        virtualSeats: cls.virtualSeats || 0,
        teacherId: cls.teacherId || '',
        assistantId: cls.assistant || '',
        semester: cls.semester || '暑假',
        subject: cls.subject || '英语',
        grade: cls.grade || '1年级',
        studentGrade: cls.studentGrade || '1年级',
        studentTag: cls.studentTag || '',
        allowStudentSchedule: cls.allowStudentSchedule || false,
        allowConflict: cls.allowConflict || false,
        needQualification: cls.needQualification || false,
        
        startDate: cls.startDate || new Date().toISOString().split('T')[0],
        startTime: start,
        endTime: end,
        skipHolidays: true,
        frequency: [], 
        
        chargeMode: (cls.chargeMode as 'whole' | 'installment') || 'whole',
        price: cls.price?.toString() || '',
        refundPolicy: cls.refundPolicy || 'unused',
        materialPrice: cls.materialPrice?.toString() || '',
        materialRefundPolicy: cls.materialRefundPolicy || 'no_return',
    });
    
    setShowCreateModal(true);
    setCreateStep(1);
  };

  const handleGenerateSchedule = () => {
    if (!formData.startDate || !formData.courseId) {
        alert("请选择首课日期和课程");
        return;
    }
    
    const course = COURSES.find(c => c.id === formData.courseId);
    if (!course) return;

    const newLessons: Lesson[] = [];
    const start = new Date(formData.startDate);
    const lessonsCount = course.lessons && course.lessons.length > 0 ? course.lessons.length : course.lessonCount;
    
    let currentDate = new Date(start);
    let count = 0;
    
    const targetDays = formData.frequency.map(d => WEEKDAYS.indexOf(d));

    while (count < lessonsCount) {
        if (targetDays.length > 0) {
            while (!targetDays.includes(currentDate.getDay())) {
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        const dateStr = currentDate.toISOString().split('T')[0];
        const lessonName = course.lessons?.[count]?.name || `${course.name} - Lesson ${count + 1}`;
        const pushTimeStr = `${dateStr} ${formData.startTime}`;

        newLessons.push({
            id: `preview-${Date.now()}-${count}`,
            classId: editingId || 'temp',
            name: lessonName,
            date: dateStr,
            startTime: formData.startTime,
            endTime: formData.endTime,
            status: 'pending',
            teacherId: formData.teacherId,
            pushTime: pushTimeStr,
            pushStatus: 'pending'
        });

        currentDate.setDate(currentDate.getDate() + 1);
        count++;
    }
    
    setPreviewLessons(newLessons);
  };

  const handleLessonChange = (index: number, field: keyof Lesson, value: string) => {
      const updated = [...previewLessons];
      updated[index] = { ...updated[index], [field]: value };
      
      // Optional: Auto-update pushTime if date changes and it was in sync
      if (field === 'date') {
          const oldDate = previewLessons[index].date;
          if (updated[index].pushTime && updated[index].pushTime?.startsWith(oldDate)) {
              updated[index].pushTime = updated[index].pushTime?.replace(oldDate, value);
          }
      }
      setPreviewLessons(updated);
  };

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
    
    const classId = editingId || Math.floor(550 + Math.random() * 100).toString();

    // Auto-generate schedule description
    const endDate = previewLessons.length > 0 ? previewLessons[previewLessons.length - 1].date : formData.startDate;
    const scheduleDesc = `${formData.startDate.replace(/-/g, '.')} - ${endDate.replace(/-/g, '.')}`;

    const newClass: ClassInfo = {
      id: classId,
      name: formData.name,
      timeSlot: `${formData.startTime}-${formData.endTime}`,
      description: course?.name || '',
      color: '#2DA194',
      campus: formData.campus,
      teacherId: formData.teacherId,
      assistant: formData.assistantId, 
      capacity: formData.capacity,
      virtualSeats: formData.virtualSeats,
      studentCount: editingId ? (classes.find(c=>c.id===editingId)?.studentCount || 0) : 0,
      courseId: formData.courseId,
      startDate: formData.startDate,
      status: editingId ? (classes.find(c=>c.id===editingId)?.status || 'pending') : 'pending',
      saleStatus: editingId ? (classes.find(c=>c.id===editingId)?.saleStatus || 'off_sale') : 'off_sale',
      createdTime: editingId ? (classes.find(c=>c.id===editingId)?.createdTime) : new Date().toLocaleString(),
      scheduleDescription: scheduleDesc,
      city: '南京', 
      district: '鼓楼区',
      
      year: formData.year,
      semester: formData.semester,
      subject: formData.subject,
      grade: formData.grade,
      studentGrade: formData.studentGrade,
      classroom: formData.classroom,
      studentTag: formData.studentTag,
      allowStudentSchedule: formData.allowStudentSchedule,
      allowConflict: formData.allowConflict,
      needQualification: formData.needQualification,
      chargeMode: formData.chargeMode,
      price: parseFloat(formData.price) || 0,
      refundPolicy: formData.refundPolicy,
      materialPrice: parseFloat(formData.materialPrice) || 0,
      materialRefundPolicy: formData.materialRefundPolicy
    };

    const finalLessons = previewLessons.map(l => ({
      ...l,
      classId: newClass.id,
      id: l.id.startsWith('preview-') ? `l-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : l.id
    }));

    onAddClass(newClass, finalLessons);
    setShowCreateModal(false);
    resetForm();
  };

  const handleToggleSaleStatus = (cls: ClassInfo) => {
      const updatedClass = { ...cls, saleStatus: cls.saleStatus === 'on_sale' ? 'off_sale' as const : 'on_sale' as const };
      const classLessons = lessons.filter(l => l.classId === cls.id);
      onAddClass(updatedClass, classLessons);
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
    
    // 2. Simple Filters
    const matchMode = !filterMode || '面授' === filterMode; 
    const matchYear = !filterYear || (cls.year === filterYear || course?.year === filterYear);
    const matchSubject = !filterSubject || cls.subject === filterSubject || course?.subject === filterSubject;
    const matchSemester = !filterSemester || cls.semester === filterSemester;
    
    // 3. Teacher Filter
    const matchTeacher = !filterTeacher || cls.teacherId === filterTeacher;

    // 4. Other filters
    const matchGrade = !filterGrade || cls.grade === filterGrade || course?.grade === filterGrade;
    const matchClassType = !filterClassType || cls.studentTag === filterClassType;
    const matchCity = !filterCity || cls.city === filterCity;
    const matchDistrict = !filterDistrict || cls.district === filterDistrict;
    const matchCampus = !filterCampus || cls.campus === filterCampus;
    const matchClassroom = !filterClassroom || cls.classroom === filterClassroom;
    
    let matchStatus = true;
    if (filterStatus) {
        if (filterStatus === 'pending') matchStatus = cls.status === 'pending';
        else if (filterStatus === 'active') matchStatus = ['active', 'full'].includes(cls.status || '');
        else if (filterStatus === 'closed') matchStatus = ['closed', 'disabled'].includes(cls.status || '');
    }

    const matchCourseType = !filterCourseType || course?.type === filterCourseType;

    // 5. New Filters
    const matchRemaining = !filterRemaining || (filterRemaining === 'has_seats' ? ((cls.capacity || 0) - (cls.studentCount || 0) > 0) : ((cls.capacity || 0) - (cls.studentCount || 0) <= 0));
    const matchSaleStatus = !filterSaleStatus || cls.saleStatus === filterSaleStatus;

    let matchCheckbox = true;
    if (showActiveOnly) {
        matchCheckbox = ['pending', 'active', 'full'].includes(cls.status || 'pending');
    }

    return matchName && matchMode && matchYear && matchSubject && matchGrade && matchClassType && 
           matchSemester && matchTeacher && matchCity && matchDistrict && matchCampus && 
           matchClassroom && matchStatus && matchCourseType && matchCheckbox && matchRemaining && matchSaleStatus;
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
    
    const classLessonList = lessons.filter(l => l.classId === cls.id);
    const totalLessons = classLessonList.length > 0 ? classLessonList.length : (course?.lessonCount || 0);
    const completedLessons = classLessonList.filter(l => l.status === 'completed').length;
    const progressText = `${completedLessons}/${totalLessons}`;

    const displayGrade = cls.grade || course?.grade || '-';
    const displayClassType = cls.studentTag || course?.classType || '-';

    switch(colId) {
        case 'id': return <span className="text-gray-600">{cls.id}</span>;
        case 'name': return (
            <span 
                className="text-primary cursor-pointer hover:underline font-medium"
                onClick={() => { setSelectedClass(cls); setView('detail'); setActiveDetailTab('basic'); }}
            >
                {cls.name}
            </span>
        );
        case 'mode': return <span className="text-gray-600">面授</span>;
        case 'courseName': return <span className="text-gray-800">{course?.name}</span>;
        case 'courseType': return <span className="text-gray-600">{course?.type === 'long-term' ? '长期班' : course?.type === 'short-term' ? '短期班' : '体验课'}</span>;
        case 'progress': return <span className="text-gray-600">{progressText}</span>;
        case 'enrolled': return (
            <span className="text-gray-600">
                {cls.studentCount}
            </span>
        );
        case 'capacity': return <span className="text-gray-600">{cls.capacity}</span>;
        case 'remaining': return <span className="text-gray-600">{Math.max(0, (cls.capacity || 0) - (cls.studentCount || 0))}</span>;
        case 'year': return <span className="text-gray-600">{cls.year || course?.year || '-'}</span>;
        case 'semester': return <span className="text-gray-600">{cls.semester || course?.semester || '-'}</span>;
        case 'grade': return (
            <div className="flex gap-1">
                {displayGrade !== '-' && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{displayGrade}</span>}
                {displayClassType !== '-' && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{displayClassType}</span>}
            </div>
        );
        case 'teacher': return <span className="text-gray-800">{teacher?.name || '-'}</span>;
        case 'assistant': return <span className="text-gray-600">{assistant?.name || cls.assistant || '-'}</span>;
        case 'city': return <span className="text-gray-600">{cls.city || '-'}</span>;
        case 'district': return <span className="text-gray-600">{cls.district || '-'}</span>;
        case 'campus': return <span className="text-gray-600">{cls.campus}</span>;
        case 'classroom': return <span className="text-gray-600">{cls.classroom || '-'}</span>;
        case 'price': return <span className="text-gray-600">¥{cls.price || 0}</span>;
        case 'status': return getStatusBadge(cls.status || 'pending');
        case 'saleStatus': 
            return cls.saleStatus === 'on_sale' 
                ? <span className="text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded text-xs">已上架</span>
                : <span className="text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-xs">未上架</span>;
        case 'schedule': return <span className="text-gray-600 text-xs">{cls.scheduleDescription || cls.startDate} {cls.timeSlot}</span>;
        case 'createdTime': return <span className="text-gray-600 text-xs">{cls.createdTime}</span>;
        default: return null;
    }
  };

  // Filter available students for the modal
  const filteredAvailableStudents = ADMIN_STUDENTS.filter(s => {
      // Must not be in enrolled list
      const isEnrolled = enrolledList.find(e => e.id === s.id);
      if (isEnrolled) return false;
      // Must match search
      if (studentSearch) {
          return s.name.includes(studentSearch) || s.account.includes(studentSearch);
      }
      return true;
  });

  // ... Detail View ...
  if (view === 'detail' && selectedClass) {
      const course = COURSES.find(c => c.id === selectedClass.courseId);
      const teacher = TEACHERS.find(t => t.id === selectedClass.teacherId);
      const classLessons = lessons.filter(l => l.classId === selectedClass.id).sort((a,b) => a.date.localeCompare(b.date));
      
      // Mock changes
      const mockChanges = [
          { id: 1, info: '修改了上课时间', time: '2025-06-20 10:00:00', operator: '管理员A' },
          { id: 2, info: '创建班级', time: '2025-06-15 09:30:00', operator: '管理员B' },
      ];

      // Mock students (using global students list for demo)
      const enrolledStudents = ADMIN_STUDENTS.slice(0, selectedClass.studentCount || 3);

      return (
          <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
              <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center text-sm">
                  <span className="text-gray-500 cursor-pointer hover:text-primary" onClick={() => setView('list')}>班级管理</span>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="text-gray-800">班级详情</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Top Card / Header of Details */}
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedClass.name}</h2>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">{selectedClass.grade}</span>
                                  <span>ID: {selectedClass.id}</span>
                                  <span>{course?.name}</span>
                              </div>
                          </div>
                          <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditClass(selectedClass)}
                                className="px-4 py-1.5 border border-primary text-primary rounded text-sm hover:bg-primary-light"
                              >
                                编辑
                              </button>
                          </div>
                      </div>
                      
                      {/* Tabs */}
                      <div className="flex border-b border-gray-100">
                          {['basic', 'course', 'sales', 'changes', 'students'].map(tab => (
                              <div 
                                key={tab}
                                onClick={() => setActiveDetailTab(tab as any)}
                                className={`px-6 py-3 text-sm font-medium cursor-pointer relative ${
                                    activeDetailTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                  {tab === 'basic' && '基本信息'}
                                  {tab === 'course' && '课程信息'}
                                  {tab === 'sales' && '售卖信息'}
                                  {tab === 'changes' && '变动信息'}
                                  {tab === 'students' && '班级学员'}
                                  {activeDetailTab === tab && (
                                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
                                  )}
                              </div>
                          ))}
                      </div>

                      {/* Content Area */}
                      <div className="pt-6">
                          {activeDetailTab === 'basic' && (
                              <div className="grid grid-cols-2 gap-y-6 text-sm text-gray-600">
                                  <div className="col-span-2"><span className="text-gray-400 w-24 inline-block">课程名称：</span><span className="text-gray-900">{course?.name}</span></div>
                                  <div className="col-span-2"><span className="text-gray-400 w-24 inline-block">班级名称：</span><span className="text-gray-900">{selectedClass.name}</span></div>
                                  <div><span className="text-gray-400 w-24 inline-block">年份：</span><span className="text-gray-900">{selectedClass.year || course?.year}</span></div>
                                  <div><span className="text-gray-400 w-24 inline-block">学期：</span><span className="text-gray-900">{selectedClass.semester || '-'}</span></div>
                                  <div><span className="text-gray-400 w-24 inline-block">面授老师：</span><span className="text-gray-900">{teacher?.name}</span></div>
                                  <div><span className="text-gray-400 w-24 inline-block">校区：</span><span className="text-gray-900">{selectedClass.campus}</span></div>
                                  <div><span className="text-gray-400 w-24 inline-block">预招人数：</span><span className="text-gray-900">{selectedClass.capacity}</span></div>
                                  <div><span className="text-gray-400 w-24 inline-block">教室：</span><span className="text-gray-900">{selectedClass.classroom || '-'}</span></div>
                                  <div><span className="text-gray-400 w-24 inline-block">助教：</span><span className="text-gray-900">{selectedClass.assistant || '0'}</span></div>
                                  <div><span className="text-gray-400 w-24 inline-block">年级：</span><span className="text-gray-900">{selectedClass.grade || '-'}</span></div>
                              </div>
                          )}

                          {activeDetailTab === 'course' && (
                              <div>
                                  <table className="w-full text-sm text-left border border-gray-100 rounded-lg overflow-hidden">
                                      <thead className="bg-gray-50 text-gray-500 font-medium">
                                          <tr>
                                              <th className="p-3">序号</th>
                                              <th className="p-3">课节名称</th>
                                              <th className="p-3">上课日期</th>
                                              <th className="p-3">上课时间</th>
                                              <th className="p-3">状态</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                          {classLessons.map((l, idx) => (
                                              <tr key={l.id}>
                                                  <td className="p-3 text-gray-600">{idx + 1}</td>
                                                  <td className="p-3 text-gray-800">{l.name}</td>
                                                  <td className="p-3 text-gray-600">{l.date}</td>
                                                  <td className="p-3 text-gray-600">{l.startTime} - {l.endTime}</td>
                                                  <td className="p-3">
                                                      {l.status === 'completed' && <span className="text-green-500">已完成</span>}
                                                      {l.status === 'pending' && <span className="text-orange-500">未开始</span>}
                                                  </td>
                                              </tr>
                                          ))}
                                          {classLessons.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-400">暂无课节信息</td></tr>}
                                      </tbody>
                                  </table>
                              </div>
                          )}

                          {activeDetailTab === 'sales' && (
                              <div className="grid grid-cols-1 gap-y-6 text-sm text-gray-600 max-w-2xl">
                                  <div className="flex"><span className="text-gray-400 w-32 inline-block">收费模式：</span><span className="text-gray-900">{selectedClass.chargeMode === 'whole' ? '整期' : '分期'}</span></div>
                                  <div className="flex"><span className="text-gray-400 w-32 inline-block">课程费用：</span><span className="text-red-500 font-bold">¥{selectedClass.price}</span></div>
                                  <div className="flex"><span className="text-gray-400 w-32 inline-block">退费策略：</span><span className="text-gray-900">
                                      {selectedClass.refundPolicy === 'unused' ? '根据未上讲次退费' : selectedClass.refundPolicy === 'full' ? '前1讲退班全额退费' : '后1讲退班不退费'}
                                  </span></div>
                                  <div className="flex"><span className="text-gray-400 w-32 inline-block">教辅费用：</span><span className="text-red-500 font-bold">¥{selectedClass.materialPrice || 0}</span></div>
                                  <div className="flex"><span className="text-gray-400 w-32 inline-block">教辅退费策略：</span><span className="text-gray-900">
                                      {selectedClass.materialRefundPolicy === 'no_return' ? '报名后不退' : '开课后不退'}
                                  </span></div>
                              </div>
                          )}

                          {activeDetailTab === 'changes' && (
                              <div>
                                  <table className="w-full text-sm text-left border border-gray-100 rounded-lg overflow-hidden">
                                      <thead className="bg-gray-50 text-gray-500 font-medium">
                                          <tr>
                                              <th className="p-3">序号</th>
                                              <th className="p-3">变动信息</th>
                                              <th className="p-3">变动时间</th>
                                              <th className="p-3">操作人</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                          {mockChanges.map((log) => (
                                              <tr key={log.id}>
                                                  <td className="p-3 text-gray-600">{log.id}</td>
                                                  <td className="p-3 text-gray-800">{log.info}</td>
                                                  <td className="p-3 text-gray-600">{log.time}</td>
                                                  <td className="p-3 text-gray-600">{log.operator}</td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                          )}

                          {activeDetailTab === 'students' && (
                              <div>
                                  <table className="w-full text-sm text-left border border-gray-100 rounded-lg overflow-hidden">
                                      <thead className="bg-gray-50 text-gray-500 font-medium">
                                          <tr>
                                              <th className="p-3">学员姓名</th>
                                              <th className="p-3">性别</th>
                                              <th className="p-3">登录账号</th>
                                              <th className="p-3">入班时间</th>
                                              <th className="p-3">状态</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                          {enrolledStudents.map((s) => (
                                              <tr key={s.id}>
                                                  <td className="p-3 text-gray-800 font-medium">{s.name}</td>
                                                  <td className="p-3 text-gray-600">{s.gender}</td>
                                                  <td className="p-3 text-gray-600">{s.account}</td>
                                                  <td className="p-3 text-gray-600">2025-07-01 10:00</td>
                                                  <td className="p-3"><span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs">在读</span></td>
                                              </tr>
                                          ))}
                                          {enrolledStudents.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-400">暂无学员</td></tr>}
                                      </tbody>
                                  </table>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      );
  }

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
                          {step === 2 && '课程信息'}
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
      {/* ... Filter Header ... */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">班级管理</h2>
      </div>

      {/* FILTER BAR - REDESIGNED */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white space-y-3">
        {/* Row 1 */}
        <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[140px] flex-shrink-0">
               <input className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full pl-8 focus:outline-none focus:border-primary placeholder-gray-400 h-[34px]" placeholder="班级名称" value={filterName} onChange={e => setFilterName(e.target.value)} />
               <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
            </div>
            
            {/* Standard Filters */}
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]" value={filterMode} onChange={e => setFilterMode(e.target.value)}>
                <option value="">授课方式</option>
                <option value="面授">面授</option>
                <option value="网课">网课</option>
            </select>
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[90px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                <option value="">年份</option>
                {YEARS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[90px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]" value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
                <option value="">学期</option>
                {SEMESTERS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[90px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                <option value="">学科</option>
                {SUBJECTS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            
            {/* Grade & Class Type - Separated */}
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[80px] focus:outline-none focus:border-primary bg-white text-gray-700 h-[34px]" value={filterGrade} onChange={e => { setFilterGrade(e.target.value); setFilterClassType(''); }}>
                <option value="">年级</option>
                {Object.keys(GRADE_CLASS_TYPES).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] focus:outline-none focus:border-primary bg-white text-gray-700 h-[34px]" value={filterClassType} onChange={e => setFilterClassType(e.target.value)}>
                <option value="">班型</option>
                {availableClassTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Teacher Select */}
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]" value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)}>
                <option value="">选择老师</option>
                {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            {/* Status */}
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">班级状态</option>
                <option value="pending">未开课</option>
                <option value="active">开课中</option>
                <option value="closed">已结课</option>
            </select>

            {/* Course Type */}
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]" value={filterCourseType} onChange={e => setFilterCourseType(e.target.value)}>
                <option value="">课程类型</option>
                <option value="long-term">长期课程</option>
                <option value="short-term">短期课程</option>
            </select>

            {/* Remaining Seats */}
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]" value={filterRemaining} onChange={e => setFilterRemaining(e.target.value)}>
                <option value="">余位情况</option>
                <option value="has_seats">有余位</option>
                <option value="full">已满</option>
            </select>
        </div>

        {/* Row 2 */}
        <div className="flex items-center gap-2 flex-wrap">
            {/* Address Group - Separated */}
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[80px] focus:outline-none focus:border-primary bg-white text-gray-700 h-[34px]" value={filterCity} onChange={e => { setFilterCity(e.target.value); setFilterDistrict(''); setFilterCampus(''); setFilterClassroom(''); }}>
                <option value="">城市</option>
                {Object.keys(LOCATION_DATA).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[90px] focus:outline-none focus:border-primary bg-white text-gray-700 h-[34px]" value={filterDistrict} onChange={e => { setFilterDistrict(e.target.value); setFilterCampus(''); setFilterClassroom(''); }}>
                <option value="">区域</option>
                {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[110px] focus:outline-none focus:border-primary bg-white text-gray-700 h-[34px]" value={filterCampus} onChange={e => { setFilterCampus(e.target.value); setFilterClassroom(''); }}>
                <option value="">校区</option>
                {availableCampuses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[90px] focus:outline-none focus:border-primary bg-white text-gray-700 h-[34px]" value={filterClassroom} onChange={e => setFilterClassroom(e.target.value)}>
                <option value="">教室</option>
                {CLASSROOMS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Sale Status */}
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]" value={filterSaleStatus} onChange={e => setFilterSaleStatus(e.target.value)}>
                <option value="">售卖状态</option>
                <option value="on_sale">已上架</option>
                <option value="off_sale">未上架</option>
            </select>

            {/* Reset Button */}
            <button 
                className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors flex-shrink-0 h-[34px] shadow-sm font-medium" 
                onClick={() => { setFilterName(''); setFilterMode(''); setFilterYear(''); setFilterSubject(''); setFilterGrade(''); setFilterClassType(''); setFilterSemester(''); setFilterTeacher(''); setStudentSearch(''); setFilterCity(''); setFilterDistrict(''); setFilterCampus(''); setFilterClassroom(''); setFilterStatus(''); setFilterCourseType(''); setFilterRemaining(''); setFilterSaleStatus(''); }}
            >
                重置
            </button>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
         <div className="flex items-center gap-3">
            <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors">创建班级</button>
            <button className="border border-primary text-primary hover:bg-primary-light px-4 py-1.5 rounded text-sm transition-colors ml-2">导出班级列表</button>
            <button className="border border-primary text-primary hover:bg-primary-light px-4 py-1.5 rounded text-sm transition-colors">导出班级学生</button>
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700 ml-4">
                <input type="checkbox" checked={showActiveOnly} onChange={e => setShowActiveOnly(e.target.checked)} className="w-4 h-4 rounded text-primary focus:ring-primary"/>
                仅展示“未开课、开课中”的班级
            </label>
         </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="border-t border-gray-100">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                {DISPLAY_COLUMNS.map(col => (<th key={col.id} className="p-4">{col.label}</th>))}
                <th className="p-4 text-center sticky right-0 bg-[#F9FBFA]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClasses.map(cls => (
                  <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                    {DISPLAY_COLUMNS.map(col => (<td key={col.id} className="p-4">{getCellContent(col.id, cls)}</td>))}
                    <td className="p-4 sticky right-0 bg-white hover:bg-gray-50">
                      <div className="flex gap-2 justify-center text-primary text-sm">
                        <button 
                            className="hover:opacity-80" 
                            onClick={() => handleToggleSaleStatus(cls)}
                        >
                            {cls.saleStatus === 'on_sale' ? '下架' : '上架'}
                        </button>
                        <button className="hover:opacity-80" onClick={() => handleEditClass(cls)}>编辑</button>
                        <button className="hover:opacity-80" onClick={() => handleOpenStudentManage(cls)}>班级学员</button>
                        <button className="hover:opacity-80" onClick={() => setShowQueueModal(cls.id)}>推送</button>
                        <button className="text-red-500 hover:opacity-80">删除</button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE CLASS MODAL */}
      {showCreateModal && (
        <div className="absolute inset-0 bg-white z-50 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto min-h-screen flex flex-col">
            <div className="py-4 border-b border-gray-100 flex gap-2 text-sm text-gray-500 mb-4 px-6">
                <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => setShowCreateModal(false)}>班级管理</span>
                <span>|</span>
                <span className="text-gray-800 font-bold">{editingId ? '编辑班级' : '创建班级'}</span>
            </div>

            {renderStepIndicator()}

            <div className="flex-1 px-32 pb-20">
                {/* STEP 1 */}
                {createStep === 1 && (
                    <div className="space-y-6">
                        <div className="border-l-4 border-primary pl-3 mb-6">
                            <h3 className="font-bold text-gray-800">基本信息</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-6 max-w-[800px]">
                            {/* ... Fields ... */}
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>课程名称</label>
                                <div className="flex-1 flex gap-2">
                                    <select value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})} className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
                                        <option value="">请选择课程</option>
                                        {COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <button className="px-4 py-2 border border-primary text-primary rounded text-sm hover:bg-primary-light">选择课程</button>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>班级名称</label>
                                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="请填写班级名称" />
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>年份</label>
                                <select value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>校区</label>
                                <select value={formData.campus} onChange={e => setFormData({...formData, campus: e.target.value})} className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
                                    <option value="">请选择校区</option>
                                    {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>教室</label>
                                <div className="flex-1 flex gap-2 items-center">
                                    <select value={formData.classroom} onChange={e => setFormData({...formData, classroom: e.target.value})} className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
                                        <option value="">请选择教室</option>
                                        {CLASSROOMS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <button 
                                      onClick={() => {
                                        if (formData.campus) {
                                          setShowScheduleModal(true);
                                        } else {
                                          alert('请先选择校区');
                                        }
                                      }}
                                      className={`text-sm cursor-pointer whitespace-nowrap px-2 py-1 rounded transition-colors ${formData.campus ? 'text-primary hover:bg-primary-light' : 'text-gray-400 cursor-not-allowed'}`}
                                    >
                                      查看教室课表
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>学生人数上限</label>
                                <div className="flex-1 relative">
                                    <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                                    <span className="absolute right-3 top-2 text-sm text-gray-400">人</span>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4">调课虚位</label>
                                <div className="flex-1 relative">
                                    <input type="number" value={formData.virtualSeats} onChange={e => setFormData({...formData, virtualSeats: parseInt(e.target.value) || 0})} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                                    <span className="absolute right-3 top-2 text-sm text-gray-400">个</span>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>主教老师</label>
                                <div className="flex-1 flex gap-2 items-center">
                                    <select value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})} className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
                                        <option value="">请选择主教老师</option>
                                        {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <button 
                                      onClick={() => {
                                        if (formData.teacherId) {
                                          setShowTeacherScheduleModal(true);
                                        } else {
                                          alert('请先选择主教老师');
                                        }
                                      }}
                                      className={`text-sm cursor-pointer whitespace-nowrap px-2 py-1 rounded transition-colors ${formData.teacherId ? 'text-primary hover:bg-primary-light' : 'text-gray-400 cursor-not-allowed'}`}
                                    >
                                      查看老师课表
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4">助教</label>
                                <div className="flex-1 flex gap-2 items-center">
                                    <select value={formData.assistantId} onChange={e => setFormData({...formData, assistantId: e.target.value})} className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
                                        <option value="">请选择助教 (非必填)</option>
                                        {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4">允许老师、教室时间冲突</label>
                                <div className="flex-1 flex gap-6 text-sm text-gray-600 items-center h-[38px]">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="allowConflict" checked={formData.allowConflict === true} onChange={() => setFormData({...formData, allowConflict: true})} className="text-primary" /> 是</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="allowConflict" checked={formData.allowConflict === false} onChange={() => setFormData({...formData, allowConflict: false})} className="text-primary" /> 否</label>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4">需要入学资格</label>
                                <div className="flex-1 flex gap-6 text-sm text-gray-600 items-center h-[38px]">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="needQualification" checked={formData.needQualification === true} onChange={() => setFormData({...formData, needQualification: true})} className="text-primary" /> 是</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="needQualification" checked={formData.needQualification === false} onChange={() => setFormData({...formData, needQualification: false})} className="text-primary" /> 否</label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: SESSION INFO -> RENAMED TO COURSE INFO */}
                {createStep === 2 && (
                    <div className="space-y-6">
                        <div className="border-l-4 border-primary pl-3 mb-2">
                            <h3 className="font-bold text-gray-800">课程信息</h3>
                        </div>
                        
                        <div className="pl-4">
                            <div className="grid grid-cols-1 gap-6 max-w-[900px]">
                                <div className="flex items-center">
                                    <label className="w-24 text-sm text-gray-500 text-left mr-4"><span className="text-red-500 mr-1">*</span>首课日期</label>
                                    <div className="flex-1 flex items-center gap-4">
                                        <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm w-40" />
                                        <div className="flex items-center gap-2">
                                            <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm w-28" />
                                            <span className="text-gray-400">-</span>
                                            <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm w-28" />
                                        </div>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <input type="checkbox" checked={formData.skipHolidays} onChange={e => setFormData({...formData, skipHolidays: e.target.checked})} className="rounded text-primary" />
                                            跳过停课日
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center">
                                        <label className="w-24 text-sm text-gray-500 text-left mr-4"><span className="text-red-500 mr-1">*</span>上课日</label>
                                        <div className="flex-1 flex gap-4 flex-wrap">
                                            {WEEKDAYS.map(day => (
                                                <label key={day} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" checked={formData.frequency.includes(day)} onChange={e => { const newFreq = e.target.checked ? [...formData.frequency, day] : formData.frequency.filter(d => d !== day); setFormData({...formData, frequency: newFreq}); }} className="text-primary" />
                                                    <span className="text-sm text-gray-600">{day}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <button onClick={handleGenerateSchedule} className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-teal-600 w-fit">
                                            生成课表
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="p-3 font-medium w-16">序号</th>
                                        <th className="p-3 font-medium">课节名称</th>
                                        <th className="p-3 font-medium w-40">面授上课日期</th>
                                        <th className="p-3 font-medium w-64">面授上课时间</th>
                                        <th className="p-3 font-medium w-56">任务推送时间</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {previewLessons.length > 0 ? previewLessons.map((l, idx) => (
                                        <tr key={l.id}>
                                            <td className="p-3 text-gray-600 text-center">{idx + 1}</td>
                                            <td className="p-3 text-gray-800"><input value={l.name} onChange={e => handleLessonChange(idx, 'name', e.target.value)} className="border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none bg-transparent w-full" /></td>
                                            <td className="p-3"><input type="date" value={l.date} onChange={e => handleLessonChange(idx, 'date', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm w-36 focus:border-primary focus:outline-none" /></td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-1">
                                                    <input type="time" value={l.startTime} onChange={e => handleLessonChange(idx, 'startTime', e.target.value)} className="border border-gray-300 rounded px-1 py-1 text-sm w-24 focus:border-primary focus:outline-none" />
                                                    <span>-</span>
                                                    <input type="time" value={l.endTime} onChange={e => handleLessonChange(idx, 'endTime', e.target.value)} className="border border-gray-300 rounded px-1 py-1 text-sm w-24 focus:border-primary focus:outline-none" />
                                                </div>
                                            </td>
                                            <td className="p-3"><input type="datetime-local" value={l.pushTime ? l.pushTime.replace(' ', 'T') : ''} onChange={e => handleLessonChange(idx, 'pushTime', e.target.value.replace('T', ' '))} className="border border-gray-300 rounded px-2 py-1 text-sm w-48 focus:border-primary focus:outline-none" /></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-400">暂无数据，请点击“生成课表”</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* STEP 3: PRICING INFO */}
                {createStep === 3 && (
                    <div className="space-y-6">
                        <div className="border-l-4 border-primary pl-3 mb-6">
                            <h3 className="font-bold text-gray-800">售卖信息</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6 max-w-[800px]">
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>收费模式</label>
                                <select value={formData.chargeMode} onChange={e => setFormData({...formData, chargeMode: e.target.value as any})} className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
                                    <option value="whole">整期</option>
                                    <option value="installment">分期</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>课程费</label>
                                <div className="flex-1 relative">
                                    <input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="请输入" />
                                    <span className="absolute right-3 top-2 text-sm text-gray-400">元/人</span>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4">教辅费</label>
                                <div className="flex-1 relative">
                                    <input value={formData.materialPrice} onChange={e => setFormData({...formData, materialPrice: e.target.value})} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="请输入" />
                                    <span className="absolute right-3 top-2 text-sm text-gray-400">元/人</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-100 p-6 flex justify-center gap-4 sticky bottom-0">
                <button onClick={() => setShowCreateModal(false)} className="px-12 py-2.5 border border-gray-200 text-gray-600 bg-white rounded hover:bg-gray-50 text-sm">取消</button>
                <div className="flex gap-4">
                    <button onClick={handlePrevStep} disabled={createStep === 1} className={`px-12 py-2.5 border border-gray-200 text-gray-600 bg-white rounded hover:bg-gray-50 text-sm ${createStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>上一步</button>
                    {createStep < 3 ? (
                        <button onClick={handleNextStep} className="px-12 py-2.5 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm">下一步</button>
                    ) : (
                        <button onClick={handleCreateClass} className="px-12 py-2.5 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm">确定</button>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT MANAGEMENT MODAL */}
      {showStudentManageModal && studentManageClass && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-[900px] h-[700px] flex flex-col overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                          <h3 className="text-lg font-bold text-gray-800">班级学员管理</h3>
                          <p className="text-xs text-gray-500 mt-1">{studentManageClass.name} | 已报 {enrolledList.length}/{studentManageClass.capacity}</p>
                      </div>
                      <button onClick={() => setShowStudentManageModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                  </div>
                  
                  <div className="flex-1 flex overflow-hidden">
                      {/* Left: Available Students */}
                      <div className="flex-1 flex flex-col border-r border-gray-100 p-4">
                          <div className="mb-3">
                              <h4 className="font-bold text-gray-700 text-sm mb-2">可选学员</h4>
                              <input 
                                className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                                placeholder="搜索学员姓名/账号"
                                value={studentSearch}
                                onChange={e => setStudentSearch(e.target.value)}
                              />
                          </div>
                          <div className="flex-1 overflow-y-auto border border-gray-100 rounded-lg">
                              {filteredAvailableStudents.map(s => (
                                  <div 
                                    key={s.id} 
                                    onClick={() => toggleLeftSelection(s.id)}
                                    className={`p-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 border-b border-gray-50 ${selectedLeft.includes(s.id) ? 'bg-blue-50' : ''}`}
                                  >
                                      <div>
                                          <div className="text-sm text-gray-800">{s.name}</div>
                                          <div className="text-xs text-gray-400">{s.account}</div>
                                      </div>
                                      {selectedLeft.includes(s.id) && <span className="text-primary text-xs">✓</span>}
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Middle: Actions */}
                      <div className="w-16 flex flex-col items-center justify-center gap-4 bg-gray-50/50">
                          <button onClick={handleAddStudents} disabled={selectedLeft.length === 0} className={`p-2 rounded shadow-sm ${selectedLeft.length > 0 ? 'bg-primary text-white hover:bg-teal-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                              &gt;
                          </button>
                          <button onClick={handleRemoveStudents} disabled={selectedRight.length === 0} className={`p-2 rounded shadow-sm ${selectedRight.length > 0 ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                              &lt;
                          </button>
                      </div>

                      {/* Right: Enrolled Students */}
                      <div className="flex-1 flex flex-col p-4">
                          <div className="mb-3">
                              <h4 className="font-bold text-gray-700 text-sm mb-2">已选学员 ({enrolledList.length})</h4>
                              <div className="h-[34px]"></div> {/* Spacer to align with search input */}
                          </div>
                          <div className="flex-1 overflow-y-auto border border-gray-100 rounded-lg">
                              {enrolledList.map(s => (
                                  <div 
                                    key={s.id} 
                                    onClick={() => toggleRightSelection(s.id)}
                                    className={`p-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 border-b border-gray-50 ${selectedRight.includes(s.id) ? 'bg-red-50' : ''}`}
                                  >
                                      <div>
                                          <div className="text-sm text-gray-800">{s.name}</div>
                                          <div className="text-xs text-gray-400">{s.account}</div>
                                      </div>
                                      {selectedRight.includes(s.id) && <span className="text-red-500 text-xs">✓</span>}
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                      <button onClick={() => setShowStudentManageModal(false)} className="px-6 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm">取消</button>
                      <button onClick={handleSaveStudentManage} className="px-6 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm">保存</button>
                  </div>
              </div>
          </div>
      )}

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <ClassroomScheduleModal campus={formData.campus} onClose={() => setShowScheduleModal(false)} />
      )}

      {/* TEACHER SCHEDULE MODAL */}
      {showTeacherScheduleModal && (
        <TeacherScheduleModal teacherId={formData.teacherId} onClose={() => setShowTeacherScheduleModal(false)} />
      )}

      {/* QUEUE MODAL (Mock) */}
      {showQueueModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-[600px] h-[500px] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">课程推送 - {selectedClassForQueue?.name}</h3>
                    <button onClick={() => setShowQueueModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="p-3">课节</th>
                                <th className="p-3">上课时间</th>
                                <th className="p-3">推送状态</th>
                                <th className="p-3 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {classLessons.map((l) => (
                                <tr key={l.id}>
                                    <td className="p-3 text-gray-800">{l.name}</td>
                                    <td className="p-3 text-gray-600">{l.date} {l.startTime}</td>
                                    <td className="p-3">
                                        {l.pushStatus === 'success' ? <span className="text-green-500">已推送</span> : <span className="text-gray-400">未推送</span>}
                                    </td>
                                    <td className="p-3 text-right">
                                        <button 
                                            onClick={() => handlePush(l.id)} 
                                            disabled={l.pushStatus === 'success'}
                                            className={`px-3 py-1 rounded text-xs border ${l.pushStatus === 'success' ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-primary text-primary hover:bg-primary-light'}`}
                                        >
                                            {l.pushStatus === 'success' ? '已推送' : '推送'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {classLessons.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-400">暂无课节</td></tr>}
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
