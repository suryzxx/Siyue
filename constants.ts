
import { ClassInfo, Lesson, Student, Task, Course, Teacher, StudentProfile, Product, Order } from './types';

export const COURSES: Course[] = [
  // 体系课 (long-term)
  { 
    id: 'course1', 
    name: 'K3进阶体系课', 
    type: 'long-term', 
    lessonCount: 12, 
    tags: ['K3', 'K3进阶'],
    description: '针对K3阶段进阶学生的体系课程',
    module: 'English',
    isRecommended: false,
    year: '2026', semester: '春季', subject: '英语', grade: 'K3', classType: '进阶', status: 'active',
    lessons: Array.from({length: 12}, (_, i) => ({
      id: `l1-${i}`, name: `第${i+1}讲`, taskCount: Math.floor(Math.random() * 10) + 2, order: i+1
    }))
  },
  { 
    id: 'course2', 
    name: 'K3飞跃体系课', 
    type: 'long-term', 
    lessonCount: 13, 
    tags: ['K3', 'K3飞跃'],
    description: 'K3飞跃体系课程',
    module: 'English',
    isRecommended: true,
    year: '2026', semester: '寒假', subject: '英语', grade: 'K3', classType: '飞跃', status: 'active',
    lessons: Array.from({length: 13}, (_, i) => ({ id: `c2-${i}`, name: `第${i+1}讲`, taskCount: Math.floor(Math.random() * 8) + 1, order: i+1 }))
  },
  { id: 'course3', name: 'G1-A+体系课', type: 'long-term', lessonCount: 15, tags: ['G1', 'A+'], year: '2026', semester: '寒假', subject: '英语', grade: 'G1', classType: 'A+', status: 'active', lessons: Array.from({length: 15}, (_, i) => ({ id: `c3-${i}`, name: `第${i+1}讲`, taskCount: Math.floor(Math.random() * 8) + 1, order: i+1 })) },
  { id: 'course4', name: 'K2启蒙体系课', type: 'long-term', lessonCount: 10, tags: ['K2', '启蒙'], year: '2026', semester: '春季', subject: '英语', grade: 'K2', classType: '启蒙', status: 'active', lessons: Array.from({length: 10}, (_, i) => ({ id: `c4-${i}`, name: `第${i+1}讲`, taskCount: Math.floor(Math.random() * 6) + 1, order: i+1 })) },
  { id: 'course5', name: 'G2-A+体系课', type: 'long-term', lessonCount: 10, tags: ['G2', 'A+'], year: '2026', semester: '寒假', subject: '英语', grade: 'G2', classType: 'A+', status: 'active', lessons: Array.from({length: 10}, (_, i) => ({ id: `c5-${i}`, name: `第${i+1}讲`, taskCount: Math.floor(Math.random() * 6) + 1, order: i+1 })) },
  { id: 'course7', name: 'G3-A+体系课', type: 'long-term', lessonCount: 10, tags: ['G3', 'A+'], year: '2026', semester: '寒假', subject: '英语', grade: 'G3', classType: 'A+', status: 'active', lessons: Array.from({length: 10}, (_, i) => ({ id: `c7-${i}`, name: `第${i+1}讲`, taskCount: Math.floor(Math.random() * 8) + 1, order: i+1 })) },
  { id: 'course8', name: 'G4-S+体系课', type: 'long-term', lessonCount: 10, tags: ['G4', 'S+'], year: '2026', semester: '寒假', subject: '英语', grade: 'G4', classType: 'S+', status: 'active', lessons: Array.from({length: 10}, (_, i) => ({ id: `c8-${i}`, name: `第${i+1}讲`, taskCount: Math.floor(Math.random() * 8) + 1, order: i+1 })) },
  { id: 'course9', name: 'G5-A+体系课', type: 'long-term', lessonCount: 10, tags: ['G5', 'A+'], year: '2025', semester: '寒假', subject: '英语', grade: 'G5', classType: 'A+', status: 'active', lessons: Array.from({length: 10}, (_, i) => ({ id: `c9-${i}`, name: `第${i+1}讲`, taskCount: Math.floor(Math.random() * 8) + 1, order: i+1 })) },
  // 专项课 (short-term)
  { id: 'course6', name: 'KET综合冲刺专项课', type: 'short-term', lessonCount: 4, tags: ['MSE考辅', 'KET'], year: '2026', semester: '寒假', subject: '英语', grade: 'MSE考辅', classType: 'KET综合冲刺', status: 'active', lessons: Array.from({length: 4}, (_, i) => ({ id: `c6-${i}`, name: `第${i+1}讲`, taskCount: Math.floor(Math.random() * 5) + 1, order: i+1 })) },
  { id: 'course10', name: '自然拼读一级专项课', type: 'short-term', lessonCount: 8, tags: ['自然拼读', '一级'], year: '2026', semester: '春季', subject: '英语', grade: '自然拼读', classType: '自拼一级', status: 'active', lessons: Array.from({length: 8}, (_, i) => ({ id: `c10-${i}`, name: `第${i+1}讲`, taskCount: Math.floor(Math.random() * 5) + 1, order: i+1 })) },
  { id: 'course11', name: '剑少一级考辅专项课', type: 'short-term', lessonCount: 6, tags: ['剑少考辅', '一级'], year: '2026', semester: '春季', subject: '英语', grade: '剑少考辅', classType: '剑少一级', status: 'active', lessons: Array.from({length: 6}, (_, i) => ({ id: `c11-${i}`, name: `第${i+1}讲`, taskCount: Math.floor(Math.random() * 5) + 1, order: i+1 })) },
];

