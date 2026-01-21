import React, { useState } from 'react';
import { STUDENTS, TASKS } from '../constants';

const TaskOverview: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(STUDENTS[0].id);

  // Group tasks by type
  const previewTasks = TASKS.filter(t => t.type === 'PREVIEW');
  const homeworkTasks = TASKS.filter(t => t.type === 'HOMEWORK');
  const reviewTasks = TASKS.filter(t => t.type === 'REVIEW');

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-white">
      {/* Student List */}
      <div className="w-[180px] border-r border-gray-200 overflow-y-auto py-2">
        <div className="px-6 py-3 font-medium text-gray-500 text-sm">班级成员 ({STUDENTS.length})</div>
        {STUDENTS.map(student => (
          <div
            key={student.id}
            onClick={() => setSelectedStudentId(student.id)}
            className={`px-6 py-3 cursor-pointer text-sm flex items-center justify-between transition-colors relative ${
              selectedStudentId === student.id
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-bg-gray'
            }`}
          >
            {student.name}
            {student.hasUnread && selectedStudentId !== student.id && (
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </div>
        ))}
      </div>

      {/* Task Details */}
      <div className="flex-1 bg-bg-gray p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6 text-primary font-medium">
          <span>📅</span>
          <span>25暑-Day10-课程任务 {new Date().toLocaleDateString()}</span>
        </div>

        {/* Task Group: Preview */}
        <TaskGroup title="🎨 课前预习" tasks={previewTasks} color="purple" />
        
        {/* Task Group: Homework */}
        <TaskGroup title="📝 课后作业" tasks={homeworkTasks} color="blue" />

        {/* Task Group: Review */}
        <TaskGroup title="📚 复习巩固" tasks={reviewTasks} color="orange" />
      </div>
    </div>
  );
};

interface TaskGroupProps {
  title: string;
  tasks: typeof TASKS;
  color: 'purple' | 'blue' | 'orange';
}

const TaskGroup: React.FC<TaskGroupProps> = ({ title, tasks, color }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Dynamic styles based on color prop
  const styles = {
    purple: { bg: 'bg-purple-light', border: 'border-[#E5E0FF]', icon: 'text-purple-main' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-500' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-100', icon: 'text-orange-500' },
  }[color];

  return (
    <div className={`mb-4 rounded-xl overflow-hidden border ${isExpanded ? styles.border : 'border-gray-200'} transition-all`}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-5 py-3 flex items-center justify-between cursor-pointer ${isExpanded ? styles.bg : 'bg-white'}`}
      >
        <div className="font-bold flex items-center gap-2 text-text-main">
          {title}
        </div>
        <div className="text-gray-400 text-xs">{isExpanded ? '▼' : '▶'}</div>
      </div>

      {isExpanded && (
        <div className={`${styles.bg} px-4 pb-4`}>
          {tasks.map(task => (
            <div key={task.id} className="bg-white p-4 rounded-lg mt-3 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-colors ${task.isCompleted ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                   {task.isCompleted && <span className="text-white text-xs">✓</span>}
                </div>
                <div className={`w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center ${styles.icon}`}>
                  📌
                </div>
                <div>
                  <h5 className={`text-sm font-medium ${task.isCompleted ? 'text-gray-400 line-through' : 'text-text-main'}`}>{task.title}</h5>
                  <p className="text-xs text-text-sub mt-0.5">{task.description}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                 {task.isCompleted ? (
                   <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">已完成</span>
                 ) : (
                   <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs">未完成</span>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskOverview;
