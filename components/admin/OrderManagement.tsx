import React, { useState, useEffect, useRef } from 'react';
import { exportToExcel, ExcelFormatters } from '../../utils/excelExport';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import { formatCurrency } from '../../utils/formatCurrency';
import { CLASSES, ADMIN_STUDENTS, CAMPUSES, TEACHERS, COURSES } from '../../constants';

enum OrderStatusEnum {
  PENDING = '待支付',
  SUCCESS = '已支付',
  CANCELLED = '已取消',
  REFUNDED = '已退款',
  DEPOSIT_PENDING = '待付定金',
  DEPOSIT_PAID = '已付定金',
  BALANCE_PENDING = '待付尾款',
  PRESALE_FAILED = '预售失败',
  RENEWAL_PENDING = '待续费',
  PARTIAL_PAID = '部分支付'
}

interface OrderItem {
  id: string;
  name: string;
  classId: string;
  type: 'course' | 'material';
  price: number;
}

interface StatusHistoryItem {
  status: string;
  time: string;
  operator?: string;
  remark?: string;
}

interface SubOrder {
  id: string;
  realPay: number;
  paymentMethod: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  status: OrderStatusEnum;
  items: OrderItem[];
  orderType: '正常报名' | '续报' | '预售' | '分期';
  deposit?: number;
  balance?: number;
  firstPeriod?: number;
  secondPeriod?: number;
  isLocked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  paymentDeadline?: string;
  statusHistory: StatusHistoryItem[];
  semester?: string;
  venue?: string; // 场馆
  lessonCount?: string; // 课次
  classInfo?: {
    className: string;
    campus: string;
    teacher: string;
    schedule: string;
  };
}

interface OrderData {
  id: string;
  orderTime: string;
  paymentTime: string;
  totalAmount: number;
  subOrders: SubOrder[];
}

// 校区-场馆-收费主体映射关系
const CAMPUS_VENUE_MAPPING: Record<string, { venue: string; billingEntity: string }> = {
  '龙江校区': { venue: '江宁同曦中心馆', billingEntity: '南京思悦教育科技有限公司' },
  '大行宫校区': { venue: '大行宫教学中心', billingEntity: '南京思悦教育科技有限公司' },
  '仙林校区': { venue: '仙林万达茂馆', billingEntity: '南京思悦教育科技有限公司' },
  '五台山校区': { venue: '五台山体育中心馆', billingEntity: '南京思悦教育科技有限公司' },
  '深圳湾校区': { venue: '深圳湾科技园馆', billingEntity: '深圳思悦教育咨询有限公司' },
  '宝安中心校区': { venue: '宝安中心城市场馆', billingEntity: '深圳思悦教育咨询有限公司' },
  '奥南校区': { venue: '奥南商业中心馆', billingEntity: '南京思悦教育科技有限公司' },
};

