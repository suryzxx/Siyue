
import React, { useState } from 'react';

// Mock Data Interfaces
interface Campus {
  id: string;
  name: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  status: 'active' | 'disabled';
  classroomCount: number;
}

interface Classroom {
  id: string;
  name: string;
  campusId: string;
  campusName: string;
  capacity: number;
  detailAddress: string;
  status: 'active' | 'disabled';
}

const INITIAL_CAMPUSES: Campus[] = [
  { id: 'c1', name: '奥体网球中心校区', province: '江苏省', city: '南京市', district: '建邺区', detailAddress: '奥体中心梦之蓝网球中心3楼', status: 'active', classroomCount: 8 },
  { id: 'c2', name: '五台山校区', province: '江苏省', city: '南京市', district: '鼓楼区', detailAddress: '五台山1-6号（东二楼）', status: 'active', classroomCount: 12 },
  { id: 'c3', name: '龙江校区', province: '江苏省', city: '南京市', district: '鼓楼区', detailAddress: '易发科技大厦', status: 'active', classroomCount: 15 },
  { id: 'c4', name: '奥南校区', province: '江苏省', city: '南京市', district: '建邺区', detailAddress: '东南邻里茂', status: 'active', classroomCount: 10 },
];

const INITIAL_CLASSROOMS: Classroom[] = [
  { id: '101', name: '101教室', campusId: 'c3', campusName: '龙江校区', capacity: 20, detailAddress: '一楼左转第一间', status: 'active' },
  { id: '102', name: '102教室', campusId: 'c3', campusName: '龙江校区', capacity: 15, detailAddress: '一楼左转第二间', status: 'active' },
  { id: '105', name: '105教室', campusId: 'c3', campusName: '龙江校区', capacity: 25, detailAddress: '二楼多功能厅', status: 'active' },
  { id: '201', name: '201教室', campusId: 'c4', campusName: '奥南校区', capacity: 18, detailAddress: '二楼201', status: 'active' },
  { id: '202', name: '202教室', campusId: 'c4', campusName: '奥南校区', capacity: 18, detailAddress: '二楼202', status: 'active' },
  { id: '305', name: '305教室', campusId: 'c5', campusName: '大行宫校区', capacity: 30, detailAddress: '三楼大教室', status: 'active' },
];

const AddressManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campus' | 'classroom'>('campus');
  
  // Data State
  const [campuses, setCampuses] = useState<Campus[]>(INITIAL_CAMPUSES);
  const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);

  // Filters
  const [filterClassroomName, setFilterClassroomName] = useState('');
  const [filterClassroomCampus, setFilterClassroomCampus] = useState('');
  const [filterClassroomStatus, setFilterClassroomStatus] = useState('');

  // Modals
  const [showCampusModal, setShowCampusModal] = useState(false);
  const [showClassroomModal, setShowClassroomModal] = useState(false);
  
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  
  // Forms
  const [campusForm, setCampusForm] = useState({
    name: '',
    province: '江苏省',
    city: '南京市',
    district: '鼓楼区',
    detailAddress: ''
  });

  const [classroomForm, setClassroomForm] = useState({
    name: '',
    campusId: '',
    capacity: 20,
    detailAddress: '',
    status: 'active' as 'active' | 'disabled'
  });

  // --- Campus Handlers ---
  const handleOpenCampusModal = (campus?: Campus) => {
    if (campus) {
      setEditingCampus(campus);
      setCampusForm({
        name: campus.name,
        province: campus.province,
        city: campus.city,
        district: campus.district,
        detailAddress: campus.detailAddress
      });
    } else {
      setEditingCampus(null);
      setCampusForm({
        name: '',
        province: '江苏省',
        city: '南京市',
        district: '鼓楼区',
        detailAddress: ''
      });
    }
    setShowCampusModal(true);
  };

  const handleSaveCampus = () => {
    if (!campusForm.name || !campusForm.detailAddress) {
      alert('请填写完整信息');
      return;
    }
    if (campusForm.detailAddress.length > 20) {
      alert('详细地址不能超过20个字符');
      return;
    }

    if (editingCampus) {
      setCampuses(campuses.map(c => c.id === editingCampus.id ? { ...c, ...campusForm } : c));
    } else {
      const newCampus: Campus = {
        id: `c-${Date.now()}`,
        ...campusForm,
        status: 'active',
        classroomCount: 0
      };
      setCampuses([...campuses, newCampus]);
    }
    setShowCampusModal(false);
  };

  const handleToggleCampusStatus = (id: string) => {
      setCampuses(campuses.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'disabled' : 'active' } : c));
  };

  // --- Classroom Handlers ---
  const handleOpenClassroomModal = (classroom?: Classroom) => {
    if (classroom) {
      setEditingClassroom(classroom);
      setClassroomForm({
        name: classroom.name,
        campusId: classroom.campusId,
        capacity: classroom.capacity,
        detailAddress: classroom.detailAddress,
        status: classroom.status
      });
    } else {
      setEditingClassroom(null);
      setClassroomForm({
        name: '',
        campusId: '',
        capacity: 20,
        detailAddress: '',
        status: 'active'
      });
    }
    setShowClassroomModal(true);
  };

  const handleSaveClassroom = () => {
    if (!classroomForm.name || !classroomForm.campusId) {
      alert('请填写完整信息（名称、所属校区为必填）');
      return;
    }
    if (classroomForm.detailAddress.length > 30) {
      alert('详细地址不能超过30个字符');
      return;
    }

    const selectedCampus = campuses.find(c => c.id === classroomForm.campusId);
    const campusName = selectedCampus ? selectedCampus.name : '未知校区';

    if (editingClassroom) {
      setClassrooms(classrooms.map(c => c.id === editingClassroom.id ? {
        ...c,
        ...classroomForm,
        campusName // Update denormalized name
      } : c));
    } else {
      const newClassroom: Classroom = {
        id: `cr-${Date.now()}`,
        ...classroomForm,
        campusName
      };
      setClassrooms([...classrooms, newClassroom]);
      
      // Update campus classroom count (simple increment mock)
      setCampuses(campuses.map(c => c.id === classroomForm.campusId ? { ...c, classroomCount: c.classroomCount + 1 } : c));
    }
    setShowClassroomModal(false);
  };

  const handleToggleClassroomStatus = (id: string) => {
    setClassrooms(classrooms.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'disabled' : 'active' } : c));
  };

  // Filter Logic
  const filteredClassrooms = classrooms.filter(c => {
    const matchName = !filterClassroomName || c.name.toLowerCase().includes(filterClassroomName.toLowerCase());
    const matchCampus = !filterClassroomCampus || c.campusName === filterClassroomCampus;
    const matchStatus = !filterClassroomStatus || c.status === filterClassroomStatus;
    return matchName && matchCampus && matchStatus;
  });

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden relative">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">地址管理</h2>
      </div>

      <div className="flex border-b border-gray-100 px-6">
        <div 
          onClick={() => setActiveTab('campus')}
          className={`py-3 mr-6 cursor-pointer text-sm font-medium border-b-2 transition-colors ${activeTab === 'campus' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          校区列表
        </div>
        <div 
          onClick={() => setActiveTab('classroom')}
          className={`py-3 cursor-pointer text-sm font-medium border-b-2 transition-colors ${activeTab === 'classroom' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          教室列表
        </div>
      </div>

      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white flex-wrap gap-4">
         {/* Filters for Classroom Tab */}
         {activeTab === 'classroom' ? (
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                   <span className="text-sm text-gray-600">教室名称:</span>
                   <input 
                     className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40 focus:outline-none focus:border-primary"
                     placeholder="请输入教室名称"
                     value={filterClassroomName}
                     onChange={e => setFilterClassroomName(e.target.value)}
                   />
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-sm text-gray-600">校区:</span>
                   <select 
                     className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40 focus:outline-none focus:border-primary bg-white text-gray-700"
                     value={filterClassroomCampus}
                     onChange={e => setFilterClassroomCampus(e.target.value)}
                   >
                     <option value="">全部校区</option>
                     {campuses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                   </select>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-sm text-gray-600">状态:</span>
                   <select 
                     className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 focus:outline-none focus:border-primary bg-white text-gray-700"
                     value={filterClassroomStatus}
                     onChange={e => setFilterClassroomStatus(e.target.value)}
                   >
                     <option value="">全部状态</option>
                     <option value="active">已启用</option>
                     <option value="disabled">已禁用</option>
                   </select>
                </div>
                <button 
                  className="bg-primary hover:bg-teal-600 text-white px-4 py-1.5 rounded text-sm transition-colors ml-2"
                  onClick={() => {/* Filter applied via state */}}
                >
                  搜索
                </button>
                 <button 
                   className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors flex-shrink-0 h-[34px] shadow-sm font-medium ml-2"
                   onClick={() => { setFilterClassroomName(''); setFilterClassroomCampus(''); setFilterClassroomStatus(''); }}
                 >
                   重置
                 </button>
            </div>
         ) : (
             <div></div> // Spacer for Campus tab
          )}
       </div>

       {/* ACTION BAR - 创建按钮居左 */}
       <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => activeTab === 'campus' ? handleOpenCampusModal() : handleOpenClassroomModal()}
               className="bg-primary hover:bg-teal-600 text-white px-5 py-1.5 rounded text-sm transition-colors"
             >
               {activeTab === 'campus' ? '创建校区' : '创建教室'}
             </button>
          </div>
       </div>

       {/* Table - 统一表格样式与班级管理一致 */}
      <div className="flex-1 overflow-hidden bg-white flex flex-col">
        <div className="flex-1 overflow-auto mx-4 my-4 border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm min-w-max">
            <thead className="bg-[#F9FBFA] text-gray-600 font-medium border-b border-gray-200 sticky top-0 z-10">
              {activeTab === 'campus' ? (
                 <tr>
                   <th className="p-4">校区名称</th>
                   <th className="p-4">校区地址</th>
                   <th className="p-4">教室数量</th>
                   <th className="p-4">状态</th>
                   <th className="p-4 text-right sticky right-0 bg-[#F9FBFA] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">操作</th>
                 </tr>
              ) : (
                 <tr>
                   <th className="p-4">教室名称</th>
                   <th className="p-4">所属校区</th>
                   <th className="p-4">容纳人数</th>
                   <th className="p-4">详细地址</th>
                   <th className="p-4">状态</th>
                   <th className="p-4 text-right sticky right-0 bg-[#F9FBFA] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">操作</th>
                 </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeTab === 'campus' && campuses.map((campus) => (
                <tr key={campus.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{campus.name}</td>
                  <td className="p-4 text-gray-600">
                      {campus.province}-{campus.city}-{campus.district} {campus.detailAddress}
                  </td>
                  <td className="p-4 text-gray-600">{campus.classroomCount}</td>
                  <td className="p-4">
                      {campus.status === 'active' ? (
                          <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs border border-green-100">已启用</span>
                      ) : (
                          <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded text-xs border border-gray-200">已禁用</span>
                      )}
                  </td>
                   <td className="p-4 text-right text-primary sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                     <button onClick={() => handleOpenCampusModal(campus)} className="mr-3 hover:opacity-80">编辑</button>
                     <button onClick={() => handleToggleCampusStatus(campus.id)} className="hover:opacity-80">
                         {campus.status === 'active' ? '禁用' : '启用'}
                     </button>
                   </td>
                </tr>
              ))}
              {activeTab === 'classroom' && filteredClassrooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{room.name}</td>
                  <td className="p-4 text-gray-600">{room.campusName}</td>
                  <td className="p-4 text-gray-600">{room.capacity}人</td>
                  <td className="p-4 text-gray-600 text-xs">{room.detailAddress || '-'}</td>
                  <td className="p-4">
                      {room.status === 'active' ? (
                          <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs border border-green-100">已启用</span>
                      ) : (
                          <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded text-xs border border-gray-200">已禁用</span>
                      )}
                  </td>
                   <td className="p-4 text-right text-primary sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                     <button onClick={() => handleOpenClassroomModal(room)} className="mr-3 hover:opacity-80">编辑</button>
                     <button onClick={() => handleToggleClassroomStatus(room.id)} className="hover:opacity-80">
                         {room.status === 'active' ? '禁用' : '启用'}
                     </button>
                   </td>
                </tr>
              ))}
              {activeTab === 'classroom' && filteredClassrooms.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-400">暂无教室数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campus Modal */}
      {showCampusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-[500px] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">{editingCampus ? '编辑校区' : '创建校区'}</h3>
                    <button onClick={() => setShowCampusModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5"><span className="text-red-500 mr-1">*</span>校区名称</label>
                        <input 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                            placeholder="请输入校区名称"
                            value={campusForm.name}
                            onChange={e => setCampusForm({...campusForm, name: e.target.value})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5"><span className="text-red-500 mr-1">*</span>校区地区</label>
                        <div className="flex gap-2">
                            <select 
                                className="flex-1 border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                                value={campusForm.province}
                                onChange={e => setCampusForm({...campusForm, province: e.target.value})}
                            >
                                <option value="江苏省">江苏省</option>
                                <option value="广东省">广东省</option>
                            </select>
                            <select 
                                className="flex-1 border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                                value={campusForm.city}
                                onChange={e => setCampusForm({...campusForm, city: e.target.value})}
                            >
                                <option value="南京市">南京市</option>
                                <option value="深圳市">深圳市</option>
                            </select>
                            <select 
                                className="flex-1 border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                                value={campusForm.district}
                                onChange={e => setCampusForm({...campusForm, district: e.target.value})}
                            >
                                <option value="鼓楼区">鼓楼区</option>
                                <option value="建邺区">建邺区</option>
                                <option value="玄武区">玄武区</option>
                                <option value="栖霞区">栖霞区</option>
                                <option value="南山区">南山区</option>
                                <option value="宝安区">宝安区</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5"><span className="text-red-500 mr-1">*</span>详细地址</label>
                        <input 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                            placeholder="请输入详细地址 (20字以内)"
                            maxLength={20}
                            value={campusForm.detailAddress}
                            onChange={e => setCampusForm({...campusForm, detailAddress: e.target.value})}
                        />
                        <div className="text-right text-xs text-gray-400 mt-1">{campusForm.detailAddress.length}/20</div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button 
                        onClick={() => setShowCampusModal(false)}
                        className="px-5 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleSaveCampus}
                        className="px-5 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm"
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Classroom Modal */}
      {showClassroomModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-[500px] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">{editingClassroom ? '编辑教室' : '创建教室'}</h3>
                    <button onClick={() => setShowClassroomModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5"><span className="text-red-500 mr-1">*</span>教室名称</label>
                        <input 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                            placeholder="请输入教室名称 (如：101教室)"
                            value={classroomForm.name}
                            onChange={e => setClassroomForm({...classroomForm, name: e.target.value})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5"><span className="text-red-500 mr-1">*</span>所属校区</label>
                        <select 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white text-gray-700"
                            value={classroomForm.campusId}
                            onChange={e => setClassroomForm({...classroomForm, campusId: e.target.value})}
                        >
                            <option value="">请选择所属校区</option>
                            {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">容纳人数</label>
                        <input 
                            type="number"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                            placeholder="请输入容纳人数"
                            value={classroomForm.capacity}
                            onChange={e => setClassroomForm({...classroomForm, capacity: parseInt(e.target.value) || 0})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">详细地址</label>
                        <input 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                            placeholder="请输入详细地址 (30字以内)"
                            maxLength={30}
                            value={classroomForm.detailAddress}
                            onChange={e => setClassroomForm({...classroomForm, detailAddress: e.target.value})}
                        />
                        <div className="text-right text-xs text-gray-400 mt-1">{classroomForm.detailAddress.length}/30</div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button 
                        onClick={() => setShowClassroomModal(false)}
                        className="px-5 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleSaveClassroom}
                        className="px-5 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm"
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AddressManagement;
