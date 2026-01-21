export type ViewType = 'class' | 'schedule';
export type ClassTabType = 'tasks' | 'schedule';
export type Role = 'teacher' | 'admin' | 'parents' | 'student';

export interface Student {
  id: string;
  name: string;
  avatar?: string;
  hasUnread?: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  account: string;
  gender: '男' | '女';
  className?: string;
  createdTime: string;
  updatedTime: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  timeSlot: string;
  description: string;
  color: string;
  // Admin fields
  campus?: string;
  teacherId?: string;
  assistant?: string;
  capacity?: number;
  studentCount?: number;
  courseId?: string;
  startDate?: string;
  status?: 'pending' | 'active' | 'full' | 'closed' | 'disabled';
  createdTime?: string;
  scheduleDescription?: string; // e.g. "2025.07.16-2025.07.30 周一, 周二..."
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

export type CourseType = 'long-term' | 'short-term';

export interface CourseLesson {
  id: string;
  name: string;
  taskCount: number;
  order: number;
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
}

export interface Teacher {
  id: string;
  name: string;
  gender?: '男' | '女';
  // Admin fields
  account?: string;
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

export interface Order {
  id: string;
  studentAccount: string;
  productName: string;
  className: string;
  amount: number;
  status: 'paid' | 'pending';
  createdTime: string;
  paymentTime: string;
}
