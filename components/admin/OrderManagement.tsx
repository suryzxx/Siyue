import React, { useState } from 'react';
import { ORDERS } from '../../constants';

const OrderManagement: React.FC = () => {
  const [filterId, setFilterId] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Filter Logic
  const filteredOrders = ORDERS.filter(order => {
    const matchId = !filterId || order.id.toLowerCase().includes(filterId.toLowerCase());
    const matchAccount = !filterAccount || order.studentAccount.includes(filterAccount);
    const matchStatus = !filterStatus || order.status === filterStatus;
    return matchId && matchAccount && matchStatus;
  });

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Title */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">订单管理</h2>
      </div>

      {/* Filter Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white">
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">订单ID:</span>
           <input 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-primary"
             placeholder="请输入订单ID"
             value={filterId}
             onChange={e => setFilterId(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">学生账号:</span>
           <input 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-primary"
             placeholder="请输入学生账号"
             value={filterAccount}
             onChange={e => setFilterAccount(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700">支付状态:</span>
           <select 
             className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40 text-gray-600 focus:outline-none focus:border-primary"
             value={filterStatus}
             onChange={e => setFilterStatus(e.target.value)}
           >
             <option value="">全部</option>
             <option value="paid">已支付</option>
             <option value="pending">待支付</option>
           </select>
        </div>

        <div className="flex items-center gap-3 ml-2">
          <button className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors">搜索</button>
          <button 
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-1.5 rounded text-sm transition-colors"
            onClick={() => {
              setFilterId('');
              setFilterAccount('');
              setFilterStatus('');
            }}
          >
            重置
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="border-t border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="p-4 whitespace-nowrap">订单ID</th>
                <th className="p-4 whitespace-nowrap">学生账号</th>
                <th className="p-4 whitespace-nowrap">商品名称</th>
                <th className="p-4 whitespace-nowrap">所属班级</th>
                <th className="p-4 whitespace-nowrap">实付金额</th>
                <th className="p-4 whitespace-nowrap">支付状态</th>
                <th className="p-4 whitespace-nowrap">创建时间</th>
                <th className="p-4 whitespace-nowrap">支付时间</th>
                <th className="p-4 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600">{order.id}</td>
                  <td className="p-4 text-gray-600">{order.studentAccount}</td>
                  <td className="p-4 text-gray-800">{order.productName}</td>
                  <td className="p-4 text-gray-600">{order.className}</td>
                  <td className="p-4 font-bold text-gray-800">¥{order.amount}</td>
                  <td className="p-4">
                    {order.status === 'paid' ? (
                      <span className="bg-[#EAF6F5] text-[#2DA194] border border-[#B2E2D3] px-2 py-0.5 rounded text-xs">已支付</span>
                    ) : (
                      <span className="bg-[#999] text-white px-2 py-0.5 rounded text-xs">待支付</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-600">{order.createdTime}</td>
                  <td className="p-4 text-gray-600">{order.paymentTime}</td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex gap-2 text-sm text-primary">
                      <button className="hover:opacity-80">查看支付凭证</button>
                      <button className="hover:opacity-80">退款</button>
                      <button className="hover:opacity-80">操作日志</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