const MOCK_ORDERS: OrderData[] = [
  // === 正常报名-已支付 ===
  { id: 'ORD-N002', orderTime: '2026-02-19 14:20:00', paymentTime: '2026-02-19 14:22:00', totalAmount: 5475, subOrders: [{ id: 'SUB-N002', realPay: 5475, paymentMethod: '现金', studentId: '4993', studentName: 'Randi丁柔', studentPhone: '139****7652', status: OrderStatusEnum.SUCCESS, orderType: '正常报名', semester: '暑假', lessonCount: '共10讲/剩余8讲', items: [{ id: 'i3', name: '25暑-G1-A+--一期', classId: 'c_p3', type: 'course', price: 5475 }, { id: 'i4', name: '教辅费', classId: '', type: 'material', price: 0 }], classInfo: { className: '25暑-G1-A+--一期', campus: '大行宫校区', teacher: 'Ruby张露', schedule: '周六 08:30-11:00' }, statusHistory: [{ status: '创建订单', time: '2026-02-19 14:20:00' }, { status: '已支付', time: '2026-02-19 14:22:00', remark: '现金支付' }] }] },
  { id: 'ORD-N003', orderTime: '2026-02-18 09:15:00', paymentTime: '2026-02-18 09:18:00', totalAmount: 2555, subOrders: [{ id: 'SUB-N003', realPay: 2555, paymentMethod: '微信支付', studentId: '4992', studentName: 'Grace吴悦', studentPhone: '182****0314', status: OrderStatusEnum.SUCCESS, orderType: '正常报名', semester: '暑假', items: [{ id: 'i5', name: '25暑-G2-A+--二期', classId: 'c_p4', type: 'course', price: 2555 }, { id: 'i6', name: '教辅费', classId: '', type: 'material', price: 0 }], classInfo: { className: '25暑-G2-A+--二期', campus: '仙林校区', teacher: 'Ace黄礼妍', schedule: '周六 10:30-12:30' }, statusHistory: [{ status: '创建订单', time: '2026-02-18 09:15:00' }, { status: '已支付', time: '2026-02-18 09:18:00', remark: '微信支付' }] }] },
  // === 正常报名-待支付 ===
  { id: 'ORD-N004', orderTime: '2026-02-28 16:00:00', paymentTime: '-', totalAmount: 1899, subOrders: [{ id: 'SUB-N004', realPay: 0, paymentMethod: '', studentId: '11678463', studentName: '殷煦纶', studentPhone: '138****0455', status: OrderStatusEnum.PENDING, orderType: '正常报名', semester: '暑假', paymentDeadline: '2026-02-28 16:30:00', lessonCount: '共10讲/剩余10讲', items: [{ id: 'i7', name: '25暑-K3-飞跃--三期', classId: 'c_p5', type: 'course', price: 1899 }, { id: 'i8', name: '教辅费', classId: '', type: 'material', price: 0 }], classInfo: { className: '25暑-K3-飞跃--三期', campus: '五台山校区', teacher: 'Melody', schedule: '周六 16:00-18:00' }, statusHistory: [{ status: '创建订单', time: '2026-02-28 16:00:00', remark: '等待支付，30分钟内有效' }] }] },
  { id: 'ORD-N005', orderTime: '2026-02-28 15:45:00', paymentTime: '-', totalAmount: 3299, subOrders: [{ id: 'SUB-N005', realPay: 0, paymentMethod: '', studentId: '5001', studentName: '陈思远', studentPhone: '135****2233', status: OrderStatusEnum.PENDING, orderType: '正常报名', semester: '寒假', paymentDeadline: '2026-02-28 16:15:00', items: [{ id: 'i9', name: '25寒-G5-A+--二期', classId: 'c_p2', type: 'course', price: 3299 }, { id: 'i10', name: '教辅费', classId: '', type: 'material', price: 100 }], classInfo: { className: '25寒-G5-A+--二期', campus: '龙江校区', teacher: 'Sonya孙苏云', schedule: '周日 10:00-12:00' }, statusHistory: [{ status: '创建订单', time: '2026-02-28 15:45:00', remark: '等待支付，30分钟内有效' }] }] },
  // === 正常报名-已取消 ===
  { id: 'ORD-N006', orderTime: '2026-02-15 11:00:00', paymentTime: '-', totalAmount: 4299, subOrders: [{ id: 'SUB-N006', realPay: 0, paymentMethod: '', studentId: '5002', studentName: '林子涵', studentPhone: '136****4455', status: OrderStatusEnum.CANCELLED, orderType: '正常报名', semester: '秋季', items: [{ id: 'i11', name: '24秋-G3-A+--周六上午', classId: '601', type: 'course', price: 4299 }, { id: 'i12', name: '教辅费', classId: '', type: 'material', price: 0 }], classInfo: { className: '24秋-G3-A+--周六上午', campus: '深圳湾校区', teacher: 'Iris', schedule: '周六 08:30-11:00' }, statusHistory: [{ status: '创建订单', time: '2026-02-15 11:00:00' }, { status: '已取消', time: '2026-02-15 11:30:00', remark: '超时未支付，系统自动取消' }] }] },
  // === 正常报名-已退款 ===
  { id: 'ORD-N007', orderTime: '2026-01-10 09:00:00', paymentTime: '2026-01-10 09:05:00', totalAmount: 2299, subOrders: [{ id: 'SUB-N007', realPay: 2299, paymentMethod: '微信支付', studentId: '5003', studentName: '王子轩', studentPhone: '137****6677', status: OrderStatusEnum.REFUNDED, orderType: '正常报名', semester: '寒假', lessonCount: '共8讲/剩余6讲', items: [{ id: 'i13', name: '25寒-G4-S+--二期', classId: '602', type: 'course', price: 2299 }, { id: 'i14', name: '教辅费', classId: '', type: 'material', price: 0 }], classInfo: { className: '25寒-G4-S+--二期', campus: '宝安中心校区', teacher: 'Felicia', schedule: '周五 18:00-20:00' }, statusHistory: [{ status: '创建订单', time: '2026-01-10 09:00:00' }, { status: '已支付', time: '2026-01-10 09:05:00', remark: '微信支付' }, { status: '已退款', time: '2026-02-01 14:30:00', operator: '管理员张老师', remark: '学生因搬家申请退费，全额退款' }] }] },
  // === 预售-待付定金 ===
  { id: 'ORD-P001', orderTime: '2026-02-27 10:00:00', paymentTime: '-', totalAmount: 4999, subOrders: [{ id: 'SUB-P001', realPay: 0, paymentMethod: '', studentId: '5004', studentName: '赵雨萱', studentPhone: '138****8899', status: OrderStatusEnum.DEPOSIT_PENDING, orderType: '预售', semester: '春季', deposit: 1000, balance: 3999, paymentDeadline: '2026-02-27 10:30:00', items: [{ id: 'i15', name: '26春-G2-A+--预售班', classId: '701', type: 'course', price: 4999 }, { id: 'i16', name: '教辅费', classId: '', type: 'material', price: 200 }], classInfo: { className: '26春-G2-A+--预售班', campus: '龙江校区', teacher: 'Sonya孙苏云', schedule: '周六 10:00-12:00' }, statusHistory: [{ status: '创建订单', time: '2026-02-27 10:00:00', remark: '预售班，等待付定金¥1000' }] }] },
  // === 预售-已付定金 ===
  { id: 'ORD-P002', orderTime: '2026-02-20 14:00:00', paymentTime: '2026-02-20 14:05:00', totalAmount: 3599, subOrders: [{ id: 'SUB-P002', realPay: 800, paymentMethod: '微信支付', studentId: '5005', studentName: '刘思琪', studentPhone: '139****1122', status: OrderStatusEnum.DEPOSIT_PAID, orderType: '预售', semester: '暑假', deposit: 800, balance: 2799, lessonCount: '共12讲/剩余12讲', items: [{ id: 'i17', name: '26暑-K3-飞跃--预售班', classId: '702', type: 'course', price: 3599 }, { id: 'i18', name: '教辅费', classId: '', type: 'material', price: 150 }], classInfo: { className: '26暑-K3-飞跃--预售班', campus: '大行宫校区', teacher: 'Sonya孙苏云', schedule: '周六 14:00-16:00' }, statusHistory: [{ status: '创建订单', time: '2026-02-20 14:00:00', remark: '预售班' }, { status: '已付定金', time: '2026-02-20 14:05:00', remark: '定金¥800已付，等待开班（需5人）' }] }] },
  // === 预售-待付尾款 ===
  { id: 'ORD-P003', orderTime: '2026-02-10 09:00:00', paymentTime: '2026-02-10 09:03:00', totalAmount: 4999, subOrders: [{ id: 'SUB-P003', realPay: 1000, paymentMethod: '微信支付', studentId: '5006', studentName: '张梓涵', studentPhone: '150****3344', status: OrderStatusEnum.BALANCE_PENDING, orderType: '预售', semester: '春季', deposit: 1000, balance: 3999, paymentDeadline: '2026-03-02 09:00:00', items: [{ id: 'i19', name: '26春-G2-A+--预售班', classId: '701', type: 'course', price: 4999 }, { id: 'i20', name: '教辅费', classId: '', type: 'material', price: 200 }], classInfo: { className: '26春-G2-A+--预售班', campus: '龙江校区', teacher: 'Sonya孙苏云', schedule: '周六 10:00-12:00' }, statusHistory: [{ status: '创建订单', time: '2026-02-10 09:00:00', remark: '预售班' }, { status: '已付定金', time: '2026-02-10 09:03:00', remark: '定金¥1000' }, { status: '待付尾款', time: '2026-03-01 09:00:00', remark: '班级已达开班人数，请在24小时内支付尾款¥3999' }] }] },
  // === 预售-已支付（定金+尾款） ===
  { id: 'ORD-P004', orderTime: '2026-01-15 10:00:00', paymentTime: '2026-02-16 10:30:00', totalAmount: 4999, subOrders: [{ id: 'SUB-P004', realPay: 4999, paymentMethod: '微信支付', studentId: '5007', studentName: '孙浩然', studentPhone: '151****5566', status: OrderStatusEnum.SUCCESS, orderType: '预售', semester: '春季', deposit: 1000, balance: 3999, items: [{ id: 'i21', name: '26春-G2-A+--预售班', classId: '701', type: 'course', price: 4999 }, { id: 'i22', name: '教辅费', classId: '', type: 'material', price: 200 }], classInfo: { className: '26春-G2-A+--预售班', campus: '龙江校区', teacher: 'Sonya孙苏云', schedule: '周六 10:00-12:00' }, statusHistory: [{ status: '创建订单', time: '2026-01-15 10:00:00', remark: '预售班' }, { status: '已付定金', time: '2026-01-15 10:05:00', remark: '定金¥1000' }, { status: '待付尾款', time: '2026-02-15 10:00:00', remark: '班级开班成功' }, { status: '已支付', time: '2026-02-16 10:30:00', remark: '尾款¥3999已付，全额到账' }] }] },
  // === 预售-预售失败 ===
  { id: 'ORD-P005', orderTime: '2026-01-05 11:00:00', paymentTime: '2026-01-05 11:03:00', totalAmount: 3599, subOrders: [{ id: 'SUB-P005', realPay: 0, paymentMethod: '微信支付', studentId: '5008', studentName: '周雨桐', studentPhone: '152****7788', status: OrderStatusEnum.PRESALE_FAILED, orderType: '预售', semester: '暑假', deposit: 800, balance: 2799, items: [{ id: 'i23', name: '26暑-K3-飞跃--预售班B', classId: '702', type: 'course', price: 3599 }, { id: 'i24', name: '教辅费', classId: '', type: 'material', price: 150 }], classInfo: { className: '26暑-K3-飞跃--预售班B', campus: '奥南校区', teacher: 'Ruby张露', schedule: '周日 14:00-16:00' }, statusHistory: [{ status: '创建订单', time: '2026-01-05 11:00:00', remark: '预售班' }, { status: '已付定金', time: '2026-01-05 11:03:00', remark: '定金¥800' }, { status: '预售失败', time: '2026-02-05 00:00:00', remark: '截止时间到期，仅3人付定金，未达最低5人开班要求，定金已原路退回' }] }] },
  // === 分期-已支付秋上 ===
  { id: 'ORD-F001', orderTime: '2026-02-01 10:00:00', paymentTime: '2026-02-01 10:05:00', totalAmount: 5475, subOrders: [{ id: 'SUB-F001', realPay: 2500, paymentMethod: '微信支付', studentId: '5009', studentName: '吴佳怡', studentPhone: '153****9900', status: OrderStatusEnum.SUCCESS, orderType: '续报', semester: '秋季', firstPeriod: 2500, secondPeriod: 2975, lessonCount: '共16讲/剩余12讲', items: [{ id: 'i25', name: '25秋-G1-A+--秋上', classId: 'c_p3', type: 'course', price: 2500 }, { id: 'i26', name: '教辅费', classId: '', type: 'material', price: 0 }], classInfo: { className: '25秋-G1-A+--一期', campus: '大行宫校区', teacher: 'Ruby张露', schedule: '周六 08:30-11:00' }, statusHistory: [{ status: '创建订单', time: '2026-02-01 10:00:00', remark: '秋季分期，秋上¥2500 + 秋下¥2975' }, { status: '已支付', time: '2026-02-01 10:05:00', remark: '秋上¥2500已付' }] }] },
  // === 分期-待续费 ===
  { id: 'ORD-F002', orderTime: '2025-09-01 10:00:00', paymentTime: '2025-09-01 10:03:00', totalAmount: 4299, subOrders: [{ id: 'SUB-F002', realPay: 2000, paymentMethod: '现金', studentId: '5010', studentName: '郑宇航', studentPhone: '155****1122', status: OrderStatusEnum.RENEWAL_PENDING, orderType: '续报', semester: '秋季', firstPeriod: 2000, secondPeriod: 2299, paymentDeadline: '2026-03-01 10:00:00', items: [{ id: 'i27', name: '25秋-G3-A+--秋上', classId: '601', type: 'course', price: 2000 }, { id: 'i28', name: '教辅费', classId: '', type: 'material', price: 0 }], classInfo: { className: '25秋-G3-A+--一期', campus: '深圳湾校区', teacher: 'Iris', schedule: '周六 08:30-11:00' }, statusHistory: [{ status: '创建订单', time: '2025-09-01 10:00:00', remark: '秋季分期' }, { status: '已支付', time: '2025-09-01 10:03:00', remark: '秋上¥2000已付' }, { status: '待续费', time: '2026-02-27 10:00:00', remark: '秋上3讲已结束，请在24小时内支付秋下¥2299' }] }] },
  // === 分期-部分支付 ===
  { id: 'ORD-F003', orderTime: '2025-09-05 14:00:00', paymentTime: '2025-09-05 14:02:00', totalAmount: 4299, subOrders: [{ id: 'SUB-F003', realPay: 2000, paymentMethod: '微信支付', studentId: '5011', studentName: '黄诗涵', studentPhone: '156****3344', status: OrderStatusEnum.PARTIAL_PAID, orderType: '续报', semester: '秋季', firstPeriod: 2000, secondPeriod: 2299, items: [{ id: 'i29', name: '25秋-G3-A+--秋上', classId: '601', type: 'course', price: 2000 }, { id: 'i30', name: '教辅费', classId: '', type: 'material', price: 0 }], classInfo: { className: '25秋-G3-A+--一期', campus: '深圳湾校区', teacher: 'Iris', schedule: '周六 08:30-11:00' }, statusHistory: [{ status: '创建订单', time: '2025-09-05 14:00:00', remark: '秋季分期' }, { status: '已支付', time: '2025-09-05 14:02:00', remark: '秋上¥2000已付' }, { status: '待续费', time: '2026-02-20 10:00:00', remark: '秋上结束，提醒续费秋下' }, { status: '部分支付', time: '2026-02-21 10:00:00', remark: '超时未续费秋下，仅完成秋上部分，退出班级' }] }] },
  // === 续报-已支付 ===
  { id: 'ORD-R001', orderTime: '2026-02-25 11:00:00', paymentTime: '2026-02-25 11:05:00', totalAmount: 1899, subOrders: [{ id: 'SUB-R001', realPay: 1899, paymentMethod: '微信支付', studentId: '4994', studentName: '朱维茜', studentPhone: '182****8828', status: OrderStatusEnum.SUCCESS, orderType: '续报', semester: '暑假', lessonCount: '共10讲/剩余10讲', items: [{ id: 'i31', name: '25暑-K3-飞跃--三期', classId: 'c_p5', type: 'course', price: 1899 }, { id: 'i32', name: '教辅费', classId: '', type: 'material', price: 0 }], classInfo: { className: '25暑-K3-飞跃--三期', campus: '五台山校区', teacher: 'Melody', schedule: '周六 16:00-18:00' }, statusHistory: [{ status: '创建订单', time: '2026-02-25 11:00:00', remark: '续报（春报暑）' }, { status: '已支付', time: '2026-02-25 11:05:00', remark: '微信支付，暑假班全款' }] }] },
  // === 锁单-待付尾款 ===
  { id: 'ORD-L001', orderTime: '2026-02-05 09:00:00', paymentTime: '2026-02-05 09:03:00', totalAmount: 4999, subOrders: [{ id: 'SUB-L001', realPay: 1000, paymentMethod: '微信支付', studentId: '5012', studentName: '马晨曦', studentPhone: '157****5566', status: OrderStatusEnum.BALANCE_PENDING, orderType: '预售', semester: '春季', deposit: 1000, balance: 3999, isLocked: true, lockedBy: '管理员张老师', lockedAt: '2026-02-26 15:00:00', items: [{ id: 'i33', name: '26春-G2-A+--预售班', classId: '701', type: 'course', price: 4999 }, { id: 'i34', name: '教辅费', classId: '', type: 'material', price: 200 }], classInfo: { className: '26春-G2-A+--预售班', campus: '龙江校区', teacher: 'Sonya孙苏云', schedule: '周六 10:00-12:00' }, statusHistory: [{ status: '创建订单', time: '2026-02-05 09:00:00', remark: '预售班' }, { status: '已付定金', time: '2026-02-05 09:03:00', remark: '定金¥1000' }, { status: '待付尾款', time: '2026-02-25 09:00:00', remark: '班级开班成功' }, { status: '锁单', time: '2026-02-26 15:00:00', operator: '管理员张老师', remark: '家长沟通中，暂不自动取消' }] }] },
  // === 锁单-待续费 ===
  { id: 'ORD-L002', orderTime: '2025-09-10 10:00:00', paymentTime: '2025-09-10 10:02:00', totalAmount: 4299, subOrders: [{ id: 'SUB-L002', realPay: 2000, paymentMethod: '现金', studentId: '5013', studentName: '杨子墨', studentPhone: '158****7788', status: OrderStatusEnum.RENEWAL_PENDING, orderType: '续报', semester: '秋季', firstPeriod: 2000, secondPeriod: 2299, isLocked: true, lockedBy: '管理员李老师', lockedAt: '2026-02-27 11:00:00', items: [{ id: 'i35', name: '25秋-G4-S+--秋上', classId: '602', type: 'course', price: 2000 }, { id: 'i36', name: '教辅费', classId: '', type: 'material', price: 0 }], classInfo: { className: '25秋-G4-S+--一期', campus: '宝安中心校区', teacher: 'Felicia', schedule: '周五 18:00-20:00' }, statusHistory: [{ status: '创建订单', time: '2025-09-10 10:00:00', remark: '秋季分期' }, { status: '已支付', time: '2025-09-10 10:02:00', remark: '秋上¥2000已付' }, { status: '待续费', time: '2026-02-25 10:00:00', remark: '秋上结束，提醒续费秋下¥2299' }, { status: '锁单', time: '2026-02-27 11:00:00', operator: '管理员李老师', remark: '家长确认续费意向，延长支付期限' }] }] },
];



