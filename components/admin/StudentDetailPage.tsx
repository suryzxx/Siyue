import React, { useState } from 'react';
import { StudentProfile } from '../../types';

const orderCardStyles = `
  /* --- 全局重置 --- */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
    background-color: #ffffff;
    color: #606266;
    padding: 20px;
    font-size: 13px;
  }

  /* --- 订单卡片容器 --- */
  .order-card {
    margin-bottom: 30px;
    padding-bottom: 10px;
  }

  /* --- 头部区域 (订单号、操作栏) --- */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 0 5px;
  }

  .header-info {
    display: flex;
    gap: 20px;
    color: #303133;
    font-weight: 500;
  }

  .header-info span {
    display: inline-block;
  }

  .header-actions {
    display: flex;
    gap: 15px;
  }

  .action-link {
    text-decoration: none;
    font-size: 13px;
    cursor: pointer;
  }

  /* 蓝色链接状态 */
  .link-blue {
    color: #409eff;
  }
  .link-blue:hover {
    color: #66b1ff;
  }

  /* 灰色禁用状态 (模拟图中的灰色链接) */
  .link-disabled {
    color: #c0c4cc;
    cursor: not-allowed;
  }

  /* --- 表格样式 --- */
  .order-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
  }

  .order-table th {
    background-color: #f9fafc;
    color: #909399;
    font-weight: normal;
    padding: 8px 6px;
    text-align: left;
    border-bottom: 1px solid #ebeef5;
    white-space: nowrap;
  }

  .order-table td {
    padding: 10px 6px;
    color: #606266;
    border-bottom: 1px solid #ebeef5;
    font-size: 13px;
  }

  /* 最后一行的单元格去掉底部边框，避免双重边框 */
  .order-table tr:last-child td {
    border-bottom: none;
  }



  /* 表格内的蓝色链接文字 (如班级名、操作) */
  .table-link {
    color: #409eff;
    cursor: pointer;
    text-decoration: none;
  }
  .table-link:hover {
    text-decoration: underline;
  }

  /* 对齐调整 */
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  
  /* 宽度控制，模拟图中比例 */
  .w-large { width: 16%; }
  .w-med { width: 10%; }
  .w-small { width: 8%; }
  
  /* 考勤明细弹窗样式 */
  .attendance-modal {
    background-color: #fff;
    width: 900px;
    max-width: 95%;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    position: relative;
    padding-bottom: 20px;
  }

  .attendance-modal .modal-header {
    padding: 20px 20px 10px;
    text-align: center;
    position: relative;
  }

  .attendance-modal .modal-title {
    font-size: 18px;
    color: #303133;
    font-weight: normal;
  }

  .attendance-modal .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 16px;
    height: 16px;
    cursor: pointer;
    opacity: 0.6;
  }

  .attendance-modal .close-btn:hover {
    opacity: 1;
  }

  .attendance-modal .close-btn::before, 
  .attendance-modal .close-btn::after {
    content: '';
    position: absolute;
    height: 16px;
    width: 2px;
    background-color: #909399;
    left: 7px;
  }

  .attendance-modal .close-btn::before { transform: rotate(45deg); }
  .attendance-modal .close-btn::after { transform: rotate(-45deg); }

  .attendance-modal .table-container {
    padding: 10px 20px;
  }

  .attendance-modal table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  .attendance-modal th {
    text-align: left;
    color: #909399;
    font-weight: normal;
    padding: 12px 10px;
    border-bottom: 1px solid #ebeef5;
    background-color: #fcfcfc;
  }

  .attendance-modal td {
    padding: 15px 10px;
    color: #606266;
    border-bottom: 1px solid #ebeef5;
    vertical-align: middle;
    line-height: 1.6;
  }

  .attendance-modal tr:hover td {
    background-color: #f5f7fa;
  }

  .attendance-modal .tag-blue {
    display: inline-block;
    background-color: #409eff;
    color: #fff;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
    line-height: 1.2;
    vertical-align: middle;
  }

  .attendance-modal .link-text {
    color: #409eff;
    text-decoration: none;
    cursor: pointer;
    margin-left: 10px;
    font-size: 13px;
  }

  .attendance-modal .link-text:hover {
    opacity: 0.8;
  }

  .attendance-modal .time-cell {
    display: flex;
    flex-direction: column;
    color: #606266;
  }

  .attendance-modal .col-index { width: 15%; }
  .attendance-modal .col-time { width: 20%; }
  .attendance-modal .col-status { width: 15%; }
  .attendance-modal .col-attend { width: 15%; }
  .attendance-modal .col-check { width: 15%; }
  .attendance-modal .col-fee { width: 20%; }
`;

