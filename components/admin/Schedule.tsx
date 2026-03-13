
import React, { useState, useEffect, useRef } from 'react';
import { ClassInfo, Lesson, Teacher } from '../../types';
import { TEACHERS, CAMPUSES, COURSES } from '../../constants';

interface ScheduleProps {
  classes: ClassInfo[];
  lessons: Lesson[];
  onNavigateToClassDetail?: (classId: string) => void;
}

type ScheduleTab = 'teacher' | 'classroom' | 'placement';

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
  // 评测场次筛选状态
  const [filterPlacementCity, setFilterPlacementCity] = useState('');
  const [filterPlacementDistrict, setFilterPlacementDistrict] = useState('');
  const [filterPlacementCampus, setFilterPlacementCampus] = useState('');
  const [filterPlacementClassroom, setFilterPlacementClassroom] = useState('');
  
  // 评测场次教室列表 (用于日历纵轴)
  const allPlacementClassrooms = [
    { name: '龙江105', campus: '龙江校区', city: '南京市', district: '鼓楼区', province: '江苏省' },
    { name: '龙江102', campus: '龙江校区', city: '南京市', district: '鼓楼区', province: '江苏省' },
    { name: '奥南202', campus: '奥南校区', city: '南京市', district: '建邺区', province: '江苏省' },
    { name: '奥南201', campus: '奥南校区', city: '南京市', district: '建邺区', province: '江苏省' },
    { name: '大行宫305', campus: '大行宫校区', city: '南京市', district: '玄武区', province: '江苏省' },
    { name: '大行宫201', campus: '大行宫校区', city: '南京市', district: '玄武区', province: '江苏省' },
    { name: '仙林303', campus: '仙林校区', city: '南京市', district: '栖霞区', province: '江苏省' },
    { name: '五台山101', campus: '五台山校区', city: '南京市', district: '鼓楼区', province: '江苏省' },
    { name: '辰龙314', campus: '辰龙校区', city: '南京市', district: '雨花台区', province: '江苏省' },
    { name: '爱邦101', campus: '爱邦中心校区', city: '南京市', district: '秦淮区', province: '江苏省' },
    { name: '奥体101', campus: '奥体网球中心校区', city: '南京市', district: '建邺区', province: '江苏省' },
  ];

  const placementClassrooms = allPlacementClassrooms.filter(c => {
    const matchName = !filterPlacementClassroom || c.name.includes(filterPlacementClassroom);
    const matchCity = !filterPlacementCity || c.city === filterPlacementCity;
    const matchDistrict = !filterPlacementDistrict || c.district === filterPlacementDistrict;
    const matchCampus = !filterPlacementCampus || c.campus === filterPlacementCampus;
    return matchName && matchCity && matchDistrict && matchCampus;
  });
  
  // 获取某教室某天的评测场次
  const getPlacementClassroomDaySchedule = (classroomName: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return placementSessions.filter(s => s.classroom === classroomName && s.date === dateStr);
  };
  
  // 定级测相关状态
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [placementForm, setPlacementForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    province: '江苏省',
    city: '南京市',
    district: '鼓楼区',
    campus: '',
    classroom: '',
    presenter: '',
    maxCapacity: 20
  });
  
  // 定级测场次数据
  const [placementSessions, setPlacementSessions] = useState([
    { id: 'pt1', date: '2026-03-07', startTime: '09:00', endTime: '11:00', province: '江苏省', city: '南京市', district: '鼓楼区', campus: '龙江校区', classroom: '龙江105', presenterId: '219', presenterName: 'Melody', maxCapacity: 20 },
    { id: 'pt2', date: '2026-03-08', startTime: '14:00', endTime: '16:00', province: '江苏省', city: '南京市', district: '建邺区', campus: '奥南校区', classroom: '奥南202', presenterId: '217', presenterName: 'Ruby', maxCapacity: 15 },
    { id: 'pt3', date: '2026-03-09', startTime: '10:00', endTime: '12:00', province: '江苏省', city: '南京市', district: '玄武区', campus: '大行宫校区', classroom: '大行宫305', presenterId: '216', presenterName: 'Angel', maxCapacity: 25 },
    { id: 'pt4', date: '2026-03-10', startTime: '15:00', endTime: '17:00', province: '江苏省', city: '南京市', district: '栖霞区', campus: '仙林校区', classroom: '仙林303', presenterId: '214', presenterName: 'Ace', maxCapacity: 18 },
    { id: 'pt5', date: '2026-03-11', startTime: '09:30', endTime: '11:30', province: '江苏省', city: '南京市', district: '鼓楼区', campus: '五台山校区', classroom: '五台山101', presenterId: '213', presenterName: 'Felicia', maxCapacity: 20 },
  ]);
  
  // 宣讲师列表 (模拟有宣讲师角色的员工)
  const presenters = [
    { id: '219', name: 'Melody' },
    { id: '217', name: 'Ruby' },
    { id: '216', name: 'Angel' },
    { id: '214', name: 'Ace' },
    { id: '213', name: 'Felicia' },
  ];

  // 评测状态类型
  type EvalStatus = '待到访' | '已到访' | '已评测' | '已取消';

  // 学生评测预约数据
  interface EvalReservation {
    id: string;
    sessionId: string;
    studentId: string;
    studentName: string;
    studentPhone: string;
    status: EvalStatus;
    assignedPaper?: string;
  }

  // 模拟学生预约数据
  const [evalReservations, setEvalReservations] = useState<EvalReservation[]>([
    // pt1 龙江校区
    { id: 'er1', sessionId: 'pt1', studentId: '4994', studentName: '朱维茜', studentPhone: '18262568828', status: '待到访' },
    { id: 'er2', sessionId: 'pt1', studentId: '4993', studentName: 'Randi丁柔', studentPhone: '13921447652', status: '已到访' },
    { id: 'er3', sessionId: 'pt1', studentId: '4992', studentName: 'Grace吴悦', studentPhone: '18260360314', status: '待到访' },
    // pt2 奥南校区
    { id: 'er4', sessionId: 'pt2', studentId: '4991', studentName: '钱晶', studentPhone: '15250965218', status: '已到访' },
    { id: 'er5', sessionId: 'pt2', studentId: '4990', studentName: '张璟秋', studentPhone: '13149918395', status: '已评测' },
    { id: 'er6', sessionId: 'pt2', studentId: '4989', studentName: 'Sara薛蓉', studentPhone: '13801597148', status: '待到访' },
    // pt3 大行宫305 (15人)
    { id: 'er7', sessionId: 'pt3', studentId: '11678463', studentName: '殷煦纶', studentPhone: '138****0455', status: '待到访' },
    { id: 'er8', sessionId: 'pt3', studentId: '11705283', studentName: '张梓墨', studentPhone: '180****7733', status: '已取消' },
    { id: 'er301', sessionId: 'pt3', studentId: '1001', studentName: '李明轩', studentPhone: '139****1234', status: '待到访' },
    { id: 'er302', sessionId: 'pt3', studentId: '1002', studentName: '王诗涵', studentPhone: '138****5678', status: '已到访' },
    { id: 'er303', sessionId: 'pt3', studentId: '1003', studentName: '陈雨桐', studentPhone: '137****9012', status: '待到访' },
    { id: 'er304', sessionId: 'pt3', studentId: '1004', studentName: '刘子轩', studentPhone: '136****3456', status: '已评测' },
    { id: 'er305', sessionId: 'pt3', studentId: '1005', studentName: '杨思远', studentPhone: '135****7890', status: '待到访' },
    { id: 'er306', sessionId: 'pt3', studentId: '1006', studentName: '赵欣怡', studentPhone: '134****2345', status: '已到访' },
    { id: 'er307', sessionId: 'pt3', studentId: '1007', studentName: '黄嘉琪', studentPhone: '133****6789', status: '待到访' },
    { id: 'er308', sessionId: 'pt3', studentId: '1008', studentName: '周子涵', studentPhone: '132****0123', status: '已取消' },
    { id: 'er309', sessionId: 'pt3', studentId: '1009', studentName: '吴雨萱', studentPhone: '131****4567', status: '待到访' },
    { id: 'er310', sessionId: 'pt3', studentId: '1010', studentName: '郑浩然', studentPhone: '130****8901', status: '已到访' },
    { id: 'er311', sessionId: 'pt3', studentId: '1011', studentName: '孙艺菲', studentPhone: '159****2345', status: '待到访' },
    { id: 'er312', sessionId: 'pt3', studentId: '1012', studentName: '钱梓晨', studentPhone: '158****6789', status: '已评测' },
    { id: 'er313', sessionId: 'pt3', studentId: '1013', studentName: '徐梦琪', studentPhone: '157****0123', status: '待到访' },
    // pt4 仙林303 (18人)
    { id: 'er9', sessionId: 'pt4', studentId: '11950153', studentName: '王子萱', studentPhone: '137****4495', status: '待到访' },
    { id: 'er10', sessionId: 'pt4', studentId: '11965183', studentName: '蒋翊翘', studentPhone: '158****8498', status: '已到访' },
    { id: 'er401', sessionId: 'pt4', studentId: '2001', studentName: '林子轩', studentPhone: '156****1234', status: '待到访' },
    { id: 'er402', sessionId: 'pt4', studentId: '2002', studentName: '何诗瑶', studentPhone: '155****5678', status: '已到访' },
    { id: 'er403', sessionId: 'pt4', studentId: '2003', studentName: '罗雨桐', studentPhone: '154****9012', status: '待到访' },
    { id: 'er404', sessionId: 'pt4', studentId: '2004', studentName: '谢子墨', studentPhone: '153****3456', status: '已评测' },
    { id: 'er405', sessionId: 'pt4', studentId: '2005', studentName: '马思远', studentPhone: '152****7890', status: '待到访' },
    { id: 'er406', sessionId: 'pt4', studentId: '2006', studentName: '沈欣怡', studentPhone: '151****2345', status: '已到访' },
    { id: 'er407', sessionId: 'pt4', studentId: '2007', studentName: '韩嘉琪', studentPhone: '150****6789', status: '待到访' },
    { id: 'er408', sessionId: 'pt4', studentId: '2008', studentName: '冯子涵', studentPhone: '189****0123', status: '已取消' },
    { id: 'er409', sessionId: 'pt4', studentId: '2009', studentName: '董雨萱', studentPhone: '188****4567', status: '待到访' },
    { id: 'er410', sessionId: 'pt4', studentId: '2010', studentName: '萧浩然', studentPhone: '187****8901', status: '已到访' },
    { id: 'er411', sessionId: 'pt4', studentId: '2011', studentName: '程艺菲', studentPhone: '186****2345', status: '待到访' },
    { id: 'er412', sessionId: 'pt4', studentId: '2012', studentName: '曹梓晨', studentPhone: '185****6789', status: '已评测' },
    { id: 'er413', sessionId: 'pt4', studentId: '2013', studentName: '袁梦琪', studentPhone: '183****0123', status: '待到访' },
    { id: 'er414', sessionId: 'pt4', studentId: '2014', studentName: '邓子轩', studentPhone: '182****4567', status: '待到访' },
    { id: 'er415', sessionId: 'pt4', studentId: '2015', studentName: '彭诗瑶', studentPhone: '181****8901', status: '已到访' },
    { id: 'er416', sessionId: 'pt4', studentId: '2016', studentName: '许雨桐', studentPhone: '180****2345', status: '待到访' },
    // pt5 五台山101 (22人)
    { id: 'er11', sessionId: 'pt5', studentId: '4994', studentName: '朱维茜', studentPhone: '18262568828', status: '待到访' },
    { id: 'er12', sessionId: 'pt5', studentId: '4993', studentName: 'Randi丁柔', studentPhone: '13921447652', status: '已到访' },
    { id: 'er501', sessionId: 'pt5', studentId: '3001', studentName: '傅子轩', studentPhone: '177****1234', status: '待到访' },
    { id: 'er502', sessionId: 'pt5', studentId: '3002', studentName: '苏诗瑶', studentPhone: '176****5678', status: '已到访' },
    { id: 'er503', sessionId: 'pt5', studentId: '3003', studentName: '卢雨桐', studentPhone: '175****9012', status: '待到访' },
    { id: 'er504', sessionId: 'pt5', studentId: '3004', studentName: '蒋子墨', studentPhone: '178****3456', status: '已评测' },
    { id: 'er505', sessionId: 'pt5', studentId: '3005', studentName: '蔡思远', studentPhone: '179****7890', status: '待到访' },
    { id: 'er506', sessionId: 'pt5', studentId: '3006', studentName: '贾欣怡', studentPhone: '166****2345', status: '已到访' },
    { id: 'er507', sessionId: 'pt5', studentId: '3007', studentName: '丁嘉琪', studentPhone: '167****6789', status: '待到访' },
    { id: 'er508', sessionId: 'pt5', studentId: '3008', studentName: '魏子涵', studentPhone: '168****0123', status: '已取消' },
    { id: 'er509', sessionId: 'pt5', studentId: '3009', studentName: '薛雨萱', studentPhone: '169****4567', status: '待到访' },
    { id: 'er510', sessionId: 'pt5', studentId: '3010', studentName: '叶浩然', studentPhone: '176****8901', status: '已到访' },
    { id: 'er511', sessionId: 'pt5', studentId: '3011', studentName: '阎艺菲', studentPhone: '177****2345', status: '待到访' },
    { id: 'er512', sessionId: 'pt5', studentId: '3012', studentName: '余梓晨', studentPhone: '178****6789', status: '已评测' },
    { id: 'er513', sessionId: 'pt5', studentId: '3013', studentName: '潘梦琪', studentPhone: '179****0123', status: '待到访' },
    { id: 'er514', sessionId: 'pt5', studentId: '3014', studentName: '杜子轩', studentPhone: '186****4567', status: '待到访' },
    { id: 'er515', sessionId: 'pt5', studentId: '3015', studentName: '戴诗瑶', studentPhone: '187****8901', status: '已到访' },
    { id: 'er516', sessionId: 'pt5', studentId: '3016', studentName: '夏雨桐', studentPhone: '188****2345', status: '待到访' },
    { id: 'er517', sessionId: 'pt5', studentId: '3017', studentName: '钟子墨', studentPhone: '189****6789', status: '待到访' },
    { id: 'er518', sessionId: 'pt5', studentId: '3018', studentName: '汪思远', studentPhone: '150****0123', status: '已到访' },
    { id: 'er519', sessionId: 'pt5', studentId: '3019', studentName: '田欣怡', studentPhone: '151****4567', status: '待到访' },
    { id: 'er520', sessionId: 'pt5', studentId: '3020', studentName: '任嘉琪', studentPhone: '152****8901', status: '已评测' },
    { id: 'er521', sessionId: 'pt5', studentId: '3021', studentName: '姜子涵', studentPhone: '153****2345', status: '待到访' },
    { id: 'er522', sessionId: 'pt5', studentId: '3022', studentName: '范雨萱', studentPhone: '154****6789', status: '待到访' },
  ]);

  // 场次详情弹窗状态
  const [showSessionDetailModal, setShowSessionDetailModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<typeof placementSessions[0] | null>(null);

  const [showPaperList, setShowPaperList] = useState(false);
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(null);

  const paperList = ['试卷A', '试卷B', '试卷C', '试卷D', '试卷E'];

  // 点击场次打开详情弹窗
  const handleSessionClick = (session: typeof placementSessions[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSession(session);
    setShowSessionDetailModal(true);
  };

  // 签到功能
  const handleCheckIn = (reservationId: string) => {
    setEvalReservations(prev => prev.map(r => 
      r.id === reservationId ? { ...r, status: '已到访' as EvalStatus } : r
    ));
  };

  const handleAssignPaper = (paperName: string) => {
    if (assigningStudentId) {
      setEvalReservations(prev => prev.map(r => 
        r.id === assigningStudentId ? { ...r, assignedPaper: paperName } : r
      ));
      setShowPaperList(false);
      setAssigningStudentId(null);
    }
  };
  
  // 省市区数据 (模拟南京)
  const addressData = {
    provinces: ['江苏省'],
    cities: { '江苏省': ['南京市'] },
    districts: { '南京市': ['鼓楼区', '建邺区', '玄武区', '栖霞区', '秦淮区', '雨花台区'] },
    campuses: {
      '鼓楼区': ['龙江校区', '五台山校区'],
      '建邺区': ['奥南校区', '奥体网球中心校区'],
      '玄武区': ['大行宫校区'],
      '栖霞区': ['仙林校区'],
      '秦淮区': ['爱邦中心校区'],
      '雨花台区': ['辰龙校区']
    },
    classrooms: {
      '龙江校区': ['龙江101', '龙江102', '龙江105'],
      '五台山校区': ['五台山101', '五台山102'],
      '奥南校区': ['奥南201', '奥南202'],
      '奥体网球中心校区': ['奥体101', '奥体102'],
      '大行宫校区': ['大行宫201', '大行宫305'],
      '仙林校区': ['仙林301', '仙林303'],
      '爱邦中心校区': ['爱邦101'],
      '辰龙校区': ['辰龙314', '辰龙315', '辰龙316']
    }
  };
  
  // 获取某天的定级测场次
  const getPlacementDaySchedule = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return placementSessions.filter(s => s.date === dateStr);
  };
  
  // 定级测 Hover Card 状态
  const [placementHoverCard, setPlacementHoverCard] = useState<{
    visible: boolean;
    x: number;
    y: number;
    item: typeof placementSessions[0] | null;
  }>({ visible: false, x: 0, y: 0, item: null });
  
  const handlePlacementMouseEnter = (item: typeof placementSessions[0], e: React.MouseEvent) => {
    setPlacementHoverCard({ visible: true, x: e.clientX, y: e.clientY, item });
  };
  
  const handlePlacementMouseMove = (e: React.MouseEvent) => {
    if (placementHoverCard.visible) {
      setPlacementHoverCard(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    }
  };
  
  const handlePlacementMouseLeave = () => {
    setPlacementHoverCard({ visible: false, x: 0, y: 0, item: null });
  };
  
  // 点击日历格子打开新增评测场次弹窗
  const handleCellClick = (classroom: typeof allPlacementClassrooms[0], date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setPlacementForm({
      date: dateStr,
      startTime: '',
      endTime: '',
      province: classroom.province,
      city: classroom.city,
      district: classroom.district,
      campus: classroom.campus,
      classroom: classroom.name,
      presenter: '',
      maxCapacity: 20
    });
    setShowPlacementModal(true);
  };

  // 创建定级测场次
  const handleCreatePlacement = () => {
    if (!placementForm.date || !placementForm.startTime || !placementForm.endTime || !placementForm.campus || !placementForm.classroom || !placementForm.presenter) {
      alert('请填写完整信息');
      return;
    }
    const presenter = presenters.find(p => p.id === placementForm.presenter);
    const newSession = {
      id: `pt-${Date.now()}`,
      ...placementForm,
      presenterId: placementForm.presenter,
      presenterName: presenter?.name || ''
    };
    setPlacementSessions([...placementSessions, newSession]);
    setShowPlacementModal(false);
    setPlacementForm({
      date: '', startTime: '', endTime: '', province: '江苏省', city: '南京市', district: '鼓楼区', campus: '', classroom: '', presenter: '', maxCapacity: 20
    });
  };
  
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
          <button
            onClick={() => setActiveTab('placement')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'placement'
                ? 'text-primary border-primary'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            评测场次
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
      {/* 定级测 */}
      {activeTab === 'placement' && (
        <>
          {/* Placement Hover Card */}
          {placementHoverCard.item && placementHoverCard.visible && (
            <div
              className="fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-xl p-3 text-xs min-w-[220px]"
              style={{
                left: placementHoverCard.x + 15,
                top: placementHoverCard.y + 15,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                pointerEvents: 'none'
              }}
            >
              <div className="space-y-1.5">
                <div><span className="text-gray-500">日期：</span><span className="text-gray-800 font-medium">{placementHoverCard.item.date}</span></div>
                <div><span className="text-gray-500">时间：</span><span className="text-gray-800 font-medium">{placementHoverCard.item.startTime}-{placementHoverCard.item.endTime}</span></div>
                <div><span className="text-gray-500">地区：</span><span className="text-gray-800">{placementHoverCard.item.province}-{placementHoverCard.item.city}-{placementHoverCard.item.district}</span></div>
                <div><span className="text-gray-500">校区：</span><span className="text-gray-800">{placementHoverCard.item.campus}</span></div>
                <div><span className="text-gray-500">教室：</span><span className="text-gray-800">{placementHoverCard.item.classroom}</span></div>
                <div><span className="text-gray-500">宣讲师：</span><span className="text-gray-800">{placementHoverCard.item.presenterName}</span></div>
                <div><span className="text-gray-500">人数上限：</span><span className="text-gray-800">{placementHoverCard.item.maxCapacity}人</span></div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
            <select
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28 text-gray-600 focus:outline-none focus:border-primary"
              value={filterPlacementCity}
              onChange={e => { setFilterPlacementCity(e.target.value); setFilterPlacementDistrict(''); setFilterPlacementCampus(''); }}
            >
              <option value="">市</option>
              <option value="南京市">南京市</option>
              <option value="深圳市">深圳市</option>
            </select>
            <select
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28 text-gray-600 focus:outline-none focus:border-primary"
              value={filterPlacementDistrict}
              onChange={e => { setFilterPlacementDistrict(e.target.value); setFilterPlacementCampus(''); }}
              disabled={!filterPlacementCity}
            >
              <option value="">区</option>
              {(addressData.districts[filterPlacementCity] || []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 text-gray-600 focus:outline-none focus:border-primary"
              value={filterPlacementCampus}
              onChange={e => setFilterPlacementCampus(e.target.value)}
              disabled={!filterPlacementDistrict}
            >
              <option value="">校区</option>
              {(addressData.campuses[filterPlacementDistrict] || []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:border-primary"
              placeholder="请输入教室名称"
              value={filterPlacementClassroom}
              onChange={e => setFilterPlacementClassroom(e.target.value)}
            />
            <button
              onClick={() => setShowPlacementModal(true)}
              className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors ml-auto"
            >
              新增评测场次
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
          </div>

          {/* Placement Schedule Grid */}
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
              {/* Grid Rows - 按教室分行 */}
              {placementClassrooms.map((classroom, rIdx) => (
                <div key={classroom.name} className={`grid grid-cols-8 ${rIdx !== placementClassrooms.length - 1 ? 'border-b border-gray-200' : ''}`}>
                  <div className="p-4 bg-gray-50/30 border-r border-gray-200 flex items-center justify-center">
                    <div className="font-bold text-gray-700 text-sm text-center">{classroom.name}</div>
                  </div>
                  {weekDates.map((date, cIdx) => {
                    const daySchedule = getPlacementClassroomDaySchedule(classroom.name, date);
                    return (
                      <div 
                        key={cIdx} 
                        className="p-2 border-r border-gray-200 last:border-r-0 min-h-[100px] relative hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleCellClick(classroom, date)}
                      >
                        {daySchedule.length > 0 ? (
                          <div className="space-y-2">
                            {daySchedule.map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-purple-50 border border-purple-200 rounded p-2 text-xs hover:shadow-md transition-shadow cursor-pointer"
                                onMouseEnter={(e) => handlePlacementMouseEnter(item, e)}
                                onMouseMove={handlePlacementMouseMove}
                                onMouseLeave={handlePlacementMouseLeave}
                                onClick={(e) => handleSessionClick(item, e)}
                              >
                                <div className="font-bold text-gray-800 mb-1">{item.startTime}-{item.endTime}</div>
                                <div className="text-purple-600 truncate">{item.presenterName}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-200 text-sm select-none">
                            +
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
            <span className="text-sm text-gray-500">共{placementSessions.length}条数据</span>
          </div>
        </>
      )}

      {/* 新增评测场次弹窗 */}
      {showPlacementModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-[550px] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">新增评测场次</h3>
              <button onClick={() => setShowPlacementModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5"><span className="text-red-500 mr-1">*</span>日期</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={placementForm.date}
                  onChange={e => setPlacementForm({...placementForm, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5"><span className="text-red-500 mr-1">*</span>时间段</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="time"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    value={placementForm.startTime}
                    onChange={e => setPlacementForm({...placementForm, startTime: e.target.value})}
                  />
                  <span className="text-gray-500">至</span>
                  <input
                    type="time"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    value={placementForm.endTime}
                    onChange={e => setPlacementForm({...placementForm, endTime: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5"><span className="text-red-500 mr-1">*</span>省市区</label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                    value={placementForm.province}
                    onChange={e => setPlacementForm({...placementForm, province: e.target.value, city: '', district: '', campus: '', classroom: ''})}
                  >
                    {addressData.provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select
                    className="flex-1 border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                    value={placementForm.city}
                    onChange={e => setPlacementForm({...placementForm, city: e.target.value, district: '', campus: '', classroom: ''})}
                  >
                    <option value="">请选择市</option>
                    {(addressData.cities[placementForm.province] || []).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    className="flex-1 border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                    value={placementForm.district}
                    onChange={e => setPlacementForm({...placementForm, district: e.target.value, campus: '', classroom: ''})}
                  >
                    <option value="">请选择区</option>
                    {(addressData.districts[placementForm.city] || []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5"><span className="text-red-500 mr-1">*</span>校区</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                  value={placementForm.campus}
                  onChange={e => setPlacementForm({...placementForm, campus: e.target.value, classroom: ''})}
                >
                  <option value="">请选择校区</option>
                  {(addressData.campuses[placementForm.district] || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5"><span className="text-red-500 mr-1">*</span>教室</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                  value={placementForm.classroom}
                  onChange={e => setPlacementForm({...placementForm, classroom: e.target.value})}
                >
                  <option value="">请选择教室</option>
                  {(addressData.classrooms[placementForm.campus] || []).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5"><span className="text-red-500 mr-1">*</span>宣讲师</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                  value={placementForm.presenter}
                  onChange={e => setPlacementForm({...placementForm, presenter: e.target.value})}
                >
                  <option value="">请选择宣讲师</option>
                  {presenters.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5"><span className="text-red-500 mr-1">*</span>人数上限</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={placementForm.maxCapacity}
                  onChange={e => setPlacementForm({...placementForm, maxCapacity: parseInt(e.target.value) || 1})}
                  placeholder="请输入人数上限"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowPlacementModal(false)}
                className="px-5 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm"
              >
                取消
              </button>
              <button
                onClick={handleCreatePlacement}
                className="px-5 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 场次详情弹窗 */}
      {showSessionDetailModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-[850px] max-h-[85vh] flex flex-col overflow-hidden">
            {/* 头部 */}

            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-base font-bold text-gray-800">评测场次详情</h3>
              <button onClick={() => setShowSessionDetailModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            {/* 上部场次信息 */}

            {!showPaperList && (
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-[1fr_2fr_1fr] gap-2 text-xs">
                  <div className="whitespace-nowrap">
                    <span className="text-gray-400">时间：</span>
                    <span className="text-gray-700">{selectedSession.date} {selectedSession.startTime}-{selectedSession.endTime}</span>
                  </div>
                  <div className="whitespace-nowrap">
                    <span className="text-gray-400">地点：</span>
                    <span className="text-gray-700">{selectedSession.campus} · {selectedSession.classroom}</span>
                    <span className="text-gray-400 ml-2">{selectedSession.province}-{selectedSession.city}-{selectedSession.district}</span>
                  </div>
                  <div className="whitespace-nowrap">
                    <span className="text-gray-400">预约情况：</span>
                    <span className="text-gray-700">{evalReservations.filter(r => r.sessionId === selectedSession.id).length}/{selectedSession.maxCapacity}人</span>
                  </div>
                  <div className="whitespace-nowrap">
                    <span className="text-gray-400">宣讲师：</span>
                    <span className="text-gray-700">{selectedSession.presenterName}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 下部学生列表 - 增加高度以每列8人 */}

            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              {showPaperList ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => {
                        setShowPaperList(false);
                        setAssigningStudentId(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      ← 返回
                    </button>
                    <h4 className="text-xs text-gray-600">试卷列表</h4>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2 overflow-y-auto pr-1">
                    {paperList.map((paper, idx) => (
                      <div key={idx} className="bg-gray-50 rounded px-3 py-2 text-xs flex items-center justify-between">
                        <span className="text-gray-700">{paper}</span>
                        <button
                          onClick={() => handleAssignPaper(paper)}
                          className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-teal-600"
                        >
                          分配
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-xs text-gray-600 mb-2">预约学生列表</h4>
                  {(() => {
                    const sessionReservations = evalReservations.filter(r => r.sessionId === selectedSession.id);
                    return sessionReservations.length > 0 ? (
                      <div className="flex-1 grid grid-cols-2 gap-2 overflow-y-auto pr-1">
                        {sessionReservations.map(reservation => (
                          <div key={reservation.id} className="bg-gray-50 rounded px-3 py-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span 
                                  className="text-primary cursor-pointer hover:underline"
                                  onClick={() => {
                                    alert(`跳转到学生详情页: ${reservation.studentName}`);
                                  }}
                                >
                                  {reservation.studentName}
                                </span>
                                <span className="text-gray-400">{reservation.studentPhone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-xs ${
                                  reservation.status === '待到访' ? 'bg-orange-50 text-orange-600' :
                                  reservation.status === '已到访' ? 'bg-blue-50 text-blue-600' :
                                  reservation.status === '已评测' ? 'bg-green-50 text-green-600' :
                                  'bg-gray-50 text-gray-500'
                                }`}>
                                  {reservation.status}
                                </span>
                                {reservation.status === '待到访' && (
                                  <button
                                    onClick={() => handleCheckIn(reservation.id)}
                                    className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-teal-600"
                                  >
                                    签到
                                  </button>
                                )}
                                {reservation.status === '已到访' && !reservation.assignedPaper && (
                                  <button
                                    onClick={() => {
                                      setAssigningStudentId(reservation.id);
                                      setShowPaperList(true);
                                    }}
                                    className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-teal-600"
                                  >
                                    分配试卷
                                  </button>
                                )}
                                {reservation.status === '已到访' && reservation.assignedPaper && (
                                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                    {reservation.assignedPaper}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
                        <p>暂无预约学生</p>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex justify-end bg-gray-50">
              <button
                onClick={() => setShowSessionDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


export default Schedule;