const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
// Status color helper
const getStatusStyle = (status: OrderStatusEnum): string => {
  const map: Record<string, string> = {
    [OrderStatusEnum.PENDING]: 'text-orange-600 bg-orange-50 border-orange-200',
    [OrderStatusEnum.SUCCESS]: 'text-green-600 bg-green-50 border-green-200',
    [OrderStatusEnum.CANCELLED]: 'text-gray-500 bg-gray-50 border-gray-200',
    [OrderStatusEnum.REFUNDED]: 'text-red-600 bg-red-50 border-red-200',
    [OrderStatusEnum.DEPOSIT_PENDING]: 'text-amber-600 bg-amber-50 border-amber-200',
    [OrderStatusEnum.DEPOSIT_PAID]: 'text-blue-600 bg-blue-50 border-blue-200',
    [OrderStatusEnum.BALANCE_PENDING]: 'text-purple-600 bg-purple-50 border-purple-200',
    [OrderStatusEnum.PRESALE_FAILED]: 'text-red-500 bg-red-50 border-red-200',
    [OrderStatusEnum.RENEWAL_PENDING]: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    [OrderStatusEnum.PARTIAL_PAID]: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  };
  return map[status] || 'text-gray-600 bg-gray-50 border-gray-200';
};
const getOrderTypeStyle = (type: string): string => {
  const map: Record<string, string> = {
    '正常报名': 'text-teal-700 bg-teal-50',
    '续报': 'text-blue-700 bg-blue-50',
    '预售': 'text-purple-700 bg-purple-50',
    '分期': 'text-amber-700 bg-amber-50',
  };
  return map[type] || 'text-gray-600 bg-gray-50';
};
interface OrderRowProps {
  subOrder: SubOrder;
  courseItem?: { name: string; price: number; classId: string };
  materialItem?: { name: string; price: number };
  orderTime: string;
  paymentTime: string;
  totalAmount: number;
  onClassClick: (classId: string) => void;
  onStudentClick: (studentId: string) => void;
  onCopyId: (id: string) => void;
  onViewDetail: (orderId: string) => void;
}
const OrderRow: React.FC<OrderRowProps> = ({ subOrder, courseItem, orderTime, onClassClick, onStudentClick, onCopyId, onViewDetail }) => {
  const campus = subOrder.classInfo?.campus || '';
  const venueInfo = CAMPUS_VENUE_MAPPING[campus] || { venue: '-', billingEntity: '-' };
  
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 text-sm">
      {/* 订单编号 */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-1">
          <button onClick={() => onViewDetail(subOrder.id)} className="font-mono text-primary hover:underline cursor-pointer">{subOrder.id}</button>
          <button onClick={() => onCopyId(subOrder.id)} className="text-gray-400 hover:text-gray-600 p-0.5" title="复制订单号">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
        </div>
      </td>
      {/* 收费主体 */}
      <td className="px-3 py-3 text-gray-800 text-xs">{venueInfo.billingEntity}</td>
      {/* 场馆 */}
      <td className="px-3 py-3 text-gray-800 text-xs">{subOrder.venue || venueInfo.venue}</td>
      {/* 订单类型 */}
      <td className="px-3 py-3"><span className={`px-1.5 py-0.5 text-xs rounded ${getOrderTypeStyle(subOrder.orderType)}`}>{subOrder.orderType}</span></td>
      {/* 学生信息 */}
      <td className="px-3 py-3"><button onClick={() => onStudentClick(subOrder.studentId)} className="text-primary hover:underline">{subOrder.studentName}</button></td>
      {/* 班级名称 */}
      <td className="px-3 py-3">
        {courseItem?.classId ? (<button onClick={() => onClassClick(courseItem.classId)} className="text-primary hover:underline text-left">{courseItem.name}</button>) : (<span className="text-gray-800">{courseItem?.name || '-'}</span>)}
      </td>
      {/* 课次 */}
      <td className="px-3 py-3 text-gray-800 text-xs">{subOrder.lessonCount || '-'}</td>
      {/* 课程费用 */}
      <td className="px-3 py-3 text-gray-800">{courseItem ? formatCurrency(courseItem.price) : '-'}</td>
      {/* 实收金额 */}
      <td className="px-3 py-3 text-gray-800 font-medium">{formatCurrency(subOrder.realPay)}</td>
      {/* 支付方式 */}
      <td className="px-3 py-3 text-gray-600 text-xs">{subOrder.paymentMethod || '-'}</td>
      {/* 下单时间 */}
      <td className="px-3 py-3 text-gray-600 text-xs">{orderTime}</td>
      {/* 交易状态 */}
      <td className="px-3 py-3"><span className={`text-xs px-2 py-0.5 rounded border ${getStatusStyle(subOrder.status)}`}>{subOrder.status}</span></td>
      {/* 操作 */}
      <td className="px-3 py-3"><button onClick={() => onViewDetail(subOrder.id)} className="text-xs text-primary hover:underline">查看</button></td>
    </tr>
  );
};



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

