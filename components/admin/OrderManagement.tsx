import React, { useState, useEffect, useRef } from 'react';
import { exportToExcel, ExcelFormatters } from '../../utils/excelExport';
import { formatCurrency } from '../../utils/formatCurrency';
import { CLASSES, ADMIN_STUDENTS } from '../../constants';

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
        id: '',
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
        id: '',
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

interface OrderCardProps {
  order: OrderData;
  onClassClick: (classId: string) => void;
  onStudentClick: (studentId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClassClick, onStudentClick }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-4 text-sm shadow-sm">
      <div className="bg-[#F9FBFA] px-4 py-3 border-b border-gray-200 text-gray-600 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <span>订单编号：<span className="text-gray-800 font-medium">{order.id}</span></span>
        <span>下单时间：<span className="text-gray-800">{order.orderTime}</span></span>
        <span>支付时间：<span className="text-gray-800">{order.paymentTime}</span></span>
        <span>订单金额：<span className="text-gray-800 font-medium">{formatCurrency(order.totalAmount)}</span></span>
      </div>

      <div className="divide-y divide-gray-200">
        {order.subOrders.map((subOrder, subIndex) => (
          <div key={subOrder.id || subIndex} className="flex flex-col hover:bg-gray-50 transition-colors">
            {subOrder.id && (
              <div className="px-4 py-2 text-gray-500 text-xs bg-gray-50 border-b border-gray-100">
                子订单号：<span className="text-gray-700">{subOrder.id}</span>
              </div>
            )}

            <div className="flex w-full">
              <div className="flex-grow flex flex-col border-r border-gray-100">
                {subOrder.items.map((item) => (
                  <div key={item.id} className="flex border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                    <div className="flex-1 p-4 flex gap-3 items-center">
                      <div className="flex flex-col justify-center gap-1">
                        <div className="flex items-center gap-2">
                          {item.type === 'course' && item.classId ? (
                            <button 
                              onClick={() => onClassClick(item.classId)}
                              className="text-primary hover:underline font-medium text-sm leading-tight line-clamp-2 text-left hover:text-teal-600 transition-colors"
                            >
                              {item.name}
                            </button>
                          ) : (
                            <span className="text-gray-500 text-xs">
                              {item.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-32 p-4 text-center flex items-center justify-center text-gray-800 font-medium">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex w-[45%]">
                <div className="flex-1 p-4 border-r border-gray-100 flex flex-col items-center justify-center text-center">
                  <span className="font-semibold text-gray-900 text-sm">{formatCurrency(subOrder.realPay)}</span>
                  <span className="text-gray-500 text-xs mt-1">{subOrder.paymentMethod}</span>
                </div>

                <div className="flex-1 p-4 border-r border-gray-100 flex flex-col items-center justify-center text-center">
                  <button 
                    onClick={() => onStudentClick(subOrder.studentId)}
                    className="text-primary hover:underline mb-1 hover:text-teal-600 transition-colors text-sm font-medium"
                  >
                    {subOrder.studentName}
                  </button>
                  <span className="text-gray-500 text-xs">{subOrder.studentPhone}</span>
                </div>

                <div className="flex-1 p-4 flex items-center justify-center text-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    subOrder.status === OrderStatusEnum.SUCCESS 
                      ? 'bg-green-50 text-green-600 border border-green-100' 
                      : subOrder.status === OrderStatusEnum.PENDING
                      ? 'bg-orange-50 text-orange-600 border border-orange-100'
                      : subOrder.status === OrderStatusEnum.CANCELLED
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}>
                    {subOrder.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
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

interface OrderManagementProps {
  onNavigateToClass?: (classId: string) => void;
  onNavigateToStudent?: (studentId: string) => void;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ onNavigateToClass, onNavigateToStudent }) => {
  const [productName, setProductName] = useState('');
  const [studentInfo, setStudentInfo] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);

  const filteredOrders = MOCK_ORDERS.filter(order => {
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
    
    return matchProductName && matchStudentInfo && matchStatus && matchPaymentMethod;
  });

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
      const flattenedData = filteredOrders.flatMap(order => 
        order.subOrders.flatMap(sub => 
          sub.items.map(item => ({
            orderId: order.id,
            subOrderId: sub.id,
            orderTime: order.orderTime,
            paymentTime: order.paymentTime,
            productName: item.name,
            productType: item.type === 'course' ? '课程' : '教辅',
            price: item.price,
            realPay: sub.realPay,
            paymentMethod: sub.paymentMethod,
            studentName: sub.studentName,
            studentPhone: sub.studentPhone,
            status: sub.status,
            totalAmount: order.totalAmount
          }))
        )
      );

      const columns = [
        { key: 'orderId', label: '订单编号', width: 25 },
        { key: 'subOrderId', label: '子订单号', width: 25 },
        { key: 'orderTime', label: '下单时间', width: 20 },
        { key: 'paymentTime', label: '支付时间', width: 20 },
        { key: 'productName', label: '产品名称', width: 25 },
        { key: 'productType', label: '产品类型', width: 10 },
        { key: 'price', label: '价格', width: 12, format: ExcelFormatters.currency },
        { key: 'realPay', label: '实收', width: 12, format: ExcelFormatters.currency },
        { key: 'paymentMethod', label: '支付方式', width: 10 },
        { key: 'studentName', label: '学生姓名', width: 12 },
        { key: 'studentPhone', label: '学生电话', width: 15 },
        { key: 'status', label: '交易状态', width: 12 },
        { key: 'totalAmount', label: '订单金额', width: 12, format: ExcelFormatters.currency },
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

  return (
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
            width="w-[100px]"
          />

          {/* 支付方式筛选 - MultiSelect */}
          <MultiSelect
            options={['微信支付', '现金']}
            selected={selectedPaymentMethods}
            onChange={setSelectedPaymentMethods}
            placeholder="支付方式"
            width="w-[100px]"
          />
        </div>


      </div>

      {/* 第二栏：功能按钮栏 */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <button 
            className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors"
          >
            手动录单
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
        <div className="flex-1 overflow-auto mx-4 my-4 border border-gray-200 rounded-lg">
          {/* 表格表头 */}
          <div className="hidden md:flex bg-[#F9FBFA] px-4 py-3 text-sm text-gray-600 font-medium border-b border-gray-200">
            <div className="flex-grow pl-4">产品名称</div>
            <div className="w-32 text-center">价格</div>
            <div className="w-[15%] text-center">实收</div>
            <div className="w-[15%] text-center">学生信息</div>
            <div className="w-[15%] text-center">交易状态</div>
          </div>

          {/* 表格内容 */}
          <div className="mt-2">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onClassClick={handleClassClick}
                onStudentClick={handleStudentClick}
              />
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              暂无订单数据
            </div>
          )}
        </div>
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
  );
};

export default OrderManagement;
