
import React, { useState, useEffect, useRef } from 'react';
import { ClassInfo, Lesson, Teacher } from '../../types';
import { TEACHERS, CAMPUSES, COURSES } from '../../constants';

interface ScheduleProps {
  classes: ClassInfo[];
  lessons: Lesson[];
  onNavigateToClassDetail?: (classId: string) => void;
}

type ScheduleTab = 'teacher' | 'classroom';

// 周视图课程数据类型
interface ScheduleItem {
  time: string;
  className: string;
  course: string;
  subject: string;
  grade: string;
  teacher: string;
  classroom: string;
  type: string;
}

// Hover Card 组件
interface HoverCardProps {
  item: {
    startTime: string;
    endTime: string;
    classInfo: ClassInfo;
  };
  visible: boolean;
  x: number;
  y: number;
}

const HoverCard: React.FC<HoverCardProps> = ({ item, visible, x, y }) => {
  if (!visible) return null;

  const teacher = TEACHERS.find(t => t.id === item.classInfo.teacherId);
  const course = COURSES.find(c => c.id === item.classInfo.courseId);

  return (
    <div
      className="fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-xl p-3 text-xs min-w-[200px]"
      style={{
        left: x + 15,
        top: y + 15,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        pointerEvents: 'none'
      }}
    >
      <div className="space-y-1.5">
        <div><span className="text-gray-500">时间：</span><span className="text-gray-800 font-medium">{item.startTime}-{item.endTime}</span></div>
        <div><span className="text-gray-500">班级：</span><span className="text-gray-800">{item.classInfo.name}</span></div>
        <div><span className="text-gray-500">产品：</span><span className="text-gray-800">{course?.name || '-'}</span></div>
        <div><span className="text-gray-500">年级：</span><span className="text-gray-800">{item.classInfo.grade || '-'}</span></div>
        <div><span className="text-gray-500">主教老师：</span><span className="text-gray-800">{teacher?.name || '班级组'}</span></div>
        <div><span className="text-gray-500">校区：</span><span className="text-gray-800">{item.classInfo.campus || '默认校区'}</span></div>
        <div><span className="text-gray-500">教室：</span><span className="text-gray-800">{item.classInfo.classroom || '-'}</span></div>
      </div>
    </div>
  );
};

