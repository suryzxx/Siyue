import React, { useState, useEffect } from 'react';
import { PRODUCTS, CLASSES, TEACHERS, CAMPUSES, LESSONS } from '../../constants';
import { Product, ClassInfo, Teacher } from '../../types';

// --- Types ---
interface LocalStudent {
  id: string;
  name: string;
  account: string;
  gender: '男' | '女';
  active: boolean;
}

interface LocalOrder {
  id: string;
  product: Product;
  classInfo: ClassInfo;
  student: LocalStudent;
  amount: number;
  status: 'paid' | 'pending' | 'refunding' | 'refunded';
  createdTime: string;
  refundReason?: string;
  refundTime?: string;
}

interface WaitlistApplication {
  id: string;
  product: Product;
  student: LocalStudent;
  position: number;
  status: 'queued' | 'notified' | 'converted' | 'expired' | 'cancelled' | 'failed' | 'reminder';
  createdTime: string;
  notificationTime?: string;
  deadline?: string;
}

interface TransferApplication {
  id: string;
  originalClass: string;
  targetClass: string;
  targetClassInfo: {
    date: string;
    time: string;
    campus: string;
    teacher: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  requestTime: string;
  reviewTime?: string;
  rejectReason?: string;
}

interface AppNotification {
  id: string;
  title: string;
  content: string;
  type: 'system' | 'waitlist_pay' | 'waitlist_alert' | 'waitlist_info';
  relatedId?: string; // e.g., waitlist application ID
  isRead: boolean;
  timestamp: string;
}

// --- Notification Templates ---
const getNotificationTemplate = (
  type: 'success' | 'reminder' | 'failed' | 'expired' | 'cancelled', 
  data: { className: string, studentName: string, date?: string, time?: string }
) => {
  const serviceContact = "188-8888-8888";
  const payLink = "https://pay.weixin.qq.com/..."; // Mock link

  switch (type) {
    case 'success':
      return {
        title: '候补成功·入班支付通知',
        content: `家长您好！\n恭喜您，您在【${data.className}】的候补队列中已排到首位，现有一个名额释放，请及时完成支付以锁定席位。\n\n操作指引\n点击下方链接进入支付页面：\n【${payLink}】\n核对订单信息并完成支付。\n支付成功后，系统将自动将学生加入班级，您可在【我的班级】中查看。\n\n重要提醒\n请在24小时内完成支付，超时未支付名额将自动顺延给下一位候补家长。\n支付截止前2小时，我们将再次提醒您。\n\n如有疑问，请联系客服：${serviceContact}。\n祝学习愉快！`
      };
    case 'reminder':
      return {
        title: '支付截止提醒（二次提醒）',
        content: `家长您好！\n您在【${data.className}】的候补入班资格即将过期，请在2小时内完成支付，以免错过名额！\n支付链接：【${payLink}】\n超时未支付名额将自动顺延给下一位候补家长。\n如有疑问，请联系客服：${serviceContact}。\n祝学习愉快！`
      };
    case 'failed':
      return {
        title: '候补结果',
        content: `家长您好，\n感谢您对 ${data.className} 的关注与耐心等待。我们非常理解您期盼孩子加入该班级的心情，现将候补结果告知如下：\n\n候补结果\n很抱歉通知您，由于本期课程已开课/名额已满且无释放名额，您的候补申请 未能成功获得名额。\n\n后续建议\n为了不影响孩子的学习安排，我们为您提供以下建议：\n选择其他班级：您可进入小程序查看 同级别、同教师 的其他班次，或相似课程的空余名额班级。\n关注下期课程：新一期课程排班将于 近期 发布，届时您可优先报名。\n保留候补记录：本次候补申请将保留在您的账户中，若未来有临时名额释放，我们将酌情优先联系您。\n再次感谢您的信任与理解。如有任何疑问，欢迎联系客服，我们将竭诚为您协助安排合适的学习计划。\n如有疑问，请联系客服：${serviceContact}。\n祝孩子学业进步！`
      };
    case 'expired':
      return {
        title: '候补资格失效通知',
        content: `家长您好，\n很遗憾地通知您，您为 ${data.studentName} 申请的 ${data.className} 候补入班资格，因 未在24小时内完成支付，现已自动失效。\n\n处理结果\n候补状态：已变更为 “已过期”。\n名额处理：该名额已按排队规则，顺延给下一位候补家长。\n\n后续建议\n重新排队：若您仍希望报读该班级，可重新提交候补申请，您的新申请将按最新时间重新排队。\n选择其他班级：您也可浏览 同级别、同时段的其他可选班级，直接报名锁定席位。\n感谢您的理解。课程名额紧张，还请下次留意支付时限。我们期待未来能为您和孩子提供服务。\n如有疑问，请联系客服：${serviceContact}。\n感谢您的关注，期待未来再次为您服务！`
      };
    case 'cancelled':
      return {
        title: '候补取消确认',
        content: `家长您好，\n已确认您的 ${data.className} 候补申请 已成功取消。\n\n取消详情\n学生：${data.studentName}\n班级：${data.className}\n取消时间：${data.date} ${data.time}\n当前状态：“已取消”\n\n温馨提示\n您的候补名额已释放，排队序列已自动更新。\n本次取消操作不影响您未来报名其他课程。\n若改变主意，您仍可为该班级重新提交候补申请，新申请将按提交时间重新排队。\n如有疑问，请联系客服：${serviceContact}。\n感谢您的关注，期待未来再次为您服务！`
      };
  }
};

// --- Icons ---

const IconBack = () => (
  <svg viewBox="0 0 1024 1024" width="24" height="24" fill="currentColor">
    <path d="M285.8112 565.76a56.4864 56.4864 0 0 0 39.04-16.3712l452.7744-453.76A56.5248 56.5248 0 0 0 778.24 16.64a54.8992 54.8992 0 0 0-78.08-0.5632L247.3344 469.76a56.5248 56.5248 0 0 0-0.5504 79.0144 50.048 50.048 0 0 0 39.0272 16.9344zM733.568 1024a56.1664 56.1664 0 0 0 39.6032-95.3856l-448.32-458.24a54.912 54.912 0 0 0-78.08-0.5632 56.5248 56.5248 0 0 0-0.5632 79.0144l448.32 458.24A53.76 53.76 0 0 0 733.568 1024z m0 0" />
  </svg>
);

const IconMessage = () => (
  <svg viewBox="0 0 1024 1024" width="24" height="24" fill="currentColor">
    <path d="M832 128 192 128C121.344 128 64 185.344 64 256l0 384c0 70.656 57.344 128 128 128l127.808 0 0 65.408c0 24 13.44 45.568 34.944 56.192 8.896 4.288 18.368 6.464 27.776 6.464 13.504 0 26.88-4.416 38.08-12.992L570.048 768 832 768c70.656 0 128-57.344 128-128L960 256C960 185.344 902.656 128 832 128zM896 640c0 35.392-28.608 64-64 64l-272.576-0.064c-7.04 0-13.888 2.304-19.456 6.592l-156.224 122.944 0-97.536c0-17.664-14.336-31.936-31.936-31.936L192 704c-35.392 0-64-28.608-64-64L128 256c0-35.392 28.608-64 64-64l640 0c35.392 0 64 28.608 64 64L896 640zM320 384C284.608 384 256 412.608 256 448s28.608 64 64 64 64-28.608 64-64S355.392 384 320 384zM512 384C476.608 384 448 412.608 448 448s28.608 64 64 64 64-28.608 64-64S547.392 384 512 384zM704 384c-35.392 0-64 28.608-64 64s28.608 64 64 64 64-28.608 64-64S739.392 384 704 384z" />
  </svg>
);

const IconHome = () => (
  <svg viewBox="0 0 1024 1024" width="24" height="24" fill="currentColor">
    <path d="M555.541333 117.994667l312.874667 224.565333A117.333333 117.333333 0 0 1 917.333333 437.866667V800c0 64.8-52.533333 117.333333-117.333333 117.333333H640V746.666667c0-70.688-57.312-128-128-128s-128 57.312-128 128v170.666666H224c-64.8 0-117.333333-52.533333-117.333333-117.333333V437.877333a117.333333 117.333333 0 0 1 48.917333-95.317333l312.874667-224.565333a74.666667 74.666667 0 0 1 87.082666 0z" />
  </svg>
);

const IconCourse = () => (
  <svg viewBox="0 0 1024 1024" width="24" height="24" fill="currentColor">
    <path d="M769.5 232.2l-198.6 59.6c-17.1 5.1-28.9 20.9-28.9 38.8v503.7c0 27.2 26.2 46.6 52.2 38.8l194.5-58.3c48.4-14.5 87.9-67.7 87.9-118.2V311.9c0-61.5-48.2-97.4-107.1-79.7zM247.5 232.2c-58.9-17.7-107.2 18.2-107.2 79.7v384.7c0 50.5 39.6 103.7 87.9 118.2l194.5 58.3c26 7.8 52.2-11.7 52.2-38.8V330.6c0-17.9-11.7-33.7-28.9-38.8l-198.5-59.6z" />
  </svg>
);

const IconProfile = () => (
  <svg viewBox="0 0 1024 1024" width="24" height="24" fill="currentColor">
    <path d="M961.72259555 1029.29749333H59.94723555c-18.64135111 0-37.28270222-9.32067555-48.93354666-23.30168888-11.65084445-16.31118222-16.31118222-34.95253333-11.65084444-53.59388445 46.60337778-237.67722667 240.00739555-414.77006222 473.02428444-433.41141333 78.06065778 0 162.52928 9.90321778 246.99790222 44.27320888 24.46677333 9.90321778 32.62236445 16.31118222 46.60337778 23.30168889 135.14979555 76.89557333 228.35655111 209.7152 258.64874666 365.83651555 4.66033778 18.64135111 0 37.28270222-13.98101333 53.59388445-11.65084445 13.98101333-30.29219555 23.30168889-48.93354667 23.30168888z" />
    <path d="M61.11232 991.43224889c-7.57304889 0-14.56355555-2.91271111-18.64135111-8.15559111-0.58254222-0.58254222-0.58254222-1.16508445-1.16508444-1.74762667-5.82542222-5.82542222-6.40796445-15.72864-5.24288-21.55406222 43.10812445-221.36604445 224.27875555-387.39057778 440.98446222-403.11921778h17.47626666c104.27505778 0 204.47232 32.62236445 253.40586667 63.49710222C876.08888889 697.24842667 961.72259555 817.83466667 988.51953778 959.97496889c1.16508445 8.15559111-0.58254222 15.72864-6.40796445 23.30168889-4.07779555 5.24288-11.06830222 8.15559111-18.64135111 8.15559111H61.11232z" />
    <path d="M494.52373333 570.83676445c101.36234667 0 198.64689778 31.45728 245.83281778 61.16693333h0.58254222c124.66403555 73.98286222 207.38503111 191.07384889 233.01688889 329.71889777 0.58254222 2.91271111 0.58254222 6.99050667-4.07779555 12.23338667-0.58254222 1.16508445-3.49525333 2.33016889-6.99050667 2.33016889H61.11232c-3.49525333 0-6.40796445-1.16508445-6.99050667-2.33016889-0.58254222-1.16508445-1.74762667-2.33016889-2.91271111-2.91271111-1.16508445-1.16508445-2.33016889-4.66033778-1.16508444-8.73813333 41.94304-214.95808 217.28824889-375.73973333 427.58599111-391.46837333 5.24288 0.58254222 11.06830222 0 16.89372444 0m0-29.12711112c-5.82542222 0-12.23338667 0-18.05880888 0.58254222C252.76871111 558.60337778 66.3552 728.70570667 22.08199111 957.06225778c-2.33016889 11.65084445 0 25.63185778 9.32067556 34.95253333 6.99050667 9.32067555 18.64135111 13.98101333 30.29219555 13.98101334H963.47022222c11.65084445 0 23.30168889-4.66033778 30.29219556-13.98101334 6.99050667-9.32067555 11.65084445-20.97152 9.32067555-34.95253333-27.96202667-149.13080889-116.50844445-271.46467555-246.99790222-349.52533333-49.51608889-30.87473778-150.87843555-65.82727111-261.56145778-65.82727112zM512 539.96202667c-146.80064 0-267.96942222-121.16878222-267.96942222-267.96942222S365.19936 4.02318222 512 4.02318222s267.96942222 121.16878222 267.96942222 267.96942223S658.80064 539.96202667 512 539.96202667z" />
    <path d="M512 502.09678222c-126.99420445 0-230.10417778-103.10997333-230.10417778-230.10417777S385.00579555 41.88842667 512 41.88842667s230.10417778 103.10997333 230.10417778 230.10417778-103.10997333 230.10417778-230.10417778 230.10417777z" />
    <path d="M512 56.45198222c118.83861333 0 215.54062222 96.70200889 215.54062222 215.54062223S630.83861333 487.53322667 512 487.53322667s-215.54062222-96.70200889-215.54062222-215.54062222 96.70200889-215.54062222 215.54062222-215.54062223m0-29.12711111c-135.14979555 0-244.66773333 109.51793778-244.66773333 244.66773334s109.51793778 244.66773333 244.66773333 244.66773333 244.66773333-109.51793778 244.66773333-244.66773333S647.14979555 27.32487111 512 27.32487111z" />
  </svg>
);

const IconMyOrders = () => (
  <svg viewBox="0 0 1024 1024" width="28" height="28" fill="currentColor">
    <path d="M821.333333 256a32 32 0 0 1 64 0v565.333333c0 64.8-52.533333 117.333333-117.333333 117.333334H256c-64.8 0-117.333333-52.533333-117.333333-117.333334V202.666667c0-64.8 52.533333-117.333333 117.333333-117.333334h597.333333a32 32 0 0 1 0 64H256a53.333333 53.333333 0 0 0-53.333333 53.333334v618.666666a53.333333 53.333333 0 0 0 53.333333 53.333334h512a53.333333 53.333333 0 0 0 53.333333-53.333334V256zM341.333333 437.333333a32 32 0 0 1 0-64h341.333334a32 32 0 0 1 0 64H341.333333z m0 170.666667a32 32 0 0 1 0-64h213.333334a32 32 0 0 1 0 64H341.333333z" />
  </svg>
);

const IconCoupon = () => (
  <svg viewBox="0 0 1024 1024" width="28" height="28" fill="currentColor">
    <path d="M876.8 166.4l-726.4 0c-57.6 0-102.4 44.8-102.4 102.4l0 118.4 0 0 0 48c0 0 22.4 0 25.6 0 25.6 0 51.2 22.4 51.2 54.4 0 28.8-22.4 54.4-51.2 54.4-6.4 0-25.6 0-25.6 0l0 44.8 0 0 0 6.4 0 118.4c0 57.6 44.8 102.4 102.4 102.4l726.4 0c57.6 0 102.4-44.8 102.4-102.4l0-118.4 0-6.4 0-44.8c0 0-19.2 0-22.4 0-25.6 0-51.2-22.4-51.2-54.4 0-28.8 22.4-54.4 51.2-54.4 6.4 0 25.6 0 22.4 0L979.2 384l0-3.2 0-115.2C976 211.2 931.2 166.4 876.8 166.4zM851.2 486.4c0 48 32 86.4 73.6 99.2l0 121.6c0 28.8-22.4 51.2-51.2 51.2l-726.4 0c-28.8 0-51.2-22.4-51.2-51.2l0-118.4 0 0c51.2-6.4 76.8-54.4 76.8-102.4 0-48-32-92.8-76.8-102.4l0-115.2c0-28.8 22.4-51.2 51.2-51.2l726.4 0c28.8 0 51.2 22.4 51.2 51.2l0 118.4C883.2 396.8 851.2 438.4 851.2 486.4z" />
    <path d="M614.4 489.6c12.8 0 25.6-12.8 25.6-25.6 0-12.8-12.8-25.6-25.6-25.6l-67.2 0 57.6-57.6c9.6-9.6 9.6-25.6 0-35.2-9.6-9.6-25.6-9.6-35.2 0l-57.6 57.6-57.6-57.6c-9.6-9.6-25.6-9.6-35.2 0-9.6 9.6-9.6 25.6 0 35.2l57.6 57.6-64 0c-12.8 0-25.6 12.8-25.6 25.6 0 12.8 12.8 25.6 25.6 25.6l80 0 0 51.2-80 0c-12.8 0-25.6 12.8-25.6 25.6 0 12.8 12.8 25.6 25.6 25.6l80 0 0 51.2c0 12.8 12.8 25.6 25.6 25.6 12.8 0 25.6-12.8 25.6-25.6l0-51.2 76.8 0c12.8 0 25.6-12.8 25.6-25.6 0-12.8-12.8-25.6-25.6-25.6l-76.8 0 0-51.2L614.4 489.6z" />
  </svg>
);

const IconMySchedule = () => (
  <svg viewBox="0 0 1024 1024" width="28" height="28" fill="currentColor">
    <path d="M213.4272 241.501867a24.2176 24.2176 0 0 1-24.209067-24.221867 24.2176 24.2176 0 0 1 24.209067-24.226133h32.277333a24.2176 24.2176 0 0 1 24.209067 24.226133 24.2176 24.2176 0 0 1-24.209067 24.221867h-32.277333z m572.936533 0a24.2176 24.2176 0 0 1-24.209066-24.221867 24.2176 24.2176 0 0 1 24.209066-24.226133h24.209067c40.110933 0 72.6272 32.5376 72.6272 72.674133v549.0688c0 40.132267-32.512 72.669867-72.6272 72.669867H213.4272C173.312 887.466667 140.8 854.929067 140.8 814.7968V265.728c0-40.136533 32.512-72.674133 72.6272-72.674133a24.2176 24.2176 0 0 1 24.209067 24.226133 24.2176 24.2176 0 0 1-24.209067 24.221867 24.2176 24.2176 0 0 0-24.209067 24.226133v549.0688a24.2176 24.2176 0 0 0 24.209067 24.221867h597.1456a24.2176 24.2176 0 0 0 24.209067-24.221867V265.728a24.2176 24.2176 0 0 0-24.209067-24.226133h-24.209067z" />
    <path d="M326.4 136.533333a24.209067 24.209067 0 0 1 24.209067 24.209067v100.962133a24.209067 24.209067 0 1 1-48.418134 0V160.7424A24.209067 24.209067 0 0 1 326.4 136.533333z m371.2 0a24.209067 24.209067 0 0 1 24.209067 24.209067v100.962133a24.209067 24.209067 0 1 1-48.418134 0V160.7424A24.209067 24.209067 0 0 1 697.6 136.533333z m-56.405333 80.746667a24.209067 24.209067 0 0 1-24.209067 24.209067H407.0144a24.209067 24.209067 0 1 1 0-48.418134h209.9712a24.209067 24.209067 0 0 1 24.209067 24.209067z m222.050133 185.7152a24.209067 24.209067 0 0 1-24.209067 24.209067H180.928a24.209067 24.209067 0 1 1 0-48.418134H839.04a24.209067 24.209067 0 0 1 24.209067 24.209067z m-109.009067 209.937067a24.209067 24.209067 0 0 1-24.209066 24.209066H293.973333a24.209067 24.209067 0 1 1 0-48.418133h436.053334a24.209067 24.209067 0 0 1 24.209066 24.209067z" />
  </svg>
);

const IconMyWaitlist = () => (
  <svg viewBox="0 0 1024 1024" width="28" height="28" fill="currentColor">
    <path d="M489.565091 43.613091a469.457455 469.457455 0 0 1 485.003636 452.189091 27.182545 27.182545 0 1 1-54.365091 1.908363 415.045818 415.045818 0 0 0-428.823272-399.825454 400.151273 400.151273 0 0 0-180.829091 48.686545 454.376727 454.376727 0 0 0-106.961455 84.014546 393.681455 393.681455 0 0 0-84.759273 134.842182 426.030545 426.030545 0 0 0-26.949818 161.093818 415.045818 415.045818 0 0 0 428.823273 399.825454 27.182545 27.182545 0 1 1 1.908364 54.365091 469.457455 469.457455 0 0 1-485.282909-452.049454 477.509818 477.509818 0 0 1 29.78909-180.736 445.114182 445.114182 0 0 1 95.557819-153.274182 516.933818 516.933818 0 0 1 120.226909-94.952727 449.954909 449.954909 0 0 1 206.661818-56.087273z" />
    <path d="M825.064727 630.970182a68.421818 68.421818 0 1 0 69.538909 67.165091 68.421818 68.421818 0 0 0-69.538909-67.165091m-0.930909-54.411637a122.740364 122.740364 0 1 1-120.645818 124.83491 122.740364 122.740364 0 0 1 120.645818-124.83491z" />
    <path d="M961.210182 914.897455a111.150545 111.150545 0 0 0-18.897455-27.927273 157.882182 157.882182 0 0 0-116.084363-49.198546 172.218182 172.218182 0 0 0-125.905455 60.136728 106.030545 106.030545 0 0 0-11.264 16.989091h272.151273m61.998545 54.411636h-394.658909a125.114182 125.114182 0 0 1 29.370182-105.472 226.955636 226.955636 0 0 1 168.308364-80.570182 213.038545 213.038545 0 0 1 156.206545 67.025455 151.505455 151.505455 0 0 1 40.773818 119.016727z" />
    <path d="M530.385455 496.965818m-73.63491 0a73.634909 73.634909 0 1 0 147.269819 0 73.634909 73.634909 0 1 0-147.269819 0Z" />
    <path d="M530.385455 477.742545a19.269818 19.269818 0 1 0 19.456 19.223273 19.269818 19.269818 0 0 0-19.269819-19.269818m-0.186181-54.365091a73.634909 73.634909 0 1 1-73.63491 73.634909 73.634909 73.634909 0 0 1 73.63491-73.634909z" />
    <path d="M477.137455 486.632727a27.322182 27.322182 0 0 1-18.618182-7.540363l-109.149091-104.448a27.182545 27.182545 0 1 1 37.608727-39.284364l109.195636 104.448a27.229091 27.229091 0 0 1-18.618181 46.824727z" />
    <path d="M512.698182 465.873455a27.089455 27.089455 0 0 1-7.819637-18.432l-6.190545-284.765091a27.182545 27.182545 0 1 1 54.365091-1.210182l6.050909 284.392727a27.182545 27.182545 0 0 1-46.405818 20.014546z" />
    <path d="M532.992 867.793455m-27.182545 0a27.182545 27.182545 0 1 0 54.36509 0 27.182545 27.182545 0 1 0-54.36509 0Z" />
    <path d="M297.937455 750.917818m-27.182546 0a27.182545 27.182545 0 1 0 54.365091 0 27.182545 27.182545 0 1 0-54.365091 0Z" />
    <path d="M164.770909 524.194909m-27.182545 0a27.182545 27.182545 0 1 0 54.365091 0 27.182545 27.182545 0 1 0-54.365091 0Z" />
    <path d="M803.048727 352.349091m-27.182545 0a27.182545 27.182545 0 1 0 54.365091 0 27.182545 27.182545 0 1 0-54.365091 0Z" />
  </svg>
);

const IconReschedule = () => (
  <svg viewBox="0 0 1024 1024" width="28" height="28" fill="currentColor">
    <path d="M808 137.6h-74V119c0-13.8-6.5-26.8-17.8-35.7-9.2-7.2-21-11.2-33.2-11.2h-54.5C622.1 55.7 611 40.9 596 29c-22.6-17.7-52.1-27.5-83.3-27.5-31.1 0-60.7 9.8-83.3 27.5-15 11.8-26.2 26.7-32.5 43.1h-56c-12.2 0-24 4-33.2 11.2-11.2 8.9-17.7 21.9-17.7 35.7v18.6h-74c-58.4 0-106 48.3-106 107.7v669.6c0 59.4 47.6 107.7 106 107.7h592c58.4 0 106-48.3 106-107.7V245.2c0-59.3-47.6-107.6-106-107.6z m-454-1.5h100.9v-32c0-11.9 8.8-20.6 14.1-24.7 11.2-8.8 27.1-13.8 43.7-13.8s32.5 5 43.7 13.8c5.3 4.1 14.1 12.8 14.1 24.7v32H670v55.4H354v-55.4z m496 778.7c0 24.1-18.8 43.7-42 43.7H216c-23.2 0-42-19.6-42-43.7V245.2c0-24.1 18.8-43.7 42-43.7h74v7c0 13.8 6.5 26.8 17.8 35.7 9.2 7.2 21 11.2 33.2 11.2h342c12.2 0 24-4 33.2-11.2 11.3-8.9 17.8-21.9 17.8-35.7v-7h74c23.2 0 42 19.6 42 43.7v669.6z" />
    <path d="M726.7 500.5L588.8 362.4c-12.7-12.7-33.4-12.5-45.9 0.6-12 12.7-11.2 32.8 1.1 45.1l82.4 82.7H321.8c-0.6 0-1.2-0.1-1.9-0.1-17.7 0-32 14.3-32 32 0 17.5 14 31.7 31.4 32v0.1h385.6c8.1 0 15.9-3.2 21.7-9 12.6-12.6 12.6-32.8 0.1-45.3zM704.6 640H319.1c-8.1 0-15.9 3.2-21.7 9-12.5 12.5-12.5 32.8 0 45.3l137.8 138.1c12.7 12.7 33.4 12.5 45.9-0.6 12-12.7 11.2-32.8-1.1-45.1L397.6 704h304.6c0.6 0 1.2 0.1 1.9 0.1 17.7 0 32-14.3 32-32-0.1-17.6-14.1-31.7-31.5-32.1z" />
  </svg>
);

const IconTransfer = () => (
  <svg viewBox="0 0 1024 1024" width="28" height="28" fill="currentColor">
    <path d="M911.68 791.872c0 16.896-4.8 30.656-14.464 41.152s-21.44 17.216-35.456 20.096l-104.128 21.888c-30.336 6.4-55.424 12.224-75.264 17.472-14.016 2.944-33.408 9.792-58.176 20.544-24.832 10.816-53.824 24.64-87.04 41.536-16.896 5.248-33.856 5.248-50.752 0-33.856-16.896-62.976-30.08-87.488-39.36l-57.728-22.72c-19.84-5.824-44.928-12.416-75.264-19.712-30.336-7.296-65.024-13.888-104.128-19.712-14.592-2.944-26.56-10.176-35.904-21.888-9.344-11.648-14.272-24.768-14.848-39.36V366.656c0.576-17.472 5.824-32.064 15.744-43.776 9.92-11.648 23.296-17.792 40.256-18.368h11.392c39.104 5.824 72.064 11.52 98.88 17.088 26.816 5.568 49.856 11.264 69.12 17.088l53.376 24.512c23.936 11.648 52.8 25.664 86.656 41.984 16.896 5.824 33.856 5.824 50.752 0 33.28-19.264 62.272-34.56 87.04-45.952 24.768-11.392 44.16-18.24 58.176-20.544 16.896-5.824 39.104-11.52 66.496-17.088 27.392-5.568 59.52-11.2 96.256-17.088h10.496c14.592 0.576 27.392 6.72 38.528 18.368 11.072 11.648 16.896 26.24 17.472 43.776v425.216zM365.248 575.36c-4.992 4.992-7.424 11.84-7.424 20.544s2.496 15.616 7.424 20.544c4.928 4.992 11.84 7.424 20.544 7.424h257.28c5.824-0.576 10.368-3.648 13.568-9.216s6.272-9.92 9.216-13.12c2.944-3.2 4.352-7.296 4.352-12.224s-1.472-10.368-4.352-16.192L598.4 472.512c-5.824-5.248-12.416-8.192-19.712-8.768-7.296-0.576-13.888 0.576-19.712 3.52-8.192 5.824-12.864 12.416-14.016 19.712-1.152 7.296-0.32 13.888 2.624 19.712l39.36 61.248H385.792c-8.768-0.064-15.616 2.432-20.544 7.424z m298.368 153.088c4.928-4.928 7.424-11.84 7.424-20.544s-2.496-15.616-7.424-20.544c-4.992-4.928-11.84-7.424-20.544-7.424h-257.28c-5.824 0-10.048 1.6-12.672 4.8-2.624 3.2-3.968 9.216-3.968 17.92-2.944 2.944-4.352 6.848-4.352 11.84s1.472 10.368 4.352 16.192l66.496 100.608c2.944 2.944 6.144 5.376 9.6 7.424 3.52 2.048 7.872 3.392 13.12 3.968 2.944 0 5.696-0.256 8.32-0.896 2.624-0.576 5.376-2.304 8.32-5.248 5.824-5.824 9.6-12.416 11.392-19.712 1.728-7.296 0-13.824-5.248-19.712l-39.36-61.248h201.28c8.704 0 15.552-2.432 20.544-7.424z m-240.64-626.496c24.192-24.192 54.656-36.864 91.456-38.08 36.736 1.152 67.2 13.888 91.456 38.08 24.192 24.192 36.608 54.4 37.184 90.56-0.576 36.736-12.992 67.264-37.184 91.456-24.192 24.192-54.656 36.608-91.456 37.184-36.736-0.576-67.264-12.992-91.456-37.184-24.192-24.192-36.608-54.656-37.184-91.456 0.576-36.16 12.992-66.368 37.184-90.56z" />
  </svg>
);

// --- Transfer Class Components ---

const TransferHistory = ({ apps, onBack }: { apps: TransferApplication[], onBack: () => void }) => {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative z-30">
      <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm z-10 sticky top-0">
         <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
         <div className="flex-1 text-center font-bold text-lg pr-8">我的转班申请</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
         {apps.length === 0 && <div className="text-center text-gray-400 mt-20">暂无申请记录</div>}
         {apps.map(app => (
            <div key={app.id} className="bg-white p-4 rounded-xl shadow-sm">
               <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-50">
                  <div>
                     <h4 className="font-bold text-sm text-gray-800">转入：{app.targetClass}</h4>
                     <div className="text-xs text-gray-400 mt-1">原班级：{app.originalClass}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                     app.status === 'approved' ? 'bg-green-50 text-green-600' :
                     app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                     'bg-orange-50 text-orange-600'
                  }`}>
                     {app.status === 'approved' && '审核通过'}
                     {app.status === 'rejected' && '审核拒绝'}
                     {app.status === 'pending' && '审核中'}
                  </span>
               </div>
               <div className="space-y-1.5 mb-3">
                  <div className="flex text-xs text-gray-500">
                     <span className="w-16 flex-shrink-0 text-gray-400">上课时间</span>
                     <span>{app.targetClassInfo.date} {app.targetClassInfo.time}</span>
                  </div>
                  <div className="flex text-xs text-gray-500">
                     <span className="w-16 flex-shrink-0 text-gray-400">上课地点</span>
                     <span>{app.targetClassInfo.campus}</span>
                  </div>
                  <div className="flex text-xs text-gray-500">
                     <span className="w-16 flex-shrink-0 text-gray-400">申请时间</span>
                     <span>{app.requestTime}</span>
                  </div>
               </div>
               
               {app.status === 'rejected' && (
                  <div className="bg-red-50 p-2 rounded text-xs text-red-500">
                     拒绝原因：{app.rejectReason}
                  </div>
               )}
               {app.status === 'approved' && (
                  <div className="bg-green-50 p-2 rounded text-xs text-green-600">
                     您已成功转入新班级，请按时上课。
                  </div>
               )}
            </div>
         ))}
      </div>
    </div>
  );
};

const TransferModal = ({ 
  targetClass, 
  onClose, 
  onSubmit 
}: { 
  targetClass: any, 
  onClose: () => void, 
  onSubmit: (reason: string) => void 
}) => {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
       <div className="bg-white w-full max-w-[340px] rounded-xl overflow-hidden shadow-2xl animate-slide-up">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
             <h3 className="font-bold text-gray-800">填写转班原因</h3>
             <button onClick={onClose} className="text-gray-400 text-xl">&times;</button>
          </div>
          <div className="p-4">
             <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <div className="text-xs text-gray-500 mb-1">申请转入班级</div>
                <div className="font-bold text-sm text-gray-800">{targetClass.name}</div>
                <div className="text-xs text-gray-500 mt-1">{targetClass.scheduleDescription} {targetClass.timeSlot}</div>
             </div>
             
             <label className="text-xs font-bold text-gray-600 mb-2 block">转班原因 (选填)</label>
             <textarea 
               className="w-full h-24 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
               placeholder="请输入您转班的原因..."
               value={reason}
               onChange={e => setReason(e.target.value)}
             />
          </div>
          <div className="p-4 border-t border-gray-100 flex gap-3">
             <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-bold">取消</button>
             <button onClick={() => onSubmit(reason)} className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-bold shadow-blue-200 shadow-lg">提交转班审核</button>
          </div>
       </div>
    </div>
  );
};

const TransferClassList = ({ 
  currentClass, 
  onBack,
  onOpenHistory,
  onApply
}: { 
  currentClass: ClassInfo | undefined, 
  onBack: () => void,
  onOpenHistory: () => void,
  onApply: (cls: any) => void
}) => {
  // Generate mock available classes based on current class
  const availableClasses = [
     { id: 'tc1', name: '25暑-K3-进阶-2班', scheduleDescription: '每周五', timeSlot: '14:00', campus: '奥南校区', teacherName: 'Ruby张露' },
     { id: 'tc2', name: '25暑-K3-进阶-3班', scheduleDescription: '每周六', timeSlot: '09:00', campus: '龙江校区', teacherName: 'Angel严义洁' },
     { id: 'tc3', name: '25暑-K3-进阶-4班', scheduleDescription: '每周六', timeSlot: '14:00', campus: '大行宫校区', teacherName: 'Ace黄礼妍' },
     { id: 'tc4', name: '25暑-K3-进阶-5班', scheduleDescription: '每周日', timeSlot: '10:00', campus: '仙林校区', teacherName: 'Iris游景' },
     { id: 'tc5', name: '25暑-K3-进阶-6班', scheduleDescription: '每周日', timeSlot: '16:00', campus: '五台山校区', teacherName: 'Luna贾璐瑶' },
  ];

  const currentTeacher = TEACHERS.find(t => t.id === currentClass?.teacherId);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative z-20">
      <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm z-10 sticky top-0 justify-between">
         <div className="flex items-center">
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
            <div className="font-bold text-lg ml-2">转班申请</div>
         </div>
         <button onClick={onOpenHistory} className="text-xs text-blue-500 font-bold px-2 py-1 bg-blue-50 rounded-full">
            我的申请
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
         {/* Current Class */}
         {currentClass ? (
             <div>
                <div className="text-xs text-gray-500 mb-2 font-bold px-1">当前所在班级</div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-white/20 px-3 py-1 rounded-bl-xl text-xs font-bold backdrop-blur-sm">当前班级</div>
                   <h3 className="font-bold text-lg mb-4 pr-16">{currentClass.name}</h3>
                   <div className="space-y-2 text-sm opacity-90">
                      <div className="flex items-center gap-2">
                         <span className="opacity-70">📅</span>
                         <span>{currentClass.scheduleDescription || '每周固定时间'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="opacity-70">🕒</span>
                         <span>{currentClass.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="opacity-70">📍</span>
                         <span>{currentClass.campus}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="opacity-70">👩‍🏫</span>
                         <span>{currentTeacher?.name || '待定'} (主教)</span>
                      </div>
                   </div>
                </div>
             </div>
         ) : (
             <div className="text-center text-gray-400 py-10">当前没有在读班级，无法转班</div>
         )}

         {/* Target Classes */}
         {currentClass && (
             <div>
                <div className="text-xs text-gray-500 mb-3 font-bold px-1">可选转入班级 (同课程)</div>
                <div className="space-y-3">
                   {availableClasses.map(cls => (
                      <div key={cls.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                         <div className="flex justify-between items-start">
                            <div>
                               <h4 className="font-bold text-gray-800">{cls.name}</h4>
                               <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                  <span className="bg-gray-100 px-1.5 py-0.5 rounded">{cls.scheduleDescription}</span>
                                  <span className="bg-gray-100 px-1.5 py-0.5 rounded">{cls.timeSlot}</span>
                               </div>
                            </div>
                            <div className="text-orange-500 text-xs bg-orange-50 px-2 py-1 rounded">热报中</div>
                         </div>
                         
                         <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-100">
                            <div className="text-xs text-gray-500 space-y-1">
                               <div>📍 {cls.campus}</div>
                               <div>👤 {cls.teacherName}</div>
                            </div>
                            <button 
                              onClick={() => onApply(cls)}
                              className="px-5 py-1.5 rounded-full border border-blue-500 text-blue-500 text-sm font-bold active:bg-blue-50 transition-colors"
                            >
                               转班
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
         )}
      </div>
    </div>
  );
};

// --- Sub-Components ---

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return <span>{formatTime(timeLeft)}</span>;
};

const ScheduleCards = ({ onBack }: { onBack: () => void }) => {
  // Mock upcoming lessons based on existing data + some generated for display
  const upcomingLessons = [
    { id: 'l1', courseName: '25暑-K3-进阶', className: '25暑-K3-进阶-1班', teacher: 'Melody', date: '10月24日 周五', time: '14:00 - 15:30', campus: '奥南校区', lessonName: 'Unit 1: Hello World' },
    { id: 'l2', courseName: '25暑-G1-A+', className: '25暑-G1-A+-2班', teacher: 'Linda', date: '10月31日 周五', time: '14:00 - 15:30', campus: '大行宫校区', lessonName: 'Unit 2: My Family' },
    { id: 'l3', courseName: '25暑-K3-进阶', className: '25暑-K3-进阶-1班', teacher: 'Melody', date: '11月07日 周五', time: '14:00 - 15:30', campus: '奥南校区', lessonName: 'Unit 3: Animals' },
    { id: 'l4', courseName: '25暑-G2-A+', className: '25暑-G2-A+-3班', teacher: 'Justin', date: '11月14日 周五', time: '16:00 - 17:30', campus: '仙林校区', lessonName: 'Unit 4: Colors' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative z-20">
      {/* Navbar */}
      <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm z-10 sticky top-0">
         <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
         <div className="flex-1 text-center font-bold text-lg pr-8">我的课表</div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-4">
         <div className="text-lg font-bold text-gray-800 mb-4 pl-2">近期课程</div>
         
         {/* Horizontal Scroll Container */}
         <div className="flex-1 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-8 px-2 no-scrollbar items-start">
            {upcomingLessons.map((lesson, idx) => (
               <div key={lesson.id} className="snap-center shrink-0 w-[85%] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                  {/* Card Header */}
                  <div className={`p-4 ${idx % 2 === 0 ? 'bg-blue-500' : 'bg-orange-400'} text-white`}>
                     <div className="text-xl font-bold">{lesson.date}</div>
                     <div className="text-sm opacity-90 mt-1">即将开始</div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-center space-y-6">
                     <div>
                        <div className="text-3xl font-bold text-gray-800 mb-2">{lesson.time}</div>
                        <div className="text-lg font-bold text-gray-700">{lesson.lessonName}</div>
                     </div>
                     
                     <div className="space-y-2 pt-4 border-t border-dashed border-gray-200">
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-400">课程</span>
                           <span className="text-gray-700 font-medium">{lesson.courseName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-400">班级</span>
                           <span className="text-gray-700 font-medium">{lesson.className}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-400">老师</span>
                           <span className="text-gray-700 font-medium">{lesson.teacher}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-400">地点</span>
                           <span className="text-gray-700 font-medium">{lesson.campus}</span>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
            {/* Spacer for easier scrolling to the end */}
            <div className="w-4 shrink-0"></div>
         </div>
      </div>
    </div>
  );
};

// --- Order Flow Components ---

const StudentSelector = ({ 
  students, 
  onSelect, 
  onAddStudent, 
  onBack,
  title = "选择报名学员"
}: { 
  students: LocalStudent[], 
  onSelect: (s: LocalStudent) => void, 
  onAddStudent: (name: string, gender: '男' | '女') => void,
  onBack: () => void,
  title?: string
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'男'|'女'>('男');

  const handleAdd = () => {
    if (newName) {
      onAddStudent(newName, newGender);
      setIsAdding(false);
    }
  };

  if (isAdding) {
    return (
      <div className="flex-1 flex flex-col bg-white h-full relative z-30">
        <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm z-10">
           <button onClick={() => setIsAdding(false)} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
           <div className="flex-1 text-center font-bold text-lg pr-8">添加新学员</div>
        </div>
        <div className="p-6 space-y-4">
           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">学员姓名</label>
             <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-gray-50 p-3 rounded-lg" placeholder="请输入姓名" />
           </div>
           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">性别</label>
             <div className="flex gap-4">
               <button onClick={() => setNewGender('男')} className={`flex-1 py-2 rounded-lg border ${newGender === '男' ? 'border-blue-500 bg-blue-50 text-blue-500' : 'border-gray-200'}`}>男</button>
               <button onClick={() => setNewGender('女')} className={`flex-1 py-2 rounded-lg border ${newGender === '女' ? 'border-pink-500 bg-pink-50 text-pink-500' : 'border-gray-200'}`}>女</button>
             </div>
           </div>
           <button onClick={handleAdd} className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold mt-4 shadow-lg shadow-blue-200">确认添加</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative z-30">
      <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm z-10 sticky top-0">
         <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
         <div className="flex-1 text-center font-bold text-lg pr-8">{title}</div>
      </div>
      <div className="p-4 space-y-3">
         {students.map(s => (
           <div key={s.id} onClick={() => onSelect(s)} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm active:scale-95 transition-transform cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${s.gender === '男' ? 'bg-blue-400' : 'bg-pink-400'}`}>
                   {s.name[0]}
                </div>
                <div>
                   <div className="font-bold text-gray-800">{s.name}</div>
                   <div className="text-xs text-gray-400">{s.account}</div>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border border-gray-300"></div>
           </div>
         ))}
         <button onClick={() => setIsAdding(true)} className="w-full py-3 rounded-xl border border-dashed border-blue-400 text-blue-500 font-bold mt-4">
            + 添加新学员
         </button>
      </div>
    </div>
  );
};

