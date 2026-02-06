
export type ViewType = 'class' | 'schedule';
export type ClassTabType = 'tasks' | 'schedule';
export type Role = 'teacher' | 'admin' | 'parents' | 'student';

export interface Student {
  id: string;
  name: string;
  avatar?: string;
  hasUnread?: boolean;
}

 // 新增枚举类型
 export type StudentStatus = '在读学生' | '潜在学生' | '历史学生';
 export type FollowUpStatus = '待跟进' | '跟进中' | '已邀约' | '已签约' | '退费&流失';
 export type OrderStatus = '待支付' | '已支付' | '已取消' | '已退款';
 export type PaymentMethod = '微信支付' | '现金';

   export interface StudentProfile {
     id: string;
     name: string;
     account: string;
     gender: '男' | '女';
     className?: string;
     createdTime: string;
     updatedTime: string;
     // 新增字段
      birthDate?: string; // 出生年月
      evaluationLevel?: string; // 评测等级
     campus?: string; // 所属校区
     studentStatus?: StudentStatus; // 学生状态
     followUpStatus?: FollowUpStatus; // 跟进状态
     englishName?: string; // 英文名
     grade?: string; // 在读年级
     school?: string; // 在读学校
     studyCity?: string; // 就读城市
     registrationChannel?: '前台注册' | 'APP注册'; // 注册渠道
     acquisitionChannel?: '朋友/熟人推荐' | '小红书' | '思悦社群' | '思悦公众号/视频号'; // 获客渠道
   }

 export interface Order {
   id: string;
   studentAccount: string;
   productName: string;
   className: string;
   amount: number;
   status: 'paid' | 'pending';
   createdTime: string;
   paymentTime: string;
   // 新增字段
    orderNumber?: string; // 订单编号
    phone?: string; // 手机号
     studentName?: string; // 学生姓名
    classId?: string; // 班级ID
    orderStatus?: OrderStatus; // 订单状态
   paymentMethod?: PaymentMethod; // 支付方式
   originalAmount?: number; // 原价金额
   discountAmount?: number; // 优惠金额
   materialFee?: number; // 教辅费
   courseFee?: number; // 课程费
   lessonCount?: number; // 购买节数
 }

export interface ClassInfo {
  id: string;
  name: string;
  timeSlot: string;
  description: string;
  color: string;
  // Admin fields
  campus?: string;
  city?: string; // New: City
  district?: string; // New: District
  teacherId?: string;
  assistant?: string;
  capacity?: number;
  studentCount?: number;
  courseId?: string;
  startDate?: string;
  status?: 'pending' | 'active' | 'full' | 'closed' | 'disabled';
  saleStatus?: 'on_sale' | 'off_sale'; // New: Sale Status
  createdTime?: string;
  scheduleDescription?: string; // e.g. "2025.07.16-2025.07.30"
  
  // Extended fields for Detail View & Create Flow
  contentMode?: 'self' | 'standard'; // 自建课程
  year?: string; // 年份
  semester?: string; // 学期 e.g. 寒假
  subject?: string; // 学科 e.g. 英语
  grade?: string; // 年级 e.g. 5年级
  studentGrade?: string; // 学生年级
  classroom?: string; // 教室
  needQualification?: boolean; // 是否需要入学资格
  studentTag?: string; // 学生标签
  allowStudentSchedule?: boolean; // 是否开启学生端预约
  allowConflict?: boolean; // 是否允许冲突
  virtualSeats?: number; // 调课虚位
  
  // Pricing
  chargeMode?: 'whole' | 'installment'; // 收费模式
  price?: number; // 课程费
  refundPolicy?: 'unused' | 'full' | 'partial'; // 退费策略
  materialPrice?: number; // 教辅费
  materialRefundPolicy?: 'no_return' | 'return'; // 教辅退费策略
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'PREVIEW' | 'HOMEWORK' | 'REVIEW';
  isCompleted: boolean;
  date: string;
}

export type LessonStatus = 'completed' | 'pending' | 'cancelled';

export interface Lesson {
  id: string;
  classId: string;
  name: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: LessonStatus;
  // Admin fields
  teacherId?: string;
  pushTime?: string; // YYYY-MM-DD HH:mm
  pushStatus?: 'pending' | 'success' | 'failed';
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'none';

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

export type CourseType = 'long-term' | 'short-term' | 'experience';

export interface CourseLesson {
  id: string;
  name: string;
  taskCount: number;
  order: number;
  isOnlineBound?: boolean;
}

export interface Course {
  id: string;
  name: string;
  type: CourseType;
  lessonCount: number;
  tags?: string[];
  description?: string;
  module?: string;
  isRecommended?: boolean;
  lessons?: CourseLesson[];
  // Extended fields for Self-built Course
  year?: string;
  semester?: string;
  subject?: string;
  grade?: string;
  classType?: string;
  status?: 'active' | 'disabled';
}

export interface Teacher {
  id: string;
  name: string;
  gender?: '男' | '女';
  // Admin fields
  account?: string;
  phone?: string;
  city?: string;
  campus?: string;
  position?: string;
  avatar?: string;
  poster?: string;
  status?: 'active' | 'disabled';
  createdTime?: string;
  updatedTime?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  courseId: string;
  classId: string;
  deliveryType: 'offline' | 'online'; // 面授 | 线上
  description: string;
  status: 'active' | 'disabled'; // 已上架 | 已下架
  createdTime: string;
}


