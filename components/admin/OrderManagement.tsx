import React, { useState, useEffect, useRef } from 'react';
import { exportToExcel, ExcelFormatters } from '../../utils/excelExport';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import { formatCurrency } from '../../utils/formatCurrency';
import { CLASSES, ADMIN_STUDENTS, CAMPUSES, TEACHERS, COURSES } from '../../constants';

enum OrderStatusEnum {
  SUCCESS = '交易成功',
  PENDING = '待支付',
  CANCELLED = '已取消',
  REFUNDED = '已退款'
}

interface OrderItem {
  id: string;
  name: string;
  classId: string;
  type: 'course' | 'material';
  price: number;
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
}

interface OrderData {
  id: string;
  orderTime: string;
  paymentTime: string;
  totalAmount: number;
  subOrders: SubOrder[];
}

const MOCK_ORDERS: OrderData[] = [
  {
    id: 'COMB116001219952447490',
    orderTime: '2026-02-02 21:15:45',
    paymentTime: '2026-02-02 21:15:45',
    totalAmount: 7665.00,
    subOrders: [
      {
        id: 'MS116001219913125890',
        realPay: 2190.00,
        paymentMethod: '现金',
        studentId: '4994',
        studentName: '朱维茜',
        studentPhone: '182****8828',
        status: OrderStatusEnum.SUCCESS,
        items: [
          { id: 'p1-1', name: '25暑-K3-进阶-1班', classId: '546', type: 'course', price: 2190.00 },
          { id: 'p1-2', name: '教辅费', classId: '', type: 'material', price: 0.00 }
        ]
      },
      {
        id: 'MS116001219949301762',
        realPay: 5475.00,
        paymentMethod: '现金',
        studentId: '4994',
        studentName: '朱维茜',
        studentPhone: '182****8828',
        status: OrderStatusEnum.SUCCESS,
        items: [
          { id: 'p2-1', name: '25寒-G5-A+--二期', classId: 'c_p2', type: 'course', price: 5475.00 },
          { id: 'p2-2', name: '教辅费', classId: '', type: 'material', price: 0.00 }
        ]
      }
    ]
  },
  {
    id: 'COMB116000852666290178',
    orderTime: '2026-02-02 19:42:21',
    paymentTime: '2026-02-02 19:42:21',
    totalAmount: 5475.00,
    subOrders: [
      {
        id: 'MS116000852666290179',
        realPay: 5475.00,
        paymentMethod: '现金',
        studentId: '4993',
        studentName: 'Randi丁柔',
        studentPhone: '139****7652',
        status: OrderStatusEnum.SUCCESS,
        items: [
          { id: 'p3-1', name: '25暑-G1-A+--一期', classId: 'c_p3', type: 'course', price: 5475.00 },
          { id: 'p3-2', name: '教辅费', classId: '', type: 'material', price: 0.00 }
        ]
      }
    ]
  },
  {
    id: 'COMB116000848622129154',
    orderTime: '2026-02-02 19:41:20',
    paymentTime: '2026-02-02 19:41:20',
    totalAmount: 2555.00,
    subOrders: [
      {
        id: 'MS116000848622129155',
        realPay: 2555.00,
        paymentMethod: '现金',
        studentId: '4992',
        studentName: 'Grace吴悦',
        studentPhone: '182****0314',
        status: OrderStatusEnum.SUCCESS,
        items: [
          { id: 'p4-1', name: '25暑-G2-A+--二期', classId: 'c_p4', type: 'course', price: 2555.00 },
          { id: 'p4-2', name: '教辅费', classId: '', type: 'material', price: 0.00 }
        ]
      }
    ]
  },
  {
    id: 'COMB116000848622129155',
    orderTime: '2026-02-01 15:30:10',
    paymentTime: '2026-02-01 15:30:10',
    totalAmount: 1899.00,
    subOrders: [
      {
        id: 'MS116001219949301800',
        realPay: 1899.00,
        paymentMethod: '微信支付',
        studentId: '11678463',
        studentName: '殷煦纶',
        studentPhone: '138****0455',
        status: OrderStatusEnum.SUCCESS,
        items: [
          { id: 'p5-1', name: '25暑-K3-飞跃--三期', classId: 'c_p5', type: 'course', price: 1899.00 },
          { id: 'p5-2', name: '教辅费', classId: '', type: 'material', price: 0.00 }
        ]
      }
    ]
  }
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
}

