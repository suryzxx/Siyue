import ExcelJS from 'exceljs';
import saveAs from 'file-saver';

export interface ColumnDefinition {
  key: string;
  label: string;
  width?: number;
  format?: (value: any) => string | number;
}

export interface ExcelExportOptions {
  data: any[];
  columns: ColumnDefinition[];
  sheetName?: string;
  fileName?: string;
  includeTimestamp?: boolean;
  enableFilter?: boolean;
  autoSizeColumns?: boolean;
  headerStyle?: {
    bold?: boolean;
    fillColor?: string; // ARGB格式，如 'FFE0F0F5'
    fontColor?: string;
  };
  rowStyle?: (rowIndex: number) => {
    fillColor?: string;
  };
}

/**
 * 通用Excel导出函数
 * @param options 导出配置选项
 */
export const exportToExcel = async (options: ExcelExportOptions): Promise<void> => {
  try {
    const {
      data,
      columns,
      sheetName = '数据列表',
      fileName = '导出数据',
      includeTimestamp = true,
      enableFilter = true,
      autoSizeColumns = true,
      headerStyle = {
        bold: true,
        fillColor: 'FFE0F0F5'
      },
      rowStyle = (rowIndex: number) => ({
        fillColor: rowIndex % 2 === 0 ? 'FFF9FBFA' : undefined
      })
    } = options;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    
    // 设置列定义
    worksheet.columns = columns.map(col => ({
      header: col.label,
      key: col.key,
      width: col.width || 15
    }));

    // 设置表头样式
    const headerRow = worksheet.getRow(1);
    if (headerStyle.bold) {
      headerRow.font = { bold: true };
    }
    if (headerStyle.fillColor) {
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: headerStyle.fillColor }
      };
    }
    if (headerStyle.fontColor) {
      headerRow.font = { color: { argb: headerStyle.fontColor } };
    }

    // 添加数据行
    data.forEach((item, index) => {
      const rowData: Record<string, any> = {};
      
      columns.forEach(col => {
        const value = item[col.key];
        rowData[col.key] = col.format ? col.format(value) : value;
      });

      const row = worksheet.addRow(rowData);
      
      // 应用行样式
      const style = rowStyle(index);
      if (style.fillColor) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: style.fillColor }
        };
      }
    });

    // 启用筛选功能
    if (enableFilter && data.length > 0) {
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: columns.length }
      };
    }

    // 自动调整列宽
    if (autoSizeColumns) {
      worksheet.columns.forEach(column => {
        if (column.width) {
          column.width = Math.max(column.width || 0, 10);
        }
      });
    }

    // 生成文件名
    let finalFileName = fileName;
    if (includeTimestamp) {
      const now = new Date();
      const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
      finalFileName = `${fileName}_${timestamp}.xlsx`;
    } else {
      finalFileName = `${fileName}.xlsx`;
    }

    // 生成并下载文件
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, finalFileName);

  } catch (error) {
    console.error('Excel导出失败:', error);
    throw new Error(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

/**
 * 导出班级列表的专用函数（保持向后兼容）
 */
export const exportClassList = async (
  data: any[],
  columns: ColumnDefinition[],
  fileName: string = '班级列表'
): Promise<void> => {
  return exportToExcel({
    data,
    columns,
    sheetName: '班级列表',
    fileName,
    headerStyle: {
      bold: true,
      fillColor: 'FFE0F0F5'
    }
  });
};

/**
 * 导出学生列表的专用函数
 */
export const exportStudentList = async (
  data: any[],
  columns: ColumnDefinition[],
  fileName: string = '学生列表'
): Promise<void> => {
  return exportToExcel({
    data,
    columns,
    sheetName: '学生列表',
    fileName,
    headerStyle: {
      bold: true,
      fillColor: 'FFE8F5E9' // 绿色调
    }
  });
};

/**
 * 导出订单列表的专用函数
 */
export const exportOrderList = async (
  data: any[],
  columns: ColumnDefinition[],
  fileName: string = '订单列表'
): Promise<void> => {
  return exportToExcel({
    data,
    columns,
    sheetName: '订单列表',
    fileName,
    headerStyle: {
      bold: true,
      fillColor: 'FFF3E5F5' // 紫色调
    }
  });
};

/**
 * 常用列格式化函数
 */
export const ExcelFormatters = {
  // 金额格式化
  currency: (value: number): string => {
    if (value === undefined || value === null) return '-';
    return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },
  
  // 日期格式化
  date: (value: string): string => {
    if (!value) return '-';
    try {
      const date = new Date(value);
      return date.toLocaleDateString('zh-CN');
    } catch {
      return value;
    }
  },
  
  // 日期时间格式化
  datetime: (value: string): string => {
    if (!value) return '-';
    try {
      const date = new Date(value);
      return date.toLocaleString('zh-CN');
    } catch {
      return value;
    }
  },
  
  // 状态格式化
  status: (value: string): string => {
    const statusMap: Record<string, string> = {
      'active': '活跃',
      'pending': '待处理',
      'completed': '已完成',
      'cancelled': '已取消',
      'paid': '已支付',
      'unpaid': '未支付',
      '在读学生': '在读',
      '潜在学生': '潜在',
      '历史学生': '历史'
    };
    return statusMap[value] || value;
  },
  
  // 布尔值格式化
  boolean: (value: boolean): string => {
    return value ? '是' : '否';
  }
};