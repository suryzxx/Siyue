# Draft: Education Management System Fixes

## Requirements (confirmed)
1. **班级管理 (Class Management):**
   - Fix dropdown z-index (dropdowns appear behind table headers)
   - Fix MultiSelect to ensure only one dropdown open at a time
   - Fix "班型" filter error: `ClassManagement.tsx:162 Uncaught TypeError: Cannot read properties of undefined (reading 'map')`
   - Complete "导出班级学生" (export class students) functionality

2. **导航栏 (Navigation):**
   - Move "基础设置" below "订单管理"

3. **订单管理 (Order Management):**
   - Add "学生姓名" column after "学号" column in table
   - Add phone number filter option

## Implementation Constraints
- Must follow existing code patterns
- No type errors suppression (`as any`, `@ts-ignore`)
- Must verify changes with diagnostics
- Must maintain Chinese UI text consistency

## Technical Decisions
1. **Z-Index Fix**: Increase MultiSelect dropdown from `z-10` to `z-50` to match SearchableMultiSelect and appear above table headers (`z-10`)
2. **Single Dropdown Management**: Add global state or context to track open dropdowns, close others when one opens
3. **filterGrade Bug Fix**: Since `filterGrade` is `string[]` and `GRADE_CLASS_TYPES` expects `string`, use `filterGrade.length > 0 ? GRADE_CLASS_TYPES[filterGrade[0]] : allClassTypes` or handle multiple grades
4. **Export Implementation**: Follow existing pattern using `exportToExcel()` from `utils/excelExport.ts`
5. **Navigation Reordering**: Move entire "基础设置" expandable section below "订单管理"
6. **Student Name Column**: Add column after "学号" that maps `studentAccount` to student name from `ADMIN_STUDENTS`
7. **Phone Filter**: Add phone filter to filter bar using SearchableMultiSelect component
8. **Test Strategy**: Manual verification only (no test infrastructure exists in package.json)

## Research Findings
**From Explore Agent:**
1. **Project Structure**: React/TypeScript app with organized components (admin/, common/, student/, parents/)
2. **MultiSelect Components**: 
   - Simple MultiSelect in ClassManagement.tsx (lines 112-180) uses `z-10`
   - SearchableMultiSelect in `/components/common/SearchableMultiSelect.tsx` uses `z-50` (modal-level)
3. **Z-Index Hierarchy**:
   - `z-10`: Table headers, regular dropdowns
   - `z-50`: Modals, searchable dropdowns, overlay backgrounds
   - Sticky table headers use `sticky top-0 z-10`
4. **Export Infrastructure**: `utils/excelExport.ts` has `exportToExcel()` function used by all export buttons
5. **Navigation Sidebar**: Fixed 200px sidebar with collapsible "基础设置" section in AdminDashboard.tsx
6. **Table Patterns**: OrderManagement has 15 data columns + 1 action column with sticky headers (`z-10`) and right column
7. **Filter Patterns**: Consistent widths (`w-[90px]`, `w-[120px]`, `w-[140px]`), cascading filters in ClassManagement

**From Librarian Agent**: Pending results

## Key Discoveries
1. **Bug Root Cause**: `filterGrade` is `string[]` but used as string key in `GRADE_CLASS_TYPES[filterGrade]` at line 559
2. **Export Button**: "导出班级学生" button exists at line 2168 but lacks implementation
3. **Component Patterns**: Should use SearchableMultiSelect for searchable filters, MultiSelect for simple ones
4. **Z-Index Fix**: Need to ensure dropdowns use appropriate z-index relative to table headers

## Open Questions
1. ~~What is the exact structure of GRADE_CLASS_TYPES? Is filterGrade supposed to be string or array?~~ **RESOLVED**: `filterGrade` is `string[]` but used as string key. Need to fix to use first element or handle array.
2. ~~How is the current export functionality implemented for other buttons?~~ **RESOLVED**: Uses `utils/excelExport.ts` with `exportToExcel()` function.
3. ~~What is the current z-index value for table headers?~~ **RESOLVED**: Table headers use `z-10`, MultiSelect uses `z-10`, SearchableMultiSelect uses `z-50`.
4. ~~How are dropdown states currently managed in MultiSelect?~~ **RESOLVED**: Each MultiSelect manages its own `isOpen` state independently.
5. ~~What data structure does Order have for student name?~~ **RESOLVED**: Orders have `studentAccount` (phone), need to map to `ADMIN_STUDENTS` by `account` to get `name`.

## Remaining Questions
6. Should we add a phone filter to OrderManagement filter bar (currently only in table)?
7. What should be the export format for "导出班级学生"? Follow same pattern as other exports?
8. Should the navigation reordering be done by moving the entire "基础设置" section or just reordering items?

## Scope Boundaries
- INCLUDE: Fixes for ClassManagement, AdminDashboard, OrderManagement
- EXCLUDE: Other components not mentioned
- INCLUDE: Following existing patterns and maintaining consistency
- EXCLUDE: Major refactoring or redesign