const generateMockScheduleData = (classes: ClassInfo[], lessons: Lesson[]) => {
  const scheduleData: Array<{
    date: string;
    startTime: string;
    endTime: string;
    classInfo: ClassInfo;
    lesson: Lesson;
  }> = [];

  const getWeekDateStr = (dayOfWeek: number) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + dayOfWeek);
    return date.toISOString().split('T')[0];
  };

  const teacherSchedule = [
    {
      teacherId: '219',
      name: 'Melody',
      classes: [
        { day: 1, startTime: '08:30', endTime: '11:00', className: '寒G1-S' },
        { day: 3, startTime: '14:50', endTime: '17:20', className: '寒G1-S' },
        { day: 6, startTime: '08:30', endTime: '11:00', className: '寒G2-A+' },
        { day: 0, startTime: '14:50', endTime: '17:20', className: '寒G3-S' },
      ]
    },
    {
      teacherId: '218',
      name: 'Sonya',
      classes: [
        { day: 2, startTime: '08:30', endTime: '11:00', className: '寒G2-A+' },
        { day: 4, startTime: '14:50', endTime: '17:20', className: '寒G2-A+' },
        { day: 6, startTime: '08:30', endTime: '11:00', className: '寒G4-S' },
      ]
    },
    {
      teacherId: '217',
      name: 'Ruby',
      classes: [
        { day: 1, startTime: '14:50', endTime: '17:20', className: '寒G3-A+' },
        { day: 5, startTime: '08:30', endTime: '11:00', className: '寒G5-S' },
        { day: 0, startTime: '08:30', endTime: '11:00', className: '寒G1-A+' },
      ]
    },
    {
      teacherId: '216',
      name: 'Angel',
      classes: [
        { day: 2, startTime: '08:30', endTime: '11:00', className: '寒G4-A+' },
        { day: 4, startTime: '14:50', endTime: '17:20', className: '寒G2-S' },
        { day: 0, startTime: '14:50', endTime: '17:20', className: '寒G6-A+' },
      ]
    },
    {
      teacherId: '215',
      name: 'Cora',
      classes: [
        { day: 3, startTime: '08:30', endTime: '11:00', className: '寒G5-A+' },
        { day: 5, startTime: '14:50', endTime: '17:20', className: '寒G3-A+' },
        { day: 0, startTime: '08:30', endTime: '11:00', className: '寒G4-S' },
      ]
    },
    {
      teacherId: '214',
      name: 'Ace',
      classes: [
        { day: 1, startTime: '14:50', endTime: '17:20', className: '寒G6-S' },
        { day: 4, startTime: '08:30', endTime: '11:00', className: '寒G4-A+' },
        { day: 6, startTime: '08:30', endTime: '11:00', className: '寒G2-S' },
      ]
    },
    {
      teacherId: '213',
      name: 'Felicia',
      classes: [
        { day: 2, startTime: '08:30', endTime: '11:00', className: '寒G1-A+' },
        { day: 5, startTime: '08:30', endTime: '11:00', className: '寒G5-S' },
      ]
    },
    {
      teacherId: '212',
      name: 'Helen',
      classes: [
        { day: 3, startTime: '14:50', endTime: '17:20', className: '寒G3-S' },
        { day: 6, startTime: '14:50', endTime: '17:20', className: '寒G6-A+' },
      ]
    },
    {
      teacherId: '211',
      name: 'Luna',
      classes: [
        { day: 2, startTime: '08:30', endTime: '11:00', className: '寒G5-A+' },
        { day: 5, startTime: '14:50', endTime: '17:20', className: '寒G1-A+' },
        { day: 0, startTime: '08:30', endTime: '11:00', className: '寒G2-S' },
      ]
    },
    {
      teacherId: '210',
      name: 'Iris',
      classes: [
        { day: 1, startTime: '14:50', endTime: '17:20', className: '寒G4-A+' },
        { day: 4, startTime: '14:50', endTime: '17:20', className: '寒G6-A+' },
        { day: 6, startTime: '08:30', endTime: '11:00', className: '寒G3-S' },
      ]
    },
  ];

  teacherSchedule.forEach(teacher => {
    teacher.classes.forEach(cls => {
      const mockClass: ClassInfo = {
        id: `teacher-${teacher.teacherId}-${cls.day}`,
        name: cls.className,
        timeSlot: `${cls.startTime}-${cls.endTime}`,
        description: '模拟课程',
        color: 'blue',
        teacherId: teacher.teacherId,
        campus: '辰龙校区',
        classroom: '辰龙314',
        subject: '英语',
        grade: '中班',
        courseId: 'course1'
      };

      scheduleData.push({
        date: getWeekDateStr(cls.day),
        startTime: cls.startTime,
        endTime: cls.endTime,
        classInfo: mockClass,
        lesson: {
          id: `lesson-${teacher.teacherId}-${cls.day}`,
          classId: mockClass.id,
          name: mockClass.name,
          date: getWeekDateStr(cls.day),
          startTime: cls.startTime,
          endTime: cls.endTime,
          status: 'pending',
          teacherId: teacher.teacherId
        }
      });
    });
  });

  const targetClassrooms = ['辰龙315', '辰龙316', '辰龙317'];
  const mockClassNames = ['寒G2-A+', '寒G3-S', '寒G1-S', '寒G4-A+'];
  const mockTeachers = ['virtual-t1', 'virtual-t2', 'virtual-t3', 'virtual-t4'];

  targetClassrooms.forEach((classroomName, roomIndex) => {
    for (let day = 0; day <= 6; day++) {
      if (day === 0 || day === 6 || (day + roomIndex) % 2 === 0) {
        const times = ['08:30-11:00', '12:00-14:30', '14:50-17:20', '18:00-20:30'];
        const timeIndex = (roomIndex + day) % times.length;
        const [startTime, endTime] = times[timeIndex].split('-');

        const mockClass: ClassInfo = {
          id: `mock-${classroomName}-${day}`,
          name: mockClassNames[day % mockClassNames.length],
          timeSlot: `${startTime}-${endTime}`,
          description: '模拟课程',
          color: 'blue',
          teacherId: mockTeachers[day % mockTeachers.length],
          campus: '辰龙校区',
          classroom: classroomName,
          subject: '英语',
          grade: '中班',
          courseId: 'course1'
        };

        scheduleData.push({
          date: getWeekDateStr(day),
          startTime,
          endTime,
          classInfo: mockClass,
          lesson: {
            id: `mock-lesson-${classroomName}-${day}`,
            classId: mockClass.id,
            name: mockClass.name,
            date: getWeekDateStr(day),
            startTime,
            endTime,
            status: 'pending',
            teacherId: mockClass.teacherId
          }
        });
      }
    }
  });

  return scheduleData;
};

