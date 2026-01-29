# Draft: 并行功能改进计划

## 原始需求
用户需要三个并行功能改进：
1. 导航栏调整：将"基础设置"移动到"订单管理"下面
2. 订单管理优化：添加"学生姓名"列和"手机号"筛选项
3. 班级管理导出功能完善：实现"导出班级学生"功能

## 探索发现

### 1. AdminDashboard导航栏结构
- 当前导航顺序：课程产品 → 班级管理 → 基础设置（可展开）→ 学生管理 → 订单管理
- 需要将"基础设置"（第87-101行）移动到"订单管理"（第106行）下面
- 基础设置包含：员工管理、地址管理、系统设置
- 使用React Hooks状态管理：`activePanel`控制当前面板，`isSettingsExpanded`控制基础设置展开状态
- 样式使用Tailwind CSS，主色调为青绿色(#2DA194)

### 2. OrderManagement组件分析
**表格列结构**（16列）：
1. 订单ID
2. 订单编号
3. 手机号（第3列）
4. 学号（第4列）← 需要在此后添加"学生姓名"列
5. 班级
6. 订单状态
7. 支付方式
8. 支付时间
9. 实付金额
10. 原价金额
11. 优惠金额
12. 教辅费
13. 课程费
14. 购买节数
15. 订单创建时间
16. 操作（固定列）

**筛选项**：
- 订单ID筛选（已实现，有UI）
- 班级筛选（已实现，有UI）
- 订单状态多选（已实现，有UI）
- 支付方式多选（已实现，有UI）
- 手机号筛选（状态存在但界面缺少输入框）

**状态管理**：
- `filterId`, `filterPhone`, `filterOrderStatus`, `filterPaymentMethod`, `filterClass`
- 实时筛选逻辑使用AND组合所有条件

**数据问题**：
- Order接口没有`studentName`字段
- 需要从`studentAccount`或`studentNumber`关联学生数据获取姓名
- ORDERS常量数据中没有学生姓名字段

### 3. ClassManagement导出功能
- 第2168行有"导出班级学生"按钮，但没有onClick事件处理函数
- 已有"导出班级列表"功能（第797-917行），使用ExcelJS直接实现
- StudentManagement.tsx中有`exportStudentList`函数（第98-130行），使用统一的`exportToExcel`工具函数
- utils/excelExport.ts提供通用导出工具函数，支持高度自定义
- 技术栈：React + TypeScript + ExcelJS + file-saver

## 关键发现总结

### 1. 数据关联分析
- **Order接口**：没有`studentName`字段，只有`studentAccount`（手机号）和`studentNumber`（学号）
- **StudentProfile接口**：有`name`字段，通过`account`或`studentNumber`关联
- **ORDERS数据**：7个示例订单，没有学生姓名字段
- **ADMIN_STUDENTS数据**：包含学生姓名，但account字段与订单的studentAccount不完全匹配

### 2. 导出功能架构
- **ClassManagement**：使用ExcelJS直接实现导出（旧版）
- **StudentManagement**：使用统一的`exportToExcel`工具函数（新版）
- **excelExport.ts**：提供通用导出工具，支持高度自定义
- **"导出班级学生"按钮**：第2168行，缺少onClick事件处理函数

### 3. 组件状态管理
- **AdminDashboard**：使用`activePanel`和`isSettingsExpanded`状态
- **OrderManagement**：使用5个筛选状态，实时过滤
- **ClassManagement**：复杂的状态管理，支持多种筛选和操作

## 待解决问题

### 数据关联问题
1. **学生姓名数据来源**：
   - 方案A：在Order接口中添加`studentName?: string`字段
   - 方案B：在组件中关联ADMIN_STUDENTS数据，通过`studentAccount`或`studentNumber`查找姓名
   - 方案C：混合方案 - 添加字段同时保留关联逻辑

2. **手机号筛选项**：
   - 状态`filterPhone`已存在，但缺少界面输入框
   - 需要添加对应的UI组件，与现有筛选样式保持一致

3. **导出班级学生功能**：
   - 需要确定导出哪些字段（班级信息+学生信息）
   - 需要实现数据获取逻辑（关联班级和学生表）
   - 需要调用excelExport工具函数

## 技术决策确认

### 1. 学生姓名获取策略
**选择方案A**：修改Order接口添加`studentName`字段
- 在`types.ts`的`Order`接口中添加`studentName?: string`字段
- 在`constants.ts`的`ORDERS`数据中添加示例的`studentName`字段
- 理由：最简单直接，符合当前项目的数据结构模式

### 2. 导出字段定义
**班级信息 + 学生基本信息**
- 班级基本信息：班级ID、名称、校区、教室等
- 学生基本信息：学生ID、姓名、学号、性别、评测等级等
- 参考`StudentManagement.tsx`中的导出实现

### 3. 测试策略
**不添加测试，仅进行手动验证**
- 理由：项目目前没有测试基础设施，保持现状
- 验证方式：构建验证 + 功能手动测试

### 4. 执行优先级
**并行执行，无特定优先级**
- 三个功能可以并行执行，修改不同的文件
- 导航栏调整最简单，可以先完成
- 订单管理优化和班级管理导出可以同时进行

## 并行执行分析

### 任务依赖关系
1. **导航栏调整**：独立任务，无依赖
2. **订单管理优化**：依赖类型修改和数据更新
3. **班级管理导出**：独立任务，无依赖

### 并行机会
- Wave 1：导航栏调整 + 类型/数据修改（可并行）
- Wave 2：订单管理优化 + 班级管理导出（可并行）