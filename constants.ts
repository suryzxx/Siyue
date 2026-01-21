import { ClassInfo, Lesson, Student, Task, Course, Teacher, StudentProfile, Product, Order } from './types';

export const COURSES: Course[] = [
  { 
    id: 'course1', 
    name: '25暑-K3-进阶', 
    type: 'long-term', 
    lessonCount: 12, 
    tags: ['K3', 'K3进阶'],
    description: '针对K3阶段进阶学生的暑期课程',
    module: 'English',
    isRecommended: false,
    lessons: Array.from({length: 12}, (_, i) => ({
      id: `l1-${i}`, name: `25暑-Day${i+1}-课程任务`, taskCount: Math.floor(Math.random() * 10) + 2, order: i+1
    }))
  },
  { 
    id: 'course2', 
    name: '25暑-K3-飞跃', 
    type: 'short-term', 
    lessonCount: 13, 
    tags: ['K3', 'K3飞跃'],
    description: 'K3飞跃班，高强度集训',
    module: 'English',
    isRecommended: true,
    lessons: [
      { id: 'c2-1', name: '25暑-Day1-课程任务', taskCount: 17, order: 1 },
      { id: 'c2-2', name: '25暑-Day2-课程任务', taskCount: 6, order: 2 },
      { id: 'c2-3', name: '25暑-Day3-课程任务', taskCount: 4, order: 3 },
      { id: 'c2-4', name: '25暑-Day4-课程任务', taskCount: 5, order: 4 },
      { id: 'c2-5', name: '25暑-Day5-课程任务', taskCount: 5, order: 5 },
      { id: 'c2-6', name: '25暑-Day6-课程任务', taskCount: 1, order: 6 },
      { id: 'c2-7', name: '25暑-Day7-课程任务', taskCount: 1, order: 7 },
      { id: 'c2-8', name: '25暑-Day8-课程任务', taskCount: 2, order: 8 },
      { id: 'c2-9', name: '25暑-Day9-课程任务', taskCount: 2, order: 9 },
      { id: 'c2-10', name: '25暑-Day10-课程任务', taskCount: 3, order: 10 },
      { id: 'c2-11', name: '26寒-快乐伴学', taskCount: 4, order: 11 },
      { id: 'c2-12', name: '拓展小天地', taskCount: 6, order: 12 },
      { id: 'c2-13', name: '222', taskCount: 6, order: 13 },
    ]
  },
  { id: 'course3', name: '25暑-G1-A+', type: 'long-term', lessonCount: 15, tags: ['G1', 'A+'], lessons: [] },
  { id: 'course4', name: '25暑-K3-启蒙', type: 'long-term', lessonCount: 10, tags: [], lessons: [] },
  { id: 'course5', name: '25暑-G2-A+', type: 'long-term', lessonCount: 10, tags: ['G2', 'A+'], lessons: [] },
  { id: 'course6', name: '25暑-K2-启蒙', type: 'long-term', lessonCount: 10, tags: [], lessons: [] },
  { id: 'course7', name: '25暑-G3-A+', type: 'long-term', lessonCount: 10, tags: ['G3', 'A+'], lessons: [] },
  { id: 'course8', name: '25寒-G4-S+', type: 'short-term', lessonCount: 10, tags: ['G4', 'S+'], lessons: [] },
  { id: 'course9', name: '25寒-G5-A+', type: 'short-term', lessonCount: 10, tags: ['G5', 'A+'], lessons: [] },
];