// --- Waitlist Components ---

const WaitlistSignup = ({ 
  product, 
  student, 
  onSubmit, 
  onBack 
}: { 
  product: Product, 
  student: LocalStudent, 
  onSubmit: () => void, 
  onBack: () => void 
}) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative z-30">
      <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm z-10 sticky top-0">
         <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
         <div className="flex-1 text-center font-bold text-lg pr-8">候补申请</div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 pb-24">
         <div className="bg-blue-50 p-4 rounded-xl mb-4">
            <h3 className="font-bold text-gray-800 mb-1">{product.name}</h3>
            <div className="text-sm text-gray-600 mb-2">候补学员: {student.name}</div>
            <div className="text-xs text-orange-500">当前班级已满员，提交申请后将排队等待名额。</div>
         </div>

         <div className="bg-gray-50 p-4 rounded-xl text-sm leading-relaxed text-gray-600 h-[300px] overflow-y-auto border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-2">候补规则</h4>
            <p className="mb-2">亲爱的家长，您好！</p>
            <p className="mb-2">当您心仪的班级名额已满时，可以选择“候补报名”。我们将通过公开、公平的排队机制，帮助您争取入班机会。以下是候补报名的完整流程说明，请您仔细阅读：</p>
            
            <p className="font-bold mt-2">第一步：提交候补申请</p>
            <p className="mb-2">提交成功后，系统将立即显示您的 实时排队位置。</p>

            <p className="font-bold mt-2">第二步：排队规则</p>
            <p className="mb-2">排队顺序按申请提交时间先后排序。您的排队位置会随着队列变化（如有人取消或顺延）实时更新，您可随时查看最新位置。</p>

            <p className="font-bold mt-2">第三步：名额释放与通知</p>
            <p className="mb-2">当班级有空余名额释放时，系统将自动按照排队顺序通知下一位家长。您将通过小程序消息+短信收到通知（请保持手机畅通）。在支付截止前2小时，系统会再次发送提醒，避免您错过。</p>

            <p className="font-bold mt-2">第四步：支付与入班</p>
            <p className="mb-2">收到通知后，请在24小时内完成支付。支付成功后，学生即正式加入班级。若超时未支付，名额将自动顺延给下一位候补家长，您的候补资格将失效。</p>

            <p className="font-bold mt-2">第五步：候补状态说明</p>
            <p className="mb-2">您可随时在小程序或家长端查看自己的候补状态，状态分为：<br/>待处理：已排队，等待名额释放。<br/>已通知：已收到支付通知，正在24小时支付期内。<br/>已转正：支付成功，正式入班。<br/>已过期：超过24小时未支付，候补资格失效。<br/>已取消：您主动取消了候补申请。</p>

            <p className="font-bold mt-2">温馨提示</p>
            <p className="mb-2">候补期间，请确保联系方式准确，并及时关注通知消息。如需帮助，可随时联系我们的客服人员。</p>
            <p>感谢您的理解与支持！祝孩子学习愉快！</p>
         </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 safe-area-bottom">
         <div onClick={() => setAgreed(!agreed)} className="flex items-center gap-2 mb-3 cursor-pointer">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${agreed ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
               {agreed && <span className="text-white text-xs">✓</span>}
            </div>
            <span className="text-xs text-gray-500">我已阅读并同意《候补规则》</span>
         </div>
         <button 
           onClick={agreed ? onSubmit : undefined} 
           className={`w-full py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95 ${agreed ? 'bg-blue-500 text-white shadow-blue-200' : 'bg-gray-200 text-gray-400'}`}
         >
            提交候补申请
         </button>
      </div>
    </div>
  );
};

