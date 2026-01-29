# 教育管理系统完善计划

## TL;DR

> **Quick Summary**: 完善教育管理系统的三个核心模块：班级管理、学生管理、订单管理，包括字段扩展、功能增强和用户体验改进
> 
> **Deliverables**: 
> - 班级管理：改进老师筛选（搜索+多选），优化Excel导出列结构
> - 学生管理：新增6个字段，实现完整CRUD操作、筛选和导出功能
> - 订单管理：新增12个字段，实现完整筛选和导出功能
> - 通用组件：创建可复用的筛选组件
> 
> **Estimated Effort**: Large（3个模块，每个模块2-3天）
> **Parallel Execution**: YES - 3 waves（类型定义→通用组件→各模块实现）
> **Critical Path**: 类型定义更新 → 通用组件创建 → 班级管理改进 → 学生/订单管理实现

---

## Context

### Original Request
完善教育管理系统的三个模块：
1. 班级管理模块：改进老师筛选和Excel导出
2. 学生管理模块：扩展字段和功能
3. 订单管理模块：扩展字段和功能

### Interview Summary
**Key Discussions**：
- 项目使用React + TypeScript + Vite + Tailwind CSS
- 使用exceljs和file-saver进行Excel导出
- 没有UI组件库，使用原生CSS
- 目前使用本地mock数据（constants.ts）
- 没有测试基础设施

**Research Findings**：
- 班级管理模块功能完整，有复杂的筛选逻辑
- 学生管理模块基础，缺少很多字段和功能
- 订单管理模块基础，缺少字段和导出功能
- 项目结构清晰，类型定义完整

### Assumptions Made
1. 保持使用本地mock数据（不涉及API集成）
2. 暂不设置测试基础设施（专注于功能完善）
3. 创建部分通用筛选组件

---

## Work Objectives

### Core Objective
完善教育管理系统的三个核心模块，提供完整的数据管理和导出功能，提升用户体验和操作效率。

### Concrete Deliverables
1. **班级管理模块改进**：
   - 老师筛选组件：支持搜索和多选
   - Excel导出优化：班层列拆分为年级和班型，上课时间列拆分为开课日期、结课日期、讲次时间

2. **学生管理模块完善**：
   - 新增6个字段：出生年月、学号、评测等级、所属校区、学生状态、跟进状态
   - 完整功能：筛选、编辑、转班、操作记录、获取临时验证码、新生录入、导出

3. **订单管理模块完善**：
   - 新增12个字段：订单编号、手机号、学号、班级、订单状态、支付方式、实付金额、原价金额、优惠金额、教辅费、课程费、购买节数
   - 完整功能：筛选、导出订单列表

4. **通用组件**：
   - 可复用的筛选组件库

### Definition of Done
- [ ] 所有新字段在types.ts中正确定义
- [ ] 所有新功能在对应模块中实现
- [ ] Excel导出功能正常工作
- [ ] 筛选功能支持所有新字段
- [ ] 项目编译无错误，功能可手动验证

### Must Have
- 保持现有功能不受影响
- 使用现有技术栈（React + TypeScript + Vite）
- 保持代码风格一致
- 所有新功能有对应的UI界面

### Must NOT Have (Guardrails)
- 不引入新的UI组件库
- 不涉及API集成（保持mock数据）
- 不设置测试基础设施（本次不处理）
- 不修改现有业务逻辑，只扩展功能

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO（项目没有测试基础设施）
- **User wants tests**: Manual-only（手动验证）
- **Framework**: none

### Manual Verification Procedures
由于没有测试基础设施，所有验证将通过手动操作进行：

**For UI changes**：
1. 启动开发服务器：`npm run dev`
2. 访问对应管理页面
3. 手动测试所有新功能
4. 验证筛选、导出等交互功能

**For Excel导出**：
1. 点击导出按钮
2. 验证生成的Excel文件
3. 检查列结构是否正确
4. 验证数据完整性

**For TypeScript编译**：
1. 运行TypeScript检查：`npx tsc --noEmit`
2. 验证无类型错误

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - Start Immediately):
├── Task 1: 更新类型定义（types.ts）
└── Task 2: 更新常量数据（constants.ts）

Wave 2 (Core Components - After Wave 1):
├── Task 3: 创建通用筛选组件
└── Task 4: 创建Excel导出工具函数

Wave 3 (Module Implementation - After Wave 2):
├── Task 5: 班级管理模块改进
├── Task 6: 学生管理模块完善
└── Task 7: 订单管理模块完善

Wave 4 (Integration & Verification - After Wave 3):
└── Task 8: 整体验证和优化
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3, 4, 5, 6, 7 | None（基础） |
| 2 | 1 | 5, 6, 7 | None（基础） |
| 3 | 1 | 5, 6, 7 | 4 |
| 4 | 1 | 5, 6, 7 | 3 |
| 5 | 1, 2, 3, 4 | 8 | 6, 7 |
| 6 | 1, 2, 3, 4 | 8 | 5, 7 |
| 7 | 1, 2, 3, 4 | 8 | 5, 6 |
| 8 | 5, 6, 7 | None | None（最终） |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | delegate_task(category="quick", load_skills=[], run_in_background=true) |
| 2 | 3, 4 | delegate_task(category="visual-engineering", load_skills=[], run_in_background=true) |
| 3 | 5, 6, 7 | dispatch parallel after Wave 2 completes |
| 4 | 8 | final verification task |

---

## TODOs