interface ManualOrderStudent {
  id: string;
  name: string;
  phone: string;
  campus: string;
  gender: '男' | '女';
}

interface ManualOrderClass {
  id: string;
  name: string;
  businessType: '新签' | '续报' | '预售';
  paymentOption: '整期' | '分期';
  amount: number;
  classId: string;
  productName: string;
  enrolledCount: number;
  capacity: number;
  courseType: string;
  gradeLevel: string;
  classType: string;
  campus: string;
  semester: string;
  teacher: string;
  startedLessons: number;
  totalLessons: number;
  startTime: string;
  fee: number;
}

interface OrderManagementProps {
  onNavigateToClass?: (classId: string) => void;
  onNavigateToStudent?: (studentId: string) => void;
  onNavigateToManualOrder?: () => void;
  onNavigateToLockOrder?: () => void; // 锁单页面
}

const OrderManagement: React.FC<OrderManagementProps> = ({ onNavigateToClass, onNavigateToStudent, onNavigateToManualOrder, onNavigateToLockOrder }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [studentInfo, setStudentInfo] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);

  // New filters
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<string[]>([]);

  // 批量报名状态
  const [showBatchEnrollmentModal, setShowBatchEnrollmentModal] = useState(false);
  const [batchEnrollmentStep, setBatchEnrollmentStep] = useState<1 | 2>(1);
  const [batchEnrollmentResults, setBatchEnrollmentResults] = useState<{
    success: Array<{row: number, studentName: string, className: string, message: string}>;
    failed: Array<{row: number, studentName: string, className: string, error: string}>;
  }>({ success: [], failed: [] });
  const [uploadedEnrollmentFile, setUploadedEnrollmentFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Quick link filter
  const [quickFilter, setQuickFilter] = useState<string>('');

  // Sorting
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort orders
  const filteredOrders = React.useMemo(() => {
    let orders = MOCK_ORDERS.filter(order => {
      const matchProductName = !productName || order.subOrders.some(sub =>
        sub.items.some(item => item.name.toLowerCase().includes(productName.toLowerCase()))
      );

      const matchStudentInfo = !studentInfo || order.subOrders.some(sub =>
        sub.studentName.includes(studentInfo) || sub.studentPhone.includes(studentInfo)
      );

      // Status filter
      const matchStatus = selectedStatuses.length === 0 ||
        order.subOrders.some(sub => selectedStatuses.includes(sub.status));

      // Payment method filter
      const matchPaymentMethod = selectedPaymentMethods.length === 0 ||
        order.subOrders.some(sub => selectedPaymentMethods.includes(sub.paymentMethod));

      // Year filter - extracted from orderTime
      const matchYear = selectedYears.length === 0 ||
        selectedYears.some(year => order.orderTime.includes(year));

      // Semester filter - extracted from product name
      const matchSemester = selectedSemesters.length === 0 ||
        order.subOrders.some(sub =>
          sub.items.some(item =>
            selectedSemesters.some(semester => item.name.includes(semester))
          )
        );

      // Product type filter
      const matchProductType = selectedProductTypes.length === 0 ||
        order.subOrders.some(sub =>
          sub.items.some(item =>
            selectedProductTypes.some(type =>
              (type === '课程' && item.type === 'course') ||
              (type === '教辅' && item.type === 'material')
            )
          )
        );

      // Order type filter
      const matchOrderType = selectedOrderTypes.length === 0 ||
        order.subOrders.some(sub => selectedOrderTypes.includes(sub.orderType));

      // Quick link filter
      let matchQuickFilter = true;
      if (quickFilter) {
        switch (quickFilter) {
          case 'current':
            matchQuickFilter = order.subOrders.some(sub =>
              sub.items.some(item => item.name.includes('在读') || item.name.includes('在读班级'))
            );
            break;
          case 'unpaid':
            matchQuickFilter = order.subOrders.some(sub => sub.status === OrderStatusEnum.PENDING);
            break;
          case 'completed':
            matchQuickFilter = order.subOrders.some(sub =>
              sub.items.some(item => item.name.includes('已结课') || item.name.includes('结课'))
            );
            break;
          case 'transferred':
            matchQuickFilter = order.subOrders.some(sub =>
              sub.items.some(item => item.name.includes('转班'))
            );
            break;
          case 'rescheduled':
            matchQuickFilter = order.subOrders.some(sub =>
              sub.items.some(item => item.name.includes('调课'))
            );
            break;
          case 'refunded':
            matchQuickFilter = order.subOrders.some(sub => sub.status === OrderStatusEnum.REFUNDED);
            break;
          default:
            matchQuickFilter = true;
        }
      }

      return matchProductName && matchStudentInfo && matchStatus && matchPaymentMethod &&
             matchYear && matchSemester && matchProductType && matchOrderType && matchQuickFilter;
    });

    // Sort by orderTime
    orders.sort((a, b) => {
      const dateA = new Date(a.orderTime).getTime();
      const dateB = new Date(b.orderTime).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return orders;
  }, [productName, studentInfo, selectedStatuses, selectedPaymentMethods, selectedYears, selectedSemesters, selectedProductTypes, selectedOrderTypes, quickFilter, sortOrder]);

  const handleClassClick = (classId: string) => {
    if (onNavigateToClass) {
      onNavigateToClass(classId);
    } else {
      window.dispatchEvent(new CustomEvent('navigate-to-class-detail', { 
        detail: { classId } 
      }));
    }
  };

  const handleStudentClick = (studentId: string) => {
    if (onNavigateToStudent) {
      onNavigateToStudent(studentId);
    } else {
      window.dispatchEvent(new CustomEvent('navigate-to-student-detail', { 
        detail: { studentId } 
      }));
    }
  };
  const resetFilters = () => {
    setProductName('');
    setStudentInfo('');
    setSelectedStatuses([]);
    setSelectedPaymentMethods([]);
    setSelectedYears([]);
    setSelectedSemesters([]);
    setSelectedProductTypes([]);
    setSelectedOrderTypes([]);
    setStartDate('');
    setEndDate('');
  };

  // Calculate order statistics
  const totalOrders = filteredOrders.length;
  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const successfulOrders = filteredOrders.filter(order => 
    order.subOrders.every(sub => sub.status === OrderStatusEnum.SUCCESS)
  ).length;
  const pendingOrders = filteredOrders.filter(order => 
    order.subOrders.some(sub => sub.status === OrderStatusEnum.PENDING)
  ).length;

  const exportOrderList = async () => {
    try {
      // 按子订单导出，与页面列表一致
      const flattenedData = filteredOrders.flatMap(order => 
        order.subOrders.map(subOrder => {
          const courseItem = subOrder.items.find(item => item.type === 'course');
          const materialItem = subOrder.items.find(item => item.type === 'material');
          const campus = subOrder.classInfo?.campus || '';
          const venueInfo = CAMPUS_VENUE_MAPPING[campus] || { venue: '-', billingEntity: '-' };
          
          return {
            orderId: subOrder.id,
            billingEntity: venueInfo.billingEntity,
            venue: subOrder.venue || venueInfo.venue,
            orderType: subOrder.orderType,
            studentInfo: subOrder.studentName,
            className: courseItem?.name || '-',
            lessonCount: subOrder.lessonCount || '-',
            coursePrice: courseItem?.price || 0,
            realPayAmount: subOrder.realPay,
            paymentMethod: subOrder.paymentMethod || '-',
            orderTime: order.orderTime,
            paymentTime: order.paymentTime,
            status: subOrder.status,
          };
        })
      );

      const columns = [
        { key: 'orderId', label: '订单编号', width: 25 },
        { key: 'billingEntity', label: '收费主体', width: 25 },
        { key: 'venue', label: '场馆', width: 20 },
        { key: 'orderType', label: '订单类型', width: 12 },
        { key: 'studentInfo', label: '学生信息', width: 12 },
        { key: 'className', label: '班级名称', width: 25 },
        { key: 'lessonCount', label: '课次', width: 15 },
        { key: 'coursePrice', label: '课程费用', width: 12, format: ExcelFormatters.currency },
        { key: 'realPayAmount', label: '实收金额', width: 12, format: ExcelFormatters.currency },
        { key: 'paymentMethod', label: '支付方式', width: 12 },
        { key: 'orderTime', label: '下单时间', width: 20 },
        { key: 'paymentTime', label: '支付时间', width: 20 },
        { key: 'status', label: '交易状态', width: 12 },
      ];

      await exportToExcel({
        data: flattenedData,
        columns,
        sheetName: '订单列表',
        fileName: '订单列表',
        headerStyle: {
          bold: true,
          fillColor: 'FFF3E5F5'
        }
      });
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请稍后重试');
    }
  };

  // 生成批量报名模板
  const generateBatchEnrollmentTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('批量报名模板');

      // 表头定义 - 根据用户要求
      worksheet.columns = [
        { header: '学号', key: 'studentId', width: 15 },
        { header: '学生姓名', key: 'studentName', width: 15 },
        { header: '联系电话', key: 'phone', width: 15 },
        { header: '班级ID', key: 'classId', width: 15 },
        { header: '班级名称', key: 'className', width: 20 },
        { header: '校区', key: 'campus', width: 12 },
        { header: '主讲老师', key: 'teacher', width: 15 },
      ];

      // 设置表头样式
      worksheet.getRow(1).font = { bold: true };

      // 添加示例数据
      worksheet.addRow({
        studentId: 'S001',
        studentName: '张三',
        phone: '13800138000',
        classId: 'C001',
        className: '春季班数学提高班',
        campus: '龙江校区',
        teacher: '王老师',
      });

      // 生成Excel文件
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, '批量报名模板.xlsx');

      alert('模板下载成功！请按照模板格式填写数据。');
    } catch (error) {
      console.error('生成模板失败:', error);
      alert('生成模板失败，请稍后重试');
    }
  };

  // 处理批量报名文件上传
  const handleBatchEnrollmentUpload = async (file: File) => {
    try {
      setUploadedEnrollmentFile(file);
      
      // 模拟文件处理过程
      console.log('开始处理批量报名文件:', file.name);
      
      // 这里应该实现实际的Excel文件解析和验证逻辑
      // 暂时使用模拟数据
      setTimeout(() => {
        const mockResults = {
          success: [
            { row: 2, studentName: '张三', className: '春季班数学提高班', message: '报名成功' },
            { row: 3, studentName: '李四', className: '春季班英语基础班', message: '报名成功' },
          ],
          failed: [
            { row: 4, studentName: '王五', className: '无效班级', error: '班级ID不存在' },
          ]
        };
        
        setBatchEnrollmentResults(mockResults);
        setBatchEnrollmentStep(2);
        alert(`文件处理完成！\n成功: ${mockResults.success.length} 条\n失败: ${mockResults.failed.length} 条`);
      }, 1500);
      
    } catch (error) {
      console.error('文件处理失败:', error);
      alert('文件处理失败，请检查文件格式后重试');
    }
  };



  // 如果选中了订单，显示详情页
  if (selectedOrderId) {
    const order = MOCK_ORDERS.flatMap(o => o.subOrders).find(sub => sub.id === selectedOrderId);
    if (!order) return <div>订单未找到</div>;
    return (
      <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
          <button onClick={() => setSelectedOrderId(null)} className="text-primary hover:underline flex items-center gap-1">
            <span>←</span> 返回列表
          </button>
          <h2 className="text-xl font-bold text-gray-800">订单详情</h2>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* 基本信息和费用信息 - 左右布局 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 基本信息 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-bold text-gray-800 mb-3">基本信息</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div><span className="text-gray-500">订单编号：</span><span className="font-mono">{order.id}</span> {order.isLocked && <span className="ml-2 text-xs text-orange-600">🔒 已锁单</span>}</div>
                <div><span className="text-gray-500">订单类型：</span><span className={`px-2 py-0.5 rounded text-xs ${getOrderTypeStyle(order.orderType)}`}>{order.orderType}</span></div>
                <div><span className="text-gray-500">学生姓名：</span>{order.studentName}</div>
                <div><span className="text-gray-500">联系电话：</span>{order.studentPhone}</div>
                <div><span className="text-gray-500">班级名称：</span>{order.classInfo?.className || '-'}</div>
                <div><span className="text-gray-500">校区：</span>{order.classInfo?.campus || '-'}</div>
                {order.isLocked && <div><span className="text-gray-500">锁单信息：</span>{order.lockedBy} 于 {order.lockedAt} 锁单</div>}
              </div>
            </div>
            {/* 费用信息 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-bold text-gray-800 mb-3">费用信息</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div><span className="text-gray-500">课程费用：</span>{formatCurrency(order.items.find(i => i.type === 'course')?.price || 0)}</div>
                <div><span className="text-gray-500">教辅费：</span>{formatCurrency(order.items.find(i => i.type === 'material')?.price || 0)}</div>
                <div><span className="text-gray-500">实收金额：</span><span className="font-bold text-lg">{formatCurrency(order.realPay)}</span></div>
                <div><span className="text-gray-500">支付方式：</span>{order.paymentMethod || '-'}</div>
                {order.orderType === '预售' && order.deposit && (
                  <><div><span className="text-gray-500">定金：</span>{formatCurrency(order.deposit)}</div><div><span className="text-gray-500">尾款：</span>{formatCurrency(order.balance || 0)}</div></>
                )}
                {order.orderType === '分期' && order.firstPeriod && (
                  <><div><span className="text-gray-500">秋上：</span>{formatCurrency(order.firstPeriod)}</div><div><span className="text-gray-500">秋下：</span>{formatCurrency(order.secondPeriod || 0)}</div></>
                )}
              </div>
            </div>
          </div>
          {/* 状态流转时间线 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">状态流转</h3>
            <div className="space-y-4">
              {order.statusHistory.map((h, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    {i < order.statusHistory.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1"></div>}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="font-medium text-gray-800">{h.status}</div>
                    <div className="text-xs text-gray-500 mt-1">{h.time}</div>
                    {h.operator && <div className="text-xs text-gray-600 mt-1">操作人：{h.operator}</div>}
                    {h.remark && <div className="text-xs text-gray-600 mt-1">{h.remark}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* 操作区域 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">操作</h3>
            <div className="flex gap-3 flex-wrap">
              {order.status === OrderStatusEnum.PENDING && (
                <><button onClick={() => alert('确认支付功能（模拟）')} className="px-4 py-2 bg-primary text-white rounded hover:bg-teal-600">确认支付</button><button onClick={() => alert('取消订单功能（模拟）')} className="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50">取消订单</button></>
              )}
              {order.status === OrderStatusEnum.SUCCESS && (
                <button onClick={() => alert('申请退款功能（模拟）')} className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50">申请退款</button>
              )}
              {order.status === OrderStatusEnum.DEPOSIT_PENDING && (
                <><button onClick={() => alert('确认付定金功能（模拟）')} className="px-4 py-2 bg-primary text-white rounded hover:bg-teal-600">确认付定金</button><button onClick={() => alert('取消订单功能（模拟）')} className="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50">取消订单</button></>
              )}
              {order.status === OrderStatusEnum.DEPOSIT_PAID && (
                <button onClick={() => alert('标记预售失败功能（模拟）')} className="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50">标记预售失败</button>
              )}
              {order.status === OrderStatusEnum.BALANCE_PENDING && (
                <><button onClick={() => alert('确认付尾款功能（模拟）')} className="px-4 py-2 bg-primary text-white rounded hover:bg-teal-600">确认付尾款</button>{!order.isLocked && <button onClick={() => alert('锁单功能（模拟）')} className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600">锁单</button>}{order.isLocked && <button onClick={() => alert('解锁功能（模拟）')} className="px-4 py-2 border border-amber-500 text-amber-600 rounded hover:bg-amber-50">解锁</button>}<button onClick={() => alert('取消订单功能（模拟）')} className="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50">取消订单</button></>
              )}
              {order.status === OrderStatusEnum.RENEWAL_PENDING && (
                <><button onClick={() => alert('确认续费功能（模拟）')} className="px-4 py-2 bg-primary text-white rounded hover:bg-teal-600">确认续费</button>{!order.isLocked && <button onClick={() => alert('锁单功能（模拟）')} className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600">锁单</button>}{order.isLocked && <button onClick={() => alert('解锁功能（模拟）')} className="px-4 py-2 border border-amber-500 text-amber-600 rounded hover:bg-amber-50">解锁</button>}<button onClick={() => alert('标记部分支付功能（模拟）')} className="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50">标记部分支付</button></>
              )}
              {[OrderStatusEnum.CANCELLED, OrderStatusEnum.REFUNDED, OrderStatusEnum.PRESALE_FAILED, OrderStatusEnum.PARTIAL_PAID].includes(order.status) && (
                <div className="text-gray-500 text-sm">该订单已结束，无可用操作</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (<>
      <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
        {/* 标题栏 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">订单管理</h2>
        </div>

        {/* 第一栏：筛选栏 */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* 班级名称搜索 */}
            <div className="relative min-w-[140px] flex-shrink-0">
              <input
                type="text"
                placeholder="班级名称"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full pl-8 focus:outline-none focus:border-primary placeholder-gray-400 h-[34px]"
              />
              <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
            </div>

            {/* 学生信息搜索 */}
            <div className="relative min-w-[140px] flex-shrink-0">
              <input
                type="text"
                placeholder="学生信息"
                value={studentInfo}
                onChange={(e) => setStudentInfo(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full pl-8 focus:outline-none focus:border-primary placeholder-gray-400 h-[34px]"
              />
              <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
            </div>

            {/* 校区筛选 */}
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]">
              <option value="">校区</option>
              <option value="龙江校区">龙江校区</option>
              <option value="大行宫校区">大行宫校区</option>
              <option value="仙林校区">仙林校区</option>
            </select>

            {/* 交易状态筛选 - MultiSelect */}
            <MultiSelect
              options={['待支付', '已支付', '已取消', '已退款', '待付定金', '已付定金', '待付尾款', '预售失败', '待续费', '部分支付']}
              selected={selectedStatuses}
              onChange={setSelectedStatuses}
              placeholder="交易状态"
              width="w-[120px]"
            />

            {/* 支付方式筛选 - MultiSelect */}
            <MultiSelect
              options={['微信支付', '现金', '支付宝', '银行卡']}
              selected={selectedPaymentMethods}
              onChange={setSelectedPaymentMethods}
              placeholder="支付方式"
              width="w-[100px]"
            />

            {/* 年份筛选 - MultiSelect */}
            <MultiSelect
              options={['2026年', '2025年', '2024年', '2023年']}
              selected={selectedYears}
              onChange={setSelectedYears}
              placeholder="年份"
              width="w-[90px]"
            />

            {/* 学期筛选 - MultiSelect */}
            <MultiSelect
              options={['春季班', '暑假班', '秋季班', '寒假班']}
              selected={selectedSemesters}
              onChange={setSelectedSemesters}
              placeholder="学期"
              width="w-[90px]"
            />

            {/* 产品类型筛选 - MultiSelect */}
            <MultiSelect
              options={['课程', '教辅']}
              selected={selectedProductTypes}
              onChange={setSelectedProductTypes}
              placeholder="产品类型"
              width="w-[90px]"
            />

            {/* 订单类型筛选 - MultiSelect */}
            <MultiSelect
              options={['正常报名', '续报', '预售']}
              selected={selectedOrderTypes}
              onChange={setSelectedOrderTypes}
              placeholder="订单类型"
              width="w-[100px]"
            />

            {/* 时间筛选 */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[110px] focus:outline-none focus:border-primary text-gray-700 h-[34px]"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[110px] focus:outline-none focus:border-primary text-gray-700 h-[34px]"
              />
            </div>

            {/* 重置按钮 */}
            <button
              onClick={resetFilters}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded text-sm transition-colors h-[34px]"
            >
              重置
            </button>
          </div>
          
          {/* 快速筛选 */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-gray-500">快速筛选：</span>
            <button 
              onClick={() => setQuickFilter(quickFilter === '在读班级' ? '' : '在读班级')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${quickFilter === '在读班级' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              在读班级
            </button>
            <button 
              onClick={() => setQuickFilter(quickFilter === '已结课班级' ? '' : '已结课班级')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${quickFilter === '已结课班级' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              已结课班级
            </button>
            <button 
              onClick={() => setQuickFilter(quickFilter === '未缴费班级' ? '' : '未缴费班级')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${quickFilter === '未缴费班级' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              未缴费班级
            </button>
            <button 
              onClick={() => setQuickFilter(quickFilter === '退费班级' ? '' : '退费班级')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${quickFilter === '退费班级' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              退费班级
            </button>
            {quickFilter && (
              <button 
                onClick={() => setQuickFilter('')}
                className="text-xs text-gray-400 hover:text-gray-600 ml-2"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>

        {/* 第二栏：操作栏 */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigateToManualOrder?.()}
              className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors"
            >
              报名
            </button>
            <button 
              onClick={() => setShowBatchEnrollmentModal(true)}
              className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors"
            >
              批量报名
            </button>
            <button 
              onClick={() => onNavigateToLockOrder?.()}
              className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors"
            >
              锁单
            </button>
            <button 
              onClick={exportOrderList}
              className="border border-primary text-primary hover:bg-primary-light px-4 py-1.5 rounded text-sm transition-colors"
            >
              导出订单列表
            </button>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <span className="text-gray-600">
              总计 <span className="text-primary font-medium">{totalOrders}</span> 条订单
            </span>
            <span className="text-gray-600">
              总金额 <span className="text-primary font-medium">{formatCurrency(totalAmount)}</span>
            </span>
            <span className="text-gray-600">
              成功 <span className="text-green-600 font-medium">{successfulOrders}</span> | 
              待支付 <span className="text-orange-600 font-medium">{pendingOrders}</span>
            </span>
          </div>
        </div>

        {/* 第三栏：表格区域 */}
        <div className="flex-1 overflow-hidden bg-white flex flex-col">
          <div className="flex-1 overflow-auto mx-6 my-4">
            <table className="w-full">
              <thead className="bg-[#F9FBFA] text-sm text-gray-600 font-medium sticky top-0 z-10">
                  <th className="px-3 py-3 text-left font-medium">订单编号</th>
                  <th className="px-3 py-3 text-left font-medium">收费主体</th>
                  <th className="px-3 py-3 text-left font-medium">场馆</th>
                  <th className="px-3 py-3 text-left font-medium">订单类型</th>
                  <th className="px-3 py-3 text-left font-medium">学生信息</th>
                  <th className="px-3 py-3 text-left font-medium">班级名称</th>
                  <th className="px-3 py-3 text-left font-medium">课次</th>
                  <th className="px-3 py-3 text-left font-medium">课程费用</th>
                  <th className="px-3 py-3 text-left font-medium">实收金额</th>
                  <th className="px-3 py-3 text-left font-medium">支付方式</th>
                  <th className="px-3 py-3 text-left font-medium">下单时间</th>
                  <th className="px-3 py-3 text-left font-medium">交易状态</th>
                  <th className="px-3 py-3 text-left font-medium">操作</th>
              </thead>
              <tbody>
                {filteredOrders.flatMap((order) =>
                  order.subOrders.map((subOrder) => {
                    const courseItem = subOrder.items.find(item => item.type === 'course');
                    const materialItem = subOrder.items.find(item => item.type === 'material');
                    return (
                      <OrderRow
                        key={subOrder.id}
                        subOrder={subOrder}
                        courseItem={courseItem}
                        orderTime={order.orderTime}
                        onClassClick={handleClassClick}
                        onStudentClick={handleStudentClick}
                        onCopyId={(id) => { navigator.clipboard.writeText(id); }}
                        onViewDetail={(id) => setSelectedOrderId(id)}
                      />
                    );
                  })
                )}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                暂无订单数据
              </div>
            )}
          </div>

          {/* 分页组件 */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end text-sm text-gray-600 gap-2 bg-white">
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">&lt;</button>
            <button className="w-7 h-7 flex items-center justify-center rounded bg-primary text-white font-medium">1</button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">2</button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">3</button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">&gt;</button>
            <select className="border border-gray-300 rounded px-2 py-1 ml-2 text-xs focus:outline-none focus:border-primary">
              <option>20 条/页</option>
              <option>50 条/页</option>
            </select>
          </div>
        </div>
      </div>

      {/* 批量报名模态框 */}
      {showBatchEnrollmentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">批量报名</h3>
              <button 
                onClick={() => setShowBatchEnrollmentModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <div className="p-8 pb-0">
              <div className="flex items-center gap-4 mb-8">
                <div className={`flex items-center gap-2 ${batchEnrollmentStep === 1 ? 'text-black font-bold text-xl' : 'text-gray-400 text-lg'}`}>
                  <span>第1步导入文件</span>
                  {batchEnrollmentStep === 1 && <div className="h-1 w-8 rounded-full bg-primary"></div>}
                </div>
                <div className={`flex items-center gap-2 ${batchEnrollmentStep === 2 ? 'text-black font-bold text-xl' : 'text-gray-400 text-lg'}`}>
                  <span>第2步查看导入情况</span>
                  {batchEnrollmentStep === 2 && <div className="h-1 w-8 rounded-full bg-primary"></div>}
                </div>
              </div>
            </div>

            <div className="flex-1 px-8 overflow-hidden">
              {batchEnrollmentStep === 1 ? (
                <div className="h-full flex flex-col">
                  <div className="mb-4">
                    <button 
                      onClick={generateBatchEnrollmentTemplate}
                      className="bg-primary hover:bg-teal-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2 transition-colors"
                    >
                      <span>⬇</span> 下载模板
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      模板包含：学号、学生姓名、联系电话、班级ID、班级名称、校区、主讲老师
                    </p>
                  </div>
                  
                  <div className="flex-1 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center relative hover:border-primary transition-colors bg-gray-50">
                    <input 
                      type="file" 
                      accept=".xlsx" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleBatchEnrollmentUpload(file);
                        }
                      }}
                    />
                    <div className="text-center p-8">
                      <div className="text-4xl text-gray-300 mb-2">📄</div>
                      <p className="text-gray-600 font-medium mb-1">点击或拖拽上传Excel文件</p>
                      <p className="text-sm text-gray-400">支持 .xlsx 格式，最大10MB</p>
                      {uploadedEnrollmentFile && (
                        <p className="mt-4 text-sm text-primary font-medium">
                          已选择: {uploadedEnrollmentFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-500">
                    <p className="font-medium mb-2">注意事项：</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>请使用下载的模板填写数据</li>
                      <li>确保学号、学生姓名、联系电话、班级ID填写正确</li>
                      <li>班级ID可在班级管理页面查看</li>
                      <li>系统会自动验证数据格式</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">导入结果</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-green-600 font-medium">
                        ✅ 成功: {batchEnrollmentResults.success.length} 条
                      </span>
                      <span className="text-red-600 font-medium">
                        ❌ 失败: {batchEnrollmentResults.failed.length} 条
                      </span>
                    </div>
                  </div>
                  
                  {batchEnrollmentResults.failed.length > 0 && (
                    <div className="mb-6">
                      <h5 className="font-medium text-gray-700 mb-2">失败记录：</h5>
                      <div className="bg-red-50 border border-red-200 rounded p-3 max-h-40 overflow-auto">
                        {batchEnrollmentResults.failed.map((item, index) => (
                          <div key={index} className="text-sm text-red-700 mb-1">
                            第{item.row}行 - {item.studentName} ({item.className}): {item.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {batchEnrollmentResults.success.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">成功记录：</h5>
                      <div className="bg-green-50 border border-green-200 rounded p-3 max-h-40 overflow-auto">
                        {batchEnrollmentResults.success.map((item, index) => (
                          <div key={index} className="text-sm text-green-700 mb-1">
                            第{item.row}行 - {item.studentName} ({item.className}): {item.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 flex justify-center gap-4 border-t border-gray-100">
              {batchEnrollmentStep === 1 ? (
                <button 
                  onClick={() => setShowBatchEnrollmentModal(false)}
                  className="px-10 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setBatchEnrollmentStep(1);
                      setBatchEnrollmentResults({ success: [], failed: [] });
                      setUploadedEnrollmentFile(null);
                    }}
                    className="px-10 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    重新导入
                  </button>
                  <button 
                    onClick={() => setShowBatchEnrollmentModal(false)}
                    className="px-10 py-2 bg-primary text-white rounded hover:bg-teal-600 transition-colors"
                  >
                    完成
                  </button>
                </>
              )}
            </div>
        </div>
        </div>
      )}
    </>
  );
};

export default OrderManagement;

// 锁单管理页面组件
interface LockOrderManagementProps {
  onBack: () => void;
  onNavigateToClass?: (classId: string) => void;
  onNavigateToStudent?: (studentId: string) => void;
}

export const LockOrderManagement: React.FC<LockOrderManagementProps> = ({ onBack, onNavigateToClass, onNavigateToStudent }) => {
  const [productName, setProductName] = useState('');
  const [studentInfo, setStudentInfo] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // 筛选待付尾款和待续费的订单
  const lockableOrders = MOCK_ORDERS.filter(order => 
    order.subOrders.some(sub => 
      sub.status === OrderStatusEnum.BALANCE_PENDING || 
      sub.status === OrderStatusEnum.RENEWAL_PENDING
    )
  );

  // 应用筛选
  const filteredOrders = React.useMemo(() => {
    return lockableOrders.filter(order => {
      const matchProductName = !productName || order.subOrders.some(sub =>
        sub.items.some(item => item.name.toLowerCase().includes(productName.toLowerCase()))
      );
      const matchStudentInfo = !studentInfo || order.subOrders.some(sub =>
        sub.studentName.includes(studentInfo) || sub.studentPhone.includes(studentInfo)
      );
      const matchCampus = !selectedCampus || order.subOrders.some(sub =>
        sub.classInfo?.campus === selectedCampus
      );
      const matchStatus = !selectedStatus || order.subOrders.some(sub => {
        if (selectedStatus === '已锁单') return sub.isLocked === true;
        if (selectedStatus === '未锁单') return sub.isLocked !== true;
        return true;
      });
      return matchProductName && matchStudentInfo && matchCampus && matchStatus;
    });
  }, [lockableOrders, productName, studentInfo, selectedCampus, selectedStatus]);

  // 获取所有可锁单的子订单
  const allLockableSubOrders = filteredOrders.flatMap(order => 
    order.subOrders.filter(sub => 
      sub.status === OrderStatusEnum.BALANCE_PENDING || 
      sub.status === OrderStatusEnum.RENEWAL_PENDING
    )
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(allLockableSubOrders.map(sub => sub.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  const handleLockOrder = (orderId: string) => {
    alert(`订单 ${orderId} 已锁单（模拟）`);
  };

  const handleUnlockOrder = (orderId: string) => {
    alert(`订单 ${orderId} 已解锁（模拟）`);
  };

  const handleBatchLock = () => {
    if (selectedOrders.length === 0) {
      alert('请先选择要锁单的订单');
      return;
    }
    alert(`已批量锁单 ${selectedOrders.length} 个订单（模拟）`);
    setSelectedOrders([]);
  };

  const handleBatchUnlock = () => {
    if (selectedOrders.length === 0) {
      alert('请先选择要解锁的订单');
      return;
    }
    alert(`已批量解锁 ${selectedOrders.length} 个订单（模拟）`);
    setSelectedOrders([]);
  };

  const handleClassClick = (classId: string) => {
    if (onNavigateToClass) {
      onNavigateToClass(classId);
    }
  };

  const handleStudentClick = (studentId: string) => {
    if (onNavigateToStudent) {
      onNavigateToStudent(studentId);
    }
  };

  const resetFilters = () => {
    setProductName('');
    setStudentInfo('');
    setSelectedCampus('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
  };

  // 锁单状态样式
  const getLockStatusStyle = (isLocked?: boolean) => {
    if (isLocked) {
      return 'text-orange-600 bg-orange-50 border-orange-200';
    }
    return 'text-gray-500 bg-gray-50 border-gray-200';
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* 标题栏 */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
        <button onClick={onBack} className="text-primary hover:underline flex items-center gap-1">
          <span>←</span> 返回订单管理
        </button>
        <h2 className="text-xl font-bold text-gray-800">锁单管理</h2>
      </div>

      {/* 筛选栏 */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3 flex-wrap">
          {/* 班级名称搜索 */}
          <div className="relative min-w-[140px] flex-shrink-0">
            <input
              type="text"
              placeholder="班级名称"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full pl-8 focus:outline-none focus:border-primary placeholder-gray-400 h-[34px]"
            />
            <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
          </div>

          {/* 学生信息搜索 */}
          <div className="relative min-w-[140px] flex-shrink-0">
            <input
              type="text"
              placeholder="学生信息"
              value={studentInfo}
              onChange={(e) => setStudentInfo(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full pl-8 focus:outline-none focus:border-primary placeholder-gray-400 h-[34px]"
            />
            <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
          </div>

          {/* 校区筛选 */}
          <select 
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]"
          >
            <option value="">校区</option>
            <option value="龙江校区">龙江校区</option>
            <option value="大行宫校区">大行宫校区</option>
            <option value="仙林校区">仙林校区</option>
            <option value="五台山校区">五台山校区</option>
            <option value="深圳湾校区">深圳湾校区</option>
            <option value="宝安中心校区">宝安中心校区</option>
          </select>

          {/* 锁单状态筛选 */}
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]"
          >
            <option value="">锁单状态</option>
            <option value="已锁单">已锁单</option>
            <option value="未锁单">未锁单</option>
          </select>

          {/* 时间范围 */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary h-[34px]"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary h-[34px]"
            />
          </div>

          {/* 重置按钮 */}
          <button
            onClick={resetFilters}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded text-sm transition-colors h-[34px]"
          >
            重置
          </button>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBatchLock}
            className="bg-primary hover:bg-teal-600 text-white px-4 py-1.5 rounded text-sm transition-colors"
          >
            批量锁单
          </button>
          <button 
            onClick={handleBatchUnlock}
            className="border border-primary text-primary hover:bg-primary-light px-4 py-1.5 rounded text-sm transition-colors"
          >
            批量解锁
          </button>
          <span className="text-sm text-gray-500">
            已选择 <span className="text-primary font-medium">{selectedOrders.length}</span> 个订单
          </span>
        </div>
        <div className="text-sm text-gray-600">
          共 <span className="text-primary font-medium">{allLockableSubOrders.length}</span> 条待处理订单
        </div>
      </div>

      {/* 表格区域 */}
      <div className="flex-1 overflow-hidden bg-white flex flex-col">
        <div className="flex-1 overflow-auto mx-6 my-4">
          <table className="w-full">
            <thead className="bg-[#F9FBFA] text-sm text-gray-600 font-medium sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left font-medium w-10">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === allLockableSubOrders.length && allLockableSubOrders.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-3 py-3 text-left font-medium">订单编号</th>
                <th className="px-3 py-3 text-left font-medium">收费主体</th>
                <th className="px-3 py-3 text-left font-medium">场馆</th>
                <th className="px-3 py-3 text-left font-medium">订单类型</th>
                <th className="px-3 py-3 text-left font-medium">学生信息</th>
                <th className="px-3 py-3 text-left font-medium">班级名称</th>
                <th className="px-3 py-3 text-left font-medium">课次</th>
                <th className="px-3 py-3 text-left font-medium">课程费用</th>
                <th className="px-3 py-3 text-left font-medium">实收金额</th>
                <th className="px-3 py-3 text-left font-medium">支付方式</th>
                <th className="px-3 py-3 text-left font-medium">下单时间</th>
                <th className="px-3 py-3 text-left font-medium">交易状态</th>
                <th className="px-3 py-3 text-left font-medium">锁单状态</th>
                <th className="px-3 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.flatMap((order) =>
                order.subOrders
                  .filter(sub => sub.status === OrderStatusEnum.BALANCE_PENDING || sub.status === OrderStatusEnum.RENEWAL_PENDING)
                  .map((subOrder) => {
                    const courseItem = subOrder.items.find(item => item.type === 'course');
                    const campus = subOrder.classInfo?.campus || '';
                    const venueInfo = CAMPUS_VENUE_MAPPING[campus] || { venue: '-', billingEntity: '-' };
                    return (
                      <tr key={subOrder.id} className="border-b border-gray-100 hover:bg-gray-50 text-sm">
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(subOrder.id)}
                            onChange={(e) => handleSelectOrder(subOrder.id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <button className="font-mono text-primary hover:underline cursor-pointer">{subOrder.id}</button>
                        </td>
                        <td className="px-3 py-3 text-gray-800 text-xs">{venueInfo.billingEntity}</td>
                        <td className="px-3 py-3 text-gray-800 text-xs">{subOrder.venue || venueInfo.venue}</td>
                        <td className="px-3 py-3">
                          <span className={`px-1.5 py-0.5 text-xs rounded ${getOrderTypeStyle(subOrder.orderType)}`}>{subOrder.orderType}</span>
                        </td>
                        <td className="px-3 py-3">
                          <button onClick={() => handleStudentClick(subOrder.studentId)} className="text-primary hover:underline">{subOrder.studentName}</button>
                        </td>
                        <td className="px-3 py-3">
                          {courseItem?.classId ? (
                            <button onClick={() => handleClassClick(courseItem.classId)} className="text-primary hover:underline text-left">{courseItem.name}</button>
                          ) : (
                            <span className="text-gray-800">{courseItem?.name || '-'}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-gray-800 text-xs">{subOrder.lessonCount || '-'}</td>
                        <td className="px-3 py-3 text-gray-800">{courseItem ? formatCurrency(courseItem.price) : '-'}</td>
                        <td className="px-3 py-3 text-gray-800 font-medium">{formatCurrency(subOrder.realPay)}</td>
                        <td className="px-3 py-3 text-gray-600 text-xs">{subOrder.paymentMethod || '-'}</td>
                        <td className="px-3 py-3 text-gray-600 text-xs">{order.orderTime}</td>
                        <td className="px-3 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded border ${getStatusStyle(subOrder.status)}`}>{subOrder.status}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded border ${getLockStatusStyle(subOrder.isLocked)}`}>
                            {subOrder.isLocked ? '已锁单' : '未锁单'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {subOrder.isLocked ? (
                            <button 
                              onClick={() => handleUnlockOrder(subOrder.id)}
                              className="text-xs text-orange-500 hover:text-orange-600 hover:underline"
                            >
                              解锁
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleLockOrder(subOrder.id)}
                              className="text-xs text-primary hover:underline"
                            >
                              锁单
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>

          {allLockableSubOrders.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              暂无待付尾款或待续费的订单
            </div>
          )}
        </div>

        {/* 分页组件 */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end text-sm text-gray-600 gap-2 bg-white">
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">&lt;</button>
          <button className="w-7 h-7 flex items-center justify-center rounded bg-primary text-white font-medium">1</button>
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">&gt;</button>
          <select className="border border-gray-300 rounded px-2 py-1 ml-2 text-xs focus:outline-none focus:border-primary">
            <option>20 条/页</option>
            <option>50 条/页</option>
          </select>
        </div>
      </div>
    </div>
  );
};
