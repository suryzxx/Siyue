import React, { useState, useEffect, useRef } from 'react';

interface SearchableMultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  width?: string;
  searchPlaceholder?: string;
}

const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder,
  width = 'w-[120px]',
  searchPlaceholder = '搜索...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 过滤选项
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

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
    setSearchTerm('');
  };

  const displayText = selected.length > 0 
    ? `${placeholder} (${selected.length})` 
    : placeholder;

  return (
    <div className={`relative ${width} flex-shrink-0`} ref={dropdownRef}>
      <button
        className={`border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-primary text-gray-700 h-[34px] flex items-center justify-between ${selected.length > 0 ? 'bg-blue-50 border-blue-200' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="truncate">{displayText}</span>
        <span className="ml-1 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-80 overflow-hidden flex flex-col">
          {/* 搜索框 */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          {/* 操作栏 */}
          <div className="p-2 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div className="text-xs text-gray-500">
              {filteredOptions.length} 个选项
              {searchTerm && ` (搜索: "${searchTerm}")`}
            </div>
            {selected.length > 0 && (
              <button
                onClick={clearSelection}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
                type="button"
              >
                清空选择
              </button>
            )}
          </div>

          {/* 选项列表 */}
          <div className="overflow-y-auto max-h-60">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                没有找到匹配的选项
              </div>
            ) : (
              filteredOptions.map(option => (
                <label
                  key={option}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => toggleOption(option)}
                    className="mr-2 text-primary"
                  />
                  <span className="text-sm flex-1">{option}</span>
                  {selected.includes(option) && (
                    <span className="text-xs text-primary font-medium">✓</span>
                  )}
                </label>
              ))
            )}
          </div>

          {/* 底部状态栏 */}
          <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
            {selected.length > 0 ? (
              <div className="flex justify-between">
                <span>已选择 {selected.length} 项</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-primary hover:text-teal-600 font-medium"
                  type="button"
                >
                  完成
                </button>
              </div>
            ) : (
              <div className="text-center">点击选项进行多选</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableMultiSelect;