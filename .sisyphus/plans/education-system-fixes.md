# Education Management System Fixes and Improvements

## TL;DR

> **Quick Summary**: Implement 7 critical fixes across ClassManagement, AdminDashboard, and OrderManagement components to resolve UI bugs, complete missing functionality, and improve user experience in an education management system.
> 
> **Deliverables**: 
> - Fixed dropdown z-index and single dropdown management in ClassManagement
> - Completed "导出班级学生" export functionality
> - Fixed filterGrade type bug
> - Reordered navigation sidebar
> - Added student name column and phone filter to OrderManagement
> 
> **Estimated Effort**: Medium (parallelizable tasks)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Wave 1 (infrastructure fixes) → Wave 2 (UI improvements) → Wave 3 (export functionality)

---

## Context

### Original Request
Implement multiple fixes and improvements to an education management system:
1. **班级管理 (Class Management)**: Fix dropdown z-index, ensure single dropdown open, fix filterGrade bug, complete export functionality
2. **导航栏 (Navigation)**: Move "基础设置" below "订单管理"
3. **订单管理 (Order Management)**: Add "学生姓名" column after "学号", add phone filter option

### Interview Summary
**Key Discussions**:
- Codebase analysis reveals React/TypeScript with Vite, no test infrastructure
- Existing patterns: MultiSelect (z-10), SearchableMultiSelect (z-50), table headers (z-10)
- Bug identified: `filterGrade` is `string[]` but used as string key in `GRADE_CLASS_TYPES[filterGrade]`
- Export infrastructure exists in `utils/excelExport.ts`
- Orders have `studentAccount` (phone), need to map to `ADMIN_STUDENTS` for student name

**Research Findings**:
- **Explore Agent**: Comprehensive codebase analysis completed
- **Librarian Agent**: Research completed with React best practices
- **Current z-index hierarchy**: table headers (z-10), MultiSelect (z-10), SearchableMultiSelect (z-50)
- **Export patterns**: All exports use `exportToExcel()` from `utils/excelExport.ts`

### Best Practices from Research
1. **Z-index**: Use hierarchical system (dropdowns: z-50+, table headers: z-10)
2. **Single dropdown**: Use React state to track open dropdown, toggle behavior
3. **MultiSelect**: Controlled components with TypeScript typing
4. **Table filters**: Use column-based filtering patterns
5. **Navigation**: Simple reordering of JSX elements (no drag-and-drop needed)
6. **Table columns**: Add columns by extending column definitions array

---

## Work Objectives

### Core Objective
Fix critical UI bugs and complete missing functionality across three main admin components while maintaining existing code patterns and Chinese UI consistency.

### Concrete Deliverables
1. **ClassManagement.tsx**: Fixed z-index (`z-10` → `z-50`), single dropdown management, filterGrade bug fix, "导出班级学生" implementation
2. **AdminDashboard.tsx**: "基础设置" section moved below "订单管理"
3. **OrderManagement.tsx**: "学生姓名" column added after "学号", phone filter added to filter bar

### Definition of Done
- [ ] All TypeScript diagnostics pass (no `as any`, no `@ts-ignore`)
- [ ] All dropdowns appear above table headers
- [ ] Only one dropdown can be open at a time
- [ ] "导出班级学生" button exports correct data
- [ ] Navigation order matches requirement
- [ ] Student names display correctly in order table
- [ ] Phone filter works in filter bar

### Must Have
- Follow existing code patterns and styling
- Maintain Chinese UI text consistency
- No type errors suppression
- Verify changes with diagnostics

### Must NOT Have (Guardrails)
- No major refactoring of unrelated components
- No changing of existing business logic
- No introduction of new dependencies
- No breaking existing functionality

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (no test scripts in package.json)
- **User wants tests**: Manual-only
- **Framework**: None

### Automated Verification (Manual QA Procedures)
> **CRITICAL PRINCIPLE: ZERO USER INTERVENTION**
>
> Each TODO includes EXECUTABLE verification procedures that agents can run directly:

**By Deliverable Type**:

| Type | Verification Tool | Automated Procedure |
|------|------------------|---------------------|
| **Frontend/UI** | Playwright browser via playwright skill | Agent navigates, clicks, screenshots, asserts DOM state |
| **TUI/CLI** | interactive_bash (tmux) | Agent runs command, captures output, validates expected strings |
| **Type Checking** | Bash TypeScript compiler | Agent runs `npx tsc --noEmit` and validates no errors |

**Evidence Requirements (Agent-Executable)**:
- Command output captured and compared against expected patterns
- Screenshots saved to .sisyphus/evidence/ for visual verification
- TypeScript compilation output validated (0 errors expected)
- Exit codes checked (0 = success)

---

## Execution Strategy

### Parallel Execution Waves

> Maximize throughput by grouping independent tasks into parallel waves.
> Each wave completes before the next begins.

```
Wave 1 (Infrastructure & Core Fixes - Start Immediately):
├── Task 1: Fix filterGrade type bug in ClassManagement
├── Task 2: Fix dropdown z-index in ClassManagement
└── Task 3: Implement single dropdown management

Wave 2 (UI Improvements - After Wave 1):
├── Task 4: Reorder navigation in AdminDashboard
├── Task 5: Add student name column to OrderManagement
└── Task 6: Add phone filter to OrderManagement

Wave 3 (Export Functionality - After Wave 2):
└── Task 7: Implement "导出班级学生" export functionality

Critical Path: Task 1 → Task 4 → Task 7
Parallel Speedup: ~60% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 4, 5, 6, 7 | 2, 3 |
| 2 | None | None | 1, 3 |
| 3 | None | None | 1, 2 |
| 4 | 1 | 7 | 5, 6 |
| 5 | 1 | None | 4, 6 |
| 6 | 1 | None | 4, 5 |
| 7 | 4 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2, 3 | delegate_task(category="quick", load_skills=[], run_in_background=true) |
| 2 | 4, 5, 6 | dispatch parallel after Wave 1 completes |
| 3 | 7 | final integration task |

---

## TODOs

> Implementation + Verification = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info.

- [ ] 1. Fix filterGrade Type Bug in ClassManagement

  **What to do**:
  - Fix line 559: `const availableClassTypes = filterGrade ? GRADE_CLASS_TYPES[filterGrade] : allClassTypes;`
  - `filterGrade` is `string[]` but `GRADE_CLASS_TYPES` expects `string`
  - Implement logic: If `filterGrade` has one element, use it; if multiple, combine class types
  - Update line 1975 usage to match new logic

  **Must NOT do**:
  - Use `as any` type assertions
  - Suppress TypeScript errors with `@ts-ignore`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple TypeScript fix with clear scope
  - **Skills**: None needed for this simple fix
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed for file edit only
    - `playwright`: Not a browser automation task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 4, 5, 6, 7
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `./components/admin/ClassManagement.tsx:536` - `filterGrade` state definition: `const [filterGrade, setFilterGrade] = useState<string[]>([]);`
  - `./components/admin/ClassManagement.tsx:26-39` - `GRADE_CLASS_TYPES` type definition: `Record<string, string[]>`
  - `./components/admin/ClassManagement.tsx:1594` - Usage pattern: `filterGrade.length === 0 || filterGrade.includes(cls.grade)`

  **Type References** (contracts to implement against):
  - `./types.ts` - TypeScript type definitions for the project

  **WHY Each Reference Matters**:
  - Line 536: Shows `filterGrade` is definitely `string[]`, not `string`
  - Lines 26-39: Shows `GRADE_CLASS_TYPES` expects string keys
  - Line 1594: Shows correct pattern for checking `filterGrade` array

  **Acceptance Criteria**:

  **Automated Verification** (using Bash TypeScript compiler):
  ```bash
  # Agent runs:
  npx tsc --noEmit ./components/admin/ClassManagement.tsx
  # Assert: Exit code 0 (no TypeScript errors)
  # Assert: Output contains 0 errors
  # Capture output to: .sisyphus/evidence/task-1-typescript-output.txt
  ```

  **Evidence to Capture**:
  - [ ] Terminal output from TypeScript compilation (actual output, not expected)
  - [ ] File diff showing the fix: `git diff ./components/admin/ClassManagement.tsx`

  **Commit**: YES
  - Message: `fix(ClassManagement): resolve filterGrade type mismatch bug`
  - Files: `./components/admin/ClassManagement.tsx`
  - Pre-commit: `npx tsc --noEmit ./components/admin/ClassManagement.tsx`

- [ ] 2. Fix Dropdown Z-Index in ClassManagement

  **What to do**:
  - Change MultiSelect dropdown z-index from `z-10` to `z-50` (line 150)
  - Verify dropdowns appear above table headers (`z-10`)
  - Check all dropdown instances in ClassManagement for consistency

  **Must NOT do**:
  - Change z-index of table headers (should remain `z-10`)
  - Modify SearchableMultiSelect z-index (already `z-50`)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple CSS/className change
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `playwright`: Could be used for verification but manual check sufficient

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: None
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `./components/admin/ClassManagement.tsx:150` - Current MultiSelect dropdown: `className="absolute z-10 mt-1 w-full..."`
  - `./components/common/SearchableMultiSelect.tsx:80` - SearchableMultiSelect dropdown: `className="absolute z-50 mt-1 w-full..."`
  - `./components/admin/ClassManagement.tsx:2180` - Table header: `className="... sticky top-0 z-10"`

  **WHY Each Reference Matters**:
  - Line 150: Target for z-index change
  - SearchableMultiSelect: Shows `z-50` is the correct value for dropdowns
  - Line 2180: Shows table headers use `z-10`, so dropdowns need higher value

  **Acceptance Criteria**:

  **Automated Verification** (using playwright skill):
  ```bash
  # Agent executes via playwright browser automation:
  1. Start dev server: npm run dev &
  2. Wait 5s for server to start
  3. Navigate to: http://localhost:3000/admin
  4. Click on any MultiSelect dropdown in ClassManagement
  5. Assert: Dropdown is fully visible (not hidden behind table headers)
  6. Screenshot: .sisyphus/evidence/task-2-dropdown-zindex.png
  7. Stop dev server
  ```

  **Evidence to Capture**:
  - [ ] Screenshot showing dropdown above table headers
  - [ ] File diff showing z-index change

  **Commit**: YES (group with Task 1)
  - Message: `fix(ClassManagement): increase dropdown z-index to appear above table headers`
  - Files: `./components/admin/ClassManagement.tsx`
  - Pre-commit: Visual verification via screenshot

- [ ] 3. Implement Single Dropdown Management in ClassManagement

  **What to do**:
  - Add global state or context to track open dropdowns
  - Ensure only one MultiSelect dropdown can be open at a time
  - Close other dropdowns when a new one opens
  - Maintain existing click-outside-to-close behavior

  **Must NOT do**:
  - Break existing dropdown functionality
  - Modify SearchableMultiSelect component (manages its own state)
  - Change the user interaction pattern

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Requires state management design and implementation
  - **Skills**: None specific needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not a git operation
    - `playwright`: Verification tool, not implementation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: None
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `./components/admin/ClassManagement.tsx:112-180` - MultiSelect component implementation
  - `./components/common/SearchableMultiSelect.tsx:37-49` - Click outside to close pattern
  - `./components/admin/ClassManagement.tsx:536-540` - Existing state definitions area

  **Implementation Approaches** (choose simplest):
  1. **Lifted State**: Move `isOpen` state to parent component, pass `isOpen` and `setIsOpen` to each MultiSelect
  2. **Context**: Create dropdown context to track active dropdown ID
  3. **Ref Management**: Use refs to track dropdown instances

  **WHY Each Reference Matters**:
  - MultiSelect component: Need to understand current implementation
  - Click outside pattern: Must preserve this behavior
  - State definitions: Logical place to add new state

  **Acceptance Criteria**:

  **Automated Verification** (using playwright skill):
  ```bash
  # Agent executes via playwright browser automation:
  1. Start dev server: npm run dev &
  2. Wait 5s for server to start
  3. Navigate to: http://localhost:3000/admin
  4. Click on first MultiSelect dropdown (e.g., "年级" filter)
  5. Assert: First dropdown is open
  6. Click on second MultiSelect dropdown (e.g., "班型" filter)
  7. Assert: First dropdown is closed, second dropdown is open
  8. Click on third MultiSelect dropdown
  9. Assert: Second dropdown is closed, third dropdown is open
  10. Click outside dropdowns
  11. Assert: All dropdowns are closed
  12. Screenshot sequence: .sisyphus/evidence/task-3-dropdown-sequence-*.png
  13. Stop dev server
  ```

  **Evidence to Capture**:
  - [ ] Screenshots showing single dropdown behavior
  - [ ] File diff showing state management implementation

  **Commit**: YES (group with Tasks 1, 2)
  - Message: `feat(ClassManagement): implement single dropdown open at a time`
  - Files: `./components/admin/ClassManagement.tsx`
  - Pre-commit: Visual verification via playwright test

- [ ] 4. Reorder Navigation in AdminDashboard

  **What to do**:
  - Move "基础设置" expandable section below "订单管理"
  - Maintain all existing functionality (expand/collapse, active states)
  - Update the navigation order in `AdminDashboard.tsx`

  **Must NOT do**:
  - Change styling or behavior of navigation items
  - Modify the "基础设置" expandable section implementation
  - Break active panel switching functionality

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple reordering of JSX elements
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Simple file edit only

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 7
  - **Blocked By**: Task 1 (should complete first)

  **References**:

  **Pattern References**:
  - `./components/admin/AdminDashboard.tsx:83-107` - Current navigation order
  - `./components/admin/AdminDashboard.tsx:87-101` - "基础设置" section implementation
  - `./components/admin/AdminDashboard.tsx:105-106` - "学生管理" and "订单管理" items

  **Current Order**:
  1. 课程产品
  2. 班级管理
  3. 基础设置 (expandable)
  4. 学生管理
  5. 订单管理

  **Target Order**:
  1. 课程产品
  2. 班级管理
  3. 学生管理
  4. 订单管理
  5. 基础设置 (expandable)

  **WHY Each Reference Matters**:
  - Lines 83-107: Complete navigation structure to understand
  - Lines 87-101: "基础设置" section to move
  - Lines 105-106: Items to position "基础设置" after

  **Acceptance Criteria**:

  **Automated Verification** (using playwright skill):
  ```bash
  # Agent executes via playwright browser automation:
  1. Start dev server: npm run dev &
  2. Wait 5s for server to start
  3. Navigate to: http://localhost:3000/admin
  4. Assert: Navigation order matches target order
  5. Click on "基础设置" to expand/collapse
  6. Assert: Expand/collapse works correctly
  7. Click on each navigation item
  8. Assert: Active panel switching works
  9. Screenshot: .sisyphus/evidence/task-4-navigation-order.png
  10. Stop dev server
  ```

  **Evidence to Capture**:
  - [ ] Screenshot showing correct navigation order
  - [ ] File diff showing JSX reordering

  **Commit**: YES
  - Message: `feat(AdminDashboard): reorder navigation - move "基础设置" below "订单管理"`
  - Files: `./components/admin/AdminDashboard.tsx`
  - Pre-commit: Visual verification via screenshot

- [ ] 5. Add Student Name Column to OrderManagement

  **What to do**:
  - Add "学生姓名" column after "学号" column in table
  - Map `studentAccount` (phone) from Order to student name from `ADMIN_STUDENTS`
  - Handle missing student mappings gracefully (show "-" or empty)
  - Update export columns to include student name

  **Must NOT do**:
  - Modify Order type definition (keep `studentAccount` as phone)
  - Break existing column rendering
  - Change data fetching logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Table column addition following existing patterns
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Simple file edit only

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: None
  - **Blocked By**: Task 1 (should complete first)

  **References**:

  **Pattern References**:
  - `./components/admin/OrderManagement.tsx:46` - "学号" column definition
  - `./components/admin/OrderManagement.tsx:166` - "学号" table header
  - `./components/admin/OrderManagement.tsx:187` - "学号" table cell rendering
  - `./constants.ts:58-70` - `ADMIN_STUDENTS` data with `account` (phone) and `name`

  **Data Mapping Logic**:
  ```typescript
  // Find student by matching order.studentAccount with student.account
  const getStudentName = (studentAccount: string) => {
    const student = ADMIN_STUDENTS.find(s => s.account === studentAccount);
    return student?.name || '-';
  };
  ```

  **WHY Each Reference Matters**:
  - Line 46: Where to add new column definition
  - Line 166: Where to add new table header
  - Line 187: Where to add new table cell
  - Constants: Source of student data for mapping

  **Acceptance Criteria**:

  **Automated Verification** (using playwright skill):
  ```bash
  # Agent executes via playwright browser automation:
  1. Start dev server: npm run dev &
  2. Wait 5s for server to start
  3. Navigate to: http://localhost:3000/admin?panel=order
  4. Assert: "学生姓名" column appears after "学号" column
  5. Assert: Student names display correctly (not empty or "-" for known students)
  6. Assert: Unknown students show "-" or empty
  7. Screenshot: .sisyphus/evidence/task-5-student-name-column.png
  8. Stop dev server
  ```

  **Evidence to Capture**:
  - [ ] Screenshot showing student name column with data
  - [ ] File diff showing column addition

  **Commit**: YES
  - Message: `feat(OrderManagement): add "学生姓名" column after "学号"`
  - Files: `./components/admin/OrderManagement.tsx`
  - Pre-commit: Visual verification via screenshot

- [ ] 6. Add Phone Filter to OrderManagement Filter Bar

  **What to do**:
  - Add phone filter option to filter bar (currently only in table)
  - Use SearchableMultiSelect component (consistent with other filters)
  - Extract unique phone numbers from orders data
  - Implement filtering logic in `filteredOrders` calculation

  **Must NOT do**:
  - Remove existing phone column from table
  - Change existing filter patterns
  - Break other filter functionality

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Filter addition following existing patterns
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Simple file edit only

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: None
  - **Blocked By**: Task 1 (should complete first)

  **References**:

  **Pattern References**:
  - `./components/admin/OrderManagement.tsx:120-140` - Existing filter bar implementation
  - `./components/admin/OrderManagement.tsx:45` - Phone column definition
  - `./components/admin/OrderManagement.tsx:165` - Phone table header
  - `./components/admin/OrderManagement.tsx:186` - Phone table cell
  - `./components/admin/OrderManagement.tsx:250-260` - `filteredOrders` calculation logic

  **Filter Implementation**:
  ```typescript
  // Add to filter state
  const [filterPhone, setFilterPhone] = useState<string[]>([]);

  // Add to filteredOrders logic
  const matchesPhone = filterPhone.length === 0 || 
    (order.phone && filterPhone.includes(order.phone));
  ```

  **WHY Each Reference Matters**:
  - Lines 120-140: Where to add new filter component
  - Phone references: Understand phone data structure
  - Lines 250-260: Where to add filter logic

  **Acceptance Criteria**:

  **Automated Verification** (using playwright skill):
  ```bash
  # Agent executes via playwright browser automation:
  1. Start dev server: npm run dev &
  2. Wait 5s for server to start
  3. Navigate to: http://localhost:3000/admin?panel=order
  4. Assert: Phone filter appears in filter bar
  5. Select a phone number from filter
  6. Assert: Table filters to show only orders with selected phone
  7. Clear filter
  8. Assert: All orders shown again
  9. Screenshot: .sisyphus/evidence/task-6-phone-filter.png
  10. Stop dev server
  ```

  **Evidence to Capture**:
  - [ ] Screenshot showing phone filter working
  - [ ] File diff showing filter implementation

  **Commit**: YES
  - Message: `feat(OrderManagement): add phone filter to filter bar`
  - Files: `./components/admin/OrderManagement.tsx`
  - Pre-commit: Visual verification via screenshot

- [ ] 7. Implement "导出班级学生" Export Functionality

  **What to do**:
  - Implement export functionality for "导出班级学生" button (line 2168)
  - Follow existing export pattern using `exportToExcel()` from `utils/excelExport.ts`
  - Export student data for selected class(es)
  - Include relevant student information (name, student number, phone, etc.)

  **Must NOT do**:
  - Modify existing export infrastructure
  - Break other export buttons
  - Change the button styling or position

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Follow existing export pattern
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Simple file edit only

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential after Wave 2)
  - **Blocks**: None
  - **Blocked By**: Task 4 (navigation reordering should complete first)

  **References**:

  **Pattern References**:
  - `./components/admin/ClassManagement.tsx:2168` - "导出班级学生" button location
  - `./components/admin/OrderManagement.tsx:40-60` - Export column definition pattern
  - `./utils/excelExport.ts` - Export utility functions
  - `./components/admin/ClassManagement.tsx:2100-2150` - Existing export button patterns

  **Export Data Structure**:
  ```typescript
  // Example export columns for class students
  const columns = [
    { key: 'studentNumber', label: '学号', width: 12 },
    { key: 'name', label: '学生姓名', width: 15 },
    { key: 'phone', label: '手机号', width: 15 },
    { key: 'className', label: '班级名称', width: 20 },
    { key: 'grade', label: '年级', width: 10 },
    { key: 'classType', label: '班型', width: 12 },
    { key: 'campus', label: '校区', width: 15 },
  ];
  ```

  **WHY Each Reference Matters**:
  - Line 2168: Target button to implement
  - OrderManagement export: Shows column definition pattern
  - excelExport.ts: Contains export infrastructure
  - Existing export patterns: Shows how to integrate with current code

  **Acceptance Criteria**:

  **Automated Verification** (using playwright skill):
  ```bash
  # Agent executes via playwright browser automation:
  1. Start dev server: npm run dev &
  2. Wait 5s for server to start
  3. Navigate to: http://localhost:3000/admin
  4. Click on "导出班级学生" button
  5. Assert: File download dialog appears or file is saved
  6. Verify downloaded file contains expected student data
  7. Screenshot: .sisyphus/evidence/task-7-export-button.png
  8. Stop dev server
  ```

  **Evidence to Capture**:
  - [ ] Screenshot showing export button working
  - [ ] File diff showing export implementation
  - [ ] Downloaded export file (if possible)

  **Commit**: YES
  - Message: `feat(ClassManagement): implement "导出班级学生" export functionality`
  - Files: `./components/admin/ClassManagement.tsx`
  - Pre-commit: Visual verification via screenshot

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1, 2, 3 | `fix(ClassManagement): resolve filterGrade type mismatch, improve dropdown z-index and management` | ClassManagement.tsx | TypeScript compilation + playwright tests |
| 4 | `feat(AdminDashboard): reorder navigation - move "基础设置" below "订单管理"` | AdminDashboard.tsx | Visual verification |
| 5 | `feat(OrderManagement): add "学生姓名" column after "学号"` | OrderManagement.tsx | Visual verification |
| 6 | `feat(OrderManagement): add phone filter to filter bar` | OrderManagement.tsx | Visual verification |
| 7 | `feat(ClassManagement): implement "导出班级学生" export functionality` | ClassManagement.tsx | Visual verification |

---

## Success Criteria

### Verification Commands
```bash
# TypeScript compilation check
npx tsc --noEmit

# Dev server start (for visual verification)
npm run dev
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All TypeScript diagnostics pass
- [ ] All dropdowns appear above table headers
- [ ] Only one dropdown open at a time
- [ ] Navigation order correct
- [ ] Student name column displays correctly
- [ ] Phone filter works
- [ ] Export functionality works