const WaitlistList = ({ 
  apps, 
  onBack,
  onPay,
  onCancel,
  onSimulateStatus
}: { 
  apps: WaitlistApplication[], 
  onBack: () => void,
  onPay: (app: WaitlistApplication) => void,
  onCancel: (app: WaitlistApplication) => void,
  onSimulateStatus: (app: WaitlistApplication, status: WaitlistApplication['status']) => void
}) => {
   return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative z-20">
      <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm z-10 sticky top-0">
         <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
         <div className="flex-1 text-center font-bold text-lg pr-8">我的候补</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
         {apps.length === 0 && <div className="text-center text-gray-400 mt-20">暂无候补记录</div>}
         {apps.map(app => (
            <div key={app.id}>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                   {/* Header */}
                   <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-base text-gray-800">{app.product.name}</h3>
                      {/* Badge */}
                      {(app.status === 'notified' || app.status === 'reminder') && <span className="text-xs border border-green-400 text-green-500 px-2 py-0.5 rounded">待支付</span>}
                      {app.status === 'converted' && <span className="text-xs border border-blue-400 text-blue-500 px-2 py-0.5 rounded">已转正</span>}
                      {app.status === 'cancelled' && <span className="text-xs border border-gray-300 text-gray-400 px-2 py-0.5 rounded">已取消</span>}
                      {app.status === 'queued' && <span className="text-xs border border-orange-400 text-orange-500 px-2 py-0.5 rounded">排队中</span>}
                      {app.status === 'expired' && <span className="text-xs border border-gray-300 text-gray-400 px-2 py-0.5 rounded">已过期</span>}
                      {app.status === 'failed' && <span className="text-xs border border-red-300 text-red-400 px-2 py-0.5 rounded">已失败</span>}
                   </div>
                   
                   <div className="text-xs text-gray-500 mb-1">学员: {app.student.name}</div>

                   {/* Status Messages Inside Card */}
                   {app.status === 'queued' && (
                       <div className="mb-2 text-xs text-orange-500 font-medium">
                           您当前处于候补队列第 <span className="font-bold text-sm mx-0.5">{app.position}</span> 位。
                       </div>
                   )}
                   {app.status === 'converted' && (
                       <div className="mb-2 text-xs text-blue-500 font-medium">
                           恭喜！已成功加入班级！
                       </div>
                   )}
                   {app.status === 'expired' && (
                       <div className="mb-2 p-1.5 bg-gray-100 text-gray-500 text-xs rounded">
                           您的候补资格已过期。
                       </div>
                   )}
                   {app.status === 'cancelled' && (
                       <div className="mb-2 p-1.5 bg-gray-100 text-gray-500 text-xs rounded">
                           您的候补申请已取消成功
                       </div>
                   )}
                   {app.status === 'failed' && (
                       <div className="mb-2 p-1.5 bg-red-50 text-red-500 text-xs rounded">
                           很遗憾，本次候补未成功。
                       </div>
                   )}
                   
                   {/* Action Content based on status */}
                   {(app.status === 'notified' || app.status === 'reminder') && (
                      <div className={`p-3 rounded-lg mb-3 mt-2 ${app.status === 'reminder' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                         <div className={`text-xs mb-3 font-medium ${app.status === 'reminder' ? 'text-yellow-700' : 'text-green-700'}`}>
                             恭喜！名额已释放，请在规定时间内完成支付。
                         </div>
                         <div className="flex justify-between items-center">
                            <span className={`text-xs font-bold flex items-center gap-1 ${app.status === 'reminder' ? 'text-yellow-600' : 'text-green-600'}`}>
                                截止: <CountdownTimer />
                            </span>
                            <button onClick={() => onPay(app)} className="bg-[#22C55E] text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-sm active:scale-95 transition-transform">立即支付</button>
                         </div>
                      </div>
                   )}

                   <div className="text-[10px] text-gray-400 text-right mb-3">申请时间: {app.createdTime}</div>

                   {/* Debug Bar */}
                   <div className="border-t border-dashed border-gray-100 pt-2">
                       <div className="text-[10px] text-gray-300 mb-2">模拟状态变更 (Debug):</div>
                       <div className="flex flex-wrap gap-2">
                           {[
                               { s: 'queued', label: '排队中', color: 'orange' },
                               { s: 'notified', label: '待支付', color: 'green' },
                               { s: 'reminder', label: '支付提醒', color: 'yellow' },
                               { s: 'converted', label: '已转正', color: 'blue' },
                               { s: 'expired', label: '已过期', color: 'gray' },
                               { s: 'cancelled', label: '已取消', color: 'gray' },
                               { s: 'failed', label: '已失败', color: 'red' },
                           ].map(btn => (
                               <button 
                                 key={btn.s}
                                 onClick={() => onSimulateStatus(app, btn.s as any)}
                                 className={`text-[10px] px-2 py-1 rounded transition-colors
                                    ${btn.color === 'orange' ? 'bg-orange-50 text-orange-600' : ''}
                                    ${btn.color === 'green' ? 'bg-green-50 text-green-600' : ''}
                                    ${btn.color === 'yellow' ? 'bg-yellow-50 text-yellow-600' : ''}
                                    ${btn.color === 'blue' ? 'bg-blue-50 text-blue-600' : ''}
                                    ${btn.color === 'gray' ? 'bg-gray-100 text-gray-500' : ''}
                                    ${btn.color === 'red' ? 'bg-red-50 text-red-500' : ''}
                                    ${app.status === btn.s ? 'ring-2 ring-blue-400 ring-offset-1' : ''} 
                                 `}
                               >
                                   {btn.label}
                               </button>
                           ))}
                       </div>
                   </div>
                </div>
            </div>
         ))}
      </div>
    </div>
   );
};

const NotificationCenter = ({ notifications, onBack, onClickItem }: { notifications: AppNotification[], onBack: () => void, onClickItem: (n: AppNotification) => void }) => {
   return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative z-20">
      <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm z-10 sticky top-0">
         <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
         <div className="flex-1 text-center font-bold text-lg pr-8">消息中心</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
         {notifications.length === 0 && <div className="text-center text-gray-400 mt-20">暂无消息</div>}
         {notifications.map(n => (
            <div 
               key={n.id} 
               onClick={() => onClickItem(n)}
               className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${n.isRead ? 'border-gray-300 opacity-60' : 'border-blue-500'} cursor-pointer active:scale-[0.98] transition-all`}
            >
               <div className="flex justify-between items-center mb-1">
                  <h4 className={`font-bold text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</h4>
                  <span className="text-[10px] text-gray-400">{n.timestamp.split(' ')[1]}</span>
               </div>
               <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed whitespace-pre-wrap">{n.content}</p>
               {!n.isRead && <div className="mt-2 text-[10px] text-blue-500 font-medium">点击查看详情 &gt;</div>}
            </div>
         ))}
      </div>
    </div>
   );
};

const OrderConfirm = ({ 
  product, 
  student, 
  onConfirm, 
  onBack,
  isWaitlistConversion = false
}: { 
  product: Product, 
  student: LocalStudent, 
  onConfirm: () => void, 
  onBack: () => void,
  isWaitlistConversion?: boolean
}) => {
  const cls = CLASSES.find(c => c.id === product.classId);
  const teacher = TEACHERS.find(t => t.id === cls?.teacherId);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative z-30">
      <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm z-10 sticky top-0">
         <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
         <div className="flex-1 text-center font-bold text-lg pr-8">{isWaitlistConversion ? '候补转正支付' : '确认订单'}</div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 pb-24">
         {/* Student Info */}
         <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
            <div className="text-sm text-gray-500 mb-2">报名学员</div>
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${student.gender === '男' ? 'bg-blue-400' : 'bg-pink-400'}`}>
                   {student.name[0]}
               </div>
               <div>
                  <div className="font-bold text-gray-800">{student.name}</div>
                  <div className="text-xs text-gray-400">{student.account}</div>
               </div>
            </div>
         </div>

         {/* Product Info */}
         <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
            <div className="text-sm text-gray-500 mb-2">课程信息</div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2 space-y-1">
               <div className="flex justify-between"><span>班级：</span><span>{cls?.name}</span></div>
               <div className="flex justify-between"><span>校区：</span><span>{cls?.campus}</span></div>
               <div className="flex justify-between"><span>主教：</span><span>{teacher?.name}</span></div>
               <div className="flex justify-between"><span>日期：</span><span>{cls?.startDate} 开课</span></div>
               <div className="flex justify-between"><span>时间：</span><span>{cls?.timeSlot}</span></div>
            </div>
         </div>

         {/* Price Info */}
         <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
               <span className="text-gray-600">课程原价</span>
               <span className="text-gray-800">¥ {product.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
               <span className="text-gray-600">优惠立减</span>
               <span className="text-red-500">- ¥ 0.00</span>
            </div>
            <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between items-center">
               <span className="font-bold text-gray-800">实付金额</span>
               <span className="font-bold text-xl text-red-500">¥ {product.price.toFixed(2)}</span>
            </div>
         </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-3 safe-area-bottom">
         <button onClick={onConfirm} className="w-full bg-[#07C160] text-white py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
            <span>微信支付</span>
            <span>¥{product.price.toFixed(2)}</span>
         </button>
      </div>
    </div>
  );
};

const PaymentResult = ({ onSuccess, onGoHome }: { onSuccess: () => void, onGoHome: () => void }) => {
  return (
     <div className="flex-1 flex flex-col items-center justify-center bg-white h-full relative z-40 p-8">
        <div className="w-20 h-20 bg-[#07C160] rounded-full flex items-center justify-center mb-6 shadow-green-200 shadow-xl">
           <span className="text-white text-4xl font-bold">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">支付成功</h2>
        <p className="text-gray-500 text-center mb-12">您已成功报名该课程，请准时参加学习</p>
        
        <div className="w-full space-y-3">
           <button onClick={onSuccess} className="w-full border border-gray-300 text-gray-700 py-3 rounded-full font-bold">查看订单</button>
           <button onClick={onGoHome} className="w-full bg-gray-100 text-gray-600 py-3 rounded-full font-bold">返回首页</button>
        </div>
     </div>
  );
};

const RefundRequest = ({ order, onSubmit, onBack }: { order: LocalOrder, onSubmit: (reason: string, desc: string) => void, onBack: () => void }) => {
  const [reason, setReason] = useState('课程时间冲突');
  const [description, setDescription] = useState('');

  const reasons = [
    '课程时间冲突',
    '孩子身体原因',
    '对课程内容不满意',
    '其他原因'
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative z-30">
      <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm z-10 sticky top-0">
         <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
         <div className="flex-1 text-center font-bold text-lg pr-8">申请退款</div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
         <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">退款商品</h3>
            <div className="flex gap-3">
               <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0"></div>
               <div>
                  <div className="font-bold text-sm text-gray-800">{order.product.name}</div>
                  <div className="text-xs text-gray-500 mt-1">实付: ¥{order.amount.toFixed(2)}</div>
               </div>
            </div>
         </div>

         <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">退款原因</h3>
            <div className="space-y-2">
               {reasons.map(r => (
                 <div key={r} onClick={() => setReason(r)} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg cursor-pointer active:bg-gray-50">
                    <span className="text-sm text-gray-700">{r}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${reason === r ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                       {reason === r && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">退款说明</h3>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="请详细描述退款原因（选填）"
              className="w-full h-32 bg-gray-50 p-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
         </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-100 safe-area-bottom">
         <button onClick={() => onSubmit(reason, description)} className="w-full bg-blue-500 text-white py-3 rounded-full font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform">
            提交申请
         </button>
      </div>
    </div>
  );
};

const OrderDetail = ({ order, onBack, onPay, onRefund }: { order: LocalOrder, onBack: () => void, onPay: (o: LocalOrder) => void, onRefund: (o: LocalOrder) => void }) => {
  const getStatusText = (status: LocalOrder['status']) => {
     switch(status) {
        case 'paid': return '已支付';
        case 'pending': return '待支付';
        case 'refunding': return '退款中';
        case 'refunded': return '已退款';
     }
  };

  const getStatusColor = (status: LocalOrder['status']) => {
     switch(status) {
        case 'paid': return 'text-green-500';
        case 'pending': return 'text-orange-500';
        case 'refunding': return 'text-purple-500';
        case 'refunded': return 'text-gray-500';
     }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative z-30">
      <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm z-10 sticky top-0">
         <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
         <div className="flex-1 text-center font-bold text-lg pr-8">订单详情</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
         {/* Status Header */}
         <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg shadow-blue-200">
            <div className="font-bold text-xl mb-1">{getStatusText(order.status)}</div>
            <div className="text-xs opacity-80">
               {order.status === 'pending' && '请在15分钟内完成支付'}
               {order.status === 'paid' && '您已成功购买，请准时上课'}
               {order.status === 'refunding' && '您的退款申请正在处理中'}
               {order.status === 'refunded' && '退款已原路返回'}
            </div>
         </div>

         {/* Product Info */}
         <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">课程信息</h3>
            <div className="flex gap-3 mb-4">
               <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0"></div>
               <div>
                  <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{order.product.name}</h4>
                  <div className="text-xs text-gray-500 mt-1 space-y-1">
                     <div>班级: {order.classInfo.name}</div>
                     <div>校区: {order.classInfo.campus}</div>
                     <div>时间: {order.classInfo.timeSlot}</div>
                  </div>
               </div>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
               <span className="text-sm text-gray-600">实付金额</span>
               <span className="font-bold text-lg text-red-500">¥{order.amount.toFixed(2)}</span>
            </div>
         </div>

         {/* Order Info */}
         <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
            <h3 className="font-bold text-gray-800 mb-1 text-sm">订单信息</h3>
            <div className="flex justify-between text-xs">
               <span className="text-gray-500">订单编号</span>
               <span className="text-gray-800 font-mono">{order.id}</span>
            </div>
            <div className="flex justify-between text-xs">
               <span className="text-gray-500">下单时间</span>
               <span className="text-gray-800">{order.createdTime}</span>
            </div>
            <div className="flex justify-between text-xs">
               <span className="text-gray-500">学员姓名</span>
               <span className="text-gray-800">{order.student.name}</span>
            </div>
            {order.refundReason && (
               <div className="flex justify-between text-xs pt-2 border-t border-gray-100">
                  <span className="text-gray-500">退款原因</span>
                  <span className="text-gray-800">{order.refundReason}</span>
               </div>
            )}
         </div>
      </div>

      {/* Action Bar */}
      <div className="p-4 bg-white border-t border-gray-100 safe-area-bottom flex justify-end gap-3">
         {order.status === 'pending' && (
            <>
               <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-600 text-sm">取消订单</button>
               <button onClick={() => onPay(order)} className="px-6 py-2 rounded-full bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-200">立即支付</button>
            </>
         )}
         {order.status === 'paid' && (
            <button onClick={() => onRefund(order)} className="px-4 py-2 rounded-full border border-gray-300 text-gray-600 text-sm">申请退款</button>
         )}
         {order.status === 'refunding' && (
            <button className="px-4 py-2 rounded-full bg-gray-100 text-blue-500 text-sm font-bold cursor-default">退款审核中</button>
         )}
      </div>
    </div>
  );
};

const OrderList = ({ orders, onBack, onSelectOrder }: { orders: LocalOrder[], onBack: () => void, onSelectOrder: (o: LocalOrder) => void }) => {
   const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'refund'>('all');

   const filteredOrders = orders.filter(o => {
      if (filter === 'all') return true;
      if (filter === 'refund') return o.status === 'refunding' || o.status === 'refunded';
      return o.status === filter;
   });

   return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative z-20">
      <div className="bg-white px-4 pt-12 pb-0 flex flex-col shadow-sm z-10 sticky top-0">
         <div className="flex items-center mb-3">
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
            <div className="flex-1 text-center font-bold text-lg pr-8">我的订单</div>
         </div>
         {/* Tabs */}
         <div className="flex justify-around text-sm">
            {['all', 'pending', 'paid', 'refund'].map(f => (
               <div 
                 key={f}
                 onClick={() => setFilter(f as any)}
                 className={`pb-3 relative cursor-pointer ${filter === f ? 'text-blue-500 font-bold' : 'text-gray-500'}`}
               >
                  {f === 'all' && '全部'}
                  {f === 'pending' && '待支付'}
                  {f === 'paid' && '已完成'}
                  {f === 'refund' && '退款/售后'}
                  {filter === f && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-500 rounded-full"></div>}
               </div>
            ))}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
         {filteredOrders.length === 0 && <div className="text-center text-gray-400 mt-20">暂无相关订单</div>}
         {filteredOrders.map(order => (
            <div key={order.id} onClick={() => onSelectOrder(order)} className="bg-white p-4 rounded-xl shadow-sm active:scale-[0.99] transition-transform">
               <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">订单号: {order.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                     order.status === 'paid' ? 'text-green-600 bg-green-50' :
                     order.status === 'pending' ? 'text-orange-600 bg-orange-50' :
                     'text-purple-600 bg-purple-50'
                  }`}>
                     {order.status === 'paid' && '已支付'}
                     {order.status === 'pending' && '待支付'}
                     {order.status === 'refunding' && '退款中'}
                     {order.status === 'refunded' && '已退款'}
                  </span>
               </div>
               <div className="flex gap-3 mb-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0"></div>
                  <div>
                     <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{order.product.name}</h4>
                     <div className="text-xs text-gray-400 mt-1">学员: {order.student.name}</div>
                  </div>
               </div>
               <div className="flex justify-end items-center gap-2">
                  <span className="text-xs text-gray-500">实付:</span>
                  <span className="font-bold text-lg text-gray-800">¥{order.amount.toFixed(2)}</span>
               </div>
            </div>
         ))}
      </div>
    </div>
   );
};

const EnrolledCourseList = ({ orders, onBack }: { orders: LocalOrder[], onBack: () => void }) => {
   return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative z-20">
      <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm z-10 sticky top-0">
         <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
         <div className="flex-1 text-center font-bold text-lg pr-8">我的班级</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
         {orders.length === 0 && <div className="text-center text-gray-400 mt-20">暂无班级</div>}
         {orders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
               <h3 className="font-bold text-gray-800 text-lg">{order.classInfo.name}</h3>
               <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                     <span>📍 {order.classInfo.campus}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span>🕒 {order.classInfo.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span>👤 {order.student.name}</span>
                  </div>
               </div>
               <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                  <button className="text-blue-500 text-sm font-medium border border-blue-200 px-4 py-1 rounded-full">查看课表</button>
               </div>
            </div>
         ))}
      </div>
    </div>
   );
};

const StudentManagement = ({ 
  students, 
  setStudents, 
  onBack,
  onSwitchStudent
}: { 
  students: LocalStudent[], 
  setStudents: React.Dispatch<React.SetStateAction<LocalStudent[]>>, 
  onBack: () => void,
  onSwitchStudent: (id: string) => void
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<LocalStudent | null>(null);
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'男'|'女'>('男');

  const handleAdd = () => {
    if (!formName) return;
    // Generate simple ID/Account
    const newId = (20250000 + students.length + 1).toString();
    const newStudent: LocalStudent = {
        id: newId,
        name: formName,
        gender: formGender,
        account: `S${newId}`,
        active: false
    };
    setStudents([...students, newStudent]);
    setIsAdding(false);
    setFormName('');
  };

  const handleSaveEdit = () => {
    if (!editingStudent || !formName) return;
    setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, name: formName, gender: formGender } : s));
    setEditingStudent(null);
    setFormName('');
  };

  const handleUnbind = (id: string) => {
    if (confirm('确定要解绑该学员吗？此操作无法撤销。')) {
        setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const openAdd = () => {
      setFormName('');
      setFormGender('男');
      setIsAdding(true);
  };

  const openEdit = (s: LocalStudent) => {
      setFormName(s.name);
      setFormGender(s.gender);
      setEditingStudent(s);
  };

  if (isAdding || editingStudent) {
      return (
        <div className="flex-1 flex flex-col bg-white h-full relative z-30">
            <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm z-10">
                <button onClick={() => { setIsAdding(false); setEditingStudent(null); }} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
                <div className="flex-1 text-center font-bold text-lg pr-8">{isAdding ? '添加新学员' : '编辑学员信息'}</div>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">学员姓名</label>
                    <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-gray-50 p-3 rounded-lg" placeholder="请输入姓名" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">性别</label>
                    <div className="flex gap-4">
                        <button onClick={() => setFormGender('男')} className={`flex-1 py-2 rounded-lg border ${formGender === '男' ? 'border-blue-500 bg-blue-50 text-blue-500' : 'border-gray-200'}`}>男</button>
                        <button onClick={() => setFormGender('女')} className={`flex-1 py-2 rounded-lg border ${formGender === '女' ? 'border-pink-500 bg-pink-50 text-pink-500' : 'border-gray-200'}`}>女</button>
                    </div>
                </div>
                {isAdding && (
                    <div className="text-xs text-gray-400 mt-2">
                        * 系统将自动为新学员生成学号作为登录账号
                    </div>
                )}
                <button onClick={isAdding ? handleAdd : handleSaveEdit} className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold mt-4 shadow-lg shadow-blue-200">
                    {isAdding ? '确认添加' : '保存修改'}
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative z-20">
      <div className="bg-white px-4 pt-12 pb-3 flex items-center shadow-sm z-10 sticky top-0">
         <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xl font-bold"><IconBack /></button>
         <div className="flex-1 text-center font-bold text-lg pr-8">学员管理</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
         {students.map(student => (
            <div 
              key={student.id} 
              className={`bg-white p-5 rounded-xl shadow-sm border-2 transition-all ${
                student.active ? 'border-blue-500 bg-blue-50/10' : 'border-transparent'
              }`}
            >
               <div className="flex items-center justify-between mb-3" onClick={() => onSwitchStudent(student.id)}>
                   <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                        student.gender === '男' ? 'bg-blue-400' : 'bg-pink-400'
                      }`}>
                         {student.name[0]}
                      </div>
                      <div>
                         <div className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                            {student.name}
                            {student.active && <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-md font-normal">当前</span>}
                         </div>
                         <div className="text-sm text-gray-500 mt-1">学号：{student.account}</div>
                         <div className="text-sm text-gray-400 mt-0.5">性别：{student.gender}</div>
                      </div>
                   </div>
                   {/* Switch Indication if not active */}
                   {!student.active && (
                       <div className="text-blue-500 text-sm border border-blue-200 rounded-full px-3 py-1 cursor-pointer">
                           切换
                       </div>
                   )}
               </div>
               
               <div className="border-t border-gray-100 pt-3 flex justify-end gap-3">
                   <button onClick={() => openEdit(student)} className="text-sm text-gray-500 px-3 py-1 border border-gray-200 rounded-full hover:bg-gray-50">
                       编辑
                   </button>
                   <button onClick={() => handleUnbind(student.id)} className="text-sm text-red-500 px-3 py-1 border border-gray-200 rounded-full hover:border-red-200 hover:bg-red-50">
                       解绑
                   </button>
               </div>
            </div>
         ))}

         <div className="pt-4">
            <button onClick={openAdd} className="w-full py-3.5 rounded-xl border border-dashed border-blue-400 text-blue-500 font-bold bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
               <span className="text-xl">+</span> 添加新学员
            </button>
         </div>
         
         <div className="text-center text-xs text-gray-400 mt-2">
            温馨提示：点击学员卡片可切换当前显示的学员
         </div>
      </div>
    </div>
  );
};

// --- Tab Components ---

const HomeTab = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-20 no-scrollbar">
       {/* Famous Teacher */}
       <div className="bg-white m-3 p-4 rounded-xl shadow-sm">
         <div className="text-base font-bold text-gray-800 mb-4">名师风采</div>
         <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex-shrink-0"></div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="font-bold text-lg text-gray-800">Amanda</span>
                 <span className="bg-[#E9B147] text-white text-[10px] px-1.5 py-0.5 rounded">英语</span>
              </div>
              <p className="text-xs text-gray-400">思悦体系主创成员，10年以上教学经验</p>
            </div>
         </div>
         <div className="flex justify-center gap-1.5 mt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
         </div>
       </div>

       {/* Campus Environment */}
       <div className="bg-white m-3 p-4 rounded-xl shadow-sm">
         <div className="text-base font-bold text-gray-800 mb-4">校区环境</div>
         <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
            <div className="w-[240px] h-[140px] bg-indigo-100 rounded-lg flex-shrink-0 relative overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/10">
                 <span className="text-2xl font-bold text-indigo-800 opacity-20">SiYue Academy</span>
               </div>
               <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-30"></div>
               <div className="absolute bottom-3 left-3 text-white font-bold shadow-sm">大行宫校区</div>
            </div>
            <div className="w-[100px] h-[140px] bg-gray-100 rounded-lg flex-shrink-0"></div>
         </div>
       </div>

       {/* Brand Intro */}
       <div className="bg-white m-3 p-4 rounded-xl shadow-sm">
          <div className="text-base font-bold text-gray-800 mb-4">品牌介绍</div>
          <p className="text-sm text-gray-600 leading-relaxed">
            思悦成立于2019年，总部位于南京，主要从事3-14岁孩子国际教育、语言培训、留学咨询等业务，现有10个校区，学生量1000+。
          </p>
       </div>
    </div>
  );
};

const CourseListTab = ({ onSelectCourse }: { onSelectCourse: (p: Product) => void }) => {
  const [filterCampus, setFilterCampus] = useState('');
  
  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
      {/* Header & Filter */}
      <div className="bg-white px-4 pt-4 pb-2 sticky top-0 z-10 shadow-sm">
         <div className="flex justify-between items-center text-sm text-gray-600 pb-2">
            <div className="flex items-center gap-1 cursor-pointer">校区 <span className="text-[10px]">▼</span></div>
            <div className="flex items-center gap-1 cursor-pointer">老师 <span className="text-[10px]">▼</span></div>
            <div className="flex items-center gap-1 cursor-pointer">班型 <span className="text-[10px]">▼</span></div>
            <div className="flex items-center gap-1 cursor-pointer">筛选 <span className="text-[10px]">▼</span></div>
         </div>
      </div>

      {/* List - Added pb-24 to content container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar pb-24">
         {PRODUCTS.map(product => {
            const cls = CLASSES.find(c => c.id === product.classId);
            const teacher = TEACHERS.find(t => t.id === cls?.teacherId);
            if (!cls || product.status !== 'active') return null;

            const remaining = (cls.capacity || 0) - (cls.studentCount || 0);
            const isFull = remaining <= 0;

            return (
              <div key={product.id} onClick={() => onSelectCourse(product)} className="bg-white p-4 rounded-xl shadow-sm active:scale-[0.99] transition-transform">
                 <div className="flex items-start gap-2 mb-2">
                    <span className="bg-blue-500 text-white text-[10px] px-1 py-0.5 rounded flex-shrink-0">面授</span>
                    <h3 className="font-bold text-base text-gray-800 leading-tight flex-1">
                      {product.name} | {teacher?.name || '待定'}
                    </h3>
                 </div>
                 
                 <div className="text-xs text-gray-500 mb-2">
                    {cls.scheduleDescription || cls.startDate}
                 </div>
                 
                 <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <span>📍 {cls.campus || '未知校区'}</span>
                 </div>
                 
                 <div className="flex gap-2 mb-4">
                    <span className="border border-gray-200 text-gray-400 text-[10px] px-1.5 py-0.5 rounded">需测评</span>
                 </div>
                 
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher?.id}`} className="w-6 h-6 rounded-full bg-gray-100" />
                       <span className="text-xs text-gray-600">{teacher?.name}</span>
                       <span className="bg-gray-100 text-gray-400 text-[10px] px-1 rounded">主讲</span>
                    </div>
                 </div>

                 <div className="mt-3 pt-3 border-t border-dashed border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       {isFull ? (
                          <div className="text-xs border border-gray-300 text-gray-400 px-1 py-0.5 rounded">已报满</div>
                       ) : (
                          <div className="text-xs border border-blue-200 text-blue-500 px-1 py-0.5 rounded">热报中</div>
                       )}
                       <div className={`text-xs ${isFull ? 'text-gray-400' : 'text-orange-500'}`}>
                          剩余{Math.max(0, remaining)}人
                       </div>
                    </div>
                    
                    <div className="text-red-500 font-bold">
                       <span className="text-sm">¥</span>
                       <span className="text-lg">{product.price.toFixed(2)}</span>
                       <span className="text-xs text-gray-400 font-normal ml-1">/ {CLASSES.find(c => c.id === product.classId)?.scheduleDescription?.split(' ').length || 7}课次</span>
                    </div>
                 </div>
              </div>
            );
         })}
      </div>
    </div>
  );
};

const CourseDetail = ({ 
  product, 
  onBack, 
  onSignup,
  onJoinWaitlist
}: { 
  product: Product, 
  onBack: () => void, 
  onSignup: () => void,
  onJoinWaitlist: () => void
}) => {
  const cls = CLASSES.find(c => c.id === product.classId);
  const teacher = TEACHERS.find(t => t.id === cls?.teacherId);
  const remaining = (cls?.capacity || 0) - (cls?.studentCount || 0);
  const isFull = remaining <= 0;

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative z-20 overflow-hidden">
      {/* Navbar */}
      <div className="absolute top-0 left-0 w-full p-4 flex items-center z-10">
         <button onClick={onBack} className="w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
            <IconBack />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
         {/* Top Card */}
         <div className="bg-gradient-to-b from-blue-50 to-white pt-16 px-4 pb-4">
             <div className="flex gap-4">
                <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                   <span className="text-2xl">📚</span>
                </div>
                <div className="flex-1">
                   <h1 className="font-bold text-lg text-gray-800 leading-tight mb-2">
                     {product.name} | {teacher?.name}
                   </h1>
                   <div className="flex gap-2 mb-2">
                      <span className="text-xs text-gray-500">思悦</span>
                      <span className="bg-blue-500 text-white text-[10px] px-1 py-0.5 rounded">面授</span>
                   </div>
                </div>
             </div>
             
             <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                   <span className="text-gray-400">📍</span>
                   <span>{cls?.campus}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-gray-400">🕒</span>
                   <span>{cls?.scheduleDescription}</span>
                </div>
             </div>
             
             <div className="mt-4 flex items-baseline gap-2">
                 <span className="text-red-500 font-bold text-2xl">¥ {product.price.toFixed(2)}</span>
             </div>
             <div className="text-xs text-orange-400 mt-1">
                剩余名额{Math.max(0, remaining)}人
             </div>
         </div>

         <div className="h-2 bg-gray-50"></div>

         {/* Teacher */}
         <div className="p-4">
            <h3 className="font-bold text-gray-800 mb-3">授课老师</h3>
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0"></div>
               <div>
                  <div className="font-bold text-gray-800">{teacher?.name}</div>
                  <div className="text-xs text-gray-500">主讲</div>
               </div>
            </div>
         </div>

         <div className="h-2 bg-gray-50"></div>

         {/* Details Tabs */}
         <div>
            <div className="flex border-b border-gray-100">
               <div className="flex-1 py-3 text-center text-sm font-bold border-b-2 border-black">商品详情</div>
               <div className="flex-1 py-3 text-center text-sm text-gray-500">教学计划</div>
               <div className="flex-1 py-3 text-center text-sm text-gray-500">费用明细</div>
            </div>
            <div className="p-6 bg-gray-50 min-h-[300px] flex flex-col items-center">
                <div className="text-xl font-bold text-gray-300 mb-4">思悦 SiYue Academy</div>
                
                {/* Updated Placeholder Image - Removed inner circle avatar as requested */}
                <div className="w-full h-[200px] bg-white rounded-xl shadow-sm flex items-center justify-center relative border border-gray-100">
                   {/* Removed content */}
                </div>
            </div>
         </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-3 flex items-center justify-between safe-area-bottom">
         <div className="text-sm">
            合计: <span className="text-orange-500 font-bold">¥ {product.price.toFixed(2)}</span>
         </div>
         <button 
            onClick={isFull ? onJoinWaitlist : onSignup}
            className={`px-8 py-2 rounded-full font-bold shadow-lg transition-transform active:scale-95 ${
            isFull 
            ? 'bg-orange-400 shadow-orange-200 text-white' 
            : 'bg-blue-500 text-white shadow-blue-200'
         }`}>
            {isFull ? '候补报名' : '立即报名'}
         </button>
      </div>
    </div>
  );
};

const ProfileTab = ({ 
  onManageStudents, 
  onOpenSchedule,
  onOpenOrders,
  onOpenCourses,
  onOpenWaitlist,
  onOpenNotifications,
  onOpenTransfer,
  unreadCount,
  activeStudent
}: { 
  onManageStudents: () => void, 
  onOpenSchedule: () => void,
  onOpenOrders: () => void,
  onOpenCourses: () => void,
  onOpenWaitlist: () => void,
  onOpenNotifications: () => void,
  onOpenTransfer: () => void,
  unreadCount: number,
  activeStudent: LocalStudent | undefined
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-20 no-scrollbar relative">
       {/* Header */}
       <div className="bg-blue-500 text-white pt-12 pb-8 px-6">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-4">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50" />
                <div>
                   <div className="text-xl font-bold mb-1">{activeStudent?.name || '请选择学员'}</div>
                   <div className="bg-white/20 text-xs px-2 py-0.5 rounded inline-block">家长: 15333333333</div>
                </div>
             </div>
             <div className="flex gap-2">
                 <button onClick={onOpenNotifications} className="relative bg-white/20 p-2 rounded-full backdrop-blur-sm active:bg-white/30 transition-colors">
                    <span className="text-base text-white"><IconMessage /></span>
                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{unreadCount}</span>}
                 </button>
                 {/* Add Student Button */}
                 <button onClick={onManageStudents} className="bg-white/20 px-3 py-1.5 rounded-full text-xs backdrop-blur-sm active:bg-white/30 transition-colors h-9">
                    学员管理
                 </button>
             </div>
          </div>
       </div>

       {/* Orders */}
       <div className="bg-white mt-3 p-4">
          <div className="text-base font-bold text-gray-800 mb-4" onClick={onOpenOrders}>我的订单</div>
          <div className="flex justify-around px-4">
             <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={onOpenOrders}>
                <div className="text-blue-500"><IconMyOrders /></div>
                <span className="text-xs text-gray-600">我的订单</span>
             </div>
             <div className="flex flex-col items-center gap-2 cursor-pointer">
                <div className="text-orange-500"><IconCoupon /></div>
                <span className="text-xs text-gray-600">优惠券</span>
             </div>
          </div>
       </div>

       {/* Services */}
       <div className="bg-white mt-3 p-4">
          <div className="text-base font-bold text-gray-800 mb-4">课程服务</div>
          <div className="grid grid-cols-4 gap-y-6 gap-x-2 px-2">
             <div onClick={onOpenSchedule} className="flex flex-col items-center gap-2 cursor-pointer active:opacity-60">
                <div className="text-blue-500"><IconMySchedule /></div>
                <span className="text-xs text-gray-600">我的课表</span>
             </div>
             <div onClick={onOpenWaitlist} className="flex flex-col items-center gap-2 cursor-pointer active:opacity-60">
                <div className="text-orange-500"><IconMyWaitlist /></div>
                <span className="text-xs text-gray-600">我的候补</span>
             </div>
             <div className="flex flex-col items-center gap-2 cursor-pointer active:opacity-60">
                <div className="text-green-500"><IconReschedule /></div>
                <span className="text-xs text-gray-600">调课</span>
             </div>
             <div onClick={onOpenTransfer} className="flex flex-col items-center gap-2 cursor-pointer active:opacity-60">
                <div className="text-purple-500"><IconTransfer /></div>
                <span className="text-xs text-gray-600">转班</span>
             </div>
          </div>
       </div>
    </div>
  );
};

// Main Parents App Container
const ParentsApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Navigation States
  const [showStudentManagement, setShowStudentManagement] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTransferList, setShowTransferList] = useState(false);
  const [showTransferHistory, setShowTransferHistory] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LocalOrder | null>(null);
  const [refundTargetOrder, setRefundTargetOrder] = useState<LocalOrder | null>(null);
  const [transferTargetClass, setTransferTargetClass] = useState<any>(null); // For modal

  // Enrollment Flow States
  const [enrollmentStep, setEnrollmentStep] = useState<'none' | 'select-student' | 'select-student-waitlist' | 'waitlist-signup' | 'confirm' | 'waitlist-pay' | 'success'>('none');
  const [targetStudent, setTargetStudent] = useState<LocalStudent | null>(null);

  // Data States (Mocking backend)
  const [students, setStudents] = useState<LocalStudent[]>([
    { id: '1', name: '秦思', account: 'S20250001', gender: '男', active: true },
    { id: '2', name: 'sury', account: 'S20250002', gender: '女', active: false },
  ]);
  
  const activeStudent = students.find(s => s.active) || students[0];

  // 7 Mock Orders covering all scenarios
  const [orders, setOrders] = useState<LocalOrder[]>([
    { id: 'ORD-001', product: PRODUCTS[0], classInfo: CLASSES[2], student: students[0], amount: 2999, status: 'paid', createdTime: '2025-07-01 10:00:00' },
    { id: 'ORD-002', product: PRODUCTS[1], classInfo: CLASSES[3], student: students[0], amount: 2555, status: 'pending', createdTime: '2025-07-02 11:30:00' },
    { id: 'ORD-003', product: PRODUCTS[2], classInfo: CLASSES[4], student: students[1], amount: 3299, status: 'paid', createdTime: '2025-07-03 09:15:00' },
    { id: 'ORD-004', product: PRODUCTS[3], classInfo: CLASSES[6], student: students[1], amount: 1899, status: 'refunding', createdTime: '2025-07-04 14:20:00', refundReason: '时间冲突' },
    { id: 'ORD-005', product: PRODUCTS[0], classInfo: CLASSES[2], student: students[1], amount: 2999, status: 'refunded', createdTime: '2025-06-28 16:45:00', refundReason: '报错了' },
    { id: 'ORD-006', product: PRODUCTS[1], classInfo: CLASSES[3], student: students[0], amount: 2555, status: 'paid', createdTime: '2025-07-05 10:30:00' },
    { id: 'ORD-007', product: PRODUCTS[2], classInfo: CLASSES[4], student: students[0], amount: 3299, status: 'pending', createdTime: '2025-07-06 13:00:00' },
  ]);

  const [waitlistApps, setWaitlistApps] = useState<WaitlistApplication[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [transferApps, setTransferApps] = useState<TransferApplication[]>([
      {
          id: 'ta-1',
          originalClass: '25暑-K3-进阶-1班',
          targetClass: '25暑-K3-进阶-2班',
          targetClassInfo: { date: '每周五', time: '14:00', campus: '奥南校区', teacher: 'Ruby张露' },
          status: 'approved',
          reason: '时间更合适',
          requestTime: '2025-07-10 14:30'
      },
      {
          id: 'ta-2',
          originalClass: '25暑-K3-进阶-1班',
          targetClass: '25暑-K3-进阶-3班',
          targetClassInfo: { date: '每周六', time: '09:00', campus: '龙江校区', teacher: 'Angel严义洁' },
          status: 'rejected',
          reason: '想换个老师',
          requestTime: '2025-07-12 09:00',
          rejectReason: '目标班级已满员'
      }
  ]);

  // Handlers
  const handleStartSignup = () => {
     setEnrollmentStep('select-student');
  };

  const handleStartWaitlist = () => {
     setEnrollmentStep('select-student-waitlist');
  };

  const handleStudentSelect = (s: LocalStudent) => {
     setTargetStudent(s);
     if (enrollmentStep === 'select-student') {
        setEnrollmentStep('confirm');
     } else if (enrollmentStep === 'select-student-waitlist') {
        setEnrollmentStep('waitlist-signup');
     }
  };

  const handleAddStudent = (name: string, gender: '男' | '女') => {
     // Generate ID and Account
     const newId = (Date.now()).toString().slice(-6); 
     const account = `S${new Date().getFullYear()}${newId}`;
     const newS: LocalStudent = {
        id: newId,
        name,
        gender,
        account,
        active: false
     };
     setStudents([...students, newS]);
     // If adding during flow, auto select
     if (enrollmentStep === 'select-student') {
        setTargetStudent(newS);
        setEnrollmentStep('confirm');
     } else if (enrollmentStep === 'select-student-waitlist') {
        setTargetStudent(newS);
        setEnrollmentStep('waitlist-signup');
     }
  };

  const handleSwitchStudent = (id: string) => {
      setStudents(prev => prev.map(s => ({
          ...s,
          active: s.id === id
      })));
  };

  const handleWaitlistSubmit = () => {
    if (!selectedProduct || !targetStudent) return;
    
    // Create Waitlist App
    const newApp: WaitlistApplication = {
      id: `wl-${Date.now()}`,
      product: selectedProduct,
      student: targetStudent,
      position: Math.floor(Math.random() * 5) + 1, // Mock position
      status: 'queued',
      createdTime: new Date().toLocaleString()
    };
    
    setWaitlistApps([newApp, ...waitlistApps]);
    
    // Auto-Simulate Notification after 3 seconds for demo purposes
    setTimeout(() => {
        handleSimulateStatus(newApp, 'notified');
    }, 5000);

    alert("候补申请提交成功！请在'我的候补'中查看状态。");
    setEnrollmentStep('none');
    setSelectedProduct(null);
    setShowWaitlist(true); // Redirect to waitlist view
  };

  const handleSimulateStatus = (app: WaitlistApplication, newStatus: WaitlistApplication['status']) => {
    // Helper to add notification
    const pushNotification = (title: string, content: string, type: AppNotification['type']) => {
        const newNotif: AppNotification = {
           id: `notif-${Date.now()}`,
           title,
           content,
           type,
           relatedId: app.id,
           isRead: false,
           timestamp: new Date().toLocaleTimeString()
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const commonData = {
        className: app.product.name,
        studentName: app.student.name,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };

    // Update App Status (including 'reminder' which is now a status)
    const statusUpdate: Partial<WaitlistApplication> = { status: newStatus };
    if (newStatus === 'notified') {
        statusUpdate.notificationTime = new Date().toLocaleString();
        statusUpdate.deadline = '24小时内';
    } else if (newStatus === 'queued') {
        statusUpdate.notificationTime = undefined;
        statusUpdate.deadline = undefined;
    }

    setWaitlistApps(prev => prev.map(a => a.id === app.id ? { ...a, ...statusUpdate } : a));

    // Send Status-Specific Notification
    if (newStatus === 'reminder') {
        // Special case: send notification but visual state change is handled by app.status = 'reminder'
        const tmpl = getNotificationTemplate('reminder', commonData);
        pushNotification(tmpl.title, tmpl.content, 'waitlist_alert');
    } else if (newStatus === 'notified') {
        const tmpl = getNotificationTemplate('success', commonData);
        pushNotification(tmpl.title, tmpl.content, 'waitlist_pay');
    } else if (newStatus === 'failed') {
        const tmpl = getNotificationTemplate('failed', commonData);
        pushNotification(tmpl.title, tmpl.content, 'waitlist_info');
    } else if (newStatus === 'expired') {
        const tmpl = getNotificationTemplate('expired', commonData);
        pushNotification(tmpl.title, tmpl.content, 'waitlist_alert');
    } else if (newStatus === 'cancelled') {
        const tmpl = getNotificationTemplate('cancelled', commonData);
        pushNotification(tmpl.title, tmpl.content, 'waitlist_info');
    }
  };

  const handleCancelWaitlist = (app: WaitlistApplication) => {
      handleSimulateStatus(app, 'cancelled');
  };

  const handleProceedToPayWaitlist = (app: WaitlistApplication) => {
      setSelectedProduct(app.product);
      setTargetStudent(app.student);
      setEnrollmentStep('waitlist-pay');
      setShowWaitlist(false);
  };

  const handlePayment = () => {
     // Mock API Call
     setTimeout(() => {
        if (!selectedProduct || !targetStudent) return;
        
        const cls = CLASSES.find(c => c.id === selectedProduct.classId);
        if (!cls) return;

        const newOrder: LocalOrder = {
           id: `ORD${Date.now()}`,
           product: selectedProduct,
           classInfo: cls,
           student: targetStudent,
           amount: selectedProduct.price,
           status: 'paid',
           createdTime: new Date().toLocaleString()
        };
        
        setOrders([newOrder, ...orders]);
        
        // If coming from waitlist conversion, update waitlist status
        if (enrollmentStep === 'waitlist-pay') {
             // Find specific app and update status via simulation to ensure logic consistency
             const app = waitlistApps.find(a => a.product.id === selectedProduct.id && a.student.id === targetStudent.id);
             if (app) {
                 // Direct status update since payment success is handled here
                 setWaitlistApps(prev => prev.map(a => a.id === app.id ? { ...a, status: 'converted' } : a));
             }
        }

        setEnrollmentStep('success');
     }, 1000); // 1s loading simulation
  };

  const handlePayOrder = (order: LocalOrder) => {
      // Simulate paying an existing pending order
      setTimeout(() => {
         setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'paid' } : o));
         setSelectedOrder(prev => prev ? { ...prev, status: 'paid' } : null); // Update if viewing details
      }, 1000);
  };

  const handleStartRefund = (order: LocalOrder) => {
     setRefundTargetOrder(order);
  };

  const handleSubmitRefund = (reason: string, desc: string) => {
     if (!refundTargetOrder) return;
     setOrders(prev => prev.map(o => o.id === refundTargetOrder.id ? { 
         ...o, 
         status: 'refunding',
         refundReason: reason + (desc ? `: ${desc}` : ''),
         refundTime: new Date().toLocaleString()
     } : o));
     setRefundTargetOrder(null);
     setSelectedOrder(prev => prev ? { ...prev, status: 'refunding' } : null);
  };

  const handleSubmitTransfer = (reason: string) => {
      if (!transferTargetClass) return;
      const currentClass = orders.find(o => o.student.id === activeStudent.id && o.status === 'paid')?.classInfo;
      const newApp: TransferApplication = {
          id: `ta-${Date.now()}`,
          originalClass: currentClass?.name || '未知班级',
          targetClass: transferTargetClass.name,
          targetClassInfo: {
              date: transferTargetClass.scheduleDescription,
              time: transferTargetClass.timeSlot,
              campus: transferTargetClass.campus,
              teacher: transferTargetClass.teacherName
          },
          status: 'pending',
          reason: reason,
          requestTime: new Date().toLocaleString()
      };
      setTransferApps([newApp, ...transferApps]);
      setTransferTargetClass(null);
      alert('转班申请提交成功！');
  };

  const handleEnrollmentSuccess = () => {
     setEnrollmentStep('none');
     setSelectedProduct(null);
     setActiveTab('profile');
     setShowOrders(true);
  };

  const handleNotificationClick = (n: AppNotification) => {
      // Mark as read
      setNotifications(prev => prev.map(item => item.id === n.id ? {...item, isRead: true} : item));
      
      if (n.type === 'waitlist_pay' && n.relatedId) {
          const app = waitlistApps.find(a => a.id === n.relatedId);
          if (app && app.status === 'notified') {
             setSelectedProduct(app.product);
             setTargetStudent(app.student);
             setEnrollmentStep('waitlist-pay');
             setShowNotifications(false);
          }
      }
  };

  const resetAllViews = () => {
    setShowStudentManagement(false);
    setShowSchedule(false);
    setShowOrders(false);
    setShowCourses(false);
    setShowWaitlist(false);
    setShowNotifications(false);
    setShowTransferList(false);
    setShowTransferHistory(false);
    setEnrollmentStep('none');
    setSelectedProduct(null);
    setSelectedOrder(null);
    setRefundTargetOrder(null);
    setTransferTargetClass(null);
  };

  const renderContent = () => {
    // 1. Enrollment Flow Overrides
    if (enrollmentStep === 'select-student' || enrollmentStep === 'select-student-waitlist') {
       return <StudentSelector 
         students={students} 
         onSelect={handleStudentSelect} 
         onAddStudent={handleAddStudent}
         onBack={() => setEnrollmentStep('none')}
         title={enrollmentStep === 'select-student-waitlist' ? '选择候补学员' : '选择报名学员'}
       />;
    }
    if (enrollmentStep === 'waitlist-signup' && selectedProduct && targetStudent) {
        return <WaitlistSignup 
          product={selectedProduct}
          student={targetStudent}
          onSubmit={handleWaitlistSubmit}
          onBack={() => setEnrollmentStep('select-student-waitlist')}
        />;
    }
    if ((enrollmentStep === 'confirm' || enrollmentStep === 'waitlist-pay') && selectedProduct && targetStudent) {
       return <OrderConfirm 
         product={selectedProduct} 
         student={targetStudent} 
         onConfirm={handlePayment} 
         onBack={() => setEnrollmentStep(enrollmentStep === 'confirm' ? 'select-student' : 'none')} // waitlist pay back goes to none/profile for simplicity
         isWaitlistConversion={enrollmentStep === 'waitlist-pay'}
       />;
    }
    if (enrollmentStep === 'success') {
       return <PaymentResult 
         onSuccess={handleEnrollmentSuccess} 
         onGoHome={() => {
            resetAllViews();
            setActiveTab('home');
         }}
       />;
    }

    // 2. Sub-page Overrides
    if (transferTargetClass) {
        return <TransferModal 
            targetClass={transferTargetClass} 
            onClose={() => setTransferTargetClass(null)} 
            onSubmit={handleSubmitTransfer} 
        />;
    }
    if (showTransferHistory) {
        return <TransferHistory apps={transferApps} onBack={() => setShowTransferHistory(false)} />;
    }
    if (showTransferList) {
        // Find current student's active class to display
        const currentClass = orders.find(o => o.student.id === activeStudent.id && o.status === 'paid')?.classInfo;
        
        return <TransferClassList 
            currentClass={currentClass} 
            onBack={() => setShowTransferList(false)}
            onOpenHistory={() => setShowTransferHistory(true)}
            onApply={setTransferTargetClass}
        />;
    }
    if (refundTargetOrder) {
        return <RefundRequest order={refundTargetOrder} onSubmit={handleSubmitRefund} onBack={() => setRefundTargetOrder(null)} />;
    }
    if (selectedOrder) {
        return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} onPay={handlePayOrder} onRefund={handleStartRefund} />;
    }
    if (showSchedule) return <ScheduleCards onBack={() => setShowSchedule(false)} />;
    if (showStudentManagement) return <StudentManagement 
      students={students} 
      setStudents={setStudents} 
      onBack={() => setShowStudentManagement(false)}
      onSwitchStudent={handleSwitchStudent}
    />;
    if (showOrders) return <OrderList orders={orders} onBack={() => setShowOrders(false)} onSelectOrder={setSelectedOrder} />;
    if (showCourses) return <EnrolledCourseList orders={orders} onBack={() => setShowCourses(false)} />;
    if (showWaitlist) return <WaitlistList apps={waitlistApps} onBack={() => setShowWaitlist(false)} onPay={handleProceedToPayWaitlist} onCancel={handleCancelWaitlist} onSimulateStatus={handleSimulateStatus} />;
    if (showNotifications) return <NotificationCenter notifications={notifications} onBack={() => setShowNotifications(false)} onClickItem={handleNotificationClick} />;

    // 3. Product Detail Override
    if (selectedProduct) {
      return <CourseDetail 
        product={selectedProduct} 
        onBack={() => setSelectedProduct(null)} 
        onSignup={handleStartSignup}
        onJoinWaitlist={handleStartWaitlist}
      />;
    }

    // 4. Main Tabs
    switch (activeTab) {
      case 'home': return <HomeTab onNavigate={setActiveTab} />;
      case 'courses': return <CourseListTab onSelectCourse={setSelectedProduct} />;
      case 'profile': return <ProfileTab 
        onManageStudents={() => setShowStudentManagement(true)} 
        onOpenSchedule={() => setShowSchedule(true)} 
        onOpenOrders={() => setShowOrders(true)}
        onOpenCourses={() => setShowCourses(true)}
        onOpenWaitlist={() => setShowWaitlist(true)}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenTransfer={() => setShowTransferList(true)}
        unreadCount={notifications.filter(n => !n.isRead).length}
        activeStudent={activeStudent}
      />;
      default: return <HomeTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-200">
      <div className="w-[375px] h-[812px] bg-white shadow-2xl rounded-[40px] overflow-hidden relative border-8 border-gray-900 flex flex-col">
         {/* Status Bar Simulation */}
         <div className="h-10 bg-white flex items-center justify-between px-6 select-none z-50">
            <span className="font-bold text-sm">14:20</span>
            <div className="flex gap-1.5">
               <div className="w-4 h-2.5 bg-black rounded-sm"></div>
               <div className="w-3 h-2.5 bg-black rounded-sm"></div>
               <div className="w-5 h-2.5 border border-black rounded-sm flex items-center justify-center">
                  <div className="w-3 h-1.5 bg-black"></div>
               </div>
            </div>
         </div>
         
         {/* Mini Program Header */}
         {!selectedProduct && !showStudentManagement && !showSchedule && !showOrders && !showCourses && !showWaitlist && !showNotifications && !selectedOrder && !refundTargetOrder && !showTransferList && !showTransferHistory && enrollmentStep === 'none' && (
            <div className="h-10 bg-white flex items-center px-4 relative z-40">
               <div className="absolute left-1/2 -translate-x-1/2 font-bold text-base">
                 {activeTab === 'home' && '思悦'}
                 {activeTab === 'courses' && '选课列表'}
                 {activeTab === 'profile' && '个人中心'}
               </div>
               <div className="ml-auto w-[80px] h-[30px] border border-gray-200 rounded-full flex items-center justify-between px-3 bg-white/50 backdrop-blur">
                  <span className="font-bold text-xs">•••</span>
                  <div className="w-[1px] h-4 bg-gray-200"></div>
                  <span className="font-bold text-xs">◎</span>
               </div>
            </div>
         )}

         {/* Content */}
         <div className="flex-1 flex flex-col overflow-hidden relative">
            {renderContent()}
         </div>

         {/* Bottom Navigation - Only show on main tabs */}
         {!selectedProduct && !showStudentManagement && !showSchedule && !showOrders && !showCourses && !showWaitlist && !showNotifications && !selectedOrder && !refundTargetOrder && !showTransferList && !showTransferHistory && enrollmentStep === 'none' && (
           <div className="h-[80px] bg-white border-t border-gray-100 flex items-start justify-around pt-3 pb-8 z-50">
              <div onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'home' ? 'text-blue-500' : 'text-gray-400'}`}>
                 <div className="text-xl"><IconHome /></div>
                 <span className="text-[10px]">首页</span>
              </div>
              <div onClick={() => setActiveTab('courses')} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'courses' ? 'text-blue-500' : 'text-gray-400'}`}>
                 <div className="text-xl"><IconCourse /></div>
                 <span className="text-[10px]">选课</span>
              </div>
              <div onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'profile' ? 'text-blue-500' : 'text-gray-400'}`}>
                 <div className="text-xl"><IconProfile /></div>
                 <span className="text-[10px]">我的</span>
              </div>
           </div>
         )}

         {/* Home Indicator */}
         <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black rounded-full z-[60]"></div>
      </div>
      
      <div className="absolute top-10 left-10 text-gray-500 w-64">
         <p className="mb-2">👈 Use the sidebar in Teacher/Admin view to switch between roles.</p>
         <p className="text-sm">This is a simulated mobile view for Parents.</p>
      </div>
    </div>
  );
};

export default ParentsApp;