
import React, { useState } from 'react';

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('org_info');
  
  // --- Institution Info State ---
  const [orgForm, setOrgForm] = useState({
    name: '思悦',
    region: { province: '北京市', city: '市辖区', district: '东城区' },
    detailAddress: '',
    category: '出国语培',
    stages: [] as string[]
  });

  // --- Attendance State ---
  const [attendanceConfig, setAttendanceConfig] = useState({
    deductionTypes: ['出勤', '迟到', '早退', '旷课'], // Selected types
    autoClass: false,
    auto1to1: false,
    lockTime: 'daily',
    allowModify: true,
    modifyRole: '区管'
  });

  // --- Reschedule State ---
  const [rescheduleConfig, setRescheduleConfig] = useState({
    autoStudent: true,
    virtualSeats: 2,
    limitCount: 4,
    // 春季续报期, 暑期续报期, 秋季续报期, 寒假续报期
    springRenewal: { startDate: '2026-03-01', endDate: '2026-03-07' },
    summerRenewal: { startDate: '2026-07-01', endDate: '2026-07-07' },
    autumnRenewal: { startDate: '2026-08-01', endDate: '2026-08-07' },
    winterRenewal: { startDate: '2026-02-01', endDate: '2026-02-07' }
  });

  // --- Transfer State ---
  const [transferConfig, setTransferConfig] = useState({
    autoStudent: true,
    sameTerm: true,
    sameSubject: true,
    sameGrade: true,
    sameType: true,
    allowPriceDiff: false, // 是否允许价格高向价格低转
    transferMaterial: false // 是否允许教辅费转入余额
  });

  // --- Settlement State ---
  const [settlementConfig, setSettlementConfig] = useState({
    settlementDays: 0,
    allowModify: false,
    allowRefund: false
  });

  // --- Student Upgrade Table Mock ---
  const upgradeRules = [
    { current: '无年级', next: '无年级' },
    { current: '学前', next: '小班' },
    { current: '小班', next: '中班' },
    { current: '中班', next: '大班' },
    { current: '大班', next: '一年级' },
    { current: '一年级', next: '二年级' },
    { current: '二年级', next: '三年级' },
    { current: '三年级', next: '四年级' },
    { current: '四年级', next: '五年级' },
    { current: '五年级', next: '六年级' },
    { current: '六年级', next: '七年级' },
    { current: '七年级', next: '八年级' },
    { current: '八年级', next: '九年级' },
    { current: '九年级', next: '高一' },
    { current: '高一', next: '高二' },
    { current: '高二', next: '高三' },
    { current: '高三', next: '高三' },
  ];

  // --- Holidays State ---
  const [year, setYear] = useState(2026);
  const [holidays, setHolidays] = useState([
    { date: '2026.01.05', name: '寒假停课', id: 1 },
    { date: '2026.01.06', name: '寒假停课', id: 2 },
    { date: '2026.01.07', name: '寒假停课', id: 3 },
    { date: '2026.01.12', name: '寒假停课', id: 4 },
    { date: '2026.01.13', name: '寒假停课', id: 5 },
    { date: '2026.01.14', name: '寒假停课', id: 6 },
    { date: '2026.01.19', name: '寒假停课', id: 7 },
    { date: '2026.01.20', name: '寒假停课', id: 8 },
    { date: '2026.01.21', name: '寒假停课', id: 9 },
    { date: '2026.01.26', name: '寒假停课', id: 10 },
    { date: '2026.01.27', name: '寒假停课', id: 11 },
  ]);

  // Modal State for Adding Holiday
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
      startDate: '',
      endDate: '',
      name: ''
  });

  const handleAddHoliday = () => {
      if(!holidayForm.startDate || !holidayForm.name) {
          alert('请填写完整信息');
          return;
      }
      
      const newHolidays = [...holidays];
      let current = new Date(holidayForm.startDate);
      const end = new Date(holidayForm.endDate || holidayForm.startDate);
      let idCounter = Math.max(...holidays.map(h => h.id), 0);

      while(current <= end) {
          const dateStr = `${current.getFullYear()}.${String(current.getMonth()+1).padStart(2,'0')}.${String(current.getDate()).padStart(2,'0')}`;
          
          // Check if date already exists to avoid duplicates
          if (!newHolidays.find(h => h.date === dateStr)) {
              idCounter++;
              newHolidays.push({
                  id: idCounter,
                  date: dateStr,
                  name: holidayForm.name
              });
          }
          current.setDate(current.getDate() + 1);
      }
      
      // Sort by date
      newHolidays.sort((a, b) => a.date.localeCompare(b.date));

      setHolidays(newHolidays);
      setShowHolidayModal(false);
      setHolidayForm({ startDate: '', endDate: '', name: '' });
  };

  const strictTabs = [
    { id: 'org_info', label: '机构信息' },
    { id: 'attendance', label: '考勤配置' },
    { id: 'student_info', label: '学生信息' },
    { id: 'holidays', label: '停课日' },
    { id: 'reschedule', label: '调课配置' },
    { id: 'transfer', label: '转班配置' },
    { id: 'settlement', label: '结算配置' },
  ];

  const stagesOptions = ['幼儿', '小学', '初中', '高中', '大学', '成人'];

  const handleStageChange = (stage: string) => {
    setOrgForm(prev => {
      const newStages = prev.stages.includes(stage)
        ? prev.stages.filter(s => s !== stage)
        : [...prev.stages, stage];
      return { ...prev, stages: newStages };
    });
  };

  // --- Sub-renderers ---

  const renderAttendance = () => (
    <div className="max-w-4xl space-y-8 text-sm text-gray-600">
        {/* Type 1 */}
        <div className="space-y-3">
            <div className="text-gray-800 font-medium">锁定考勤不可更改</div>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-400 flex items-center gap-2">
                <span className="bg-gray-200 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">!</span>
                根据每天的23:59:59截止不可修改
            </div>
            <div className="w-64">
                <select className="w-full bg-[#F6F7FB] border border-transparent hover:border-gray-200 rounded px-3 py-2 outline-none text-gray-700">
                    <option value="daily">每天</option>
                    <option value="weekly">每周</option>
                </select>
            </div>
        </div>

        {/* Type 2 */}
        <div className="space-y-3">
            <div className="text-gray-800 font-medium">是否允许修改考勤</div>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-400 flex items-center gap-2">
                <span className="bg-gray-200 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">!</span>
                允许后，只能修改未结算的学生
            </div>
            <div className="flex gap-6 mb-3">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={attendanceConfig.allowModify} onChange={() => setAttendanceConfig({...attendanceConfig, allowModify: true})} className="text-primary focus:ring-primary"/> 允许</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={!attendanceConfig.allowModify} onChange={() => setAttendanceConfig({...attendanceConfig, allowModify: false})} className="text-primary focus:ring-primary"/> 不允许</label>
            </div>
            {attendanceConfig.allowModify && (
                <div className="flex items-center gap-2">
                    <span className="text-gray-600">请选择职位</span>
                    <select className="w-48 bg-white border border-gray-200 rounded px-3 py-1.5 outline-none text-gray-700 text-sm">
                        <option value="区管">区管</option>
                        <option value="校长">校长</option>
                    </select>
                </div>
            )}
        </div>
    </div>
  );

  const renderStudentInfo = () => (
    <div className="max-w-5xl">
        <div className="mb-6 font-bold text-gray-800 text-base">学生升级</div>
        <button className="bg-primary hover:bg-teal-600 text-white px-6 py-2 rounded text-sm mb-6 transition-colors shadow-sm">
            学生批量升级
        </button>

        <div className="mb-6 text-sm text-gray-500 space-y-1">
            <p className="font-bold text-gray-700 mb-2">说明</p>
            <p>1. 每年7-10月支持升级操作，每年仅能操作一次。</p>
            <p>2. 升级成功后无法撤销操作。</p>
            <p>3. 升级规则如图：</p>
        </div>

        <div className="border border-gray-200 rounded overflow-hidden max-w-2xl">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                        <th className="p-3 border-b border-r border-gray-200 w-1/2">目前学生年级</th>
                        <th className="p-3 border-b border-gray-200 w-1/2">学生升级后对应年级</th>
                    </tr>
                </thead>
                <tbody>
                    {upgradeRules.map((rule, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                            <td className="p-3 border-b border-r border-gray-100 text-gray-700">{rule.current}</td>
                            <td className="p-3 border-b border-gray-100 text-primary font-medium">{rule.next}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderHolidays = () => {
      // Helper to render a mini calendar month
      const renderMonth = (month: number) => {
          // Hardcoded layout for visualization as per image request
          const days = 31;
          const monthHolidays = holidays.filter(h => h.date.startsWith(`2026.${String(month).padStart(2, '0')}`));
          const holidayDays = monthHolidays.map(h => parseInt(h.date.split('.')[2]));

          return (
              <div className="mb-8">
                  <div className="text-lg font-bold text-gray-700 mb-4">{month}月</div>
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                      <div className="text-gray-400 text-xs mb-2">日</div>
                      <div className="text-gray-400 text-xs mb-2">一</div>
                      <div className="text-gray-400 text-xs mb-2">二</div>
                      <div className="text-gray-400 text-xs mb-2">三</div>
                      <div className="text-gray-400 text-xs mb-2">四</div>
                      <div className="text-gray-400 text-xs mb-2">五</div>
                      <div className="text-gray-400 text-xs mb-2">六</div>
                      
                      {/* Blank start padding (mock) */}
                      {month === 1 && <div className="col-span-4"></div>}
                      {month === 2 && <div className="col-span-0"></div>}
                      
                      {Array.from({length: days}).map((_, i) => {
                          const day = i + 1;
                          const isHoliday = holidayDays.includes(day);
                          return (
                              <div key={day} className="h-8 flex items-center justify-center">
                                  {isHoliday ? (
                                      <span className="w-6 h-6 bg-[#FF5733] text-white rounded-full flex items-center justify-center text-xs">{day}</span>
                                  ) : (
                                      <span className="text-gray-600">{day}</span>
                                  )}
                              </div>
                          );
                      })}
                  </div>
              </div>
          );
      };

      return (
        <div className="flex h-full gap-8">
            <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-center gap-4 mb-6">
                    <button onClick={() => setYear(year - 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500">{'<'}</button>
                    <span className="text-2xl font-bold text-gray-800">{year}年</span>
                    <button onClick={() => setYear(year + 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500">{'>'}</button>
                </div>
                
                <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-3 gap-x-12 px-4">
                    {renderMonth(1)}
                    {renderMonth(2)}
                    {renderMonth(3)}
                    {renderMonth(4)}
                    {renderMonth(5)}
                    {renderMonth(6)}
                    {renderMonth(7)}
                    {renderMonth(8)}
                    {renderMonth(9)}
                </div>
            </div>

            <div className="w-[400px] border-l border-gray-100 pl-8 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <button 
                        onClick={() => setShowHolidayModal(true)}
                        className="bg-primary hover:bg-teal-600 text-white px-4 py-2 rounded text-sm transition-colors shadow-sm"
                    >
                        添加停课日
                    </button>
                    <div className="text-right">
                        <span className="text-sm text-gray-600">{year}年停课日: {holidays.length}天</span>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded flex-1 overflow-hidden flex flex-col">
                    <div className="flex bg-gray-50 border-b border-gray-100 p-3 text-sm text-gray-600 font-bold">
                        <div className="w-32">停课日期</div>
                        <div className="flex-1">停课日名称</div>
                        <div className="w-16 text-right">操作</div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-0">
                        {holidays.map(h => (
                            <div key={h.id} className="flex p-3 border-b border-gray-50 text-sm hover:bg-gray-50">
                                <div className="w-32 text-gray-600">{h.date}</div>
                                <div className="flex-1 text-gray-800">{h.name}</div>
                                <div className="w-16 text-right">
                                    <button 
                                        className="text-primary hover:underline text-xs"
                                        onClick={() => setHolidays(holidays.filter(item => item.id !== h.id))}
                                    >
                                        删除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ADD HOLIDAY MODAL */}
            {showHolidayModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl w-[550px] flex flex-col animate-fade-in">
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">添加停课日</h3>
                            <button onClick={() => setShowHolidayModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        
                        <div className="p-10 space-y-8">
                            <div className="flex items-start">
                                <label className="w-24 text-sm text-gray-600 text-right mr-4 mt-2 font-medium"><span className="text-red-500 mr-1">*</span>停课日时间</label>
                                <div className="flex-1 flex items-center gap-3">
                                    <div className="relative flex-1">
                                         <span className="absolute left-3 top-2.5 text-gray-400 text-sm">📅</span>
                                         <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 pl-9 text-sm focus:outline-none focus:border-primary text-gray-600" 
                                            value={holidayForm.startDate}
                                            onChange={e => setHolidayForm({...holidayForm, startDate: e.target.value})}
                                            placeholder="开始日期"
                                         />
                                    </div>
                                    <span className="text-gray-500 text-sm font-medium">至</span>
                                    <div className="relative flex-1">
                                         <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600" 
                                            value={holidayForm.endDate}
                                            onChange={e => setHolidayForm({...holidayForm, endDate: e.target.value})}
                                            placeholder="结束日期"
                                         />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <label className="w-24 text-sm text-gray-600 text-right mr-4 font-medium"><span className="text-red-500 mr-1">*</span>停课日名称</label>
                                <input 
                                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary placeholder-gray-400"
                                    placeholder="请输入停课日名称，例：五一节假日停课1天"
                                    value={holidayForm.name}
                                    onChange={e => setHolidayForm({...holidayForm, name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="px-8 py-5 border-t border-gray-100 flex justify-center gap-4">
                            <button onClick={() => setShowHolidayModal(false)} className="px-10 py-2.5 border border-gray-200 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm font-medium transition-colors">取消</button>
                            <button onClick={handleAddHoliday} className="px-10 py-2.5 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm font-medium transition-colors">确定</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  };



  const renderReschedule = () => (
    <div className="max-w-4xl space-y-12 text-sm text-gray-600">
        <div className="space-y-8">
            <div className="space-y-3">
                <div className="text-gray-800 font-medium">学生端自动调课设置</div>
                <div className="bg-gray-50 p-3 rounded text-xs text-gray-400 flex items-center gap-2">
                    <span className="bg-gray-200 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">!</span>
                    允许后，学生/家长可自行在学生端网校、APP、小程序内进行调课操作，且无需审核，符合条件可直接调课成功
                </div>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={rescheduleConfig.autoStudent} onChange={() => setRescheduleConfig({...rescheduleConfig, autoStudent: true})} className="text-primary focus:ring-primary"/> 允许</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={!rescheduleConfig.autoStudent} onChange={() => setRescheduleConfig({...rescheduleConfig, autoStudent: false})} className="text-primary focus:ring-primary"/> 不允许</label>
                </div>
            </div>

            {rescheduleConfig.autoStudent && (
              <div className="space-y-6">
                {/* 寒假续报期 */}
                <div className="space-y-2">
                  <div className="text-gray-800 font-medium">寒假续报期</div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.winterRenewal.startDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        winterRenewal: { ...rescheduleConfig.winterRenewal, startDate: e.target.value }
                      })}
                    />
                    <span className="text-gray-500 text-sm font-medium">至</span>
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.winterRenewal.endDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        winterRenewal: { ...rescheduleConfig.winterRenewal, endDate: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {/* 春季续报期 */}
                <div className="space-y-2">
                  <div className="text-gray-800 font-medium">春季续报期</div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.springRenewal.startDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        springRenewal: { ...rescheduleConfig.springRenewal, startDate: e.target.value }
                      })}
                    />
                    <span className="text-gray-500 text-sm font-medium">至</span>
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.springRenewal.endDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        springRenewal: { ...rescheduleConfig.springRenewal, endDate: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {/* 暑期续报期 */}
                <div className="space-y-2">
                  <div className="text-gray-800 font-medium">暑期续报期</div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.summerRenewal.startDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        summerRenewal: { ...rescheduleConfig.summerRenewal, startDate: e.target.value }
                      })}
                    />
                    <span className="text-gray-500 text-sm font-medium">至</span>
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.summerRenewal.endDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        summerRenewal: { ...rescheduleConfig.summerRenewal, endDate: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {/* 秋季续报期 */}
                <div className="space-y-2">
                  <div className="text-gray-800 font-medium">秋季续报期</div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.autumnRenewal.startDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        autumnRenewal: { ...rescheduleConfig.autumnRenewal, startDate: e.target.value }
                      })}
                    />
                    <span className="text-gray-500 text-sm font-medium">至</span>
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.autumnRenewal.endDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        autumnRenewal: { ...rescheduleConfig.autumnRenewal, endDate: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
        </div>
    </div>
  );

  const renderTransfer = () => (
    <div className="max-w-4xl space-y-12 text-sm text-gray-600">
        <div className="space-y-8">
            <div className="space-y-3">
                <div className="text-gray-800 font-medium">学生端自动转班设置</div>
                <div className="bg-gray-50 p-3 rounded text-xs text-gray-400 flex items-center gap-2">
                    <span className="bg-gray-200 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">!</span>
                    允许后，学生/家长可自行在学生端网校、APP、小程序内进行转班操作，且无需审核，符合条件可直接转班成功
                </div>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={rescheduleConfig.autoStudent} onChange={() => setRescheduleConfig({...rescheduleConfig, autoStudent: true})} className="text-primary focus:ring-primary"/> 允许</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={!rescheduleConfig.autoStudent} onChange={() => setRescheduleConfig({...rescheduleConfig, autoStudent: false})} className="text-primary focus:ring-primary"/> 不允许</label>
                </div>
            </div>

            {rescheduleConfig.autoStudent && (
              <div className="space-y-6">
                {/* 寒假续报期 */}
                <div className="space-y-2">
                  <div className="text-gray-800 font-medium">寒假续报期</div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.winterRenewal.startDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        winterRenewal: { ...rescheduleConfig.winterRenewal, startDate: e.target.value }
                      })}
                    />
                    <span className="text-gray-500 text-sm font-medium">至</span>
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.winterRenewal.endDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        winterRenewal: { ...rescheduleConfig.winterRenewal, endDate: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {/* 春季续报期 */}
                <div className="space-y-2">
                  <div className="text-gray-800 font-medium">春季续报期</div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.springRenewal.startDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        springRenewal: { ...rescheduleConfig.springRenewal, startDate: e.target.value }
                      })}
                    />
                    <span className="text-gray-500 text-sm font-medium">至</span>
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.springRenewal.endDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        springRenewal: { ...rescheduleConfig.springRenewal, endDate: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {/* 暑期续报期 */}
                <div className="space-y-2">
                  <div className="text-gray-800 font-medium">暑期续报期</div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.summerRenewal.startDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        summerRenewal: { ...rescheduleConfig.summerRenewal, startDate: e.target.value }
                      })}
                    />
                    <span className="text-gray-500 text-sm font-medium">至</span>
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.summerRenewal.endDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        summerRenewal: { ...rescheduleConfig.summerRenewal, endDate: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {/* 秋季续报期 */}
                <div className="space-y-2">
                  <div className="text-gray-800 font-medium">秋季续报期</div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.autumnRenewal.startDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        autumnRenewal: { ...rescheduleConfig.autumnRenewal, startDate: e.target.value }
                      })}
                    />
                    <span className="text-gray-500 text-sm font-medium">至</span>
                    <input 
                      type="date" 
                      className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary text-gray-600"
                      value={rescheduleConfig.autumnRenewal.endDate}
                      onChange={e => setRescheduleConfig({
                        ...rescheduleConfig,
                        autumnRenewal: { ...rescheduleConfig.autumnRenewal, endDate: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
        </div>
    </div>
  );

  const renderSettlement = () => (
    <div className="max-w-4xl space-y-8 text-sm text-gray-600">
        <div className="space-y-3">
            <div className="text-gray-800 font-medium">班级结课几天后进行结算？（面授课）</div>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-400 flex items-center gap-2">
                <span className="bg-gray-200 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">!</span>
                默认为0天，即在结课当天晚上24点进行结算，结算后无法再修改考勤，也不能给学生原路退款
            </div>
            <div className="flex items-center gap-4">
                <input 
                    type="number" 
                    min="0" 
                    value={settlementConfig.settlementDays}
                    onChange={(e) => setSettlementConfig({...settlementConfig, settlementDays: parseInt(e.target.value) || 0})}
                    className="w-32 bg-white border border-gray-200 rounded px-3 py-2 outline-none text-gray-700 text-sm focus:border-primary"
                />
                <span className="text-gray-600">天</span>
                <span className="text-gray-500 text-sm">
                    {settlementConfig.settlementDays === 0 ? '结课后 0 天进行结算' : `结课后 ${settlementConfig.settlementDays} 天进行结算`}
                </span>
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-[#F5F7F9]">
        <h2 className="text-sm text-gray-500">系统设置</h2>
      </div>

      <div className="flex-1 flex flex-col bg-white overflow-hidden m-4 rounded-xl shadow-sm border border-gray-100">
          {/* Tabs Header */}
          <div className="flex px-8 border-b border-gray-100 overflow-x-auto no-scrollbar pt-2">
            {strictTabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 mr-10 cursor-pointer text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-10">
            {activeTab === 'org_info' && (
              <div className="max-w-4xl">
                <div className="mb-10">
                   <button className="bg-primary text-white px-8 py-2 rounded shadow-sm hover:bg-teal-600 text-sm font-medium transition-colors">
                     修改
                   </button>
                </div>

                <div className="space-y-8">
                  {/* Name */}
                  <div className="flex items-center">
                    <label className="w-24 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>机构名称:</label>
                    <input 
                      className="w-[400px] bg-[#F6F7FB] border border-transparent hover:border-gray-200 focus:bg-white focus:border-primary rounded px-3 py-2.5 text-sm outline-none transition-all text-gray-700"
                      value={orgForm.name}
                      onChange={e => setOrgForm({...orgForm, name: e.target.value})}
                    />
                  </div>

                  {/* Address Region */}
                  <div className="flex items-center">
                    <label className="w-24 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>机构地址:</label>
                    <div className="flex gap-2 w-[400px]">
                       <select className="flex-1 bg-[#F6F7FB] border border-transparent hover:border-gray-200 rounded px-3 py-2.5 text-sm outline-none text-gray-700">
                          <option>北京市</option>
                          <option>江苏省</option>
                       </select>
                       <select className="flex-1 bg-[#F6F7FB] border border-transparent hover:border-gray-200 rounded px-3 py-2.5 text-sm outline-none text-gray-700">
                          <option>市辖区</option>
                          <option>南京市</option>
                       </select>
                       <select className="flex-1 bg-[#F6F7FB] border border-transparent hover:border-gray-200 rounded px-3 py-2.5 text-sm outline-none text-gray-700">
                          <option>东城区</option>
                          <option>鼓楼区</option>
                       </select>
                    </div>
                  </div>

                  {/* Address Detail */}
                  <div className="flex items-center">
                    <label className="w-24 text-sm text-gray-500 text-right mr-4">详细地址:</label>
                    <input 
                      className="w-[400px] bg-[#F6F7FB] border border-transparent hover:border-gray-200 focus:bg-white focus:border-primary rounded px-3 py-2.5 text-sm outline-none transition-all text-gray-700 placeholder-gray-400"
                      placeholder="请填写详细地址"
                      value={orgForm.detailAddress}
                      onChange={e => setOrgForm({...orgForm, detailAddress: e.target.value})}
                    />
                  </div>

                  {/* Category */}
                  <div className="flex items-center">
                    <label className="w-24 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>主营类目:</label>
                    <select 
                      className="w-[400px] bg-[#F6F7FB] border border-transparent hover:border-gray-200 rounded px-3 py-2.5 text-sm outline-none text-gray-700"
                      value={orgForm.category}
                      onChange={e => setOrgForm({...orgForm, category: e.target.value})}
                    >
                       <option>出国语培</option>
                       <option>K12教育</option>
                       <option>素质教育</option>
                    </select>
                  </div>

                  {/* Stages */}
                  <div className="flex items-start pt-1">
                    <label className="w-24 text-sm text-gray-500 text-right mr-4"><span className="text-red-500 mr-1">*</span>覆盖学段:</label>
                    <div className="flex gap-8 flex-wrap flex-1 pt-1">
                       {stagesOptions.map(stage => (
                         <label key={stage} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 select-none">
                            <input 
                              type="checkbox" 
                              checked={orgForm.stages.includes(stage)}
                              onChange={() => handleStageChange(stage)}
                              className="rounded text-primary focus:ring-primary w-4 h-4 bg-[#F6F7FB] border-gray-300"
                            />
                            {stage}
                         </label>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

             {activeTab === 'attendance' && renderAttendance()}
             {activeTab === 'student_info' && renderStudentInfo()}
             {activeTab === 'holidays' && renderHolidays()}
             {activeTab === 'reschedule' && renderReschedule()}
             {activeTab === 'transfer' && renderTransfer()}
             {activeTab === 'settlement' && renderSettlement()}

             {/* Placeholders for other tabs */}
             {!['org_info', 'attendance', 'student_info', 'holidays', 'reschedule', 'transfer', 'settlement'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center h-96 text-gray-300">
                 <div className="text-6xl mb-6 opacity-50">🛠️</div>
                 <div className="text-lg font-medium">{strictTabs.find(t => t.id === activeTab)?.label} 功能模块开发中...</div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default SystemSettings;
