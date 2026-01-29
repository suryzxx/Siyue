# Draft: Education Management System - Remaining Tasks

## Context
User has completed 3/7 tasks and needs to implement 4 remaining tasks:
1. Fixed ClassManagement dropdown z-index (z-10 → z-50)
2. Fixed MultiSelect click-outside detection (added useRef + useEffect)
3. Fixed ClassManagement.tsx line 559 bug (availableClassTypes calculation)

## Remaining Tasks
4. Move '基础设置' below '订单管理' in AdminDashboard navigation
5. Add '学生姓名' column after '学号' column in OrderManagement table
6. Add phone number filter option to OrderManagement filters
7. Implement complete export class students functionality in ClassManagement

## Technical Decisions (Pending Research)
- Task 4 approach: JSX reorder vs state management changes
- Task 5 data source: Need to check Order type for student name availability
- Task 6 filter type: Text input vs SearchableMultiSelect
- Task 7 export columns: Should follow StudentManagement export pattern

## Research Findings

### AdminDashboard.tsx Navigation Structure (Completed)
- Navigation is **hardcoded in JSX** with no external configuration
- Current order: 课程产品 → 班级管理 → (divider) → 学生管理 → 订单管理 → 基础设置
- State dependencies: `activePanel` controls displayed content, `isSettingsExpanded` controls "基础设置" dropdown visibility
- Reordering approach: Simply swap JSX blocks - no state management changes needed
- The divider is between "班级管理" and "学生管理"

### OrderManagement.tsx Table and Filter Patterns (Completed)
- **Table Structure**: 17 columns total, "学号" is column 4, "学生姓名" is column 5
- **Data Source**: ORDERS array from constants.ts with studentNumber (S20250001 format) and studentName fields
- **Current Filters**: Order ID (text), Phone (text), Class (text) - SearchableMultiSelect components defined in state but not rendered
- **Student Data**: Directly in Order object (denormalized) - studentNumber, studentName, phone, studentAccount
- **Phone Filter**: Currently exists as text input for phone number filtering

### ClassManagement.tsx Export Functionality (Completed)
- **Export Button**: At line 2297, calls `exportClassStudents` function (lines 937-1042)
- **Current Implementation**: Uses custom ExcelJS approach instead of standardized `exportToExcel` utility
- **Needs Refactoring**: Should use `exportToExcel` from `/utils/excelExport.ts` for consistency
- **Columns Needed**: Based on StudentManagement pattern: Student ID, Name, Account, Gender, Birth Date, Student Number, Evaluation Level, Campus, Student Status, Follow-up Status, Class Name, Created/Updated Time
- **Data Source**: Combines `ADMIN_STUDENTS` with class filtering

### excelExport.ts Patterns (Completed)
- **Standardized Utility**: `exportToExcel` function with column definitions, formatting, and styling
- **Existing Export Functions**: `exportStudentList`, `exportOrderList`, `exportClassList`
- **ExcelFormatters**: Date/time/status formatting utilities
- **Consistent Patterns**: Header styling, error handling, file naming

## Open Questions - ALL ANSWERED
1. ~~Does AdminDashboard navigation have any state dependencies?~~ **ANSWERED: Yes, but simple - just swap JSX blocks**
2. ~~What Order type fields are available for student names?~~ **ANSWERED: studentName field directly in Order type**
3. ~~What filter components are currently used in OrderManagement?~~ **ANSWERED: Text inputs for ID/phone/class, SearchableMultiSelect defined but not rendered**
4. ~~What columns are in StudentManagement export?~~ **ANSWERED: 13 columns including student details and statuses**
5. ~~Are there any existing export utilities that can be reused?~~ **ANSWERED: Yes, `exportToExcel` utility with formatters**

## Technical Decisions (Updated)
- Task 4: Simple JSX reorder - no state management changes needed
- Task 5: Add "学生姓名" column after "学号" - data already available in Order.studentName
- Task 6: Phone filter already exists as text input - no changes needed (clarification: user wants phone filter, which already exists)
- Task 7: Refactor exportClassStudents to use standardized `exportToExcel` utility with StudentManagement column pattern

## Scope Boundaries
- INCLUDE: All 4 tasks with complete implementations
- INCLUDE: Following existing code patterns
- INCLUDE: Chinese UI text consistency
- EXCLUDE: Type errors suppression
- EXCLUDE: Breaking existing functionality