interface StudentDetailPageProps {
  student: StudentProfile;
  onBack: () => void;
}

interface Order {
  id: string;
  orderNumber: string;
  courseType: string;
  enrollmentDate: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  projectName: string;
  className: string;
  classTime: string;
  courseFee: number;
  quantity: number;
  materialFee: number;
  totalPrice: number;
  discount: string;
  amountReceivable: number;
  totalReceivable: number;
  totalActualPaid: number;
  outstanding: number;
  paymentMethod: string;
  campus: string;
  operator: string;
  notes: string;
}

interface OrderClass {
  id: string;
  orderNumber: string;
  className: string;
  courseName: string;
  teacher: string;
  type: string;
  startTime: string;
  status: string;
  campus: string;
  tuitionFee: number;
  materialFee: number;
  actualPaid: number;
}

interface WaitlistRecord {
  id: string;
  className: string;
  classStatus: string;
  campus: string;
  firstLessonDate: string;
  totalWaitlistCount: number;
  waitlistTime: string;
  status: string;
}

interface AttendanceRecord {
  id: string;
  lessonNumber: string;
  lessonTime: string;
  courseStatus: string;
  attendanceStatus: string;
  attendanceStatus2: string;
  deductionStatus: string;
  hasClassChange?: boolean;
}

const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ student, onBack }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'waitlist' | 'coupons'>('orders');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // Mock data for student orders
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'MS114380689820356610',
      courseType: '寒春联报班',
      enrollmentDate: '2026-01-15 10:30:22',
    },
    {
      id: '2',
      orderNumber: 'MS115450016254267394', 
      courseType: '长期班',
      enrollmentDate: '2025-10-28 15:57:24',
    },
    {
      id: '3',
      orderNumber: 'MS113156075144548354',
      courseType: '长期班',
      enrollmentDate: '2024-09-18 09:58:01',
    }
  ];

  const mockOrderDetails: OrderDetail[] = [
    {
      id: '1',
      orderNumber: 'MS114380689820356610',
      projectName: '寒G5-A | Yves二期',
      className: '寒G5-A | Yves二期',
      classTime: '2026-02-02 14:50',
      courseFee: 2555,
      quantity: 1,
      materialFee: 0,
      totalPrice: 2555,
      discount: '无优惠',
      amountReceivable: 2555,
      totalReceivable: 2555,
      totalActualPaid: 2555,
      outstanding: 0,
      paymentMethod: '现金 2555.00元',
      campus: '默认校区',
      operator: '班级组',
      notes: '无'
    }
  ];

  // Mock data for order classes
  const mockOrderClasses: OrderClass[] = [
    {
      id: '1',
      orderNumber: 'MS114380689820356610',
      className: '寒G5-A | Yves二期12:00',
      courseName: '寒G5-A | Yves二期12:00',
      teacher: 'Yves孙中祥',
      type: '面授',
      startTime: '2026-02-02 12:00-14:00',
      status: '在读',
      campus: '新街口校区',
      tuitionFee: 2555,
      materialFee: 0,
      actualPaid: 2555,
    },
    {
      id: '2',
      orderNumber: 'MS115450016254267394',
      className: '秋G5-A | Yves周六14:50',
      courseName: '秋G5-A | Yves周六14:50',
      teacher: 'Yves孙中祥',
      type: '面授',
      startTime: '2025-09-06 14:50-17:00',
      status: '结课',
      campus: '默认校区',
      tuitionFee: 5840,
      materialFee: 0,
      actualPaid: 5840,
    },
    {
      id: '3',
      orderNumber: 'MS115450016254267394',
      className: '春G5-A | Yves周六14:50',
      courseName: '春G5-A | Yves周六14:50',
      teacher: 'Yves孙中祥',
      type: '面授',
      startTime: '2026-03-07 14:50-17:00',
      status: '在读',
      campus: '默认校区',
      tuitionFee: 5475,
      materialFee: 0,
      actualPaid: 5475,
    },
    {
      id: '4',
      orderNumber: 'MS113156075144548354',
      className: '【物转入·新生选报】秋...',
      courseName: '【物转入·新生选报】秋...',
      teacher: '教务组',
      type: '面授',
      startTime: '2024-09-08 08:30-11:00',
      status: '退出',
      campus: '爱邦校区',
      tuitionFee: 2880,
      materialFee: 0,
      actualPaid: 2880,
    },
    {
      id: '5',
      orderNumber: 'MS113156075144548354',
      className: '【物转入·新生选报】秋...',
      courseName: '【物转入·新生选报】秋...',
      teacher: '教务组',
      type: '面授',
      startTime: '2024-09-08 08:30-11:00',
      status: '未在谈',
      campus: '爱邦校区',
      tuitionFee: 5040,
      materialFee: 0,
      actualPaid: 5040,
    }
  ];

  // Mock data for waitlist records
  const mockWaitlistRecords: WaitlistRecord[] = [
    {
      id: '1',
      className: 'G4数学菁英班',
      classStatus: '已满员',
      campus: '五台山校区',
      firstLessonDate: '2025-09-01',
      totalWaitlistCount: 5,
      waitlistTime: '2025-06-15 14:30',
      status: '候补中',
    },
    {
      id: '2',
      className: 'K3编程进阶班',
      classStatus: '招生中',
      campus: '仙林校区',
      firstLessonDate: '2025-09-15',
      totalWaitlistCount: 2,
      waitlistTime: '2025-07-20 10:15',
      status: '已录取',
    }
  ];

  // Mock data for attendance records
  const mockAttendanceRecords: AttendanceRecord[] = [
    {
      id: '1',
      lessonNumber: '第1讲',
      lessonTime: '2025-09-06 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '出勤',
      deductionStatus: '已扣费',
      hasClassChange: false,
    },
    {
      id: '2',
      lessonNumber: '第2讲',
      lessonTime: '2025-09-13 08:30-11:00',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '出勤',
      deductionStatus: '已扣费',
      hasClassChange: false,
    },
    {
      id: '3',
      lessonNumber: '第3讲',
      lessonTime: '2025-09-20 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '出勤',
      deductionStatus: '已扣费',
      hasClassChange: true,
    },
    {
      id: '4',
      lessonNumber: '第4讲',
      lessonTime: '2025-09-27 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '出勤',
      deductionStatus: '已扣费',
      hasClassChange: false,
    },
    {
      id: '5',
      lessonNumber: '第5讲',
      lessonTime: '2025-10-12 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '出勤',
      deductionStatus: '已扣费',
      hasClassChange: false,
    },
    {
      id: '6',
      lessonNumber: '第6讲',
      lessonTime: '2025-10-18 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '出勤',
      deductionStatus: '已扣费',
      hasClassChange: false,
    },
    {
      id: '7',
      lessonNumber: '第7讲',
      lessonTime: '2025-10-25 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '迟到',
      deductionStatus: '已扣费',
      hasClassChange: false,
    },
    {
      id: '8',
      lessonNumber: '第8讲',
      lessonTime: '2025-11-01 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '出勤',
      deductionStatus: '已扣费',
      hasClassChange: true,
    },
    {
      id: '9',
      lessonNumber: '第9讲',
      lessonTime: '2025-11-08 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '请假',
      deductionStatus: '未扣费',
    },
    {
      id: '10',
      lessonNumber: '第10讲',
      lessonTime: '2025-11-15 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '出勤',
      deductionStatus: '已扣费',
      hasClassChange: false,
    },
    {
      id: '11',
      lessonNumber: '第11讲',
      lessonTime: '2025-11-22 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '出勤',
      deductionStatus: '已扣费',
      hasClassChange: false,
    },
    {
      id: '12',
      lessonNumber: '第12讲',
      lessonTime: '2025-11-28 18:00-20:30',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '出勤',
      deductionStatus: '已扣费',
      hasClassChange: false,
    },
    {
      id: '13',
      lessonNumber: '第13讲',
      lessonTime: '2025-12-06 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '出勤',
      deductionStatus: '已扣费',
      hasClassChange: false,
    },
    {
      id: '14',
      lessonNumber: '第14讲',
      lessonTime: '2025-12-13 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '出勤',
      deductionStatus: '已扣费',
      hasClassChange: false,
    },
    {
      id: '15',
      lessonNumber: '第15讲',
      lessonTime: '2025-12-20 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '早退',
      deductionStatus: '已扣费',
      hasClassChange: false,
    },
{
    id: '16',
    lessonNumber: '第16讲',
    lessonTime: '2025-12-27 14:50-17:20',
    courseStatus: '已结课',
    attendanceStatus: '已考勤',
    attendanceStatus2: '出勤',
    deductionStatus: '已扣费',
    hasClassChange: false,
  },
  {
    id: '17',
    lessonNumber: '第17讲',
    lessonTime: '2026-01-03 14:50-17:20',
    courseStatus: '已结课',
    attendanceStatus: '已考勤',
    attendanceStatus2: '出勤',
    deductionStatus: '已扣费',
    hasClassChange: true,
  },
  {
    id: '18',
    lessonNumber: '第18讲',
    lessonTime: '2026-01-10 14:50-17:20',
    courseStatus: '已结课',
    attendanceStatus: '已考勤',
    attendanceStatus2: '请假',
    deductionStatus: '未扣费',
  },
{
      id: '19',
      lessonNumber: '第19讲',
      lessonTime: '2026-01-17 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '出勤',
      deductionStatus: '已扣费',
      hasClassChange: false,
    },
{
      id: '20',
      lessonNumber: '第20讲',
      lessonTime: '2026-01-24 14:50-17:20',
      courseStatus: '已结课',
      attendanceStatus: '已考勤',
      attendanceStatus2: '迟到',
      deductionStatus: '已扣费',
      hasClassChange: false,
    }
  ];

  const getClassChangeTag = (record: AttendanceRecord) => {
  if (!record.hasClassChange) return null;
  
  return (
    <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-600 border border-purple-200">
      调课
    </span>
  );
 };

