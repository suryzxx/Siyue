import React, { useState } from 'react';
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
    <div className="bg-white border border-gray-200 rounded-sm mb-4 text-sm">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 text-gray-500 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <span>订单编号：<span className="text-gray-600">{order.id}</span></span>
        <span>下单时间：<span className="text-gray-600">{order.orderTime}</span></span>
        <span>支付时间：<span className="text-gray-600">{order.paymentTime}</span></span>
        <span>订单金额：<span className="text-gray-600">{formatCurrency(order.totalAmount)}</span></span>
      </div>

      <div className="divide-y divide-gray-200">
        {order.subOrders.map((subOrder, subIndex) => (
          <div key={subOrder.id || subIndex} className="flex flex-col">
            {subOrder.id && (
              <div className="px-4 py-2 text-gray-500 text-xs bg-white border-b border-gray-100">
                子订单号：{subOrder.id}
              </div>
            )}

            <div className="flex w-full">
              <div className="flex-grow flex flex-col border-r border-gray-100">
                {subOrder.items.map((item) => (
                  <div key={item.id} className="flex border-b border-gray-100 last:border-b-0">
                    <div className="flex-1 p-3 flex gap-3 items-center">
                      <div className="flex flex-col justify-center gap-1">
                        <div className="flex items-center gap-2">
                          {item.type === 'course' && item.classId ? (
                            <button 
                              onClick={() => onClassClick(item.classId)}
                              className="text-blue-600 hover:underline font-medium text-sm leading-tight line-clamp-2 text-left"
                            >
                              {item.name}
                            </button>
                          ) : (
                            <span className="text-gray-900 font-medium text-sm leading-tight line-clamp-2">
                              {item.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-32 p-3 text-center flex items-center justify-center text-gray-800">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex w-[45%]">
                <div className="flex-1 p-3 border-r border-gray-100 flex flex-col items-center justify-center text-center">
                  <span className="font-semibold text-gray-900">{formatCurrency(subOrder.realPay)}</span>
                  <span className="text-gray-400 text-xs mt-1">{subOrder.paymentMethod}</span>
                </div>

                <div className="flex-1 p-3 border-r border-gray-100 flex flex-col items-center justify-center text-center">
                  <button 
                    onClick={() => onStudentClick(subOrder.studentId)}
                    className="text-blue-500 hover:underline mb-1"
                  >
                    {subOrder.studentName}
                  </button>
                  <span className="text-gray-500">{subOrder.studentPhone}</span>
                </div>

                <div className="flex-1 p-3 flex items-center justify-center text-center">
                  <span className={`${
                    subOrder.status === OrderStatusEnum.SUCCESS ? 'text-[#f68b42]' : 'text-gray-500'
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

interface FilterBarProps {
  productName: string;
  setProductName: (value: string) => void;
  studentInfo: string;
  setStudentInfo: (value: string) => void;
  onExport: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ productName, setProductName, studentInfo, setStudentInfo, onExport }) => {
  return (
    <div className="bg-white p-4 mb-4 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        <div className="relative group w-full md:w-64">
          <input
            type="text"
            placeholder="请输入商品名称"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full pl-4 pr-10 py-1.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4 cursor-pointer" />
        </div>

        <div className="relative group w-full md:w-64">
          <input
            type="text"
            placeholder="请输入学生信息查询"
            value={studentInfo}
            onChange={(e) => setStudentInfo(e.target.value)}
            className="w-full pl-4 pr-10 py-1.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4 cursor-pointer" />
        </div>

        <div className="relative w-full md:w-32">
          <button className="w-full px-4 py-1.5 border border-gray-200 rounded-sm text-sm text-gray-400 bg-white flex items-center justify-between hover:border-blue-500 transition-colors">
            <span>校区</span>
            <ChevronDownIcon className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>

      <div>
        <button 
          onClick={onExport}
          className="px-6 py-1.5 border border-blue-500 text-blue-600 text-sm rounded-sm hover:bg-blue-50 transition-colors font-medium"
        >
          导出
        </button>
      </div>
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

  const filteredOrders = MOCK_ORDERS.filter(order => {
    const matchProductName = !productName || order.subOrders.some(sub => 
      sub.items.some(item => item.name.toLowerCase().includes(productName.toLowerCase()))
    );
    
    const matchStudentInfo = !studentInfo || order.subOrders.some(sub => 
      sub.studentName.includes(studentInfo) || sub.studentPhone.includes(studentInfo)
    );
    
    return matchProductName && matchStudentInfo;
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
        { key: 'productName', label: '商品名称', width: 25 },
        { key: 'productType', label: '商品类型', width: 10 },
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
    <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">订单管理</h2>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <FilterBar 
            productName={productName}
            setProductName={setProductName}
            studentInfo={studentInfo}
            setStudentInfo={setStudentInfo}
            onExport={exportOrderList}
          />

          <div className="hidden md:flex bg-[#f5f7fa] px-4 py-3 text-xs text-gray-500 border-b border-transparent rounded-t-sm">
            <div className="flex-grow pl-10">商品名称</div>
            <div className="w-32 text-center">价格</div>
            <div className="w-[15%] text-center">实收</div>
            <div className="w-[15%] text-center">学生信息</div>
            <div className="w-[15%] text-center">交易状态</div>
          </div>

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

      <div className="bg-white px-6 py-4 border-t border-gray-100 flex items-center justify-end text-sm text-gray-600 gap-2">
        <span>总计 {filteredOrders.length} 条</span>
        <button className="px-2 hover:text-blue-500">&lt;</button>
        <button className="w-7 h-7 flex items-center justify-center rounded bg-blue-500 text-white">1</button>
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">2</button>
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">3</button>
        <button className="px-2 hover:text-blue-500">&gt;</button>
        <select className="border border-gray-300 rounded px-2 py-1 ml-2 text-xs">
          <option>20 条/页</option>
          <option>50 条/页</option>
        </select>
      </div>
    </div>
  );
};

export default OrderManagement;