export const TEACHERS: Teacher[] = [
  { id: '219', name: 'Melody', account: 'melody_01', phone: '13812345678', city: '南京', campus: '龙江校区', position: '全职教师', gender: '女', avatar: '头像A.jpg', poster: '海报A.png', status: 'active', createdTime: '2025-06-23 11:58:07', updatedTime: '2025-06-24 17:27:24' },
  { id: '218', name: 'Sonya孙苏云', account: 'Sonya孙苏云', phone: '13987654321', city: '南京', campus: '龙江校区', position: '全职教师', gender: '女', avatar: '头像B.jpg', poster: '海报B.png', status: 'active', createdTime: '2025-06-23 11:58:07', updatedTime: '2025-06-24 17:27:24' },
  { id: '217', name: 'Ruby张露', account: 'Ruby张露', phone: '13700001111', city: '南京', campus: '奥南校区', position: '教学主管', gender: '女', avatar: '头像C.jpg', poster: '海报C.png', status: 'active', createdTime: '2025-06-23 11:58:07', updatedTime: '2025-06-24 17:27:24' },
  { id: '216', name: 'Angel严义洁', account: 'Angel严义洁', phone: '13611112222', city: '南京', campus: '大行宫校区', position: '全职教师', gender: '女', avatar: '头像D.jpg', poster: '海报D.png', status: 'active', createdTime: '2025-06-23 11:58:06', updatedTime: '2025-06-24 17:27:24' },
  { id: '215', name: 'Cora王晶', account: 'Cora王晶', phone: '13533334444', city: '南京', campus: '辰龙校区', position: '助教', gender: '女', avatar: '头像E.jpg', poster: '海报E.png', status: 'active', createdTime: '2025-06-23 11:58:06', updatedTime: '2025-06-24 17:27:24' },
  { id: '214', name: 'Ace黄礼妍', account: 'Ace黄礼妍', phone: '13355556666', city: '南京', campus: '仙林校区', position: '全职教师', gender: '女', avatar: '头像F.jpg', poster: '海报F.png', status: 'active', createdTime: '2025-06-23 11:58:05', updatedTime: '2025-06-24 17:27:24' },
  { id: '213', name: 'Felicia杨星', account: 'Felicia杨星', phone: '13177778888', city: '南京', campus: '五台山校区', position: '全职教师', gender: '女', avatar: '头像G.jpg', poster: '海报G.png', status: 'active', createdTime: '2025-06-23 11:58:04', updatedTime: '2025-06-24 17:27:24' },
  { id: '212', name: 'Helen', account: 'helen_01', phone: '18099990000', city: '南京', campus: '奥体网球中心校区', position: '校区主管', gender: '女', avatar: '头像H.jpg', poster: '海报H.png', status: 'active', createdTime: '2025-06-23 11:58:04', updatedTime: '2025-06-24 17:27:24' },
  { id: '211', name: 'Luna贾璐瑶', account: 'Luna贾璐瑶', phone: '15912341234', city: '南京', campus: '爱邦中心校区', position: '全职教师', gender: '女', avatar: '头像I.jpg', poster: '海报I.png', status: 'active', createdTime: '2025-06-23 11:58:03', updatedTime: '2025-06-24 17:27:24' },
  { id: '210', name: 'Iris游景', account: 'Iris游景', phone: '15856785678', city: '深圳', campus: '深圳湾校区', position: '全职教师', gender: '女', avatar: '头像J.jpg', poster: '海报J.png', status: 'active', createdTime: '2025-06-23 11:58:03', updatedTime: '2025-06-24 17:27:24' },
  { id: 't1', name: 'Linda', account: 'linda_01', phone: '15600001111', city: '南京', campus: '大行宫校区', position: '全职教师', gender: '女', avatar: '头像K.jpg', poster: '海报K.png', status: 'active', createdTime: '2025-01-01 10:00:00', updatedTime: '2025-01-01 10:00:00' },
  { id: 't2', name: 'Justin', account: 'justin_01', phone: '15522223333', city: '南京', campus: '仙林校区', position: '全职教师', gender: '男', avatar: '头像L.jpg', poster: '海报L.png', status: 'active', createdTime: '2025-01-01 10:00:00', updatedTime: '2025-01-01 10:00:00' },
  { id: 't3', name: 'Crystal张骁', account: 'crystal_01', phone: '15344445555', city: '南京', campus: '龙江校区', position: '教务', gender: '女', avatar: '头像M.jpg', poster: '海报M.png', status: 'active', createdTime: '2025-01-01 10:00:00', updatedTime: '2025-01-01 10:00:00' },
];

export const ADMIN_STUDENTS: StudentProfile[] = [
    { id: '4994', name: '朱维茜', account: '18262568828', gender: '男', className: '测试-暑G2-S', createdTime: '2025-06-30 19:52:28', updatedTime: '2025-06-30 19:52:28', birthDate: '2015-03-15', evaluationLevel: 'G1A', campus: '龙江校区', studentStatus: '在读学生', followUpStatus: '已签约', englishName: 'Zhu Weiqian', grade: '四年级', school: '琅琊路小学', studyCity: '南京', registrationChannel: '前台注册', acquisitionChannel: '朋友/熟人推荐' },
     { id: '4993', name: 'Randi丁柔', account: '13921447652', gender: '男', className: '测试-暑G2-R', createdTime: '2025-06-30 19:52:28', updatedTime: '2025-06-30 19:52:28', birthDate: '2016-05-20', evaluationLevel: 'G1S', campus: '辰龙校区', studentStatus: '在读学生', followUpStatus: '已签约', englishName: 'Randi Ding', grade: '三年级', school: '力学小学', studyCity: '南京', registrationChannel: 'APP注册', acquisitionChannel: '小红书' },
     { id: '4992', name: 'Grace吴悦', account: '18260360314', gender: '男', className: '测试-暑G1-R', createdTime: '2025-06-30 19:52:27', updatedTime: '2025-06-30 19:52:27', birthDate: '2017-08-10', evaluationLevel: 'G5A+', campus: '大行宫校区', studentStatus: '在读学生', followUpStatus: '已签约', englishName: 'Grace Wu', grade: '二年级', school: '拉萨路小学', studyCity: '南京', registrationChannel: '前台注册', acquisitionChannel: '思悦社群' },
     { id: '4991', name: '钱晶', account: '15250965218', gender: '男', className: '测试-暑G4-A+', createdTime: '2025-06-30 19:52:27', updatedTime: '2025-06-30 19:52:27', birthDate: '2014-11-25', evaluationLevel: 'G3S', campus: '奥南校区', studentStatus: '在读学生', followUpStatus: '已签约', englishName: 'Qian Jing', grade: '五年级', school: '琅琊路小学', studyCity: '南京', registrationChannel: 'APP注册', acquisitionChannel: '思悦公众号/视频号' },
     { id: '4990', name: '张璟秋', account: '13149918395', gender: '男', className: '测试-暑G1-R', createdTime: '2025-06-30 19:52:27', updatedTime: '2025-06-30 19:52:27', birthDate: '2017-02-14', evaluationLevel: 'G3A+', campus: '五台山校区', studentStatus: '潜在学生', followUpStatus: '跟进中', englishName: 'Zhang Jingqiu', grade: '一年级', school: '力学小学', studyCity: '南京', registrationChannel: '前台注册', acquisitionChannel: '朋友/熟人推荐' },
     { id: '4989', name: 'Sara薛蓉', account: '13801597148', gender: '男', className: '测试-暑K3-进阶', createdTime: '2025-06-30 19:52:27', updatedTime: '2025-06-30 19:52:27', birthDate: '2018-07-30', evaluationLevel: 'G1A', campus: '奥体网球中心校区', studentStatus: '潜在学生', followUpStatus: '待跟进', englishName: 'Sara Xue', grade: '大班', school: '琅琊路小学', studyCity: '南京', registrationChannel: 'APP注册', acquisitionChannel: '小红书' },
     { id: '4988', name: '刘嘉颖', account: '13951796802', gender: '男', className: '测试-暑G2-A', createdTime: '2025-06-30 19:52:27', updatedTime: '2025-06-30 19:52:27', birthDate: '2016-09-05', evaluationLevel: 'G1S', campus: '爱邦中心校区', studentStatus: '历史学生', followUpStatus: '退费&流失', englishName: 'Liu Jiaying', grade: '三年级', school: '南京市第一中学', studyCity: '南京', registrationChannel: '前台注册', acquisitionChannel: '思悦社群' },
     { id: '11678463', name: '殷煦纶', account: '138****0455', gender: '男', className: '寒G5-A+', createdTime: '2025-01-01', updatedTime: '2025-01-01', birthDate: '2013-12-01', evaluationLevel: 'G5A+', campus: '仙林校区', studentStatus: '在读学生', followUpStatus: '已签约', englishName: 'Yin Xulun', grade: '六年级', school: '南京师范大学附属中学', studyCity: '南京', registrationChannel: 'APP注册', acquisitionChannel: '思悦公众号/视频号' },
     { id: '11705283', name: '张梓墨', account: '180****7733', gender: '男', className: '寒G5-A+', createdTime: '2025-01-01', updatedTime: '2025-01-01', birthDate: '2013-08-15', evaluationLevel: 'G3S', campus: '龙江校区', studentStatus: '在读学生', followUpStatus: '已签约', englishName: 'Zhang Zimo', grade: '六年级', school: '南京市金陵中学', studyCity: '南京', registrationChannel: '前台注册', acquisitionChannel: '朋友/熟人推荐' },
     { id: '11950153', name: '王子萱', account: '137****4495', gender: '女', className: '寒G5-A+', createdTime: '2025-01-01', updatedTime: '2025-01-01', birthDate: '2013-04-22', evaluationLevel: 'G3A+', campus: '辰龙校区', studentStatus: '在读学生', followUpStatus: '已签约', englishName: 'Wang Zixuan', grade: '七年级', school: '南京市第一中学', studyCity: '南京', registrationChannel: 'APP注册', acquisitionChannel: '小红书' },
     { id: '11965183', name: '蒋翊翘', account: '158****8498', gender: '男', className: '寒G5-A+', createdTime: '2025-01-01', updatedTime: '2025-01-01', birthDate: '2013-10-30', evaluationLevel: 'G1A', campus: '大行宫校区', studentStatus: '在读学生', followUpStatus: '已签约', englishName: 'Jiang Yiqiao', grade: '七年级', school: '南京师范大学附属中学', studyCity: '南京', registrationChannel: '前台注册', acquisitionChannel: '思悦社群' },
];

 export const CAMPUSES = [
   '龙江校区',
   '辰龙校区', 
   '大行宫校区',
   '奥南校区', 
   '五台山校区', 
   '奥体网球中心校区', 
   '爱邦中心校区', 
   '仙林校区'
 ];

 // 年级选项
 export const GRADE_OPTIONS = [
   '小班',
   '中班',
   '大班',
   '一年级',
   '二年级',
   '三年级',
   '四年级',
   '五年级',
   '六年级',
   '七年级',
   '八年级',
   '九年级'
 ];

  // 学校选项
  export const SCHOOL_OPTIONS = [
    '琅琊路小学',
    '力学小学',
    '拉萨路小学',
    '南京师范大学附属中学',
    '南京市金陵中学',
    '南京市第一中学'
  ];

  // 就读城市选项
  export const STUDY_CITY_OPTIONS = [
    '南京',
    '上海',
    '北京',
    '广州',
    '深圳',
    '杭州',
    '苏州',
    '成都'
  ];

  // 注册渠道选项
  export const REGISTRATION_CHANNEL_OPTIONS = [
    '前台注册',
    'APP注册'
  ] as const;

  // 获客渠道选项
  export const ACQUISITION_CHANNEL_OPTIONS = [
    '朋友/熟人推荐',
    '小红书',
    '思悦社群',
    '思悦公众号/视频号'
  ] as const;

 export const CLASSES: ClassInfo[] = [
  {
    id: '546',
    name: '25暑-K3-进阶-1班',
    timeSlot: '14:30-16:00',
    description: '25暑-K3-进阶',
    color: '#52C41A',
    city: '南京',
    district: '建邺区',
    campus: '奥南校区',
    teacherId: 't1',
    assistant: '216',
    capacity: 20,
    studentCount: 12,
    courseId: 'course1',
    startDate: '2025-07-10',
    status: 'active',
    saleStatus: 'on_sale',
    createdTime: '2025-05-15 14:20:00',
    scheduleDescription: '2025.07.10-2025.08.30',
    contentMode: 'self', semester: '暑假', subject: '英语', grade: 'K3', studentGrade: 'K3', classroom: '奥南202', needQualification: true, studentTag: '进阶', allowStudentSchedule: false, chargeMode: 'whole', price: 2999, refundPolicy: 'unused', materialPrice: 100, materialRefundPolicy: 'no_return', scheduleFrequency: ['周六']
  },
  {
    id: 'c_p1',
    name: '25暑-K3-进阶--一期',
    timeSlot: '14:30-16:00',
    description: '25暑-K3-进阶',
    color: '#2DA194',
    city: '南京',
    district: '鼓楼区',
    campus: '龙江校区',
    teacherId: '219', // Melody
    assistant: '215',
    capacity: 12,
    studentCount: 7,
    courseId: 'course1',
    startDate: '2025-07-16',
    status: 'active',
    saleStatus: 'on_sale',
    createdTime: '2025-07-01 10:00:00',
    scheduleDescription: '2025.07.16-2025.07.30',
    contentMode: 'self', semester: '暑假', subject: '英语', grade: 'K3', studentGrade: 'K3', classroom: '龙江105', needQualification: true, studentTag: '进阶', allowStudentSchedule: false, chargeMode: 'whole', price: 2999, refundPolicy: 'unused', materialPrice: 0, materialRefundPolicy: 'no_return', scheduleFrequency: ['周六']
  },
  {
    id: 'c_p2',
    name: '25寒-G5-A+--二期', 
    timeSlot: '18:00-20:00',
    description: '寒G5-A+ | Felicia二期18:00',
    color: '#1890FF',
    city: '南京',
    district: '玄武区',
    campus: '大行宫校区',
    teacherId: '213', // Felicia杨星
    assistant: '1',
    capacity: 14,
    studentCount: 4,
    courseId: 'course9', 
    startDate: '2025-01-16',
    status: 'active',
    saleStatus: 'on_sale',
    createdTime: '2025-01-01 10:00:00',
    scheduleDescription: '2025.01.16-2025.01.30',
    contentMode: 'self',
    semester: '寒假',
    subject: '英语',
    grade: '5年级',
    studentGrade: '5年级',
    classroom: '大行宫305',
    needQualification: true,
    studentTag: '领航A+',
    allowStudentSchedule: false,
    chargeMode: 'whole',
    price: 2555,
    refundPolicy: 'unused',
    materialPrice: 0,
    materialRefundPolicy: 'no_return',
    scheduleFrequency: ['周六']
  },
  {
    id: 'c_p3',
    name: '25暑-G1-A+--一期',
    timeSlot: '09:00-11:00',
    description: '25暑-G1-A+',
    color: '#FAAD14',
    city: '南京',
    district: '玄武区',
    campus: '大行宫校区',
    teacherId: 't1', // Linda
    assistant: '216',
    capacity: 15,
    studentCount: 5,
    courseId: 'course3',
    startDate: '2025-08-01',
    status: 'active',
    saleStatus: 'on_sale',
    createdTime: '2025-06-15 10:00:00',
    scheduleDescription: '2025.08.01-2025.08.15',
    contentMode: 'self', semester: '暑假', subject: '英语', grade: 'G1', studentGrade: 'G1', classroom: '大行宫201', needQualification: true, studentTag: 'A+', allowStudentSchedule: false, chargeMode: 'whole', price: 3299, refundPolicy: 'unused', materialPrice: 0, materialRefundPolicy: 'no_return', scheduleFrequency: ['周六']
  },
  {
    id: 'c_p4',
    name: '25暑-G2-A+--二期',
    timeSlot: '10:30-12:30',
    description: '25暑-G2-A+',
    color: '#13C2C2',
    city: '南京',
    district: '栖霞区',
    campus: '仙林校区',
    teacherId: 't2', // Justin
    assistant: '214',
    capacity: 18,
    studentCount: 12,
    courseId: 'course5',
    startDate: '2025-07-20',
    status: 'active',
    saleStatus: 'on_sale',
    createdTime: '2025-06-20 10:00:00',
    scheduleDescription: '2025.07.20-2025.08.05',
    contentMode: 'self', semester: '暑假', subject: '英语', grade: 'G2', studentGrade: 'G2', classroom: '仙林303', needQualification: true, studentTag: 'A+', allowStudentSchedule: false, chargeMode: 'whole', price: 3299, refundPolicy: 'unused', materialPrice: 0, materialRefundPolicy: 'no_return', scheduleFrequency: ['周六']
  },
  {
    id: 'c_p5',
    name: '25暑-K3-飞跃--三期',
    timeSlot: '16:00-18:00',
    description: '25暑-K3-飞跃',
    color: '#722ED1',
    city: '南京',
    district: '鼓楼区',
    campus: '五台山校区',
    teacherId: '219', // Melody
    assistant: '212',
    capacity: 8,
    studentCount: 8,
    courseId: 'course2',
    startDate: '2025-07-25',
    status: 'full',
    saleStatus: 'on_sale',
    createdTime: '2025-07-10 10:00:00',
    scheduleDescription: '2025.07.25-2025.08.08',
    contentMode: 'self', semester: '暑假', subject: '英语', grade: 'K3', studentGrade: 'K3', classroom: '五台山101', needQualification: true, studentTag: '飞跃', allowStudentSchedule: false, chargeMode: 'whole', price: 1899, refundPolicy: 'unused', materialPrice: 0, materialRefundPolicy: 'no_return', scheduleFrequency: ['周六']
  },
  {
    id: '601',
    name: '24秋-G3-A+--周六上午',
    timeSlot: '08:30-11:00',
    description: '24秋-G3-A+',
    color: '#999999',
    city: '深圳',
    district: '南山区',
    campus: '深圳湾校区',
    teacherId: '210', 
    assistant: '211',
    capacity: 15,
    studentCount: 15,
    courseId: 'course7',
    startDate: '2024-09-07',
    status: 'closed',
    saleStatus: 'off_sale',
    createdTime: '2024-08-01 10:00:00',
    scheduleDescription: '2024.09.07-2025.01.11',
    contentMode: 'self', semester: '秋季', subject: '英语', grade: '3年级', studentGrade: '3年级', classroom: '101', needQualification: true, studentTag: 'A+', allowStudentSchedule: false, chargeMode: 'whole', price: 4299, refundPolicy: 'unused', materialPrice: 0, materialRefundPolicy: 'no_return', scheduleFrequency: ['周六']
  },
  {
    id: '602',
    name: '24秋-G4-S--周五晚',
    timeSlot: '18:00-20:00',
    description: '24秋-G4-S',
    color: '#999999',
    city: '深圳',
    district: '宝安区',
    campus: '宝安中心校区',
    teacherId: '213', 
    assistant: '212',
    capacity: 12,
    studentCount: 10,
    courseId: 'course8',
    startDate: '2024-09-06',
    status: 'closed',
    saleStatus: 'off_sale',
    createdTime: '2024-08-01 10:00:00',
    scheduleDescription: '2024.09.06-2025.01.10',
    contentMode: 'self', semester: '秋季', subject: '英语', grade: '4年级', studentGrade: '4年级', classroom: '202', needQualification: true, studentTag: 'S', allowStudentSchedule: false, chargeMode: 'whole', price: 4299, refundPolicy: 'unused', materialPrice: 0, materialRefundPolicy: 'no_return', scheduleFrequency: ['周六']
  },
  {
    id: '603',
    name: '24暑-K2-启蒙--一期',
    timeSlot: '09:00-10:30',
    description: '24暑-K2-启蒙',
    color: '#999999',
    city: '南京',
    district: '玄武区',
    campus: '大行宫校区',
    teacherId: 't3', 
    assistant: '215',
    capacity: 10,
    studentCount: 10,
    courseId: 'course4',
    startDate: '2024-07-05',
    status: 'closed',
    saleStatus: 'off_sale',
    createdTime: '2024-05-01 10:00:00',
    scheduleDescription: '2024.07.05-2024.07.15',
    contentMode: 'self', semester: '暑假', subject: '英语', grade: 'K2', studentGrade: 'K2', classroom: '305', needQualification: false, studentTag: '启蒙', allowStudentSchedule: false, chargeMode: 'whole', price: 1599, refundPolicy: 'unused', materialPrice: 0, materialRefundPolicy: 'no_return', scheduleFrequency: ['周六']
  },
  {
    id: '604',
    name: '26春-G1-S--周六下午',
    timeSlot: '14:00-16:00',
    description: '26春-G1-S',
    color: '#FA8C16',
    city: '南京',
    district: '鼓楼区',
    campus: '龙江校区',
    teacherId: '218', 
    assistant: '216',
    capacity: 16,
    studentCount: 2,
    courseId: 'course3',
    startDate: '2026-03-07',
    status: 'pending',
    saleStatus: 'on_sale',
    createdTime: '2025-11-01 10:00:00',
    scheduleDescription: '2026.03.07-2026.06.20',
    contentMode: 'self', semester: '春季', subject: '英语', grade: '1年级', studentGrade: '1年级', classroom: '105', needQualification: true, studentTag: 'S', allowStudentSchedule: false, chargeMode: 'whole', price: 4599, refundPolicy: 'unused', materialPrice: 0, materialRefundPolicy: 'no_return', scheduleFrequency: ['周六']
  },
  {
    id: '605',
    name: '26春-K3-飞跃--周日上午',
    timeSlot: '08:30-10:30',
    description: '26春-K3-飞跃',
    color: '#FA8C16',
    city: '深圳',
    district: '南山区',
    campus: '深圳湾校区',
    teacherId: '217', 
    assistant: '219',
    capacity: 12,
    studentCount: 0,
    courseId: 'course1',
    startDate: '2026-03-08',
    status: 'pending',
    saleStatus: 'on_sale',
    createdTime: '2025-11-01 10:00:00',
    scheduleDescription: '2026.03.08-2026.06.21',
    contentMode: 'self', semester: '春季', subject: '英语', grade: 'K3', studentGrade: 'K3', classroom: '102', needQualification: true, studentTag: '飞跃', allowStudentSchedule: false, chargeMode: 'whole', price: 4599, refundPolicy: 'unused', materialPrice: 0, materialRefundPolicy: 'no_return', scheduleFrequency: ['周六']
  },
  {
    id: '606',
    name: '26寒-G5-S+--二期',
    timeSlot: '13:30-15:30',
    description: '26寒-G5-S+',
    color: '#FA8C16',
    city: '南京',
    district: '建邺区',
    campus: '奥体网球中心校区',
    teacherId: '211', 
    assistant: '214',
    capacity: 15,
    studentCount: 5,
    courseId: 'course9',
    startDate: '2026-01-20',
    status: 'pending',
    saleStatus: 'on_sale',
    createdTime: '2025-10-01 10:00:00',
    scheduleDescription: '2026.01.20-2026.02.05',
    contentMode: 'self', semester: '寒假', subject: '英语', grade: '5年级', studentGrade: '5年级', classroom: '201', needQualification: true, studentTag: 'S+', allowStudentSchedule: false, chargeMode: 'whole', price: 2999, refundPolicy: 'unused', materialPrice: 0, materialRefundPolicy: 'no_return', scheduleFrequency: ['周六']
  },
  {
    id: '607',
    name: '26春-KET冲刺--一期',
    timeSlot: '09:00-11:00',
    description: '26春-KET综合冲刺',
    color: '#EB2F96',
    city: '南京',
    district: '鼓楼区',
    campus: '龙江校区',
    teacherId: '219',
    assistant: '215',
    capacity: 10,
    studentCount: 3,
    courseId: 'course6',
    startDate: '2026-03-02',
    status: 'pending',
    saleStatus: 'on_sale',
    createdTime: '2025-12-01 10:00:00',
    scheduleDescription: '2026.03.02-2026.03.08',
    contentMode: 'self', semester: '春季', subject: '英语', grade: 'MSE考辅', studentGrade: 'MSE考辅', classroom: '龙江105', needQualification: false, studentTag: 'KET综合冲刺', allowStudentSchedule: false, chargeMode: 'whole', price: 1299, refundPolicy: 'unused', materialPrice: 0, materialRefundPolicy: 'no_return', scheduleFrequency: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  {
    id: '608',
    name: '26春-自拼一级--二期',
    timeSlot: '14:00-15:30',
    description: '26春-自然拼读一级',
    color: '#52C41A',
    city: '南京',
    district: '玄武区',
    campus: '大行宫校区',
    teacherId: 't1',
    assistant: '216',
    capacity: 12,
    studentCount: 6,
    courseId: 'course10',
    startDate: '2026-03-09',
    status: 'pending',
    saleStatus: 'on_sale',
    createdTime: '2025-12-01 10:00:00',
    scheduleDescription: '2026.03.09-2026.03.16',
    contentMode: 'self', semester: '春季', subject: '英语', grade: '自然拼读', studentGrade: '自然拼读', classroom: '大行宫201', needQualification: false, studentTag: '自拼一级', allowStudentSchedule: false, chargeMode: 'whole', price: 1599, refundPolicy: 'unused', materialPrice: 0, materialRefundPolicy: 'no_return', scheduleFrequency: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  {
    id: '609',
    name: '26春-剑少一级--一期',
    timeSlot: '16:00-17:30',
    description: '26春-剑少一级考辅',
    color: '#1890FF',
    city: '南京',
    district: '栖霞区',
    campus: '仙林校区',
    teacherId: 't2',
    assistant: '214',
    capacity: 8,
    studentCount: 2,
    courseId: 'course11',
    startDate: '2026-03-16',
    status: 'pending',
    saleStatus: 'on_sale',
    createdTime: '2025-12-01 10:00:00',
    scheduleDescription: '2026.03.16-2026.03.22',
    contentMode: 'self', semester: '春季', subject: '英语', grade: '剑少考辅', studentGrade: '剑少考辅', classroom: '仙林303', needQualification: false, studentTag: '剑少一级', allowStudentSchedule: false, chargeMode: 'whole', price: 1199, refundPolicy: 'unused', materialPrice: 0, materialRefundPolicy: 'no_return', scheduleFrequency: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
];

export const STUDENTS: Student[] = [
  { id: 's1', name: '张小明', hasUnread: true },
  { id: 's2', name: '李小红', hasUnread: false },
  { id: 's3', name: '王大力', hasUnread: true },
  { id: 's4', name: '赵小花', hasUnread: false },
  { id: 's5', name: '孙悟空', hasUnread: false },
  { id: 's6', name: '猪八戒', hasUnread: true },
  { id: 's7', name: '沙和尚', hasUnread: false },
];

export const TASKS: Task[] = [
  { id: 't1', title: 'Unit 1 单词跟读', description: '请完成Unit 1单词的跟读练习，注意发音准确。', type: 'PREVIEW', isCompleted: false, date: '2025-07-24' },
  { id: 't2', title: '观看预习视频', description: '观看Unit 1的讲解视频，了解本课重点。', type: 'PREVIEW', isCompleted: true, date: '2025-07-24' },
  { id: 't3', title: '完成练习册P1-P3', description: '完成练习册第1页到第3页的习题。', type: 'HOMEWORK', isCompleted: false, date: '2025-07-24' },
  { id: 't4', title: '口语录音作业', description: '录制一段自我介绍的音频。', type: 'HOMEWORK', isCompleted: false, date: '2025-07-24' },
  { id: 't5', title: '复习Unit 1单词', description: '复习今天学习的单词，准备明天的听写。', type: 'REVIEW', isCompleted: false, date: '2025-07-24' },
];

export const LESSONS: Lesson[] = [
  // 班级 546 - 25暑-K3-进阶-1班 (12讲)
  { id: 'l546-1', classId: '546', name: '第1讲：Hello World', date: '2025-07-10', startTime: '14:30', endTime: '16:00', status: 'completed', teacherId: 't1', pushTime: '2025-07-10 14:25', pushStatus: 'success' },
  { id: 'l546-2', classId: '546', name: '第2讲：Colors', date: '2025-07-12', startTime: '14:30', endTime: '16:00', status: 'completed', teacherId: 't1', pushTime: '2025-07-12 14:25', pushStatus: 'success' },
  { id: 'l546-3', classId: '546', name: '第3讲：Numbers', date: '2025-07-17', startTime: '14:30', endTime: '16:00', status: 'completed', teacherId: 't1', pushTime: '2025-07-17 14:25', pushStatus: 'success' },
  { id: 'l546-4', classId: '546', name: '第4讲：Family', date: '2025-07-19', startTime: '14:30', endTime: '16:00', status: 'pending', teacherId: 't1', pushTime: '2025-07-19 14:25', pushStatus: 'pending' },
  { id: 'l546-5', classId: '546', name: '第5讲：Animals', date: '2025-07-24', startTime: '14:30', endTime: '16:00', status: 'pending', teacherId: 't1', pushTime: '2025-07-24 14:25', pushStatus: 'pending' },
  { id: 'l546-6', classId: '546', name: '第6讲：Fruits', date: '2025-07-26', startTime: '14:30', endTime: '16:00', status: 'pending', teacherId: 't1', pushTime: '2025-07-26 14:25', pushStatus: 'pending' },
  
  // 班级 c_p1 - 25暑-K3-进阶--一期 (12讲)
  { id: 'lp1-1', classId: 'c_p1', name: '第1讲：自我介绍', date: '2025-07-16', startTime: '14:30', endTime: '16:00', status: 'completed', teacherId: '219', pushTime: '2025-07-16 14:25', pushStatus: 'success' },
  { id: 'lp1-2', classId: 'c_p1', name: '第2讲：日常问候', date: '2025-07-18', startTime: '14:30', endTime: '16:00', status: 'completed', teacherId: '219', pushTime: '2025-07-18 14:25', pushStatus: 'success' },
  { id: 'lp1-3', classId: 'c_p1', name: '第3讲：颜色认知', date: '2025-07-23', startTime: '14:30', endTime: '16:00', status: 'completed', teacherId: '219', pushTime: '2025-07-23 14:25', pushStatus: 'success' },
  { id: 'lp1-4', classId: 'c_p1', name: '第4讲：形状识别', date: '2025-07-25', startTime: '14:30', endTime: '16:00', status: 'pending', teacherId: '219', pushTime: '2025-07-25 14:25', pushStatus: 'pending' },
  
  // 班级 c_p2 - 25寒-G5-A+--二期 (10讲)
  { id: 'lp2-1', classId: 'c_p2', name: '第1讲：阅读技巧', date: '2025-01-16', startTime: '18:00', endTime: '20:00', status: 'completed', teacherId: '213', pushTime: '2025-01-16 17:55', pushStatus: 'success' },
  { id: 'lp2-2', classId: 'c_p2', name: '第2讲：写作入门', date: '2025-01-17', startTime: '18:00', endTime: '20:00', status: 'completed', teacherId: '213', pushTime: '2025-01-17 17:55', pushStatus: 'success' },
  { id: 'lp2-3', classId: 'c_p2', name: '第3讲：语法精讲', date: '2025-01-18', startTime: '18:00', endTime: '20:00', status: 'completed', teacherId: '213', pushTime: '2025-01-18 17:55', pushStatus: 'success' },
  { id: 'lp2-4', classId: 'c_p2', name: '第4讲：听力训练', date: '2025-01-19', startTime: '18:00', endTime: '20:00', status: 'completed', teacherId: '213', pushTime: '2025-01-19 17:55', pushStatus: 'success' },
  { id: 'lp2-5', classId: 'c_p2', name: '第5讲：口语表达', date: '2025-01-20', startTime: '18:00', endTime: '20:00', status: 'pending', teacherId: '213', pushTime: '2025-01-20 17:55', pushStatus: 'pending' },
  
  // 班级 c_p3 - 25暑-G1-A+--一期 (15讲)
  { id: 'lp3-1', classId: 'c_p3', name: '第1讲：字母发音', date: '2025-08-01', startTime: '09:00', endTime: '11:00', status: 'completed', teacherId: 't1', pushTime: '2025-08-01 08:55', pushStatus: 'success' },
  { id: 'lp3-2', classId: 'c_p3', name: '第2讲：单词拼读', date: '2025-08-02', startTime: '09:00', endTime: '11:00', status: 'completed', teacherId: 't1', pushTime: '2025-08-02 08:55', pushStatus: 'success' },
  { id: 'lp3-3', classId: 'c_p3', name: '第3讲：简单句型', date: '2025-08-03', startTime: '09:00', endTime: '11:00', status: 'completed', teacherId: 't1', pushTime: '2025-08-03 08:55', pushStatus: 'success' },
  { id: 'lp3-4', classId: 'c_p3', name: '第4讲：情景对话', date: '2025-08-08', startTime: '09:00', endTime: '11:00', status: 'pending', teacherId: 't1', pushTime: '2025-08-08 08:55', pushStatus: 'pending' },
  { id: 'lp3-5', classId: 'c_p3', name: '第5讲：绘本阅读', date: '2025-08-09', startTime: '09:00', endTime: '11:00', status: 'pending', teacherId: 't1', pushTime: '2025-08-09 08:55', pushStatus: 'pending' },
  
  // 班级 c_p4 - 25暑-G2-A+--二期 (10讲)
  { id: 'lp4-1', classId: 'c_p4', name: '第1讲：词汇扩展', date: '2025-07-20', startTime: '10:30', endTime: '12:30', status: 'completed', teacherId: 't2', pushTime: '2025-07-20 10:25', pushStatus: 'success' },
  { id: 'lp4-2', classId: 'c_p4', name: '第2讲：阅读理解', date: '2025-07-21', startTime: '10:30', endTime: '12:30', status: 'completed', teacherId: 't2', pushTime: '2025-07-21 10:25', pushStatus: 'success' },
  { id: 'lp4-3', classId: 'c_p4', name: '第3讲：写作练习', date: '2025-07-22', startTime: '10:30', endTime: '12:30', status: 'completed', teacherId: 't2', pushTime: '2025-07-22 10:25', pushStatus: 'success' },
  { id: 'lp4-4', classId: 'c_p4', name: '第4讲：听力提升', date: '2025-07-23', startTime: '10:30', endTime: '12:30', status: 'completed', teacherId: 't2', pushTime: '2025-07-23 10:25', pushStatus: 'success' },
  
  // 班级 c_p5 - 25暑-K3-飞跃--三期 (13讲)
  { id: 'lp5-1', classId: 'c_p5', name: '第1讲：基础问候', date: '2025-07-25', startTime: '16:00', endTime: '18:00', status: 'completed', teacherId: '219', pushTime: '2025-07-25 15:55', pushStatus: 'success' },
  { id: 'lp5-2', classId: 'c_p5', name: '第2讲：家庭称呼', date: '2025-07-26', startTime: '16:00', endTime: '18:00', status: 'completed', teacherId: '219', pushTime: '2025-07-26 15:55', pushStatus: 'success' },
  { id: 'lp5-3', classId: 'c_p5', name: '第3讲：身体部位', date: '2025-07-27', startTime: '16:00', endTime: '18:00', status: 'completed', teacherId: '219', pushTime: '2025-07-27 15:55', pushStatus: 'success' },
  { id: 'lp5-4', classId: 'c_p5', name: '第4讲：情绪表达', date: '2025-08-01', startTime: '16:00', endTime: '18:00', status: 'pending', teacherId: '219', pushTime: '2025-08-01 15:55', pushStatus: 'pending' },
  
  // 班级 601 - 24秋-G3-A+--周六上午 (10讲) - 已结课
  { id: 'l601-1', classId: '601', name: '第1讲：Unit 1 导入', date: '2024-09-07', startTime: '08:30', endTime: '11:00', status: 'completed', teacherId: '210', pushTime: '2024-09-07 08:25', pushStatus: 'success' },
  { id: 'l601-2', classId: '601', name: '第2讲：Unit 1 精读', date: '2024-09-14', startTime: '08:30', endTime: '11:00', status: 'completed', teacherId: '210', pushTime: '2024-09-14 08:25', pushStatus: 'success' },
  { id: 'l601-3', classId: '601', name: '第3讲：Unit 2 导入', date: '2024-09-21', startTime: '08:30', endTime: '11:00', status: 'completed', teacherId: '210', pushTime: '2024-09-21 08:25', pushStatus: 'success' },
  { id: 'l601-4', classId: '601', name: '第4讲：Unit 2 精读', date: '2024-09-28', startTime: '08:30', endTime: '11:00', status: 'completed', teacherId: '210', pushTime: '2024-09-28 08:25', pushStatus: 'success' },
  
  // 班级 602 - 24秋-G4-S--周五晚 (10讲) - 已结课
  { id: 'l602-1', classId: '602', name: '第1讲：语法回顾', date: '2024-09-06', startTime: '18:00', endTime: '20:00', status: 'completed', teacherId: '213', pushTime: '2024-09-06 17:55', pushStatus: 'success' },
  { id: 'l602-2', classId: '602', name: '第2讲：阅读理解A', date: '2024-09-13', startTime: '18:00', endTime: '20:00', status: 'completed', teacherId: '213', pushTime: '2024-09-13 17:55', pushStatus: 'success' },
  { id: 'l602-3', classId: '602', name: '第3讲：阅读理解B', date: '2024-09-20', startTime: '18:00', endTime: '20:00', status: 'completed', teacherId: '213', pushTime: '2024-09-20 17:55', pushStatus: 'success' },
  { id: 'l602-4', classId: '602', name: '第4讲：写作技巧', date: '2024-09-27', startTime: '18:00', endTime: '20:00', status: 'completed', teacherId: '213', pushTime: '2024-09-27 17:55', pushStatus: 'success' },
  
  // 班级 603 - 24暑-K2-启蒙--一期 (10讲) - 已结课
  { id: 'l603-1', classId: '603', name: '第1讲：Hello Song', date: '2024-07-05', startTime: '09:00', endTime: '10:30', status: 'completed', teacherId: 't3', pushTime: '2024-07-05 08:55', pushStatus: 'success' },
  { id: 'l603-2', classId: '603', name: '第2讲：ABC Song', date: '2024-07-06', startTime: '09:00', endTime: '10:30', status: 'completed', teacherId: 't3', pushTime: '2024-07-06 08:55', pushStatus: 'success' },
  { id: 'l603-3', classId: '603', name: '第3讲：Numbers Song', date: '2024-07-07', startTime: '09:00', endTime: '10:30', status: 'completed', teacherId: 't3', pushTime: '2024-07-07 08:55', pushStatus: 'success' },
  
  // 班级 604 - 26春-G1-S--周六下午 (15讲) - 未开课
  { id: 'l604-1', classId: '604', name: '第1讲：新学期导入', date: '2026-03-07', startTime: '14:00', endTime: '16:00', status: 'pending', teacherId: '218', pushTime: '2026-03-07 13:55', pushStatus: 'pending' },
  { id: 'l604-2', classId: '604', name: '第2讲：Unit 1 预习', date: '2026-03-14', startTime: '14:00', endTime: '16:00', status: 'pending', teacherId: '218', pushTime: '2026-03-14 13:55', pushStatus: 'pending' },
  { id: 'l604-3', classId: '604', name: '第3讲：Unit 1 精讲', date: '2026-03-21', startTime: '14:00', endTime: '16:00', status: 'pending', teacherId: '218', pushTime: '2026-03-21 13:55', pushStatus: 'pending' },
  
  // 班级 605 - 26春-K3-飞跃--周日上午 (12讲) - 未开课
  { id: 'l605-1', classId: '605', name: '第1讲：Spring Welcome', date: '2026-03-08', startTime: '08:30', endTime: '10:30', status: 'pending', teacherId: '217', pushTime: '2026-03-08 08:25', pushStatus: 'pending' },
  { id: 'l605-2', classId: '605', name: '第2讲：My Friends', date: '2026-03-15', startTime: '08:30', endTime: '10:30', status: 'pending', teacherId: '217', pushTime: '2026-03-15 08:25', pushStatus: 'pending' },
  
  // 班级 606 - 26寒-G5-S+--二期 (10讲) - 未开课
  { id: 'l606-1', classId: '606', name: '第1讲：寒期冲刺导入', date: '2026-01-20', startTime: '13:30', endTime: '15:30', status: 'pending', teacherId: '211', pushTime: '2026-01-20 13:25', pushStatus: 'pending' },
  { id: 'l606-2', classId: '606', name: '第2讲：词汇强化训练', date: '2026-01-21', startTime: '13:30', endTime: '15:30', status: 'pending', teacherId: '211', pushTime: '2026-01-21 13:25', pushStatus: 'pending' },
  
  // 班级 607 - 26春-KET冲刺--一期 (4讲) - 专项课
  { id: 'l607-1', classId: '607', name: '第1讲：KET考试概述', date: '2026-03-02', startTime: '09:00', endTime: '11:00', status: 'pending', teacherId: '219', pushTime: '2026-03-02 08:55', pushStatus: 'pending' },
  { id: 'l607-2', classId: '607', name: '第2讲：Reading Part 1', date: '2026-03-03', startTime: '09:00', endTime: '11:00', status: 'pending', teacherId: '219', pushTime: '2026-03-03 08:55', pushStatus: 'pending' },
  { id: 'l607-3', classId: '607', name: '第3讲：Writing Part 1', date: '2026-03-04', startTime: '09:00', endTime: '11:00', status: 'pending', teacherId: '219', pushTime: '2026-03-04 08:55', pushStatus: 'pending' },
  { id: 'l607-4', classId: '607', name: '第4讲：模拟测试', date: '2026-03-05', startTime: '09:00', endTime: '11:00', status: 'pending', teacherId: '219', pushTime: '2026-03-05 08:55', pushStatus: 'pending' },
  
  // 班级 608 - 26春-自拼一级--二期 (8讲) - 专项课
  { id: 'l608-1', classId: '608', name: '第1讲：Aa Bb Cc', date: '2026-03-09', startTime: '14:00', endTime: '15:30', status: 'pending', teacherId: 't1', pushTime: '2026-03-09 13:55', pushStatus: 'pending' },
  { id: 'l608-2', classId: '608', name: '第2讲：Dd Ee Ff', date: '2026-03-10', startTime: '14:00', endTime: '15:30', status: 'pending', teacherId: 't1', pushTime: '2026-03-10 13:55', pushStatus: 'pending' },
  
  // 班级 609 - 26春-剑少一级--一期 (6讲) - 专项课
  { id: 'l609-1', classId: '609', name: '第1讲：剑少考试介绍', date: '2026-03-16', startTime: '16:00', endTime: '17:30', status: 'pending', teacherId: 't2', pushTime: '2026-03-16 15:55', pushStatus: 'pending' },
  { id: 'l609-2', classId: '609', name: '第2讲：听力训练1', date: '2026-03-17', startTime: '16:00', endTime: '17:30', status: 'pending', teacherId: 't2', pushTime: '2026-03-17 15:55', pushStatus: 'pending' },
];

export const PRODUCTS: Product[] = [
  { id: 'P001', name: '产品名称1', price: 2999, courseId: 'course1', classId: 'c_p1', deliveryType: 'offline', description: 'K3进阶班首期', status: 'active', createdTime: '2025-06-01' },
  { id: 'P002', name: '产品名称2', price: 2555, courseId: 'course9', classId: 'c_p2', deliveryType: 'offline', description: 'G5A+寒假班', status: 'active', createdTime: '2025-06-02' },
  { id: 'P003', name: '产品名称3', price: 3299, courseId: 'course3', classId: 'c_p3', deliveryType: 'offline', description: 'G1A+暑期班', status: 'active', createdTime: '2025-06-03' },
  { id: 'P004', name: '产品名称4', price: 1899, courseId: 'course2', classId: 'c_p5', deliveryType: 'offline', description: 'K3飞跃班三期(Full)', status: 'active', createdTime: '2025-06-04' },
];

 export const ORDERS: Order[] = [
     { id: 'ORD001', studentAccount: '17788888888', productName: '产品名称1', className: '25暑-K3-进阶--一期', amount: 2999, status: 'paid', createdTime: '2026-01-16 10:30:00', paymentTime: '2026-01-16 10:35:00', orderNumber: 'ON20260116001', phone: '17788888888', studentName: '张三', classId: 'c_p1', orderStatus: '已支付', paymentMethod: '微信支付', originalAmount: 3200, discountAmount: 201, materialFee: 100, courseFee: 2899, lessonCount: 12 },
     { id: 'ORD002', studentAccount: '15588888888', productName: '产品名称2', className: '25寒-G5-A+--二期', amount: 2555, status: 'pending', createdTime: '2026-01-16 10:35:00', paymentTime: '-', orderNumber: 'ON20260116002', phone: '15588888888', studentName: '李四', classId: 'c_p2', orderStatus: '待支付', paymentMethod: '现金', originalAmount: 2800, discountAmount: 245, materialFee: 0, courseFee: 2555, lessonCount: 10 },
     { id: 'ORD003', studentAccount: '13866666666', productName: '产品名称3', className: '25暑-G1-A+--一期', amount: 3299, status: 'paid', createdTime: '2026-01-15 14:20:00', paymentTime: '2026-01-15 14:25:00', orderNumber: 'ON20260115001', phone: '13866666666', studentName: '王五', classId: 'c_p3', orderStatus: '已支付', paymentMethod: '微信支付', originalAmount: 3500, discountAmount: 201, materialFee: 0, courseFee: 3299, lessonCount: 15 },
     { id: 'ORD004', studentAccount: '15977777777', productName: '产品名称1', className: '25暑-G2-A+--二期', amount: 2799, status: 'paid', createdTime: '2026-01-14 09:15:00', paymentTime: '2026-01-14 09:20:00', orderNumber: 'ON20260114001', phone: '15977777777', studentName: '赵六', classId: 'c_p4', orderStatus: '已支付', paymentMethod: '微信支付', originalAmount: 3000, discountAmount: 201, materialFee: 0, courseFee: 2799, lessonCount: 12 },
     { id: 'ORD005', studentAccount: '18699999999', productName: '产品名称4', className: '25暑-K3-飞跃--三期', amount: 1899, status: 'pending', createdTime: '2026-01-13 16:45:00', paymentTime: '-', orderNumber: 'ON20260113001', phone: '18699999999', studentName: '钱七', classId: 'c_p5', orderStatus: '待支付', paymentMethod: '现金', originalAmount: 2000, discountAmount: 101, materialFee: 0, courseFee: 1899, lessonCount: 8 },
     { id: 'ORD006', studentAccount: '13644444444', productName: '产品名称7', className: '25暑-G3-A+--一期', amount: 3599, status: 'paid', createdTime: '2026-01-12 11:30:00', paymentTime: '2026-01-12 11:35:00', orderNumber: 'ON20260112001', phone: '13644444444', studentName: '孙八', classId: '601', orderStatus: '已支付', paymentMethod: '微信支付', originalAmount: 3800, discountAmount: 201, materialFee: 0, courseFee: 3599, lessonCount: 15 },
     { id: 'ORD007', studentAccount: '15833333333', productName: '产品名称8', className: '25寒-G4-S+--二期', amount: 2299, status: 'paid', createdTime: '2026-01-11 13:20:00', paymentTime: '2026-01-11 13:25:00', orderNumber: 'ON20260111001', phone: '15833333333', studentName: '周九', classId: '602', orderStatus: '已取消', paymentMethod: '微信支付', originalAmount: 2500, discountAmount: 201, materialFee: 0, courseFee: 2299, lessonCount: 10 },
 ];