export const TEACHERS: Teacher[] = [
  { id: '219', name: 'Melody', account: 'melody_01', gender: '女', status: 'active', createdTime: '2025-06-23 11:58:07', updatedTime: '2025-06-24 17:27:24' },
  { id: '218', name: 'Sonya孙苏云', account: 'Sonya孙苏云', gender: '女', status: 'active', createdTime: '2025-06-23 11:58:07', updatedTime: '2025-06-24 17:27:24' },
  { id: '217', name: 'Ruby张露', account: 'Ruby张露', gender: '女', status: 'active', createdTime: '2025-06-23 11:58:07', updatedTime: '2025-06-24 17:27:24' },
  { id: '216', name: 'Angel严义洁', account: 'Angel严义洁', gender: '女', status: 'active', createdTime: '2025-06-23 11:58:06', updatedTime: '2025-06-24 17:27:24' },
  { id: '215', name: 'Cora王晶', account: 'Cora王晶', gender: '女', status: 'active', createdTime: '2025-06-23 11:58:06', updatedTime: '2025-06-24 17:27:24' },
  { id: '214', name: 'Ace黄礼妍', account: 'Ace黄礼妍', gender: '女', status: 'active', createdTime: '2025-06-23 11:58:05', updatedTime: '2025-06-24 17:27:24' },
  { id: '213', name: 'Felicia杨星', account: 'Felicia杨星', gender: '女', status: 'active', createdTime: '2025-06-23 11:58:04', updatedTime: '2025-06-24 17:27:24' },
  { id: '212', name: 'Helen', account: 'helen_01', gender: '女', status: 'active', createdTime: '2025-06-23 11:58:04', updatedTime: '2025-06-24 17:27:24' },
  { id: '211', name: 'Luna贾璐瑶', account: 'Luna贾璐瑶', gender: '女', status: 'active', createdTime: '2025-06-23 11:58:03', updatedTime: '2025-06-24 17:27:24' },
  { id: '210', name: 'Iris游景', account: 'Iris游景', gender: '女', status: 'active', createdTime: '2025-06-23 11:58:03', updatedTime: '2025-06-24 17:27:24' },
  { id: 't1', name: 'Linda', account: 'linda_01', gender: '女', status: 'active', createdTime: '2025-01-01 10:00:00', updatedTime: '2025-01-01 10:00:00' },
  { id: 't2', name: 'Justin', account: 'justin_01', gender: '男', status: 'active', createdTime: '2025-01-01 10:00:00', updatedTime: '2025-01-01 10:00:00' },
  { id: 't3', name: 'Crystal张骁', account: 'crystal_01', gender: '女', status: 'active', createdTime: '2025-01-01 10:00:00', updatedTime: '2025-01-01 10:00:00' },
];