const getStatusBadge = (status: string) => {
    const statusConfig = {
      '已支付': { className: 'bg-green-50 text-green-600 border border-green-200', text: '已支付' },
      '待支付': { className: 'bg-orange-50 text-orange-600 border border-orange-200', text: '待支付' },
      '已取消': { className: 'bg-gray-50 text-gray-600 border border-gray-200', text: '已取消' },
      '已退款': { className: 'bg-red-50 text-red-600 border border-red-200', text: '已退款' },
      '候补中': { className: 'bg-yellow-50 text-yellow-600 border border-yellow-200', text: '候补中' },
      '已录取': { className: 'bg-green-50 text-green-600 border border-green-200', text: '已录取' },
      '已满员': { className: 'bg-red-50 text-red-600 border border-red-200', text: '已满员' },
      '招生中': { className: 'bg-blue-50 text-blue-600 border border-blue-200', text: '招生中' },
      '已结课': { className: 'bg-gray-50 text-gray-600 border border-gray-200', text: '已结课' },
      '已考勤': { className: 'bg-blue-50 text-blue-600 border border-blue-200', text: '已考勤' },
      '出勤': { className: 'bg-green-50 text-green-600 border border-green-200', text: '出勤' },
      '请假': { className: 'bg-orange-50 text-orange-600 border border-orange-200', text: '请假' },
      '迟到': { className: 'bg-yellow-50 text-yellow-600 border border-yellow-200', text: '迟到' },
      '已扣费': { className: 'bg-red-50 text-red-600 border border-red-200', text: '已扣费' },
      '未扣费': { className: 'bg-blue-50 text-blue-600 border border-blue-200', text: '未扣费' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { className: 'bg-gray-50 text-gray-600 border border-gray-200', text: status };
    return (
      <span className={`px-2 py-0.5 rounded text-xs ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const handleClassDetailClick = (lessonNumber: string) => {
    const event = new CustomEvent('navigate-to-class-detail', {
      detail: {
        classId: '546',
        autoSwitchTab: 'students'
      }
    });
    window.dispatchEvent(event);
  };

  const handleInvoiceClick = (order: Order) => {
    const orderDetail = mockOrderDetails.find(detail => detail.orderNumber === order.orderNumber);
    setSelectedOrder(orderDetail || {
      ...order,
      projectName: '寒G5-A | Yves二期',
      className: '寒G5-A | Yves二期',
      classTime: '2026-02-02 14:50',
      courseFee: 2555,
      quantity: 1,
      materialFee: 0,
      totalPrice: 2555,
      discount: '无优惠',
      amountReceivable: 2555,
      totalReceivable: 2555,
      totalActualPaid: 2555,
      outstanding: 0,
      paymentMethod: '现金 2555.00元',
      campus: '默认校区',
      operator: '班级组',
      notes: '无'
    });
    setShowInvoiceModal(true);
  };

  const handleCloseInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedOrder(null);
  };

  const handlePrintInvoice = () => {
    const printContent = document.getElementById('invoice-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="zh-CN">
          <head>
            <meta charset="UTF-8">
            <title>思悦 - 订单详情</title>
            <style>
              body { font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif; padding: 20px; }
              .container { max-width: 1200px; margin: 0 auto; }
              .header-title { text-align: center; font-size: 24px; color: #303133; font-weight: 500; margin-bottom: 25px; }
              .info-bar { display: flex; justify-content: space-between; background-color: #f9fafc; padding: 15px 20px; font-size: 14px; color: #606266; margin-bottom: 20px; border-radius: 2px; }
              .info-item { display: flex; align-items: center; }
              .info-item span:first-child { margin-right: 5px; color: #909399; }
              .data-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px; border: 1px solid #ebeef5; }
              .data-table th, .data-table td { border: 1px solid #ebeef5; padding: 12px 10px; text-align: center; color: #606266; }
              .data-table th { background-color: #fff; color: #909399; font-weight: 400; }
              .data-table .align-left { text-align: left; padding-left: 20px; }
              .data-table .text-row { line-height: 1.5; }
              .footer-note { font-size: 14px; color: #909399; margin-bottom: 40px; padding-left: 5px; }
              .button-group { display: flex; justify-content: center; gap: 15px; margin-top: 30px; }
              .btn { padding: 10px 25px; font-size: 14px; border-radius: 4px; cursor: pointer; outline: none; transition: all 0.3s; }
              .btn-primary { background-color: #409eff; border: 1px solid #409eff; color: white; }
              .btn-primary:hover { background-color: #66b1ff; border-color: #66b1ff; }
              .btn-default { background-color: #fff; border: 1px solid #dcdfe6; color: #606266; }
              .btn-default:hover { color: #409eff; border-color: #c6e2ff; background-color: #ecf5ff; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="header-title">思悦</h1>
              <div class="info-bar">
                <div class="info-item"><span>学生姓名:</span> ${student.name}</div>
                <div class="info-item"><span>手机号:</span> 181****5217</div>
                <div class="info-item"><span>经办时间:</span> ${selectedOrder?.enrollmentDate}</div>
                <div class="info-item"><span>单据号:</span> ${selectedOrder?.orderNumber}</div>
              </div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>项目名称</th>
                    <th>班级名称</th>
                    <th>上课时间</th>
                    <th>课程费用</th>
                    <th>数量</th>
                    <th>教辅费用</th>
                    <th>总价</th>
                    <th>优惠</th>
                    <th>应收</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="text-row">寒G5-A | Yves二期<br>14:50</td>
                    <td class="text-row">寒G5-A | Yves二期<br>14:50</td>
                    <td>2026-02-02 14:50</td>
                    <td>2555.00元</td>
                    <td>1</td>
                    <td>0.00元</td>
                    <td>2555.00元</td>
                    <td>无优惠</td>
                    <td>2555.00元</td>
                  </tr>
                  <tr>
                    <td colspan="3" class="align-left">应收总额: 2555.00元</td>
                    <td colspan="4" class="align-left">实收总额: 2555.00元</td>
                    <td colspan="2" class="align-left">欠费: 0.00元</td>
                  </tr>
                  <tr>
                    <td colspan="9" class="align-left">收款方式: 现金 2555.00元</td>
                  </tr>
                  <tr>
                    <td colspan="6" class="align-left">经办校区: 默认校区</td>
                    <td colspan="3" class="align-left">经办人: 班级组</td>
                  </tr>
                </tbody>
              </table>
              <div class="footer-note">备注: 无</div>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleAttendanceClick = () => {
    setShowAttendanceModal(true);
  };

  const handleCloseAttendanceModal = () => {
    setShowAttendanceModal(false);
  };

  const handleAttendanceDetailClick = (lessonNumber: string) => {
    const event = new CustomEvent('navigate-to-attendance-detail', {
      detail: {
        lessonNumber: lessonNumber,
        studentName: student.name
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <>
      <style>{orderCardStyles}</style>
      
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div id="invoice-content">
              <div className="text-center py-6 border-b">
                <h1 className="text-2xl font-medium text-gray-800">思悦</h1>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">学生姓名:</span>
                  <span>{student.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">手机号:</span>
                  <span>181****5217</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">经办时间:</span>
                  <span>{selectedOrder.enrollmentDate}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">单据号:</span>
                  <span>{selectedOrder.orderNumber}</span>
                </div>
              </div>

              <div className="px-6 mb-4">
                <table className="w-full border border-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left">项目名称</th>
                      <th className="border border-gray-200 px-4 py-3 text-left">班级名称</th>
                      <th className="border border-gray-200 px-4 py-3 text-center">上课时间</th>
                      <th className="border border-gray-200 px-4 py-3 text-right">产品费用</th>
                      <th className="border border-gray-200 px-4 py-3 text-center">数量</th>
                      <th className="border border-gray-200 px-4 py-3 text-right">教辅费用</th>
                      <th className="border border-gray-200 px-4 py-3 text-right">总价</th>
                      <th className="border border-gray-200 px-4 py-3 text-center">优惠</th>
                      <th className="border border-gray-200 px-4 py-3 text-right">应收</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="leading-relaxed">{selectedOrder.projectName}<br/>14:50</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="leading-relaxed">{selectedOrder.className}<br/>14:50</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-center">{selectedOrder.classTime}</td>
                      <td className="border border-gray-200 px-4 py-3 text-right">{selectedOrder.courseFee.toFixed(2)}元</td>
                      <td className="border border-gray-200 px-4 py-3 text-center">{selectedOrder.quantity}</td>
                      <td className="border border-gray-200 px-4 py-3 text-right">{selectedOrder.materialFee.toFixed(2)}元</td>
                      <td className="border border-gray-200 px-4 py-3 text-right">{selectedOrder.totalPrice.toFixed(2)}元</td>
                      <td className="border border-gray-200 px-4 py-3 text-center">{selectedOrder.discount}</td>
                      <td className="border border-gray-200 px-4 py-3 text-right">{selectedOrder.amountReceivable.toFixed(2)}元</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3 text-left" colSpan={3}>
                        应收总额: {selectedOrder.totalReceivable.toFixed(2)}元
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-left" colSpan={4}>
                        实收总额: {selectedOrder.totalActualPaid.toFixed(2)}元
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-left" colSpan={2}>
                        欠费: {selectedOrder.outstanding.toFixed(2)}元
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3 text-left" colSpan={9}>
                        收款方式: {selectedOrder.paymentMethod}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3 text-left" colSpan={6}>
                        经办校区: {selectedOrder.campus}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-left" colSpan={3}>
                        经办人: {selectedOrder.operator}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="px-6 mb-6 text-sm text-gray-400">
                备注: {selectedOrder.notes}
              </div>

              <div className="flex justify-center gap-4 px-6 pb-6">
                <button 
                  onClick={handlePrintInvoice}
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  打印
                </button>
                <button 
                  onClick={handleCloseInvoiceModal}
                  className="px-6 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="attendance-modal bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="modal-header">
              <h2 className="modal-title">考勤明细</h2>
              <div 
                className="close-btn" 
                title="关闭"
                onClick={handleCloseAttendanceModal}
              ></div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="col-index">讲次</th>
                    <th className="col-time">开课时间</th>
                    <th className="col-status">班级状态</th>
                    <th className="col-attend">考勤状态</th>
                    <th className="col-check">出勤情况</th>
                    <th className="col-fee">扣费情况</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAttendanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        {record.lessonNumber}
                        {record.hasClassChange && (
                          <span className="tag-blue">调班</span>
                        )}
                      </td>
                      <td>
                        <div className="time-cell">
                          <span>{record.lessonTime.split(' ')[0]}</span>
                          <span>{record.lessonTime.split(' ')[1]}</span>
                        </div>
                      </td>
                      <td>{record.courseStatus}</td>
                      <td>{record.attendanceStatus}</td>
                      <td>{record.attendanceStatus2}</td>
                      <td>
                        {record.deductionStatus}
                        {record.hasClassChange && (
                          <a 
                            href="#" 
                            className="link-text"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAttendanceDetailClick(record.lessonNumber);
                            }}
                          >
                            详情
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
)}

      <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
       {/* Header */}
       <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center text-sm">
         <span className="text-gray-500 cursor-pointer hover:text-primary" onClick={onBack}>
           学生管理
         </span>
         <span className="mx-2 text-gray-400">|</span>
         <span className="text-gray-800">学生详情 - {student.name}</span>
       </div>

       <div className="flex-1 overflow-y-auto">
         {/* Student Info Card */}
         <div className="bg-white p-6 m-6 rounded-xl shadow-sm">
           <div className="flex justify-between items-start mb-6">
             <div>
               <h2 className="text-xl font-bold text-gray-800 mb-2">{student.name}</h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>ID: {student.id}</span>
                  <span>登录账号: {student.account}</span>
                  <span>性别: {student.gender}</span>
                   {student.birthDate && <span>出生年月: {student.birthDate}</span>}
                   {student.englishName && <span>英文名: {student.englishName}</span>}
                </div>
             </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
             <div>
               <span className="text-gray-400">所属校区:</span>
               <span className="text-gray-900 ml-2">{student.campus || '-'}</span>
             </div>
              <div>
                <span className="text-gray-400">在读年级:</span>
                <span className="text-gray-900 ml-2">{student.grade || '-'}</span>
              </div>
             <div>
               <span className="text-gray-400">学生状态:</span>
               <span className="ml-2">
                 {getStatusBadge(student.studentStatus || '潜在学生')}
               </span>
             </div>
             <div>
               <span className="text-gray-400">跟进状态:</span>
               <span className="ml-2">
                 {getStatusBadge(student.followUpStatus || '待跟进')}
               </span>
             </div>
              <div>
                <span className="text-gray-400">在读学校:</span>
                <span className="text-gray-900 ml-2">{student.school || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400">评测等级:</span>
                <span className="text-gray-900 ml-2">{student.evaluationLevel || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400">注册时间:</span>
                <span className="text-gray-900 ml-2">{student.createdTime}</span>
              </div>
             <div>
               <span className="text-gray-400">更新时间:</span>
               <span className="text-gray-900 ml-2">{student.updatedTime}</span>
             </div>
           </div>
         </div>

         {/* Tabs Container */}
         <div className="bg-white m-6 rounded-xl shadow-sm">
           {/* Tabs */}
           <div className="border-b border-gray-100">
             <div className="flex">
               {[
                 { id: 'orders', label: '学生订单' },
                 { id: 'waitlist', label: '候补记录' },
                 { id: 'coupons', label: '优惠券' }
               ].map(tab => (
                 <div
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`px-6 py-3 text-sm font-medium cursor-pointer relative ${
                     activeTab === tab.id ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   {tab.label}
                   {activeTab === tab.id && (
                     <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
                   )}
                 </div>
               ))}
             </div>
           </div>

           {/* Tab Content */}
           <div className="p-6">
             {/* Student Orders Tab */}
             {activeTab === 'orders' && (
               <div>
                 {mockOrders.length === 0 ? (
                   <div className="text-center py-8 text-gray-400">暂无订单记录</div>
                 ) : (
                   mockOrders.map((order, orderIndex) => {
                     const orderClasses = mockOrderClasses.filter(cls => cls.orderNumber === order.orderNumber);
                     
                     return (
                       <div key={order.id} className="order-card">
                         <div className="card-header">
                           <div className="header-info">
                             <span>订单编号: {order.orderNumber}</span>
                             <span>课程类型: {order.courseType}</span>
                             <span>报名日期: {order.enrollmentDate}</span>
                           </div>
                           <div className="header-actions">
                             <a 
                               className="action-link link-blue" 
                               onClick={() => handleInvoiceClick(order)}
                             >
                               单据
                             </a>
                             <a 
                               className="action-link link-blue" 
                               onClick={handleAttendanceClick}
                             >
                               考勤明细
                             </a>
                             <a className="action-link link-blue">转课/班</a>
                             <a className="action-link link-disabled">补费</a>
                             <a className="action-link link-blue">退课/班</a>
                             <a className="action-link link-blue">停课</a>
                           </div>
                         </div>

                         <table className="order-table">
                           <thead>
                             <tr>
                               <th className="w-large">班级名称</th>
                               <th className="w-large">课程名称</th>
                               <th className="w-small">授课老师</th>
                               <th className="w-small">类型</th>
                               <th>开课时间</th>
                               <th className="w-small">状态</th>
                               <th>经办校区</th>
                               <th className="text-right">应收学费</th>
                               <th className="text-right">应收教辅费</th>
                               <th className="text-right">实收</th>
                               <th className="text-center">操作</th>
                             </tr>
                           </thead>
                           <tbody>
                             {orderClasses.map((classItem) => (
                               <tr key={classItem.id}>
                                  <td>
                                    <button 
                                      className="table-link"
                                      onClick={() => {
                                        if (typeof window !== 'undefined') {
                                          window.dispatchEvent(new CustomEvent('navigate-to-class-detail', { 
                                            detail: { classId: '546' } 
                                          }));
                                        }
                                      }}
                                    >
                                      {classItem.className}
                                    </button>
                                  </td>
                                 <td>{classItem.courseName}</td>
                                 <td>{classItem.teacher}</td>
                                 <td>{classItem.type}</td>
                                 <td>{classItem.startTime}</td>
                                 <td>{getStatusBadge(classItem.status)}</td>
                                 <td>{classItem.campus}</td>
                                 <td className="text-right">¥{classItem.tuitionFee.toFixed(2)}</td>
                                 <td className="text-right">¥{classItem.materialFee.toFixed(2)}</td>
                                 <td className="text-right">¥{classItem.actualPaid.toFixed(2)}</td>
                                 <td className="text-center">
                                   <button className="table-link">明细</button>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>


                       </div>
                     );
                   })
                 )}
               </div>
             )}

             {/* Waitlist Records Tab */}
             {activeTab === 'waitlist' && (
               <div>
                 <div className="mb-4">
                   <h3 className="text-lg font-medium text-gray-800 mb-4">候补记录</h3>
                   {mockWaitlistRecords.length === 0 ? (
                     <div className="text-center py-8 text-gray-400">暂无候补记录</div>
                   ) : (
                     <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                       <table className="w-full text-sm text-left">
                         <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                           <tr>
                             <th className="p-4">班级名称</th>
                             <th className="p-4">班级状态</th>
                             <th className="p-4">校区</th>
                             <th className="p-4">首课日期</th>
                             <th className="p-4">候补总人数</th>
                             <th className="p-4">候补时间</th>
                             <th className="p-4">状态</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                           {mockWaitlistRecords.map(record => (
                             <tr key={record.id} className="hover:bg-gray-50">
                               <td className="p-4">
                                 <span className="bg-blue-50 text-blue-500 border border-blue-200 px-2 py-0.5 rounded text-xs">
                                   {record.className}
                                 </span>
                               </td>
                               <td className="p-4">{getStatusBadge(record.classStatus)}</td>
                               <td className="p-4 text-gray-600">{record.campus}</td>
                               <td className="p-4 text-gray-600">{record.firstLessonDate}</td>
                               <td className="p-4 text-gray-600">{record.totalWaitlistCount}人</td>
                               <td className="p-4 text-gray-600">{record.waitlistTime}</td>
                               <td className="p-4">{getStatusBadge(record.status)}</td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   )}
                 </div>
               </div>
             )}

             {/* Coupons Tab */}
             {activeTab === 'coupons' && (
               <div>
                 <h3 className="text-lg font-medium text-gray-800 mb-4">优惠券</h3>
                 <div className="text-center py-12 text-gray-400">
                   <div className="mb-4">🎫</div>
                   <p>优惠券功能开发中...</p>
                 </div>
               </div>
)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDetailPage;