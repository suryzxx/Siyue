import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { CLASSES, ADMIN_STUDENTS, CAMPUSES, COURSES, TEACHERS } from '../../constants';

const GRADE_OPTIONS = [
  '小班', '中班', '大班',
  '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
  '初一', '初二', '初三',
  '高一', '高二', '高三'
];

const ACQUISITION_CHANNEL_OPTIONS = [
  '朋友/熟人推荐',
  '小红书',
  '思悦社群',
  '思悦公众号/视频号',
  '抖音',
  '大众点评',
  '线下地推',
  '其他'
];

interface ManualOrderStudent {
  id: string;
  name: string;
  phone: string;
  campus: string;
  gender: string;
}

interface ManualOrderClass {
  id: string;
  classId: string;
  name: string;
  businessType: '新签' | '续报' | '预售';
  paymentOption: '整期' | '分期';
  fee: number;
  amount: number;
}

interface ManualOrderPageProps {
  onBack: () => void;
  onNavigateToClass?: (classId: string) => void;
}

const ManualOrderPage: React.FC<ManualOrderPageProps> = ({ onBack, onNavigateToClass }) => {
  const [selectedStudent, setSelectedStudent] = useState<ManualOrderStudent | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<ManualOrderClass[]>([]);
  const [showStudentSelectModal, setShowStudentSelectModal] = useState(false);
  const [showNewStudentModal, setShowNewStudentModal] = useState(false);
  const [showClassSelectModal, setShowClassSelectModal] = useState(false);

  const [filterClassName, setFilterClassName] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterClassType, setFilterClassType] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');

  const [newStudentFormData, setNewStudentFormData] = useState({
    studentName: '',
    phone: '',
    grade: '',
    gender: '',
    englishName: '',
    school: '',
    city: '',
    channel: ''
  });

  const resetNewStudentForm = () => {
    setNewStudentFormData({
      studentName: '',
      phone: '',
      grade: '',
      gender: '',
      englishName: '',
      school: '',
      city: '',
      channel: ''
    });
  };

  const handleSaveNewStudent = () => {
    if (!newStudentFormData.studentName || !newStudentFormData.phone) {
      alert('请填写学生姓名和联系电话');
      return;
    }
    
    const newStudent: ManualOrderStudent = {
      id: `new_${Date.now()}`,
      name: newStudentFormData.studentName,
      phone: newStudentFormData.phone,
      campus: '',
      gender: newStudentFormData.gender || '男'
    };
    
    setSelectedStudent(newStudent);
    setShowNewStudentModal(false);
    resetNewStudentForm();
  };

  const filteredClasses = useMemo(() => {
    return CLASSES.filter(cls => {
      const matchName = !filterClassName || cls.name.toLowerCase().includes(filterClassName.toLowerCase());
      const matchSubject = !filterSubject || cls.subject === filterSubject;
      const matchGrade = !filterGrade || cls.grade === filterGrade;
      const matchClassType = !filterClassType || cls.studentTag === filterClassType;
      const matchSemester = !filterSemester || cls.semester === filterSemester;
      const matchTeacher = !filterTeacher || cls.teacherId === filterTeacher;
      
      return matchName && matchSubject && matchGrade && matchClassType && matchSemester && matchTeacher;
    });
  }, [filterClassName, filterSubject, filterGrade, filterClassType, filterSemester, filterTeacher]);

  return (
    <div className="flex flex-col h-full bg-bg-gray">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <span>←</span>
            <span>返回</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800">报名</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold text-gray-800">选择学生</h4>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowStudentSelectModal(true)}
                  className="px-4 py-1.5 border border-primary text-primary rounded text-sm hover:bg-primary-light"
                >
                  选择学生
                </button>
                <button 
                  onClick={() => setShowNewStudentModal(true)}
                  className="px-4 py-1.5 bg-primary text-white rounded text-sm hover:bg-teal-600"
                >
                  新生录入
                </button>
              </div>
            </div>
            
            {selectedStudent ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-4 py-3 text-left">学生姓名</th>
                      <th className="px-4 py-3 text-left">联系电话</th>
                      <th className="px-4 py-3 text-left">校区</th>
                      <th className="px-4 py-3 text-left">性别</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3">{selectedStudent.name}</td>
                      <td className="px-4 py-3">{selectedStudent.phone}</td>
                      <td className="px-4 py-3">{selectedStudent.campus || '-'}</td>
                      <td className="px-4 py-3">{selectedStudent.gender}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
                请选择学生或录入新生
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold text-gray-800">选择班级</h4>
              <button 
                onClick={() => setShowClassSelectModal(true)}
                className="px-4 py-1.5 border border-primary text-primary rounded text-sm hover:bg-primary-light"
              >
                选择班级
              </button>
            </div>
            
            {selectedClasses.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-4 py-3 text-left">业务</th>
                      <th className="px-4 py-3 text-left">班级名称</th>
                      <th className="px-4 py-3 text-left">支付选项</th>
                      <th className="px-4 py-3 text-left">应收金额</th>
                      <th className="px-4 py-3 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedClasses.map((cls, index) => (
                      <tr key={cls.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <select 
                            value={cls.businessType}
                            onChange={(e) => {
                              const updated = [...selectedClasses];
                              updated[index].businessType = e.target.value as '新签' | '续报' | '预售';
                              setSelectedClasses(updated);
                            }}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary"
                          >
                            <option value="新签">新签</option>
                            <option value="续报">续报</option>
                            <option value="预售">预售</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => onNavigateToClass?.(cls.classId)}
                            className="text-primary hover:underline"
                          >
                            {cls.name}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <select 
                            value={cls.paymentOption}
                            onChange={(e) => {
                              const updated = [...selectedClasses];
                              updated[index].paymentOption = e.target.value as '整期' | '分期';
                              if (e.target.value === '分期') {
                                updated[index].amount = Math.round(cls.fee * 0.5);
                              } else {
                                updated[index].amount = cls.fee;
                              }
                              setSelectedClasses(updated);
                            }}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary"
                          >
                            <option value="整期">整期</option>
                            <option value="分期">分期</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 font-medium">{formatCurrency(cls.amount)}</td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => {
                              setSelectedClasses(prev => prev.filter(c => c.id !== cls.id));
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
                请选择班级
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
        <button 
          onClick={() => {
            setSelectedStudent(null);
            setSelectedClasses([]);
            onBack();
          }}
          className="px-6 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm"
        >
          取消
        </button>
        <button 
          onClick={() => {
            alert('订单提交成功！');
            setSelectedStudent(null);
            setSelectedClasses([]);
            onBack();
          }}
          className="px-6 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm"
          disabled={!selectedStudent || selectedClasses.length === 0}
        >
          立即报名
        </button>
      </div>

      {showStudentSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-[900px] max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">选择学生</h3>
              <button onClick={() => setShowStudentSelectModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 border-b border-gray-100 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="输入学生姓名、联系电话搜索"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary pl-9"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
                </div>
                
                <select className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary w-40">
                  <option value="">校区</option>
                  {CAMPUSES.map(campus => (
                    <option key={campus} value={campus}>{campus}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium">
                  <tr>
                    <th className="px-6 py-3 w-12">选择</th>
                    <th className="px-6 py-3">学生ID</th>
                    <th className="px-6 py-3">学生姓名</th>
                    <th className="px-6 py-3">联系电话</th>
                    <th className="px-6 py-3">校区</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ADMIN_STUDENTS.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <input
                          type="radio"
                          name="studentSelect"
                          className="text-primary"
                          onChange={() => {
                            setSelectedStudent({
                              id: student.id,
                              name: student.name,
                              phone: student.account,
                              campus: student.campus || '',
                              gender: student.gender
                            });
                          }}
                        />
                      </td>
                      <td className="px-6 py-3">{student.id}</td>
                      <td className="px-6 py-3 font-medium">{student.name}</td>
                      <td className="px-6 py-3">{student.account}</td>
                      <td className="px-6 py-3">{student.campus || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                共 {ADMIN_STUDENTS.length} 条记录
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">&lt;</button>
                  <button className="w-7 h-7 flex items-center justify-center rounded bg-primary text-white font-medium">1</button>
                  <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">2</button>
                  <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">3</button>
                  <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">&gt;</button>
                  <select className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary">
                    <option>20 条/页</option>
                    <option>50 条/页</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setShowStudentSelectModal(false)}
                className="px-6 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  if (selectedStudent) {
                    setShowStudentSelectModal(false);
                  }
                }}
                className="px-6 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm"
                disabled={!selectedStudent}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">新生录入</h3>
              <button onClick={() => { setShowNewStudentModal(false); resetNewStudentForm(); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    学生姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStudentFormData.studentName}
                    onChange={(e) => setNewStudentFormData({...newStudentFormData, studentName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="请输入学生姓名"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    联系电话 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStudentFormData.phone}
                    onChange={(e) => setNewStudentFormData({...newStudentFormData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="请输入联系电话"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  在读年级 <span className="text-red-500">*</span>
                </label>
                <select
                  value={newStudentFormData.grade}
                  onChange={(e) => setNewStudentFormData({...newStudentFormData, grade: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">请选择在读年级</option>
                  {GRADE_OPTIONS.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  性别
                </label>
                <select
                  value={newStudentFormData.gender}
                  onChange={(e) => setNewStudentFormData({...newStudentFormData, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">请选择性别</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  英文名
                </label>
                <input
                  type="text"
                  value={newStudentFormData.englishName}
                  onChange={(e) => setNewStudentFormData({...newStudentFormData, englishName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="请输入英文名"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  在读学校
                </label>
                <input
                  type="text"
                  value={newStudentFormData.school}
                  onChange={(e) => setNewStudentFormData({...newStudentFormData, school: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="请输入在读学校"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  就读城市
                </label>
                <select
                  value={newStudentFormData.city}
                  onChange={(e) => setNewStudentFormData({...newStudentFormData, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">请选择就读城市</option>
                  <option value="南京">南京</option>
                  <option value="深圳">深圳</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  获客渠道
                </label>
                <select
                  value={newStudentFormData.channel}
                  onChange={(e) => setNewStudentFormData({...newStudentFormData, channel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">请选择获客渠道</option>
                  {ACQUISITION_CHANNEL_OPTIONS.map(channel => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => { setShowNewStudentModal(false); resetNewStudentForm(); }}
                className="px-6 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm"
              >
                取消
              </button>
              <button 
                onClick={handleSaveNewStudent}
                className="px-6 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showClassSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-[1000px] max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">选择班级</h3>
              <button onClick={() => setShowClassSelectModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative min-w-[140px] flex-shrink-0">
                  <input
                    type="text"
                    placeholder="班级名称"
                    value={filterClassName}
                    onChange={(e) => setFilterClassName(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full pl-8 focus:outline-none focus:border-primary placeholder-gray-400 h-[34px]"
                  />
                  <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
                </div>
                
                <select 
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[90px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]"
                >
                  <option value="">学科</option>
                  <option value="英语">英语</option>
                  <option value="数学">数学</option>
                  <option value="语文">语文</option>
                </select>

                <select 
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[90px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]"
                >
                  <option value="">年级</option>
                  <option value="K3">K3</option>
                  <option value="G1">G1</option>
                  <option value="G2">G2</option>
                  <option value="G3">G3</option>
                  <option value="G4">G4</option>
                  <option value="G5">G5</option>
                </select>

                <select 
                  value={filterClassType}
                  onChange={(e) => setFilterClassType(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[90px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]"
                >
                  <option value="">班型</option>
                  <option value="进阶">进阶</option>
                  <option value="飞跃">飞跃</option>
                  <option value="A+">A+</option>
                  <option value="S+">S+</option>
                </select>

                <select 
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[90px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]"
                >
                  <option value="">学期</option>
                  <option value="寒假">寒假</option>
                  <option value="暑假">暑假</option>
                  <option value="春季">春季</option>
                  <option value="秋季">秋季</option>
                </select>

                <select 
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm w-[100px] flex-shrink-0 focus:outline-none focus:border-primary text-gray-700 h-[34px]"
                >
                  <option value="">主讲老师</option>
                  {TEACHERS.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 font-medium sticky top-0">
                  <tr>
                    <th className="px-4 py-3 w-16">选择</th>
                    <th className="px-4 py-3">班级ID</th>
                    <th className="px-4 py-3 min-w-[180px]">班级名称</th>
                    <th className="px-4 py-3 min-w-[150px]">产品名称</th>
                    <th className="px-4 py-3 min-w-[120px]">已报/预招人数</th>
                    <th className="px-4 py-3 min-w-[100px]">课程类型</th>
                    <th className="px-4 py-3 min-w-[150px]">班层（年级、班型）</th>
                    <th className="px-4 py-3">学期</th>
                    <th className="px-4 py-3 min-w-[100px]">主讲老师</th>
                    <th className="px-4 py-3 min-w-[110px]">已开/总讲次</th>
                    <th className="px-4 py-3 min-w-[100px]">开课时间</th>
                    <th className="px-4 py-3">校区</th>
                    <th className="px-4 py-3">收费</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClasses.map(cls => {
                    const course = COURSES.find(c => c.id === cls.courseId);
                    const teacher = TEACHERS.find(t => t.id === cls.teacherId);
                    const enrolledCount = cls.studentCount || 0;
                    const capacity = cls.capacity || 0;
                    const displayGrade = cls.grade || course?.grade || '-';
                    const displayClassType = cls.studentTag || course?.classType || '-';
                    
                    return (
                      <tr key={cls.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="text-primary"
                            checked={selectedClasses.some(c => c.classId === cls.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const fee = cls.price || 5000;
                                setSelectedClasses(prev => [...prev, {
                                  id: `${cls.id}_${Date.now()}`,
                                  classId: cls.id,
                                  name: cls.name,
                                  businessType: '新签',
                                  paymentOption: '整期',
                                  fee: fee,
                                  amount: fee
                                }]);
                              } else {
                                setSelectedClasses(prev => prev.filter(c => c.classId !== cls.id));
                              }
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-600">{cls.id}</td>
                        <td className="px-4 py-3 font-medium">{cls.name}</td>
                        <td className="px-4 py-3 text-gray-800">{course?.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{enrolledCount}/{capacity}</td>
                        <td className="px-4 py-3 text-gray-600">{course?.type === 'long-term' ? '体系课' : course?.type === 'short-term' ? '专项课' : '短期课程'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {displayGrade !== '-' && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{displayGrade}</span>}
                            {displayClassType !== '-' && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{displayClassType}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{cls.semester || '-'}</td>
                        <td className="px-4 py-3 text-gray-800">{teacher?.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">0/{course?.lessonCount || 0}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{cls.startDate || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{cls.campus || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{formatCurrency(cls.price || 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setShowClassSelectModal(false)}
                className="px-6 py-2 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 text-sm"
              >
                取消
              </button>
              <button 
                onClick={() => setShowClassSelectModal(false)}
                className="px-6 py-2 bg-primary text-white rounded shadow-sm hover:bg-teal-600 text-sm"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualOrderPage;