export const ADMIN_STUDENTS: StudentProfile[] = [
  { id: '4994', name: '朱维茜', account: '18262568828', gender: '男', className: '测试-暑G2-S', createdTime: '2025-06-30 19:52:28', updatedTime: '2025-06-30 19:52:28' },
  { id: '4993', name: 'Randi丁柔', account: '13921447652', gender: '男', className: '测试-暑G2-R', createdTime: '2025-06-30 19:52:28', updatedTime: '2025-06-30 19:52:28' },
  { id: '4992', name: 'Grace吴悦', account: '18260360314', gender: '男', className: '测试-暑G1-R', createdTime: '2025-06-30 19:52:27', updatedTime: '2025-06-30 19:52:27' },
  { id: '4991', name: '钱晶', account: '15250965218', gender: '男', className: '测试-暑G4-A+', createdTime: '2025-06-30 19:52:27', updatedTime: '2025-06-30 19:52:27' },
  { id: '4990', name: '张璟秋', account: '13149918395', gender: '男', className: '测试-暑G1-R', createdTime: '2025-06-30 19:52:27', updatedTime: '2025-06-30 19:52:27' },
  { id: '4989', name: 'Sara薛蓉', account: '13801597148', gender: '男', className: '测试-暑K3-进阶', createdTime: '2025-06-30 19:52:27', updatedTime: '2025-06-30 19:52:27' },
  { id: '4988', name: '刘嘉颖', account: '13951796802', gender: '男', className: '测试-暑G2-A', createdTime: '2025-06-30 19:52:27', updatedTime: '2025-06-30 19:52:27' },
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

export const CLASSES: ClassInfo[] = [
  {
    id: '549',
    name: 'A',
    timeSlot: '12:31',
    description: '25暑-K3-进阶',
    color: '#2DA194',
    campus: '辰龙校区',
    teacherId: 't2', 
    assistant: '215', 
    capacity: 20,
    studentCount: 0,
    courseId: 'course1',
    startDate: '2026-01-21',
    status: 'pending',
    createdTime: '2026/1/21 12:31:05',
    scheduleDescription: '2026.01.21-2026.02.10 每周二'
  },
  {
    id: '546',
    name: '25暑-K3-进阶-1班',
    timeSlot: '14:30',
    description: '25暑-K3-进阶',
    color: '#52C41A',
    campus: '奥南校区',
    teacherId: 't1',
    assistant: '216',
    capacity: 20,
    studentCount: 12,
    courseId: 'course1',
    startDate: '2025-07-10',
    status: 'active',
    createdTime: '2025-05-15 14:20:00',
    scheduleDescription: '2025.07.10-2025.08.30 每周四'
  },
  {
    id: 'c_p1',
    name: '25暑-K3-进阶--一期',
    timeSlot: '14:30',
    description: '25暑-K3-进阶',
    color: '#2DA194',
    campus: '龙江校区',
    teacherId: '219', // Melody
    assistant: '215',
    capacity: 12,
    studentCount: 7,
    courseId: 'course1',
    startDate: '2025-07-16',
    status: 'active',
    createdTime: '2025-07-01 10:00:00',
    scheduleDescription: '2025.07.16-2025.07.30 周一, 周二, 周三, 周四, 周五, 周六, 周日'
  },
  {
    id: 'c_p2',
    name: '25寒-G5-A+--二期',
    timeSlot: '18:00',
    description: '25寒-G5-A+',
    color: '#1890FF',
    campus: '辰龙校区',
    teacherId: 't3', // Crystal
    assistant: '217',
    capacity: 10,
    studentCount: 9,
    courseId: 'course9',
    startDate: '2025-01-16',
    status: 'active',
    createdTime: '2025-01-01 10:00:00',
    scheduleDescription: '2025.01.16-2025.01.30 周一, 周二, 周三, 周四, 周五, 周六, 周日'
  },
  {
    id: 'c_p3',
    name: '25暑-G1-A+--一期',
    timeSlot: '09:00',
    description: '25暑-G1-A+',
    color: '#FAAD14',
    campus: '大行宫校区',
    teacherId: 't1', // Linda
    assistant: '216',
    capacity: 15,
    studentCount: 5,
    courseId: 'course3',
    startDate: '2025-08-01',
    status: 'active',
    createdTime: '2025-06-15 10:00:00',
    scheduleDescription: '2025.08.01-2025.08.15 周一至周五'
  },
  {
    id: 'c_p4',
    name: '25暑-G2-A+--二期',
    timeSlot: '10:30',
    description: '25暑-G2-A+',
    color: '#13C2C2',
    campus: '仙林校区',
    teacherId: 't2', // Justin
    assistant: '214',
    capacity: 18,
    studentCount: 12,
    courseId: 'course5',
    startDate: '2025-07-20',
    status: 'active',
    createdTime: '2025-06-20 10:00:00',
    scheduleDescription: '2025.07.20-2025.08.05 周一至周五'
  },
  {
    id: 'c_p5',
    name: '25暑-K3-飞跃--三期',
    timeSlot: '16:00',
    description: '25暑-K3-飞跃',
    color: '#722ED1',
    campus: '五台山校区',
    teacherId: '219', // Melody
    assistant: '212',
    capacity: 8,
    studentCount: 8,
    courseId: 'course2',
    startDate: '2025-07-25',
    status: 'full',
    createdTime: '2025-07-10 10:00:00',
    scheduleDescription: '2025.07.25-2025.08.08 周一至周五'
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
  { id: 'l1', classId: 'c1', name: 'Unit 1: Hello World', date: '2025-07-20', startTime: '14:00', endTime: '15:30', status: 'completed', teacherId: 't1', pushTime: '2025-07-20 13:55', pushStatus: 'success' },
  { id: 'l2', classId: 'c1', name: 'Unit 2: My Family', date: '2025-07-22', startTime: '14:00', endTime: '15:30', status: 'completed', teacherId: 't1', pushTime: '2025-07-22 13:55', pushStatus: 'success' },
  { id: 'l3', classId: 'c1', name: 'Unit 3: Animals', date: '2025-07-24', startTime: '14:00', endTime: '15:30', status: 'pending', teacherId: 't1', pushTime: '2025-07-24 13:55', pushStatus: 'pending' },
  { id: 'l4', classId: 'c1', name: 'Unit 4: Colors', date: '2025-07-26', startTime: '14:00', endTime: '15:30', status: 'pending', teacherId: 't1', pushTime: '2025-07-26 13:55', pushStatus: 'pending' },
  { id: 'l11', classId: 'c_p1', name: 'Day 1: Intro', date: '2025-07-16', startTime: '14:30', endTime: '16:00', status: 'completed', teacherId: '219', pushTime: '2025-07-16 14:00', pushStatus: 'success' },
  { id: 'l12', classId: 'c_p1', name: 'Day 2: Vocab', date: '2025-07-17', startTime: '14:30', endTime: '16:00', status: 'completed', teacherId: '219', pushTime: '2025-07-17 14:00', pushStatus: 'success' },
  { id: 'l13', classId: 'c_p1', name: 'Day 3: Grammar', date: '2025-07-18', startTime: '14:30', endTime: '16:00', status: 'pending', teacherId: '219', pushTime: '2025-07-18 14:00', pushStatus: 'pending' },
];

export const PRODUCTS: Product[] = [
  { id: 'P001', name: '商品A', price: 2999, courseId: 'course1', classId: 'c_p1', deliveryType: 'offline', description: 'K3进阶班首期', status: 'active', createdTime: '2025-06-01' },
  { id: 'P002', name: '商品B', price: 2555, courseId: 'course9', classId: 'c_p2', deliveryType: 'offline', description: 'G5A+寒假班', status: 'active', createdTime: '2025-06-02' },
  { id: 'P003', name: '商品C', price: 3299, courseId: 'course3', classId: 'c_p3', deliveryType: 'offline', description: 'G1A+暑期班', status: 'active', createdTime: '2025-06-03' },
  { id: 'P004', name: '商品D', price: 1899, courseId: 'course2', classId: 'c_p5', deliveryType: 'offline', description: 'K3飞跃班三期(Full)', status: 'active', createdTime: '2025-06-04' },
];

export const ORDERS: Order[] = [
  { id: 'ORD001', studentAccount: '17788888888', productName: '商品A', className: '25暑-K3-进阶--一期', amount: 2999, status: 'paid', createdTime: '2026-01-16 10:30:00', paymentTime: '2026-01-16 10:35:00' },
  { id: 'ORD002', studentAccount: '15588888888', productName: '商品B', className: '25寒-G5-A+--二期', amount: 2555, status: 'pending', createdTime: '2026-01-16 10:35:00', paymentTime: '-' },
  { id: 'ORD003', studentAccount: '13866666666', productName: '商品C', className: '25暑-G1-A+--一期', amount: 3299, status: 'paid', createdTime: '2026-01-15 14:20:00', paymentTime: '2026-01-15 14:25:00' },
  { id: 'ORD004', studentAccount: '15977777777', productName: '商品D', className: '25暑-G2-A+--二期', amount: 2799, status: 'paid', createdTime: '2026-01-14 09:15:00', paymentTime: '2026-01-14 09:20:00' },
  { id: 'ORD005', studentAccount: '18699999999', productName: '商品E', className: '25暑-K3-飞跃--三期', amount: 1899, status: 'pending', createdTime: '2026-01-13 16:45:00', paymentTime: '-' },
  { id: 'ORD006', studentAccount: '13644444444', productName: '商品F', className: '25暑-G3-A+--一期', amount: 3599, status: 'paid', createdTime: '2026-01-12 11:30:00', paymentTime: '2026-01-12 11:35:00' },
  { id: 'ORD007', studentAccount: '15833333333', productName: '商品G', className: '25寒-G4-S+--二期', amount: 2299, status: 'paid', createdTime: '2026-01-11 13:20:00', paymentTime: '2026-01-11 13:25:00' },
];