const Schedule: React.FC<ScheduleProps> = ({ classes, lessons, onNavigateToClassDetail }) => {
  const [activeTab, setActiveTab] = useState<ScheduleTab>('teacher');
  

  
  // 老师课表筛选状态
  const [filterTeacherName, setFilterTeacherName] = useState('');
  const [filterTeacherCampus, setFilterTeacherCampus] = useState('');
  
  // 教室课表筛选状态
  const [filterClassroomName, setFilterClassroomName] = useState('');
  const [filterClassroomCampus, setFilterClassroomCampus] = useState('');
  
  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // 当前周日期
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // 生成周视图数据
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  const getWeekDates = (date: Date) => {
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
  
  const weekDates = getWeekDates(new Date(currentWeek));
  
  const changeWeek = (offset: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (offset * 7));
    setCurrentWeek(newDate);
  };
  
  // 生成课程数据
  const scheduleData = generateMockScheduleData(classes, lessons);

  const teachers = [
    { id: '219', name: 'Melody', campus: '龙江校区' },
    { id: '218', name: 'Sonya', campus: '龙江校区' },
    { id: '217', name: 'Ruby', campus: '奥南校区' },
    { id: '216', name: 'Angel', campus: '大行宫校区' },
    { id: '215', name: 'Cora', campus: '辰龙校区' },
    { id: '214', name: 'Ace', campus: '仙林校区' },
    { id: '213', name: 'Felicia', campus: '五台山校区' },
    { id: '212', name: 'Helen', campus: '奥体网球中心校区' },
    { id: '211', name: 'Luna', campus: '爱邦中心校区' },
    { id: '210', name: 'Iris', campus: '深圳湾校区' },
  ].filter(t => {
    const matchName = !filterTeacherName || t.name.includes(filterTeacherName);
    const matchCampus = !filterTeacherCampus || t.campus === filterCampus;
    return matchName && matchCampus;
  });

  const classrooms = [
    { name: '辰龙315', campus: '辰龙校区', purpose: '面授教室' },
    { name: '辰龙316', campus: '辰龙校区', purpose: '面授教室' },
    { name: '辰龙317', campus: '辰龙校区', purpose: '面授教室' },
  ].filter(c => {
    const matchName = !filterClassroomName || c.name.includes(filterClassroomName);
    const matchCampus = !filterClassroomCampus || c.campus === filterClassroomCampus;
    return matchName && matchCampus;
  });

  // 获取某老师某天的课程
  const getTeacherDaySchedule = (teacherId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduleData.filter(s => 
      s.classInfo.teacherId === teacherId && s.date === dateStr
    );
  };

  // 获取某教室某天的课程
  const getClassroomDaySchedule = (classroomName: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduleData.filter(s => 
      s.classInfo.classroom?.includes(classroomName) && s.date === dateStr
    );
  };

  const formatDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;
  const formatWeekDay = (date: Date) => weekDays[date.getDay()];

  // Hover Card 状态
  const [hoverCard, setHoverCard] = useState<{
    visible: boolean;
    x: number;
    y: number;
    item: { startTime: string; endTime: string; classInfo: ClassInfo } | null;
  }>({ visible: false, x: 0, y: 0, item: null });

  const handleMouseEnter = (item: { startTime: string; endTime: string; classInfo: ClassInfo }, e: React.MouseEvent) => {
    setHoverCard({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoverCard.visible) {
      setHoverCard(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    }
  };

  const handleMouseLeave = () => {
    setHoverCard({ visible: false, x: 0, y: 0, item: null });
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Hover Card */}
      {hoverCard.item && (
        <HoverCard 
          item={hoverCard.item} 
          visible={hoverCard.visible} 
          x={hoverCard.x} 
          y={hoverCard.y} 
        />
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">课表</h2>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-gray-200">
        <div className="flex gap-8">

          <button
            onClick={() => setActiveTab('teacher')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'teacher'
                ? 'text-primary border-primary'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            老师课表
          </button>
          <button
            onClick={() => setActiveTab('classroom')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'classroom'
                ? 'text-primary border-primary'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            教室课表
          </button>
        </div>
      </div>



      {/* 老师课表 */}
      {activeTab === 'teacher' && (
        <>
          {/* Filter Bar */}
          <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
            <input 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:border-primary"
              placeholder="请输入老师姓名"
              value={filterTeacherName}
              onChange={e => setFilterTeacherName(e.target.value)}
            />
            <select 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 text-gray-600 focus:outline-none focus:border-primary"
              value={filterTeacherCampus}
              onChange={e => setFilterTeacherCampus(e.target.value)}
            >
              <option value="">校区</option>
              {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="px-4 py-1.5 border border-primary text-primary rounded text-sm hover:bg-primary-light ml-auto">
              导出
            </button>
          </div>

          {/* Week Navigation */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-gray-200 rounded text-gray-500">◀</button>
                <span className="text-lg font-bold text-gray-800">
                  {currentWeek.getFullYear()}年{currentWeek.getMonth() + 1}月{weekDates[0].getDate()}-{weekDates[6].getDate()}日
                </span>
                <button onClick={() => changeWeek(1)} className="p-1 hover:bg-gray-200 rounded text-gray-500">▶</button>
              </div>
              <button 
                onClick={() => setCurrentWeek(new Date())}
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

          {/* Teacher Schedule Grid */}
          <div className="flex-1 overflow-auto p-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden min-w-[900px]">
              {/* Grid Header */}
              <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
                <div className="p-4 font-bold text-gray-600 border-r border-gray-200 flex items-center justify-center">教师</div>
                {weekDates.map((date, i) => (
                  <div key={i} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                    <div className="text-xs text-gray-500 mb-1">{formatDate(date)}</div>
                    <div className="font-bold text-gray-700">{formatWeekDay(date)}</div>
                  </div>
                ))}
              </div>

              {/* Grid Rows */}
              {teachers.map((teacher, rIdx) => (
                <div key={teacher.id} className={`grid grid-cols-8 ${rIdx !== teachers.length - 1 ? 'border-b border-gray-200' : ''}`}>
                  <div className="p-4 bg-gray-50/30 border-r border-gray-200 flex items-center justify-center">
                    <div className="font-bold text-gray-700 text-sm text-center">{teacher.name}</div>
                  </div>
                  
                  {/* Schedule Columns */}
                  {weekDates.map((date, cIdx) => {
                    const daySchedule = getTeacherDaySchedule(teacher.id, date);
                    return (
                      <div key={cIdx} className="p-2 border-r border-gray-200 last:border-r-0 min-h-[100px] relative hover:bg-gray-50 transition-colors">
                        {daySchedule.length > 0 ? (
                          <div className="space-y-2">
                            {daySchedule.map((item, idx) => (
                              <div 
                                key={idx} 
                                className="bg-blue-50 border border-blue-100 rounded p-2 text-xs hover:shadow-md transition-shadow cursor-pointer"
                                onMouseEnter={(e) => handleMouseEnter(item, e)}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                              >
                                <div className="font-bold text-gray-800 mb-1">{item.startTime}-{item.endTime}</div>
                                <div className="text-blue-600 truncate">{item.classInfo.name}</div>
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

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
            <span className="text-sm text-gray-500">共{teachers.length}条数据</span>
          </div>
        </>
      )}

      {/* 教室课表 */}
      {activeTab === 'classroom' && (
        <>
          {/* Filter Bar */}
          <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
            <input 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:border-primary"
              placeholder="请输入教室名称"
              value={filterClassroomName}
              onChange={e => setFilterClassroomName(e.target.value)}
            />
            <select 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 text-gray-600 focus:outline-none focus:border-primary"
              value={filterClassroomCampus}
              onChange={e => setFilterClassroomCampus(e.target.value)}
            >
              <option value="">校区</option>
              {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="px-4 py-1.5 border border-primary text-primary rounded text-sm hover:bg-primary-light ml-auto">
              导出
            </button>
          </div>

          {/* Week Navigation */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-gray-200 rounded text-gray-500">◀</button>
                <span className="text-lg font-bold text-gray-800">
                  {currentWeek.getFullYear()}年{currentWeek.getMonth() + 1}月{weekDates[0].getDate()}-{weekDates[6].getDate()}日
                </span>
                <button onClick={() => changeWeek(1)} className="p-1 hover:bg-gray-200 rounded text-gray-500">▶</button>
              </div>
              <button 
                onClick={() => setCurrentWeek(new Date())}
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

          {/* Classroom Schedule Grid */}
          <div className="flex-1 overflow-auto p-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden min-w-[900px]">
              {/* Grid Header */}
              <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
                <div className="p-4 font-bold text-gray-600 border-r border-gray-200 flex items-center justify-center">教室</div>
                {weekDates.map((date, i) => (
                  <div key={i} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                    <div className="text-xs text-gray-500 mb-1">{formatDate(date)}</div>
                    <div className="font-bold text-gray-700">{formatWeekDay(date)}</div>
                  </div>
                ))}
              </div>

              {/* Grid Rows */}
              {classrooms.map((classroom, rIdx) => (
                <div key={classroom.name} className={`grid grid-cols-8 ${rIdx !== classrooms.length - 1 ? 'border-b border-gray-200' : ''}`}>
                  <div className="p-4 bg-gray-50/30 border-r border-gray-200 flex items-center justify-center">
                    <div className="font-bold text-gray-700 text-sm text-center">{classroom.name}</div>
                  </div>
                  
                  {/* Schedule Columns */}
                  {weekDates.map((date, cIdx) => {
                    const daySchedule = getClassroomDaySchedule(classroom.name, date);
                    return (
                      <div key={cIdx} className="p-2 border-r border-gray-200 last:border-r-0 min-h-[100px] relative hover:bg-gray-50 transition-colors">
                        {daySchedule.length > 0 ? (
                          <div className="space-y-2">
                            {daySchedule.map((item, idx) => (
                              <div 
                                key={idx} 
                                className="bg-blue-50 border border-blue-100 rounded p-2 text-xs hover:shadow-md transition-shadow cursor-pointer"
                                onMouseEnter={(e) => handleMouseEnter(item, e)}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                              >
                                <div className="font-bold text-gray-800 mb-1">{item.startTime}-{item.endTime}</div>
                                <div className="text-blue-600 truncate">{item.classInfo.name}</div>
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

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
            <span className="text-sm text-gray-500">共{classrooms.length}条数据</span>
          </div>
        </>
      )}
    </div>
  );
};

export default Schedule;
