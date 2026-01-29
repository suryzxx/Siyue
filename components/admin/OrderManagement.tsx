import React, { useState } from 'react';
import { ORDERS } from '../../constants';
import { Order, OrderStatus, PaymentMethod } from '../../types';
import SearchableMultiSelect from '../common/SearchableMultiSelect';
import { exportToExcel, ExcelFormatters } from '../../utils/excelExport';

const OrderManagement: React.FC = () => {
   // 筛选状态
   const [filterId, setFilterId] = useState('');
   const [filterPhone, setFilterPhone] = useState('');
   const [filterOrderStatus, setFilterOrderStatus] = useState<string[]>([]);
   const [filterPaymentMethod, setFilterPaymentMethod] = useState<string[]>([]);
   const [filterClass, setFilterClass] = useState('');

  // 选项
  const orderStatusOptions: OrderStatus[] = ['待支付', '已支付', '已取消', '已退款'];
  const paymentMethodOptions: PaymentMethod[] = ['微信支付', '现金'];

   // 筛选逻辑
   const filteredOrders = ORDERS.filter(order => {
     const matchId = !filterId || order.id.toLowerCase().includes(filterId.toLowerCase());
     const matchPhone = !filterPhone || (order.phone && order.phone.includes(filterPhone));
     const matchOrderStatus = filterOrderStatus.length === 0 || (order.orderStatus && filterOrderStatus.includes(order.orderStatus));
     const matchPaymentMethod = filterPaymentMethod.length === 0 || (order.paymentMethod && filterPaymentMethod.includes(order.paymentMethod));
     const matchClass = !filterClass || (order.className && order.className.toLowerCase().includes(filterClass.toLowerCase()));
     
     return matchId && matchPhone && matchOrderStatus && matchPaymentMethod && matchClass;
   });

   // 重置筛选
   const resetFilters = () => {
     setFilterId('');
     setFilterPhone('');
     setFilterOrderStatus([]);
     setFilterPaymentMethod([]);
     setFilterClass('');
   };

  // 导出订单列表
  const exportOrderList = async () => {
    try {
       const columns = [
          { key: 'id', label: '订单ID', width: 12 },
          { key: 'orderNumber', label: '订单编号', width: 15 },
          { key: 'phone', label: '手机号', width: 15 },
          { key: 'studentNumber', label: '学号', width: 12 },
          { key: 'studentName', label: '学生姓名', width: 15 },
          { key: 'className', label: '班级', width: 20 },
         { key: 'orderStatus', label: '订单状态', width: 12, format: ExcelFormatters.status },
         { key: 'paymentMethod', label: '支付方式', width: 12 },
         { key: 'paymentTime', label: '支付时间', width: 18, format: ExcelFormatters.datetime },
         { key: 'amount', label: '实付金额', width: 12, format: ExcelFormatters.currency },
         { key: 'originalAmount', label: '原价金额', width: 12, format: ExcelFormatters.currency },
         { key: 'discountAmount', label: '优惠金额', width: 12, format: ExcelFormatters.currency },
         { key: 'materialFee', label: '教辅费', width: 12, format: ExcelFormatters.currency },
         { key: 'courseFee', label: '课程费', width: 12, format: ExcelFormatters.currency },
         { key: 'lessonCount', label: '购买节数', width: 10 },
         { key: 'createdTime', label: '订单创建时间', width: 18, format: ExcelFormatters.datetime },
       ];

      await exportToExcel({
        data: filteredOrders,
        columns,
        sheetName: '订单列表',
        fileName: '订单列表',
        headerStyle: {
          bold: true,
          fillColor: 'FFF3E5F5' // 紫色调
        }
      });
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请稍后重试');
    }
  };

  // 操作处理函数
  const handleViewPaymentProof = (order: Order) => {
    alert(`查看订单 ${order.id} 的支付凭证`);
    // 实际应用中这里会打开支付凭证查看器
  };

  const handleRefund = (order: Order) => {
    if (order.orderStatus !== '已支付') {
      alert('只有已支付的订单才能退款');
      return;
    }
    alert(`为订单 ${order.id} 发起退款`);
    // 实际应用中这里会打开退款模态框
  };

  const handleViewOperationLog = (order: Order) => {
    alert(`查看订单 ${order.id} 的操作日志`);
    // 实际应用中这里会打开操作日志页面
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">订单管理</h2>
      </div>

       {/* Filter Bar */}
       <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
         {/* 订单ID筛选 */}
         <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">订单ID:</span>
           <input 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-primary"
             placeholder="请输入订单ID"
             value={filterId}
             onChange={e => setFilterId(e.target.value)}
            />
         </div>

         {/* 手机号筛选 */}
         <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">手机号:</span>
           <input 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-primary"
             placeholder="请输入手机号"
             value={filterPhone}
             onChange={e => setFilterPhone(e.target.value)}
           />
         </div>

         {/* 班级筛选 */}
         <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">班级:</span>
           <input 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-primary"
             placeholder="请输入班级名称"
             value={filterClass}
             onChange={e => setFilterClass(e.target.value)}
           />
         </div>

         {/* 操作按钮 */}
         <div className="flex items-center gap-3 ml-2">
           <button 
             className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors"
             onClick={() => {}} // 搜索逻辑已在筛选器中实时处理
           >
             搜索
           </button>
            <button 
              className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors flex-shrink-0 h-[34px] shadow-sm font-medium"
              onClick={resetFilters}
            >
              重置
            </button>
         </div>
       </div>

       {/* ACTION BAR - 导出按钮 */}
       <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
             <button 
               onClick={exportOrderList}
               className="border border-primary text-primary hover:bg-primary-light px-4 py-1.5 rounded text-sm transition-colors"
             >
               导出订单列表
             </button>
          </div>
       </div>

      {/* Table */}
       {/* Table - 统一表格样式与班级管理一致 */}
       <div className="flex-1 overflow-hidden bg-white flex flex-col">
         <div className="flex-1 overflow-auto mx-4 my-4 border border-gray-200 rounded-lg">
           <table className="w-full text-left text-sm min-w-max">
             <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200 sticky top-0 z-10">
              <tr>
                  <th className="p-4 whitespace-nowrap">订单ID</th>
                  <th className="p-4 whitespace-nowrap">订单编号</th>
                  <th className="p-4 whitespace-nowrap">手机号</th>
                  <th className="p-4 whitespace-nowrap">学号</th>
                  <th className="p-4 whitespace-nowrap">学生姓名</th>
                  <th className="p-4 whitespace-nowrap">班级</th>
                <th className="p-4 whitespace-nowrap">订单状态</th>
                <th className="p-4 whitespace-nowrap">支付方式</th>
                <th className="p-4 whitespace-nowrap">支付时间</th>
                <th className="p-4 whitespace-nowrap">实付金额</th>
                <th className="p-4 whitespace-nowrap">原价金额</th>
                <th className="p-4 whitespace-nowrap">优惠金额</th>
                <th className="p-4 whitespace-nowrap">教辅费</th>
                <th className="p-4 whitespace-nowrap">课程费</th>
                <th className="p-4 whitespace-nowrap">购买节数</th>
                <th className="p-4 whitespace-nowrap">订单创建时间</th>
                 <th className="p-4 whitespace-nowrap sticky right-0 bg-[#F9FBFA] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                   <td className="p-4 text-gray-600">{order.id}</td>
                    <td className="p-4 text-gray-600">{order.orderNumber || '-'}</td>
                    <td className="p-4 text-gray-nowrap">{order.phone || '-'}</td>
                    <td className="p-4 text-gray-nowrap">{order.studentNumber || '-'}</td>
                    <td className="p-4 text-gray-nowrap">{order.studentName || '-'}</td>
                    <td className="p-4 text-gray-nowrap">{order.className}</td>
                  <td className="p-4">
                    {order.orderStatus ? (
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        order.orderStatus === '已支付' ? 'bg-green-50 text-green-600 border border-green-200' :
                        order.orderStatus === '待支付' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                        order.orderStatus === '已取消' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                        'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {order.orderStatus}
                      </span>
                    ) : order.status === 'paid' ? (
                      <span className="bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded text-xs">已支付</span>
                    ) : (
                      <span className="bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-0.5 rounded text-xs">待支付</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-600">{order.paymentMethod || '-'}</td>
                  <td className="p-4 text-gray-600 text-xs">{order.paymentTime}</td>
                  <td className="p-4 font-bold text-gray-800">¥{order.amount.toLocaleString()}</td>
                  <td className="p-4 text-gray-600">
                    {order.originalAmount ? `¥${order.originalAmount.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-4 text-green-600">
                    {order.discountAmount ? `-¥${order.discountAmount.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-4 text-gray-600">
                    {order.materialFee ? `¥${order.materialFee.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-4 text-gray-600">
                    {order.courseFee ? `¥${order.courseFee.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-4 text-gray-600">{order.lessonCount || '-'}</td>
                  <td className="p-4 text-gray-600 text-xs">{order.createdTime}</td>
                   <td className="p-4 whitespace-nowrap sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                     <div className="flex flex-col gap-1.5 text-xs">
                       <div className="flex gap-3">
                         <button 
                           className="text-primary hover:opacity-80"
                           onClick={() => handleViewPaymentProof(order)}
                         >
                           查看支付凭证
                         </button>
                         <button 
                           className="text-red-500 hover:opacity-80"
                           onClick={() => handleRefund(order)}
                         >
                           退款
                         </button>
                         <button 
                           className="text-purple-600 hover:opacity-80"
                           onClick={() => handleViewOperationLog(order)}
                         >
                           操作日志
                         </button>
                       </div>
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end text-sm text-gray-600 bg-white gap-2">
        <span>总计 {filteredOrders.length} 条</span>
        <button className="px-2 hover:text-primary">&lt;</button>
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">1</button>
        <button className="w-7 h-7 flex items-center justify-center rounded bg-primary text-white border border-primary">2</button>
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">3</button>
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">4</button>
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">5</button>
        <span>...</span>
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">10</button>
        <button className="px-2 hover:text-primary">&gt;</button>
        <select className="border border-gray-300 rounded px-2 py-1 ml-2 text-xs">
          <option>20 条/页</option>
          <option>50 条/页</option>
        </select>
      </div>
    </div>
  );
};

export default OrderManagement;