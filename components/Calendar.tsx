import React, { useState } from 'react';
import { LESSONS, CLASSES } from '../constants';

interface CalendarProps {
  onLessonClick: (classId: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onLessonClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Logic to generate calendar grid
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  // Previous month padding
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  const prevMonthDays = Array.from({ length: firstDay }, (_, i) => daysInPrevMonth - firstDay + i + 1);
  
  // Current month days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Next month padding to fill 42 cells (6 rows * 7 cols) grid usually
  const totalSlots = 42;
  const usedSlots = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDays = Array.from({ length: totalSlots - usedSlots }, (_, i) => i + 1);

  // Helper to get events for a specific day
  const getEventsForDay = (d: number) => {
    // Construct date string YYYY-MM-DD manually to avoid timezone issues
    const mStr = (month + 1).toString().padStart(2, '0');
    const dStr = d.toString().padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;

    return LESSONS.filter(l => l.date === dateStr);
  };

  const getClassColor = (classId: string) => {
    return CLASSES.find(c => c.id === classId)?.color || '#999';
  };
  
  const getClassName = (classId: string) => {
     return CLASSES.find(c => c.id === classId)?.name || 'Unknown';
  };

  return (
    <div className="flex-1 bg-bg-gray p-6 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {year}年{month + 1}月
        </h2>
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <button onClick={prevMonth} className="px-4 py-1.5 hover:bg-gray-100 text-gray-600 rounded text-sm transition-colors">上月</button>
          <button onClick={goToToday} className="px-4 py-1.5 hover:bg-gray-100 text-primary font-medium rounded text-sm transition-colors mx-1">今天</button>
          <button onClick={nextMonth} className="px-4 py-1.5 hover:bg-gray-100 text-gray-600 rounded text-sm transition-colors">下月</button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['日', '一', '二', '三', '四', '五', '六'].map((day, idx) => (
            <div key={idx} className={`py-3 text-center text-sm font-semibold ${idx === 0 || idx === 6 ? 'text-orange-500' : 'text-gray-500'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {/* Previous Month */}
          {prevMonthDays.map(day => (
            <div key={`prev-${day}`} className="border-b border-r border-gray-100 bg-gray-50/50 p-2 min-h-[100px]">
              <span className="text-gray-300 font-medium text-sm">{day}</span>
            </div>
          ))}

          {/* Current Month */}
          {currentMonthDays.map(day => {
            const events = getEventsForDay(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            
            return (
              <div key={`curr-${day}`} className={`border-b border-r border-gray-100 p-2 min-h-[100px] relative hover:bg-blue-50/30 transition-colors group`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white shadow-md' : 'text-gray-700'}`}>
                    {day}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[90px] custom-scrollbar">
                  {events.map(event => (
                    <div 
                      key={event.id}
                      onClick={() => onLessonClick(event.classId)}
                      className="text-xs text-white px-2 py-1 rounded shadow-sm cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all truncate"
                      style={{ backgroundColor: getClassColor(event.classId) }}
                      title={`${event.startTime} ${getClassName(event.classId)} ${event.name}`}
                    >
                      <span className="opacity-80 text-[10px] mr-1">{event.startTime}</span>
                      {getClassName(event.classId)} {event.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Next Month */}
          {nextMonthDays.map(day => (
            <div key={`next-${day}`} className="border-b border-r border-gray-100 bg-gray-50/50 p-2 min-h-[100px]">
              <span className="text-gray-300 font-medium text-sm">{day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
