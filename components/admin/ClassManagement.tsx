
import React, { useState, useEffect, useRef } from 'react';
import { ClassInfo, Lesson, Course, Teacher, StudentProfile } from '../../types';
import { COURSES, TEACHERS, CAMPUSES, ADMIN_STUDENTS } from '../../constants';
import SearchableMultiSelect from '../common/SearchableMultiSelect';
// @ts-ignore
import ExcelJS from 'exceljs';
// @ts-ignore
import saveAs from 'file-saver';

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

// Combined Course Class Hierarchy - For Class Management filtering
// Includes both System Courses (体系课) and Special Courses (专项课)
const GRADE_CLASS_TYPES: Record<string, string[]> = {
  // System Courses (体系课)
  'K2': ['启蒙', '启蒙衔接', '进阶'],
  'K3': ['启蒙', '进阶', '进阶衔接', '飞跃'],
  'G1': ['A', 'A+', 'S', 'R'],
  'G2': ['A', 'A+', 'S', 'R'],
  'G3': ['A', 'A+', 'S', 'S+', 'R'],
  'G4': ['A', 'A+', 'S', 'S+', 'R'],
  'G5': ['A', 'A+', 'S', 'S+', 'R'],
  'G6': ['A', 'A+', 'S', 'S+', 'R'],
  'G7': ['英才', '菁英', '菁英Plus', '火箭', '火箭Plus'],
  'G8': ['英才', '菁英', '菁英Plus', '火箭', '火箭Plus'],
  'G9': ['英才', '菁英', '菁英Plus', '火箭', '火箭Plus'],
  
  // Special Courses (专项课)
  '剑少考辅': ['剑少一级', '剑少二级', '剑少三级'],
  'MSE考辅': ['KET综合冲刺', 'KET口语写作专项', 'PET综合冲刺', 'PET口语写作专项', 'FCE综合冲刺', 'FCE口语写作专项'],
  '自然拼读': ['自拼一级', '自拼二级', '自拼三级'],
  '语法专项': ['KET核心语法', 'PET核心语法'],
  '阅读专项': ['神奇树屋', '神奇校', '苍蝇小子', '夏洛的网', '国家探索', '国家地理足迹-KET', '国家地理足迹-PET'],
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

  // 列表显示列定义（班层和上课时间合并显示）
  const DISPLAY_COLUMNS = [
    { id: 'id', label: '班级ID' },
    { id: 'name', label: '班级名称' },
    { id: 'mode', label: '授课方式' },
    { id: 'courseName', label: '产品名称' },
    { id: 'courseType', label: '产品类型' },
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
    { id: 'price', label: '产品费用' },
    { id: 'status', label: '班级状态' },
    { id: 'saleStatus', label: '售卖状态' },
    { id: 'schedule', label: '上课时间' },
    { id: 'createdTime', label: '创建时间' },
  ];

  // 导出列定义（班层拆分为年级+班型，上课时间拆分为开课日期+结课日期+讲次时间）
  const EXPORT_COLUMNS = [
    { id: 'id', label: '班级ID' },
    { id: 'name', label: '班级名称' },
    { id: 'mode', label: '授课方式' },
    { id: 'courseName', label: '产品名称' },
    { id: 'courseType', label: '产品类型' },
    { id: 'progress', label: '教学进度' },
    { id: 'capacity', label: '预招人数' },
     { id: 'enrolled', label: '已报人数' },
     { id: 'remaining', label: '余位' },
     { id: 'year', label: '年份' },
    { id: 'semester', label: '学期' },
    { id: 'grade', label: '年级' },
    { id: 'classType', label: '班型' },
    { id: 'teacher', label: '主教老师' },
    { id: 'assistant', label: '助教' },
    { id: 'city', label: '城市' },
    { id: 'district', label: '区域' },
    { id: 'campus', label: '校区' },
    { id: 'classroom', label: '教室' },
    { id: 'price', label: '产品费用' },
    { id: 'status', label: '班级状态' },
    { id: 'saleStatus', label: '售卖状态' },
    { id: 'startDate', label: '开课日期' },
    { id: 'endDate', label: '结课日期' },
    { id: 'lessonTime', label: '讲次时间' },
    { id: 'createdTime', label: '创建时间' },
  ];

  // Multi-select dropdown component
  interface MultiSelectProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder: string;
    width?: string;
  }

   const MultiSelect: React.FC<MultiSelectProps> = ({ options, selected, onChange, placeholder, width = 'w-[90px]' }) => {
     const [isOpen, setIsOpen] = useState(false);
     const dropdownRef = useRef<HTMLDivElement>(null);

     // 点击外部关闭下拉框
     useEffect(() => {
       const handleClickOutside = (event: MouseEvent) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
           setIsOpen(false);
         }
       };

       document.addEventListener('mousedown', handleClickOutside);
       return () => {
         document.removeEventListener('mousedown', handleClickOutside);
       };
     }, []);

    const toggleOption = (option: string) => {
      if (selected.includes(option)) {
        onChange(selected.filter(item => item !== option));
      } else {
        onChange([...selected, option]);
      }
    };

    const clearSelection = () => {
      onChange([]);
    };

    const displayText = selected.length > 0 
      ? `${placeholder} (${selected.length})` 
      : placeholder;

     return (
       <div className={`relative ${width} flex-shrink-0`} ref={dropdownRef}>
        <button
          className={`border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-primary text-gray-700 h-[34px] flex items-center justify-between ${selected.length > 0 ? 'bg-blue-50 border-blue-200' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">{displayText}</span>
          <span className="ml-1 text-xs">{isOpen ? '▲' : '▼'}</span>
        </button>
        
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-gray-200 flex justify-between items-center">
              <span className="text-xs text-gray-500">可多选</span>
              {selected.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  清空
                </button>
              )}
            </div>
            {options.map(option => (
              <label
                key={option}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="mr-2 text-primary"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
   };

  // Combined Grade-Class Type Select Component with Tags
  interface GradeClassTypeSelectProps {
    selected: Array<{grade: string, classType: string}>;
    onChange: (selected: Array<{grade: string, classType: string}>) => void;
    placeholder: string;
    width?: string;
  }

  const GradeClassTypeSelect: React.FC<GradeClassTypeSelectProps> = ({ selected, onChange, placeholder, width = 'w-[180px]' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<string>('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 点击外部关闭下拉框
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSelectedGrade('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const toggleSelection = (grade: string, classType: string) => {
      const key = `${grade} ${classType}`;
      const exists = selected.some(item => item.grade === grade && item.classType === classType);
      
      if (exists) {
        onChange(selected.filter(item => !(item.grade === grade && item.classType === classType)));
      } else {
        onChange([...selected, { grade, classType }]);
      }
    };

    const removeSelection = (grade: string, classType: string) => {
      onChange(selected.filter(item => !(item.grade === grade && item.classType === classType)));
    };

    const clearAll = () => {
      onChange([]);
      setSelectedGrade('');
    };

    const displayText = selected.length > 0 
      ? `${placeholder} (${selected.length})` 
      : placeholder;

    const availableClassTypes = selectedGrade ? GRADE_CLASS_TYPES[selectedGrade] || [] : [];

    return (
      <div className={`relative ${width} flex-shrink-0`} ref={dropdownRef}>
        {/* Selected Tags Display */}
        {selected.length > 0 && (
          <div className="absolute -top-7 left-0 right-0 flex flex-wrap gap-1 mb-1">
            {selected.map((item, index) => (
              <div 
                key={`${item.grade}-${item.classType}-${index}`}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded text-xs"
              >
                <span>{item.grade} {item.classType}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelection(item.grade, item.classType);
                  }}
                  className="text-blue-400 hover:text-blue-700 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          className={`border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-primary text-gray-700 h-[34px] flex items-center justify-between ${selected.length > 0 ? 'bg-blue-50 border-blue-200' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">{displayText}</span>
          <span className="ml-1 text-xs">{isOpen ? '▲' : '▼'}</span>
        </button>
        
        {isOpen && (
          <div className="absolute z-50 mt-1 w-[360px] bg-white border border-gray-300 rounded shadow-lg">
            {/* Header with clear button */}
            <div className="p-2 border-b border-gray-200 flex justify-end items-center">
              {selected.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  清空
                </button>
              )}
            </div>

            {/* Left-Right Layout Container */}
            <div className="flex" style={{ height: '240px' }}>
              {/* Left Side: Grade/Special Type List */}
              <div className="w-1/2 border-r border-gray-200 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  {Object.keys(GRADE_CLASS_TYPES).map(grade => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setSelectedGrade(selectedGrade === grade ? '' : grade)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${selectedGrade === grade ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-500' : 'text-gray-700'}`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Side: Class Type List */}
              <div className="w-1/2 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  {selectedGrade ? (
                    availableClassTypes.map(classType => {
                      const isSelected = selected.some(item => item.grade === selectedGrade && item.classType === classType);
                      return (
                        <button
                          key={classType}
                          type="button"
                          onClick={() => toggleSelection(selectedGrade, classType)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${isSelected ? 'bg-green-50 text-green-600' : 'text-gray-700'}`}
                        >
                          {classType}
                        </button>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-300 text-sm">
                      —
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
 
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
   const [showBatchImportModal, setShowBatchImportModal] = useState(false); // Batch Import Modal State
   const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
   const [showQueueModal, setShowQueueModal] = useState<string | null>(null); // holds class ID
   const [editingId, setEditingId] = useState<string | null>(null); // New: Editing ID
   
   // Batch Import State
   const [batchImportStep, setBatchImportStep] = useState<1 | 2>(1); // 1: 导入文件, 2: 查看导入情况
   const [importResults, setImportResults] = useState<{
     success: Array<{row: number, className: string, message: string}>;
     failed: Array<{row: number, className: string, error: string}>;
   }>({ success: [], failed: [] });
   const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
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
  const [filterYear, setFilterYear] = useState<string[]>([]);
  const [filterSemester, setFilterSemester] = useState<string[]>([]);
  const [filterSubject, setFilterSubject] = useState<string[]>([]);
  
  // Class Level Filter - Combined grade and class type
  const [filterGradeClassType, setFilterGradeClassType] = useState<Array<{grade: string, classType: string}>>([]);

  // Address Filter
  const [filterCity, setFilterCity] = useState<string[]>([]);
  const [filterDistrict, setFilterDistrict] = useState<string[]>([]);
  const [filterCampus, setFilterCampus] = useState<string[]>([]);
  const [filterClassroom, setFilterClassroom] = useState<string[]>([]);

  // Teacher Filter
  const [filterTeacher, setFilterTeacher] = useState<string[]>([]); 

  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterCourseType, setFilterCourseType] = useState<string[]>([]);
  
  // NEW FILTERS (保持单选)
  const [filterRemaining, setFilterRemaining] = useState('');
  const [filterSaleStatus, setFilterSaleStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Dynamic Options
  const allClassTypes = Array.from(new Set(Object.values(GRADE_CLASS_TYPES).flat()));
  // Extract unique grades from filterGradeClassType for dynamic class type filtering
  const selectedGrades = Array.from(new Set(filterGradeClassType.map(item => item.grade)));
  const availableClassTypes = selectedGrades.length > 0 
    ? Array.from(new Set(selectedGrades.flatMap(grade => GRADE_CLASS_TYPES[grade as keyof typeof GRADE_CLASS_TYPES] || [])))
    : allClassTypes;

  const allDistricts = Array.from(new Set(Object.values(LOCATION_DATA).flatMap(city => Object.keys(city))));
  const availableDistricts = filterCity.length > 0
    ? Array.from(new Set(filterCity.flatMap(city => LOCATION_DATA[city] ? Object.keys(LOCATION_DATA[city]) : [])))
    : allDistricts;

  const allCampusesFromData = Array.from(new Set(Object.values(LOCATION_DATA).flatMap(city => Object.values(city).flat())));
  let availableCampuses = allCampusesFromData;
  if (filterDistrict.length > 0 && filterCity.length > 0) {
      // Get campuses for selected cities and districts
      availableCampuses = Array.from(new Set(filterCity.flatMap(city => 
        filterDistrict.flatMap(district => LOCATION_DATA[city]?.[district] || [])
      )));
  } else if (filterCity.length > 0) {
      // Get all campuses for selected cities
      availableCampuses = Array.from(new Set(filterCity.flatMap(city => 
        LOCATION_DATA[city] ? Object.values(LOCATION_DATA[city]).flat() : []
      )));
  } else if (filterDistrict.length > 0) {
       // Find districts anywhere across all cities
       availableCampuses = Array.from(new Set(
         Object.values(LOCATION_DATA).flatMap(cityData => 
           filterDistrict.flatMap(district => cityData[district] || [])
         )
       ));
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

  // --- Batch Import Logic ---
  const generateAndDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('班级导入模板');

    // Headers based on user request
    worksheet.columns = [
      { header: '产品名称*', key: 'courseName', width: 25 },
      { header: '班级名称*', key: 'className', width: 25 },
      { header: '年份*', key: 'year', width: 10 },
      { header: '校区*', key: 'campus', width: 15 },
      { header: '教室', key: 'classroom', width: 15 },
      { header: '学生人数上限*', key: 'capacity', width: 15 },
      { header: '调课虚位', key: 'virtualSeats', width: 10 },
      { header: '主教老师*', key: 'teacher', width: 15 },
      { header: '助教', key: 'assistant', width: 15 },
      { header: '允许老师、教室时间冲突（是、否）*', key: 'allowConflict', width: 30 },
      { header: '需要入学资格（是、否）*', key: 'needQualification', width: 25 },
      { header: '首课日期*', key: 'startDate', width: 15 }, // YYYY-MM-DD
      { header: '上课开始时间*', key: 'startTime', width: 15 }, // HH:mm
      { header: '上课结束时间*', key: 'endTime', width: 15 }, // HH:mm
      { header: '上课日*', key: 'days', width: 15 }, // e.g. 周六,周日
      { header: '收费模式（整期、分期）*', key: 'chargeMode', width: 25 },
      { header: '产品费用*', key: 'price', width: 10 },
      { header: '教辅费', key: 'materialPrice', width: 10 },
    ];

    // Style Header
    worksheet.getRow(1).font = { bold: true };

    // Add comments/notes to specific header cells
    // B: 班级名称
    worksheet.getCell('B1').note = {
      texts: [{ text: '必填，班级名称不能超过30个字符' }]
    };
    // F: 学生人数上限
    worksheet.getCell('F1').note = {
      texts: [{ text: '输入数字' }]
    };
    // G: 调课虚位
    worksheet.getCell('G1').note = {
      texts: [{ text: '输入数字' }]
    };
    // L: 首课日期
    worksheet.getCell('L1').note = {
      texts: [{ text: '格式：2022-01-01。请注意第一次上课日期应与上课日对应上' }]
    };
    // M: 上课开始时间
    worksheet.getCell('M1').note = {
      texts: [{ text: '格式：08:00使用英文:号分隔' }]
    };
    // N: 上课结束时间
    worksheet.getCell('N1').note = {
      texts: [{ text: '格式：08:00使用英文:号分隔' }]
    };
    // O: 上课日
    worksheet.getCell('O1').note = {
      texts: [{ text: '按照每周的上课频率填写，如每周多天上课，则需要用英文","隔开，如：周六,周日' }]
    };
    // Q: 课程费用
    worksheet.getCell('Q1').note = {
      texts: [{ text: '填写0-9999999.00间数字，支持2位小数' }]
    };
    // R: 教辅费
    worksheet.getCell('R1').note = {
      texts: [{ text: '填写0-9999999.00间数字，支持2位小数' }]
    };
    
    // Add Validation Data Sheet (Hidden)
    const dataSheet = workbook.addWorksheet('Data');
    dataSheet.state = 'hidden';

    // Populate Data Sheet
    const courseNames = COURSES.map(c => c.name);
    const teacherNames = TEACHERS.map(t => t.name);
    const campusNames = CAMPUSES;
    const yearList = YEARS;
    const classroomNames = CLASSROOMS;
    const booleanOptions = ['是', '否'];
    const chargeModeOptions = ['整期', '分期'];

    // Helper to add data column
    const addDataCol = (data: string[], colIndex: number) => {
        data.forEach((val, idx) => {
            dataSheet.getCell(idx + 1, colIndex).value = val;
        });
        // Return range reference, e.g., 'Data!$A$1:$A$10'
        const colLetter = String.fromCharCode(65 + colIndex - 1); // 1->A, 2->B
        return `Data!$${colLetter}$1:$${colLetter}$${data.length}`;
    };

    const courseRange = addDataCol(courseNames, 1);
    const campusRange = addDataCol(campusNames, 2);
    const teacherRange = addDataCol(teacherNames, 3);
    const yearRange = addDataCol(yearList, 4);
    const classroomRange = addDataCol(classroomNames, 5); 
    const booleanRange = addDataCol(booleanOptions, 6);
    const chargeModeRange = addDataCol(chargeModeOptions, 7);

    // Apply Validation to Template Columns (Rows 2-1000)
    for (let i = 2; i <= 1000; i++) {
        // A: Course Name
        worksheet.getCell(`A${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [courseRange] };
        // C: Year
        worksheet.getCell(`C${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [yearRange] };
        // D: Campus
        worksheet.getCell(`D${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [campusRange] };
        // E: Classroom
        worksheet.getCell(`E${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [classroomRange] };
        // H: Teacher
        worksheet.getCell(`H${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [teacherRange] };
        // I: Assistant
        worksheet.getCell(`I${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [teacherRange] };
        // J: Allow Conflict
        worksheet.getCell(`J${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [booleanRange] };
        // K: Need Qualification
        worksheet.getCell(`K${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [booleanRange] };
        // P: Charge Mode
        worksheet.getCell(`P${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [chargeModeRange] };
    }

    // Generate and Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, '班级批量导入模板.xlsx');
  };

  // 导出班级列表功能（使用EXPORT_COLUMNS，拆分年级+班型、开课日期+结课日期+讲次时间）
  const exportClassList = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('班级列表');
      
      // 使用EXPORT_COLUMNS作为表头（拆分格式）
      const headers = EXPORT_COLUMNS.map(col => col.label);
      worksheet.columns = EXPORT_COLUMNS.map(col => ({
        header: col.label,
        key: col.id,
        width: 15
      }));

      // 设置表头样式
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0F0F5' }
      };

      // 添加数据行 - 使用filteredClasses确保数据已根据筛选条件过滤
      filteredClasses.forEach((cls, index) => {
        const course = COURSES.find(c => c.id === cls.courseId);
        const teacher = TEACHERS.find(t => t.id === cls.teacherId);
        const assistant = TEACHERS.find(t => t.id === cls.assistant);
        
        const classLessonList = lessons.filter(l => l.classId === cls.id);
        const totalLessons = classLessonList.length > 0 ? classLessonList.length : (course?.lessonCount || 0);
        const completedLessons = classLessonList.filter(l => l.status === 'completed').length;
        const progressText = `${completedLessons}/${totalLessons}`;

        // 计算开课日期（首课日期）和结课日期（首课日期+课节数推算）
        let startDate = cls.startDate || '-';
        let endDate = '-';
        if (cls.startDate && totalLessons > 0) {
          try {
            const start = new Date(cls.startDate);
            const end = new Date(start);
            end.setDate(end.getDate() + (totalLessons - 1) * 7); // 假设每周一节课
            endDate = `${end.getFullYear()}.${(end.getMonth() + 1).toString().padStart(2, '0')}.${end.getDate().toString().padStart(2, '0')}`;
            startDate = `${start.getFullYear()}.${(start.getMonth() + 1).toString().padStart(2, '0')}.${start.getDate().toString().padStart(2, '0')}`;
          } catch {
            endDate = '-';
          }
        }

        // 拆分年级和班型
        const grade = cls.grade || course?.grade || '-';
        const classType = cls.studentTag || '-';

        const rowData: Record<string, any> = {
          id: cls.id,
          name: cls.name,
          mode: '面授',
          courseName: course?.name || '',
          courseType: course?.type === 'long-term' ? '体系课' : course?.type === 'short-term' ? '专项课' : '短期课程',
            progress: progressText,
            capacity: cls.capacity,
            enrolled: cls.studentCount,
            remaining: Math.max(0, (cls.capacity || 0) - (cls.studentCount || 0)),
          year: cls.year || course?.year || '-',
          semester: cls.semester || course?.semester || '-',
          grade: grade,
          classType: classType,
          teacher: teacher?.name || '-',
          assistant: assistant?.name || '-',
          city: cls.city || '-',
          district: cls.district || '-',
          campus: cls.campus || '-',
          classroom: cls.classroom || '-',
          price: cls.price || 0,
          status: cls.status === 'active' || cls.status === 'full' ? '开课中' : 
                  cls.status === 'closed' || cls.status === 'disabled' ? '已结课' : '未开课',
          saleStatus: cls.saleStatus === 'on_sale' ? '已上架' : '未上架',
          startDate: startDate,
          endDate: endDate,
          lessonTime: cls.timeSlot || '-',
          createdTime: cls.createdTime || '-'
        };

        const row = worksheet.addRow(rowData);
        
        // 设置行样式
        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FBFA' }
          };
        }
      });

      // 启用筛选功能
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: headers.length }
      };

      // 自动调整列宽
      worksheet.columns.forEach(column => {
        if (column.width) {
          column.width = Math.max(column.width || 0, 10);
        }
      });

      // 生成文件名（包含当前时间）
      const now = new Date();
      const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
      const fileName = `班级列表_${timestamp}.xlsx`;

      // 生成并下载文件
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);

     } catch (error) {
       console.error('导出班级列表失败:', error);
       alert('导出失败，请稍后重试');
     }
   };

    // 导出班级学生功能
    const exportClassStudents = async () => {
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('班级学生列表');
        
        // 定义导出列 - 按照用户要求的顺序
        const exportColumns = [
          { key: 'className', label: '班级名称', width: 20 },
          { key: 'courseType', label: '产品类型', width: 12 },
          { key: 'grade', label: '年级', width: 10 },
          { key: 'classType', label: '班型', width: 12 },
          { key: 'subject', label: '学科', width: 10 },
          { key: 'semester', label: '学期', width: 10 },
          { key: 'campus', label: '校区', width: 15 },
          { key: 'teacher', label: '老师', width: 15 },
          { key: 'startDate', label: '开课日期', width: 12 },
          { key: 'endDate', label: '结束日期', width: 12 },
          { key: 'lessonTime', label: '上课时间', width: 15 },
          { key: 'studentId', label: '学生ID', width: 12 },
          { key: 'studentName', label: '学生姓名', width: 15 },
          { key: 'phone', label: '联系电话', width: 15 }
        ];

        worksheet.columns = exportColumns.map(col => ({
          header: col.label,
          key: col.key,
          width: col.width
        }));

       // 设置表头样式
       worksheet.getRow(1).font = { bold: true };
       worksheet.getRow(1).fill = {
         type: 'pattern',
         pattern: 'solid',
         fgColor: { argb: 'FFE0F0F5' }
       };

        // 收集所有班级的学生数据
        const allClassStudents: any[] = [];
        
        filteredClasses.forEach(cls => {
          // 获取该班级的学生（根据className匹配）
          const classStudents = ADMIN_STUDENTS.filter(student => 
            student.className === cls.name
          );
          
          // 获取班级相关信息
          const course = COURSES.find(c => c.id === cls.courseId);
          const teacher = TEACHERS.find(t => t.id === cls.teacherId);
          const assistant = TEACHERS.find(t => t.id === cls.assistant);
          
          // 解析开课日期和结束日期
          let startDate = cls.startDate || '-';
          let endDate = '-';
          
          // 尝试从scheduleDescription解析结束日期
          if (cls.scheduleDescription) {
            const parts = cls.scheduleDescription.split('-');
            if (parts.length === 2) {
              endDate = parts[1];
            }
          }
          
          // 如果没有scheduleDescription但有startDate，计算结束日期（假设12周课程）
          if (startDate !== '-' && endDate === '-') {
            try {
              const start = new Date(startDate);
              const end = new Date(start);
              end.setDate(end.getDate() + 12 * 7); // 假设12周课程
              endDate = `${end.getFullYear()}.${(end.getMonth() + 1).toString().padStart(2, '0')}.${end.getDate().toString().padStart(2, '0')}`;
              startDate = `${start.getFullYear()}.${(start.getMonth() + 1).toString().padStart(2, '0')}.${start.getDate().toString().padStart(2, '0')}`;
            } catch {
              endDate = '-';
            }
          }
          
          // 确定课程类型
          const courseType = course?.type === 'long-term' ? '体系课' : 
                            course?.type === 'short-term' ? '专项课' : '短期课程';
          
          // 确定班型（使用studentTag字段）
          const classType = cls.studentTag || '-';
          
          // 为每个学生添加班级和学生信息
          classStudents.forEach(student => {
            allClassStudents.push({
              // 班级信息
              className: cls.name,
              courseType: courseType,
              grade: cls.grade || '-',
              classType: classType,
              subject: cls.subject || '-',
              semester: cls.semester || '-',
              campus: cls.campus || '-',
              teacher: teacher?.name || '-',
              startDate: startDate,
              endDate: endDate,
              lessonTime: cls.timeSlot || '-',
              
              // 学生信息（重命名字段以匹配exportColumns的key）
              studentId: student.id,
              studentName: student.name,
              phone: student.account
            });
          });
        });

        // 如果没有找到学生数据，使用模拟数据
        let studentsToExport = allClassStudents;
        if (allClassStudents.length === 0 && filteredClasses.length > 0) {
          // 使用第一个班级和ADMIN_STUDENTS前20个学生作为模拟数据
          const firstClass = filteredClasses[0];
          const course = COURSES.find(c => c.id === firstClass.courseId);
          const teacher = TEACHERS.find(t => t.id === firstClass.teacherId);
          
          // 解析日期
          let startDate = firstClass.startDate || '-';
          let endDate = '-';
          if (firstClass.scheduleDescription) {
            const parts = firstClass.scheduleDescription.split('-');
            if (parts.length === 2) {
              endDate = parts[1];
            }
          }
          
          const courseType = course?.type === 'long-term' ? '体系课' : 
                            course?.type === 'short-term' ? '专项课' : '短期课程';
          const classType = firstClass.studentTag || '-';
          
          studentsToExport = ADMIN_STUDENTS.slice(0, 20).map(student => ({
            // 班级信息
            className: firstClass.name,
            courseType: courseType,
            grade: firstClass.grade || '-',
            classType: classType,
            subject: firstClass.subject || '-',
            semester: firstClass.semester || '-',
            campus: firstClass.campus || '-',
            teacher: teacher?.name || '-',
            startDate: startDate,
            endDate: endDate,
            lessonTime: firstClass.timeSlot || '-',
            
            // 学生信息
            studentId: student.id,
            studentName: student.name,
            phone: student.account
          }));
        } else if (allClassStudents.length === 0) {
          // 如果没有班级也没有学生，创建空数据
          studentsToExport = [];
        }

       // 添加数据行
       studentsToExport.forEach((student, index) => {
         const row = worksheet.addRow(student);
         
         // 设置行样式
         if (index % 2 === 0) {
           row.fill = {
             type: 'pattern',
             pattern: 'solid',
             fgColor: { argb: 'FFF9FBFA' }
           };
         }
       });

       // 启用筛选功能
       worksheet.autoFilter = {
         from: { row: 1, column: 1 },
         to: { row: 1, column: exportColumns.length }
       };

       // 自动调整列宽
       worksheet.columns.forEach(column => {
         if (column.width) {
           column.width = Math.max(column.width || 0, 10);
         }
       });

       // 生成文件名（包含当前时间）
       const now = new Date();
       const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
       const fileName = `班级学生列表_${timestamp}.xlsx`;

       // 生成并下载文件
       const buffer = await workbook.xlsx.writeBuffer();
       const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
       saveAs(blob, fileName);

     } catch (error) {
       console.error('导出班级学生失败:', error);
       alert('导出失败，请稍后重试');
     }
   };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (!file) return;

       // 检查文件大小（10M限制）
       if (file.size > 10 * 1024 * 1024) {
           alert('文件大小超过10M限制');
           return;
       }

       // 保存上传的文件
       setUploadedFile(file);

       const workbook = new ExcelJS.Workbook();
       const buffer = await file.arrayBuffer();
       await workbook.xlsx.load(buffer);
       const worksheet = workbook.getWorksheet(1); // Assuming first sheet is the template
       
       if (!worksheet) {
           alert('无法读取工作表，请确保使用正确模板');
           return;
       }

       const newClasses: ClassInfo[] = [];
       const newLessonsList: Lesson[] = [];
       const successResults: Array<{row: number, className: string, message: string}> = [];
       const failedResults: Array<{row: number, className: string, error: string}> = [];

       worksheet.eachRow((row: any, rowNumber: number) => {
           if (rowNumber === 1) return; // Skip header

           // 检查是否超过1000行限制
           if (rowNumber > 1001) {
               failedResults.push({
                   row: rowNumber,
                   className: '',
                   error: '超过1000行限制，此行及之后的数据将被忽略'
               });
               return;
           }

           // Extract values (Cell access depends on exceljs version, using safe gets)
           // Mapped to new column structure
           const courseName = row.getCell(1).text;
           const className = row.getCell(2).text;
           const year = row.getCell(3).text;
           // Col 4: Campus
           const campus = row.getCell(4).text;
           const classroom = row.getCell(5).text;
           const capacity = parseInt(row.getCell(6).text) || 20;
           const virtualSeats = parseInt(row.getCell(7).text) || 0;
           const teacherName = row.getCell(8).text;
           const assistantName = row.getCell(9).text;
           const allowConflict = row.getCell(10).text === '是';
           const needQualification = row.getCell(11).text === '是';
           const startDate = row.getCell(12).text; // Should verify format
           const startTime = row.getCell(13).text;
           const endTime = row.getCell(14).text;
           const daysText = row.getCell(15).text; // e.g. "周六,周日"
           const chargeModeText = row.getCell(16).text;
           const price = parseFloat(row.getCell(17).text) || 0;
           const materialPrice = parseFloat(row.getCell(18).text) || 0;

           // 验证必填字段
           if (!courseName || !className || !campus) {
               failedResults.push({
                   row: rowNumber,
                   className: className || '未知',
                   error: '缺少必填字段（产品名称、班级名称或校区）'
               });
               return;
           }

           // 验证班级名称长度
           if (className.length > 30) {
               failedResults.push({
                   row: rowNumber,
                   className: className,
                   error: '班级名称不能超过30个字符'
               });
               return;
           }

           // 验证日期格式
           const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
           if (!dateRegex.test(startDate)) {
               failedResults.push({
                   row: rowNumber,
                   className: className,
                   error: '首课日期格式错误，应为YYYY-MM-DD格式'
               });
               return;
           }

           // 验证时间格式
           const timeRegex = /^\d{2}:\d{2}$/;
           if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
               failedResults.push({
                   row: rowNumber,
                   className: className,
                   error: '上课时间格式错误，应为HH:mm格式'
               });
               return;
           }

           // 验证数字字段
           if (isNaN(capacity) || capacity <= 0) {
               failedResults.push({
                   row: rowNumber,
                   className: className,
                   error: '学生人数上限必须是大于0的数字'
               });
               return;
           }

           // Lookup IDs
           const course = COURSES.find(c => c.name === courseName);
           const teacher = TEACHERS.find(t => t.name === teacherName);
           const assistant = TEACHERS.find(t => t.name === assistantName);

           // 验证课程是否存在
           if (!course) {
               failedResults.push({
                   row: rowNumber,
                   className: className,
                   error: `产品"${courseName}"不存在`
               });
               return;
           }

           // 验证老师是否存在
           if (!teacher) {
               failedResults.push({
                   row: rowNumber,
                   className: className,
                   error: `老师"${teacherName}"不存在`
               });
               return;
           }

           const classId = `b-${Date.now()}-${rowNumber}`;
           
           const timeSlot = `${startTime}-${endTime}`;
           const scheduleDescription = `${startDate} 起 ${daysText}`;
           
           const newClass: ClassInfo = {
               id: classId,
               name: className,
               courseId: course?.id || 'unknown',
               year,
               semester: course?.semester || '寒假', // Fallback
               campus,
               classroom,
               teacherId: teacher?.id || '',
               assistant: assistant?.id || '',
               capacity,
               virtualSeats,
               allowConflict,
               needQualification,
               startDate,
               timeSlot,
               price,
               materialPrice,
               chargeMode: chargeModeText === '分期' ? 'installment' : 'whole',
               
               // Defaults
               status: 'pending',
               saleStatus: 'off_sale',
               description: courseName,
               color: '#2DA194',
               studentCount: 0,
               createdTime: new Date().toLocaleString(),
               city: '南京', 
               district: '鼓楼区', 
               scheduleDescription,
               studentTag: '',
               allowStudentSchedule: false,
               refundPolicy: 'unused',
               materialRefundPolicy: 'no_return',
               subject: course?.subject || '英语',
               grade: course?.grade || '1年级',
               studentGrade: course?.grade || '1年级',
           };

           // Generate Default Lessons
           if (course) {
               const lessonCount = course.lessons?.length || course.lessonCount || 10;
               let currentLessonDate = new Date(startDate);
               // Parse daysText
               const targetDays = daysText.split(/[,，、 ]/).filter((d: string) => WEEKDAYS.includes(d));
               const targetDayIndices = targetDays.map((d: string) => WEEKDAYS.indexOf(d));
               
               // If invalid days or empty, fallback to weekly on startDate's day
               if (targetDayIndices.length === 0) {
                   targetDayIndices.push(currentLessonDate.getDay());
               }

               let lessonsGenerated = 0;
               let loopDate = new Date(currentLessonDate);

               // Find first valid day >= startDate
               while (!targetDayIndices.includes(loopDate.getDay())) {
                   loopDate.setDate(loopDate.getDate() + 1);
               }

               while (lessonsGenerated < lessonCount) {
                   if (targetDayIndices.includes(loopDate.getDay())) {
                       const dateStr = loopDate.toISOString().split('T')[0];
                       newLessonsList.push({
                           id: `bl-${Date.now()}-${rowNumber}-${lessonsGenerated}`,
                           classId,
                           name: course.lessons?.[lessonsGenerated]?.name || `${courseName} - 第${lessonsGenerated+1}讲`,
                           date: dateStr,
                           startTime: startTime || '14:00',
                           endTime: endTime || '16:00',
                           status: 'pending',
                           teacherId: teacher?.id,
                       });
                       lessonsGenerated++;
                   }
                   loopDate.setDate(loopDate.getDate() + 1);
               }
           }

           newClasses.push(newClass);
           successResults.push({
               row: rowNumber,
               className: className,
               message: `成功创建班级，产品：${courseName}，校区：${campus}`
           });
       });
       
       // 保存导入结果
       setImportResults({
           success: successResults,
           failed: failedResults
       });
       
       // 切换到第二步查看导入情况
       setBatchImportStep(2);
       
       // 暂时不添加到班级列表，等用户确认后再添加
       // 保存成功的数据以便确认时添加
       // 这里需要保存 newClasses 和 newLessonsList 到状态中
       // 为了简化，我们可以在确认时重新解析文件，或者保存到状态中
       // 这里我们选择在确认时重新解析文件
   };

   // Batch Import Confirmation Handler
   const handleBatchImportConfirm = async () => {
       if (!uploadedFile) {
           alert('没有上传的文件');
           return;
       }

       const workbook = new ExcelJS.Workbook();
       const buffer = await uploadedFile.arrayBuffer();
       await workbook.xlsx.load(buffer);
       const worksheet = workbook.getWorksheet(1);
       
       if (!worksheet) {
           alert('无法读取工作表');
           return;
       }

       const newClasses: ClassInfo[] = [];
       const newLessonsList: Lesson[] = [];
       let successCount = 0;

       worksheet.eachRow((row: any, rowNumber: number) => {
           if (rowNumber === 1) return; // Skip header
           if (rowNumber > 1001) return; // Skip beyond 1000 rows

           const courseName = row.getCell(1).text;
           const className = row.getCell(2).text;
           const year = row.getCell(3).text;
           const campus = row.getCell(4).text;
           const classroom = row.getCell(5).text;
           const capacity = parseInt(row.getCell(6).text) || 20;
           const virtualSeats = parseInt(row.getCell(7).text) || 0;
           const teacherName = row.getCell(8).text;
           const assistantName = row.getCell(9).text;
           const allowConflict = row.getCell(10).text === '是';
           const needQualification = row.getCell(11).text === '是';
           const startDate = row.getCell(12).text;
           const startTime = row.getCell(13).text;
           const endTime = row.getCell(14).text;
           const daysText = row.getCell(15).text;
           const chargeModeText = row.getCell(16).text;
           const price = parseFloat(row.getCell(17).text) || 0;
           const materialPrice = parseFloat(row.getCell(18).text) || 0;

           // 只添加验证成功的数据（基于之前的验证结果）
           const isSuccess = importResults.success.some(item => item.row === rowNumber);
           if (!isSuccess) return;

           const course = COURSES.find(c => c.name === courseName);
           const teacher = TEACHERS.find(t => t.name === teacherName);
           const assistant = TEACHERS.find(t => t.name === assistantName);

           const classId = `b-${Date.now()}-${rowNumber}`;
           
           const timeSlot = `${startTime}-${endTime}`;
           const scheduleDescription = `${startDate} 起 ${daysText}`;
           
           const newClass: ClassInfo = {
               id: classId,
               name: className,
               courseId: course?.id || 'unknown',
               year,
               semester: course?.semester || '寒假',
               campus,
               classroom,
               teacherId: teacher?.id || '',
               assistant: assistant?.id || '',
               capacity,
               virtualSeats,
               allowConflict,
               needQualification,
               startDate,
               timeSlot,
               price,
               materialPrice,
               chargeMode: chargeModeText === '分期' ? 'installment' : 'whole',
               
               status: 'pending',
               saleStatus: 'off_sale',
               description: courseName,
               color: '#2DA194',
               studentCount: 0,
               createdTime: new Date().toLocaleString(),
               city: '南京', 
               district: '鼓楼区', 
               scheduleDescription,
               studentTag: '',
               allowStudentSchedule: false,
               refundPolicy: 'unused',
               materialRefundPolicy: 'no_return',
               subject: course?.subject || '英语',
               grade: course?.grade || '1年级',
               studentGrade: course?.grade || '1年级',
           };

           // Generate Default Lessons
           if (course) {
               const lessonCount = course.lessons?.length || course.lessonCount || 10;
               let currentLessonDate = new Date(startDate);
               const targetDays = daysText.split(/[,，、 ]/).filter((d: string) => WEEKDAYS.includes(d));
               const targetDayIndices = targetDays.map((d: string) => WEEKDAYS.indexOf(d));
               
               if (targetDayIndices.length === 0) {
                   targetDayIndices.push(currentLessonDate.getDay());
               }

               let lessonsGenerated = 0;
               let loopDate = new Date(currentLessonDate);

               while (!targetDayIndices.includes(loopDate.getDay())) {
                   loopDate.setDate(loopDate.getDate() + 1);
               }

               while (lessonsGenerated < lessonCount) {
                   if (targetDayIndices.includes(loopDate.getDay())) {
                       const dateStr = loopDate.toISOString().split('T')[0];
                       newLessonsList.push({
                           id: `bl-${Date.now()}-${rowNumber}-${lessonsGenerated}`,
                           classId,
                           name: course.lessons?.[lessonsGenerated]?.name || `${courseName} - 第${lessonsGenerated+1}讲`,
                           date: dateStr,
                           startTime: startTime || '14:00',
                           endTime: endTime || '16:00',
                           status: 'pending',
                           teacherId: teacher?.id,
                       });
                       lessonsGenerated++;
                   }
                   loopDate.setDate(loopDate.getDate() + 1);
               }
           }

           newClasses.push(newClass);
           successCount++;
       });
       
       // 添加成功的班级到列表
       newClasses.forEach(c => {
           const clsLessons = newLessonsList.filter(l => l.classId === c.id);
           onAddClass(c, clsLessons);
       });

       // 关闭弹窗并重置状态
       setShowBatchImportModal(false);
       setBatchImportStep(1);
       setImportResults({ success: [], failed: [] });
       setUploadedFile(null);
       
       // 显示成功消息
       if (successCount > 0) {
           alert(`成功导入 ${successCount} 个班级`);
       }
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
        alert("请选择首课日期和产品");
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
    
    // 3. Multi-select Filters
    const matchYear = filterYear.length === 0 || filterYear.includes(cls.year) || (course?.year && filterYear.includes(course.year));
    const matchSubject = filterSubject.length === 0 || filterSubject.includes(cls.subject) || (course?.subject && filterSubject.includes(course.subject));
    const matchSemester = filterSemester.length === 0 || filterSemester.includes(cls.semester);
    
    // 4. Teacher Filter
    const matchTeacher = filterTeacher.length === 0 || filterTeacher.includes(cls.teacherId);

    // 5. Combined Grade & Class Type Filter
    const matchGradeClassType = filterGradeClassType.length === 0 || 
      filterGradeClassType.some(({ grade, classType }) => {
        // Check if class matches either the class grade or course grade
        const gradeMatch = cls.grade === grade || (course?.grade && course.grade === grade);
        // Also check course tags for system course grades (e.g., "G1", "G2")
        const tagMatch = course?.tags?.includes(grade) || false;
        // Check if class type matches
        const classTypeMatch = cls.studentTag === classType;
        return (gradeMatch || tagMatch) && classTypeMatch;
      });
    const matchCity = filterCity.length === 0 || filterCity.includes(cls.city);
    const matchDistrict = filterDistrict.length === 0 || filterDistrict.includes(cls.district);
    const matchCampus = filterCampus.length === 0 || filterCampus.includes(cls.campus);
    const matchClassroom = filterClassroom.length === 0 || filterClassroom.includes(cls.classroom);
    
    // 6. Status filter (multi-select)
    let matchStatus = true;
    if (filterStatus.length > 0) {
        const statusMap: Record<string, string[]> = {
            'pending': ['pending'],
            'active': ['active', 'full'],
            'closed': ['closed', 'disabled']
        };
        
        // 检查班级状态是否匹配任何选中的状态组
        matchStatus = filterStatus.some(statusKey => {
            const statusValues = statusMap[statusKey] || [statusKey];
            return statusValues.includes(cls.status || '');
        });
    }

    // 7. Course type filter (multi-select)
    const matchCourseType = filterCourseType.length === 0 || (course?.type && filterCourseType.includes(course.type));

    // 5. New Filters
    const matchRemaining = !filterRemaining || (filterRemaining === 'has_seats' ? ((cls.capacity || 0) - (cls.studentCount || 0) > 0) : ((cls.capacity || 0) - (cls.studentCount || 0) <= 0));
    const matchSaleStatus = !filterSaleStatus || cls.saleStatus === filterSaleStatus;

    let matchCheckbox = true;
    if (showActiveOnly) {
        matchCheckbox = ['pending', 'active', 'full'].includes(cls.status || 'pending');
    }

    return matchName && matchMode && matchYear && matchSubject && matchGradeClassType && 
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
        case 'courseType': return <span className="text-gray-600">{course?.type === 'long-term' ? '体系课' : course?.type === 'short-term' ? '专项课' : '短期课程'}</span>;
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
                                  {tab === 'course' && '产品信息'}
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
                                  <div className="col-span-2"><span className="text-gray-400 w-24 inline-block">产品名称：</span><span className="text-gray-900">{course?.name}</span></div>
                                  <div className="col-span-2"><span className="text-gray-400 w-24 inline-block">班级名称：</span><span className="text-gray-900">{selectedClass.name}</span></div>
                                  <div><span className="text-gray-400 w-24 inline-block">年份：</span><span className="text-gray-900">{selectedClass.year || course?.year}</span></div>
                                  <div><span className="text-gray-400 w-24 inline-block">学期：</span><span className="text-gray-900">{selectedClass.semester || '-'}</span></div>
                                  <div><span className="text-gray-400 w-24 inline-block">面授老师：</span><span className="text-gray-900">{teacher?.name}</span></div>
                                  <div><span className="text-gray-400 w-24 inline-block">校区：</span><span className="text-gray-900">{selectedClass.campus}</span></div>
                                   <div><span className="text-gray-400 w-24 inline-block">预招人数：</span><span className="text-gray-900">{selectedClass.capacity}</span></div>
                                   <div><span className="text-gray-400 w-24 inline-block">调课位：</span><span className="text-gray-900">{selectedClass.virtualSeats || 0}</span></div>
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
                                  <div className="flex"><span className="text-gray-400 w-32 inline-block">产品费用：</span><span className="text-red-500 font-bold">¥{selectedClass.price}</span></div>
                                  <div className="flex"><span className="text-gray-400 w-32 inline-block">教辅费用：</span><span className="text-red-500 font-bold">¥{selectedClass.materialPrice || 0}</span></div>
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
                                              <th className="p-3">学生姓名</th>
                                              <th className="p-3">性别</th>
                                              <th className="p-3">联系电话</th>
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
                          {step === 2 && '产品信息'}
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
              <MultiSelect
                options={YEARS}
                selected={filterYear}
                onChange={setFilterYear}
                placeholder="年份"
                width="w-[90px]"
              />
             <MultiSelect
               options={SEMESTERS}
               selected={filterSemester}
               onChange={setFilterSemester}
               placeholder="学期"
               width="w-[90px]"
             />
             <MultiSelect
               options={SUBJECTS}
               selected={filterSubject}
               onChange={setFilterSubject}
               placeholder="学科"
               width="w-[90px]"
             />
            
              {/* Combined Grade & Class Type Filter */}
              <GradeClassTypeSelect
                selected={filterGradeClassType}
                onChange={setFilterGradeClassType}
                placeholder="班层筛选"
                width="w-[180px]"
              />

               {/* Teacher Select - 支持搜索和多选 */}
               <SearchableMultiSelect
                 options={TEACHERS.map(t => t.name)}
                 selected={filterTeacher.map(id => TEACHERS.find(t => t.id === id)?.name || '')}
                 onChange={(selectedNames) => {
                   // 将老师姓名转换为ID
                   const selectedIds = selectedNames.map(name => 
                     TEACHERS.find(t => t.name === name)?.id || ''
                   ).filter(id => id !== '');
                   setFilterTeacher(selectedIds);
                 }}
                 placeholder="选择老师"
                 width="w-[140px]"
                 searchPlaceholder="搜索老师..."
               />

              {/* Status */}
              <MultiSelect
                options={['未开课', '开课中', '已结课']}
                selected={filterStatus.map(status => {
                  const statusMap: Record<string, string> = {
                    'pending': '未开课',
                    'active': '开课中', 
                    'closed': '已结课'
                  };
                  return statusMap[status] || '';
                }).filter(label => label !== '')}
                onChange={(selectedLabels) => {
                  // 将中文标签转换为对应的状态值
                  const statusMap: Record<string, string> = {
                    '未开课': 'pending',
                    '开课中': 'active', 
                    '已结课': 'closed'
                  };
                  const selectedStatus = selectedLabels.map(label => statusMap[label] || '');
                  setFilterStatus(selectedStatus.filter(status => status !== ''));
                }}
                placeholder="班级状态"
                width="w-[100px]"
              />

              {/* Course Type */}
              <MultiSelect
                options={['体系课', '专项课']}
                selected={filterCourseType.map(type => {
                  const typeMap: Record<string, string> = {
'long-term': '体系课',
  'short-term': '专项课'
                  };
                  return typeMap[type] || '';
                }).filter(label => label !== '')}
                onChange={(selectedLabels) => {
                  // 将中文标签转换为对应的类型值
                  const typeMap: Record<string, string> = {
'体系课': 'long-term',
  '专项课': 'short-term'
                  };
                  const selectedTypes = selectedLabels.map(label => typeMap[label] || '');
                  setFilterCourseType(selectedTypes.filter(type => type !== ''));
                }}
                placeholder="产品类型"
                width="w-[100px]"
              />

            {/* Remaining Seats */}
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]" value={filterRemaining} onChange={e => setFilterRemaining(e.target.value)}>
                <option value="">余位情况</option>
                <option value="has_seats">有余位</option>
                <option value="full">已满</option>
            </select>

            {/* First Lesson Date */}
            <div className="relative">
              <input
                id="firstLessonDatePicker"
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px] opacity-0 absolute inset-0 cursor-pointer"
              />
              <div 
                className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[120px] flex-shrink-0 h-[34px] flex items-center justify-between cursor-pointer hover:border-primary transition-colors"
                onClick={() => {
                  const dateInput = document.getElementById('firstLessonDatePicker');
                  if (dateInput && dateInput instanceof HTMLInputElement) {
                    dateInput.click();
                  }
                }}
              >
                <span className="text-gray-700">
                  {filterStartDate || '首课日期'}
                </span>
                <span className="text-gray-400 text-sm">📅</span>
              </div>
            </div>
        </div>

        {/* Row 2 */}
        <div className="flex items-center gap-2 flex-wrap">
             {/* Address Group - Separated */}
             <MultiSelect
               options={Object.keys(LOCATION_DATA)}
               selected={filterCity}
               onChange={(selected) => { 
                 setFilterCity(selected);
                 // 城市变化时清空下级筛选
                 setFilterDistrict([]);
                 setFilterCampus([]);
                 setFilterClassroom([]);
               }}
               placeholder="城市"
               width="w-[80px]"
             />
             <MultiSelect
               options={availableDistricts}
               selected={filterDistrict}
               onChange={(selected) => { 
                 setFilterDistrict(selected);
                 // 区域变化时清空下级筛选
                 setFilterCampus([]);
                 setFilterClassroom([]);
               }}
               placeholder="区域"
               width="w-[90px]"
             />
             <MultiSelect
               options={availableCampuses}
               selected={filterCampus}
               onChange={(selected) => { 
                 setFilterCampus(selected);
                 // 校区变化时清空教室筛选
                 setFilterClassroom([]);
               }}
               placeholder="校区"
               width="w-[110px]"
             />
             <MultiSelect
               options={CLASSROOMS}
               selected={filterClassroom}
               onChange={setFilterClassroom}
               placeholder="教室"
               width="w-[90px]"
             />

            {/* Sale Status */}
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]" value={filterSaleStatus} onChange={e => setFilterSaleStatus(e.target.value)}>
                <option value="">售卖状态</option>
                <option value="on_sale">已上架</option>
                <option value="off_sale">未上架</option>
            </select>

             {/* Search Button */}
             <button 
                 className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors flex-shrink-0 h-[34px] shadow-sm font-medium" 
                 onClick={() => {
                   // 搜索按钮点击时，筛选逻辑会自动应用
                   // 这里不需要额外操作，因为filteredClasses已经实时计算
                 }}
             >
                 搜索
             </button>

             {/* Reset Button */}
             <button 
                 className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors flex-shrink-0 h-[34px] shadow-sm font-medium" 
                 onClick={() => { 
                   setFilterName(''); 
                   setFilterMode(''); 
                   setFilterYear([]); 
                   setFilterSubject([]); 
                    setFilterGradeClassType([]);
                   setFilterSemester([]); 
                   setFilterTeacher([]); 
                   setStudentSearch(''); 
                   setFilterCity([]); 
                   setFilterDistrict([]); 
                   setFilterCampus([]); 
                   setFilterClassroom([]); 
                   setFilterStatus([]); 
                   setFilterCourseType([]); 
                   setFilterRemaining(''); 
                   setFilterSaleStatus(''); 
                 }}
             >
                 重置
             </button>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
         <div className="flex items-center gap-3">
            <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors">创建班级</button>
            <button onClick={() => setShowBatchImportModal(true)} className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors">批量建班</button>
             <button 
               onClick={exportClassList}
               className="border border-primary text-primary hover:bg-primary-light px-4 py-1.5 rounded text-sm transition-colors ml-2"
             >
               导出班级列表
             </button>
             <button 
               onClick={exportClassStudents}
               className="border border-primary text-primary hover:bg-primary-light px-4 py-1.5 rounded text-sm transition-colors"
             >
               导出班级学生
             </button>
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700 ml-4">
                <input type="checkbox" checked={showActiveOnly} onChange={e => setShowActiveOnly(e.target.checked)} className="w-4 h-4 rounded text-primary focus:ring-primary"/>
                仅展示“未开课、开课中”的班级
             </label>
             <span className="ml-6 text-sm text-gray-700">
                在班总人数：<span className="text-[#2DA194] font-medium">130</span>
             </span>
          </div>
      </div>

      {/* Table - 优化边距和操作栏固定 */}
      <div className="flex-1 overflow-hidden bg-white flex flex-col">
        <div className="flex-1 overflow-auto mx-4 my-4 border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
            <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200 sticky top-0 z-10">
              <tr>
                {DISPLAY_COLUMNS.map(col => (<th key={col.id} className="p-4">{col.label}</th>))}
                <th className="p-4 text-center sticky right-0 bg-[#F9FBFA] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClasses.map(cls => (
                  <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                    {DISPLAY_COLUMNS.map(col => (<td key={col.id} className="p-4">{getCellContent(col.id, cls)}</td>))}
                    <td className="p-4 sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                      <div className="flex gap-2 justify-center text-primary text-sm whitespace-nowrap">
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
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>产品名称</label>
                                <div className="flex-1 flex gap-2">
                                    <select value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})} className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
                                        <option value="">请选择产品</option>
                                        {COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <button className="px-4 py-2 border border-primary text-primary rounded text-sm hover:bg-primary-light">选择产品</button>
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
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>允许老师、教室时间冲突</label>
                                <div className="flex-1 flex gap-6 text-sm text-gray-600 items-center h-[38px]">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="allowConflict" checked={formData.allowConflict === true} onChange={() => setFormData({...formData, allowConflict: true})} className="text-primary" /> 是</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="allowConflict" checked={formData.allowConflict === false} onChange={() => setFormData({...formData, allowConflict: false})} className="text-primary" /> 否</label>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>需要入学资格</label>
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
                            <h3 className="font-bold text-gray-800">产品信息</h3>
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
                                        <label className="w-24 text-sm text-gray-500 text-left mr-4"><span className="text-red-500 mr-1">*</span>频率</label>
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
                                <label className="w-32 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>产品费</label>
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

       {/* BATCH IMPORT MODAL */}
       {showBatchImportModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-[900px] h-[600px] flex flex-col relative animate-fade-in">
              <button 
                 onClick={() => {
                   setShowBatchImportModal(false);
                   setBatchImportStep(1);
                   setImportResults({ success: [], failed: [] });
                   setUploadedFile(null);
                 }} 
                 className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                 &times;
              </button>
              
              <div className="p-8 pb-0">
                  <h3 className="text-lg font-bold text-gray-700 mb-6">批量建班</h3>
                  
                  <div className="flex items-center gap-4 mb-8">
                      <div className={`flex items-center gap-2 ${batchImportStep === 1 ? 'text-black font-bold text-xl' : 'text-gray-400 text-lg'}`}>
                          <span>第1步导入文件</span>
                          {batchImportStep === 1 && <div className="h-1 w-8 rounded-full bg-primary"></div>}
                      </div>
                      <div className={`flex items-center gap-2 ${batchImportStep === 2 ? 'text-black font-bold text-xl' : 'text-gray-400 text-lg'}`}>
                          <span>第2步查看导入情况</span>
                          {batchImportStep === 2 && <div className="h-1 w-8 rounded-full bg-primary"></div>}
                      </div>
                  </div>
              </div>

              <div className="flex-1 px-8">
                {batchImportStep === 1 ? (
                  <div className="h-full flex flex-col">
                      <div className="mb-4">
                          <button 
                             onClick={generateAndDownloadTemplate}
                             className="bg-primary hover:bg-teal-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2 transition-colors"
                          >
                              <span>⬇</span> 下载模板
                          </button>
                      </div>
                      
                      <div className="flex-1 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center relative hover:border-primary transition-colors bg-gray-50">
                          <input 
                             type="file" 
                             accept=".xlsx" 
                             onChange={handleFileUpload}
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                           <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-white text-2xl">
                               ↑
                           </div>
                          <div className="text-gray-500 text-sm font-medium">点击或拖拽上传文件</div>
                      </div>

                      <div className="mt-6 text-xs text-gray-500 space-y-1.5 bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <div className="font-bold text-gray-700 mb-2">导入须知</div>
                          <p>1、需要下载模板，按照模板格式内容上传；</p>
                          <p>2、请认真阅读表头内需注意的问题；</p>
                          <p>3、一次最大导入 10M 大小以内；</p>
                          <p>4、表格内最多仅能支持1000行，空行后的数据不可导入；</p>
                          <p>5、仅支持.xlsx 后缀文件格式。</p>
                          <p>6、请勿改动模板格式，否则将无法导入</p>
                      </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="mb-4 flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-600">导入结果：</span>
                        <span className="ml-2 text-green-600 font-medium">成功 {importResults.success.length} 条</span>
                        <span className="ml-4 text-red-600 font-medium">失败 {importResults.failed.length} 条</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="p-3 text-left font-medium text-gray-600 w-16">行号</th>
                            <th className="p-3 text-left font-medium text-gray-600">班级名称</th>
                            <th className="p-3 text-left font-medium text-gray-600">状态</th>
                            <th className="p-3 text-left font-medium text-gray-600">详情</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {importResults.success.map((item, idx) => (
                            <tr key={`success-${idx}`} className="hover:bg-green-50">
                              <td className="p-3 text-gray-600">{item.row}</td>
                              <td className="p-3 text-gray-800">{item.className}</td>
                              <td className="p-3">
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">成功</span>
                              </td>
                              <td className="p-3 text-gray-600 text-sm">{item.message}</td>
                            </tr>
                          ))}
                          {importResults.failed.map((item, idx) => (
                            <tr key={`failed-${idx}`} className="hover:bg-red-50">
                              <td className="p-3 text-gray-600">{item.row}</td>
                              <td className="p-3 text-gray-800">{item.className}</td>
                              <td className="p-3">
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">失败</span>
                              </td>
                              <td className="p-3 text-red-600 text-sm">{item.error}</td>
                            </tr>
                          ))}
                          {importResults.success.length === 0 && importResults.failed.length === 0 && (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-gray-400">暂无导入数据</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 flex justify-center gap-4 border-t border-gray-100 mt-4">
                {batchImportStep === 1 ? (
                  <button 
                    onClick={() => {
                      setShowBatchImportModal(false);
                      setBatchImportStep(1);
                      setImportResults({ success: [], failed: [] });
                      setUploadedFile(null);
                    }}
                    className="px-10 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    关闭
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setBatchImportStep(1);
                        setImportResults({ success: [], failed: [] });
                        setUploadedFile(null);
                      }}
                      className="px-10 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      重新上传
                    </button>
                    <button 
                      onClick={handleBatchImportConfirm}
                      className="px-10 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600 transition-colors"
                    >
                      确认
                    </button>
                  </>
                )}
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
                                placeholder="搜索学生姓名/联系电话"
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
                    <h3 className="text-lg font-bold text-gray-800">产品推送 - {selectedClassForQueue?.name}</h3>
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