const OrderRow: React.FC<OrderRowProps> = ({ subOrder, courseItem, materialItem, orderTime, paymentTime, totalAmount, onClassClick, onStudentClick, onCopyId }) => {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 text-sm">
      <td className="px-3 py-3">
        <div className="flex items-center gap-1">
          <span className="font-mono text-gray-600">{subOrder.id}</span>
          <button 
            onClick={() => onCopyId(subOrder.id)}
            className="text-gray-400 hover:text-gray-600 p-0.5"
            title="复制订单号"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </td>
      <td className="px-3 py-3">
        {courseItem?.classId ? (
          <button 
            onClick={() => onClassClick(courseItem.classId)}
            className="text-primary hover:underline text-left hover:text-teal-600 transition-colors"
          >
            {courseItem.name}
          </button>
        ) : (
          <span className="text-gray-800">{courseItem?.name || '-'}</span>
        )}
      </td>
      <td className="px-3 py-3">
        <button
          onClick={() => onStudentClick(subOrder.studentId)}
          className="text-primary hover:underline hover:text-teal-600 transition-colors"
        >
          {subOrder.studentName}
        </button>
      </td>
      <td className="px-3 py-3 text-gray-800">{courseItem ? formatCurrency(courseItem.price) : '-'}</td>
      <td className="px-3 py-3 text-gray-500">共15讲/剩余15讲</td>
      <td className="px-3 py-3 text-gray-800">{materialItem ? formatCurrency(materialItem.price) : '¥0.00'}</td>
      <td className="px-3 py-3 text-gray-800 font-medium">{formatCurrency(totalAmount)}</td>
      <td className="px-3 py-3">
        <div>
          <span className="text-gray-900 font-medium">{formatCurrency(subOrder.realPay)}</span>
          <span className="text-gray-400 text-xs ml-1">{subOrder.paymentMethod}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-gray-600 text-xs">{orderTime}</td>
      <td className="px-3 py-3 text-gray-600 text-xs">{paymentTime}</td>
      <td className="px-3 py-3">
        <span className={`text-xs ${
          subOrder.status === OrderStatusEnum.SUCCESS
            ? 'text-green-600'
            : subOrder.status === OrderStatusEnum.PENDING
            ? 'text-orange-600'
            : subOrder.status === OrderStatusEnum.CANCELLED
            ? 'text-red-600'
            : 'text-gray-600'
        }`}>
          {subOrder.status}
        </span>
      </td>
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
}

const OrderManagement: React.FC<OrderManagementProps> = ({ onNavigateToClass, onNavigateToStudent, onNavigateToManualOrder }) => {
  const [productName, setProductName] = useState('');
  const [studentInfo, setStudentInfo] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);

  // New filters
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);

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
             matchYear && matchSemester && matchProductType && matchQuickFilter;
    });

    // Sort by orderTime
    orders.sort((a, b) => {
      const dateA = new Date(a.orderTime).getTime();
      const dateB = new Date(b.orderTime).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return orders;
  }, [productName, studentInfo, selectedStatuses, selectedPaymentMethods, selectedYears, selectedSemesters, selectedProductTypes, quickFilter, sortOrder]);

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
          
          return {
            orderId: subOrder.id,
            className: courseItem?.name || '-',
            studentInfo: subOrder.studentName,
            coursePrice: courseItem?.price || 0,
            lessonInfo: '共15讲/剩余15讲',
            materialPrice: materialItem?.price || 0,
            orderAmount: order.totalAmount,
            realPayAmount: subOrder.realPay,
            orderTime: order.orderTime,
            paymentTime: order.paymentTime,
            status: subOrder.status,
          };
        })
      );

      const columns = [
        { key: 'orderId', label: '订单编号', width: 25 },
        { key: 'className', label: '班级名称', width: 25 },
        { key: 'studentInfo', label: '学生信息', width: 12 },
        { key: 'coursePrice', label: '课程费用', width: 12, format: ExcelFormatters.currency },
        { key: 'lessonInfo', label: '讲次信息', width: 15 },
        { key: 'materialPrice', label: '教辅费', width: 10, format: ExcelFormatters.currency },
        { key: 'orderAmount', label: '订单金额', width: 12, format: ExcelFormatters.currency },
        { key: 'realPayAmount', label: '实收金额', width: 12, format: ExcelFormatters.currency },
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



  return (
    <>
      <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
        {/* 标题栏 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">订单管理</h2>
        </div>

        {/* 第一栏：筛选栏 */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* 产品名称搜索 */}
            <div className="relative min-w-[140px] flex-shrink-0">
              <input
                type="text"
                placeholder="产品名称"
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
              options={['交易成功', '待支付', '已取消', '已退款']}
              selected={selectedStatuses}
              onChange={setSelectedStatuses}
              placeholder="交易状态"
              width="w-[120px]"
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
        </div>

        {/* 第二栏：操作栏 */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {}}
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
                <tr>
                  <th className="px-3 py-3 text-left font-medium">订单编号</th>
                  <th className="px-3 py-3 text-left font-medium">班级名称</th>
                  <th className="px-3 py-3 text-left font-medium">学生信息</th>
                  <th className="px-3 py-3 text-left font-medium">课程费用</th>
                  <th className="px-3 py-3 text-left font-medium">讲次信息</th>
                  <th className="px-3 py-3 text-left font-medium">教辅费</th>
                  <th className="px-3 py-3 text-left font-medium">订单金额</th>
                  <th className="px-3 py-3 text-left font-medium">实收金额</th>
                  <th className="px-3 py-3 text-left font-medium">下单时间</th>
                  <th className="px-3 py-3 text-left font-medium">支付时间</th>
                  <th className="px-3 py-3 text-left font-medium">交易状态</th>
                </tr>
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
                        materialItem={materialItem}
                        orderTime={order.orderTime}
                        paymentTime={order.paymentTime}
                        totalAmount={order.totalAmount}
                        onClassClick={handleClassClick}
                        onStudentClick={handleStudentClick}
                        onCopyId={(id) => {
                          navigator.clipboard.writeText(id);
                        }}
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
