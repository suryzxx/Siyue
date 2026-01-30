# Class Creation System Enhancements

## TL;DR

> **Quick Summary**: Enhance class creation system with improved date filter and pricing page features including required material fee, new sales modes, and conditional pre-sale fields.
> 
> **Deliverables**: 
> - Modified date filter without calendar icon, clean date display, with time selection
> - Enhanced pricing page with required material fee field
> - New sales mode field with conditional pre-sale fields
> - Validation and auto-calculation logic
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves (date filter + pricing enhancements)
> **Critical Path**: Date filter modifications → Pricing form enhancements → Validation logic

---

## Context

### Original Request
User wants two major enhancements to the class creation system:

**FEATURE 1: Create Class - First Lesson Date Filter**
- Remove calendar icon from existing date filter
- Date picker should not show "年/月/" format (clean date display)
- Clicking should allow time selection (date + time picker)

**FEATURE 2: Create Class - Pricing Standards Page Enhancements**
1. **教辅费** (material fee): Change from optional to REQUIRED field
2. **新增售卖模式** (new sales mode field):
   - Options: "普通班" (regular class), "预售班" (pre-sale class)
3. **预售班条件字段** (pre-sale class conditional fields):
   - 定金 (deposit): REQUIRED, must be < course fee
   - 尾款 (balance): AUTO-CALCULATED (course fee - deposit)
   - 最低开班人数 (min class size): REQUIRED, positive integer
   - 确认开班方式 (confirmation method): "手动确认" (manual) or "自动确认" (auto), default: manual
   - 组班截止时间 (group deadline): OPTIONAL

### Interview Summary
**Key Discussions**:
- Current date filter uses native HTML5 date input with calendar emoji overlay (lines 2280-2301)
- Pricing step is step 3 of create class wizard (lines 2674-2706)
- Material fee field already exists but is optional (line 2698)
- Codebase uses native HTML inputs with Tailwind styling, no external libraries
- Basic manual validation with alert() messages
- Form state managed with useState and spread operators

**Research Findings**:
1. **Codebase Patterns**: Native HTML inputs, Tailwind CSS, custom components, no external UI libraries
2. **Date Picker**: Native `<input type="date">` with emoji trigger
3. **Validation**: Manual checks with alert() messages
4. **Conditional Fields**: Cascading dropdown patterns exist
5. **State Management**: useState with object spread patterns
6. **Pricing Structure**: Already has materialPrice and chargeMode fields

### Technical Decisions Made
1. **Date+Time Picker**: Use native `datetime-local` input (follows existing patterns)
2. **Validation**: Extend existing manual validation patterns (no new libraries)
3. **Conditional Fields**: Use conditional rendering based on sales mode
4. **Auto-calculation**: Use useEffect to watch for deposit and course fee changes
5. **Test Strategy**: Manual verification (no test infrastructure exists)

---

## Work Objectives

### Core Objective
Enhance the class creation system with improved date filtering and comprehensive pricing options including pre-sale class functionality.

### Concrete Deliverables
1. Modified date filter in `ClassManagement.tsx` (lines 2280-2301)
2. Enhanced pricing form in step 3 (lines 2674-2706)
3. New form state fields for sales mode and pre-sale conditions
4. Validation logic for required fields and business rules
5. Auto-calculation for balance (course fee - deposit)

### Definition of Done
- [ ] Date filter shows clean date display without "年/月/" format
- [ ] Date filter allows time selection (date + time picker)
- [ ] Material fee field is required with validation
- [ ] Sales mode field with "普通班" and "预售班" options
- [ ] Conditional pre-sale fields shown only when "预售班" selected
- [ ] Auto-calculation of balance works correctly
- [ ] All validation rules enforced

### Must Have
- Clean date display without calendar icon
- Date+time selection capability
- Required material fee field
- Sales mode selection with conditional fields
- Deposit validation (must be < course fee)
- Auto-calculated balance
- Minimum class size validation

### Must NOT Have (Guardrails)
- No external date picker libraries (use native inputs)
- No new validation libraries (extend existing patterns)
- No changes to existing form state management patterns
- No modifications to unrelated parts of ClassManagement.tsx
- No breaking changes to existing class creation flow

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (no test files found)
- **User wants tests**: Manual verification only
- **Framework**: None
- **QA approach**: Manual verification with specific commands and assertions

### Automated Verification (Manual Execution)
> **CRITICAL PRINCIPLE: ZERO USER INTERVENTION**
>
> **NEVER** create acceptance criteria that require:
> - "User manually tests..." / "사용자가 직접 테스트..."
> - "User visually confirms..." / "사용자가 눈으로 확인..."
> - "User interacts with..." / "사용자가 직접 조작..."
> - "Ask user to verify..." / "사용자에게 확인 요청..."
> - ANY step that requires a human to perform an action
>
> **ALL verification MUST be automated and executable by the agent.**

Each TODO includes EXECUTABLE verification procedures that agents can run directly:

**By Deliverable Type:**

| Type | Verification Tool | Automated Procedure |
|------|------------------|---------------------|
| **Frontend/UI** | Playwright browser via playwright skill | Agent navigates, clicks, screenshots, asserts DOM state |
| **Form Validation** | Bash + curl/httpie | Agent submits form data, validates response |
| **State Changes** | Bash + grep | Agent checks file modifications for correct patterns |

**Evidence Requirements (Agent-Executable):**
- Command output captured and compared against expected patterns
- Screenshots saved to .sisyphus/evidence/ for visual verification
- File diffs captured to verify correct modifications
- Exit codes checked (0 = success)

---

## Execution Strategy

### Parallel Execution Waves

> Maximize throughput by grouping independent tasks into parallel waves.
> Each wave completes before the next begins.

```
Wave 1 (Start Immediately):
├── Task 1: Modify date filter component (FEATURE 1)
└── Task 2: Update form state for new fields (FEATURE 2 - state)

Wave 2 (After Wave 1):
├── Task 3: Enhance pricing form UI (FEATURE 2 - UI)
├── Task 4: Implement conditional field display
└── Task 5: Add validation logic

Wave 3 (After Wave 2):
└── Task 6: Implement auto-calculation and final integration

Critical Path: Task 1 → Task 3 → Task 6
Parallel Speedup: ~40% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3 | 2 |
| 2 | None | 4, 5 | 1 |
| 3 | 1 | 6 | 4, 5 |
| 4 | 2 | 6 | 3, 5 |
| 5 | 2 | 6 | 3, 4 |
| 6 | 3, 4, 5 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | delegate_task(category="quick", load_skills=[], run_in_background=true) |
| 2 | 3, 4, 5 | dispatch parallel after Wave 1 completes |
| 3 | 6 | final integration task |

---

## TODOs

> Implementation + Verification = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info.

- [ ] 1. **Modify Date Filter Component**

  **What to do**:
  - Locate date filter in `ClassManagement.tsx` (lines 2280-2301)
  - Remove calendar emoji icon (`<span>📅</span>` at line 2288-2295)
  - Change input type from `date` to `datetime-local`
  - Update placeholder text from "首课日期" to appropriate datetime placeholder
  - Adjust styling to accommodate datetime input (width may need adjustment)
  - Update state variable `filterStartDate` to handle datetime format

  **Must NOT do**:
  - Don't add external date picker libraries
  - Don't change the filter functionality beyond requirements
  - Don't modify unrelated parts of the component

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple UI modification with clear requirements
  - **Skills**: None needed for this task
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for file modification only
    - `frontend-ui-ux`: Simple enough for quick agent

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3 (pricing form UI)
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `./components/admin/ClassManagement.tsx:2280-2301` - Current date filter implementation
  - `./components/admin/ClassManagement.tsx:2602` - Date input pattern in create modal
  - `./components/admin/ClassManagement.tsx:2660` - datetime-local input pattern for push time

  **Styling References**:
  - `./components/admin/ClassManagement.tsx:2286` - Current date input styling classes
  - `./components/admin/ClassManagement.tsx:2652` - Time input styling pattern

  **State Management References**:
  - `./components/admin/ClassManagement.tsx:569` - filterStartDate state declaration
  - `./components/admin/ClassManagement.tsx:2285` - Current onChange handler pattern

  **WHY Each Reference Matters**:
  - Lines 2280-2301: Exact component to modify
  - Line 2660: Example of datetime-local input usage
  - Line 2286: Styling pattern to maintain consistency
  - Line 569: State variable that needs to handle datetime format

  **Acceptance Criteria**:

  **Automated Verification**:
  ```bash
  # Agent executes via grep to verify changes:
  # 1. Check calendar icon removed
  grep -n "📅" ./components/admin/ClassManagement.tsx
  # Assert: No matches found (calendar icon removed)

  # 2. Check input type changed to datetime-local
  grep -n 'type="date"' ./components/admin/ClassManagement.tsx | grep -i "firstlesson"
  # Assert: No matches for date type on first lesson date picker

  grep -n 'type="datetime-local"' ./components/admin/ClassManagement.tsx | grep -i "firstlesson"
  # Assert: Match found (datetime-local type implemented)

  # 3. Check placeholder updated if changed
  grep -n "首课日期" ./components/admin/ClassManagement.tsx
  # Assert: Either removed or replaced with appropriate placeholder

  # 4. Verify file compiles without errors
  cd /Users/sury/Documents/Siyue && npm run build 2>&1 | head -20
  # Assert: No TypeScript errors related to ClassManagement.tsx
  ```

  **Evidence to Capture**:
  - [ ] Terminal output from grep commands showing changes
  - [ ] Screenshot of modified date filter in browser (optional)
  - [ ] Build output showing no errors

  **Commit**: YES
  - Message: `feat(class-creation): modify date filter to use datetime-local input`
  - Files: `./components/admin/ClassManagement.tsx`
  - Pre-commit: `npm run build` (verify no errors)

- [ ] 2. **Update Form State for New Fields**

  **What to do**:
  - Locate formData state in `ClassManagement.tsx` (lines 614-647)
  - Add new fields to formData object:
    - `salesMode`: string with default "普通班"
    - `deposit`: string (for pre-sale deposit amount)
    - `minClassSize`: number (for minimum students required)
    - `confirmationMethod`: string with default "手动确认"
    - `groupDeadline`: string (optional datetime)
  - Update `resetForm()` function (lines 652-681) to include default values for new fields
  - Update TypeScript interface if needed (check types.ts)

  **Must NOT do**:
  - Don't remove existing fields
  - Don't change existing field types
  - Don't modify unrelated state management

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple state management updates
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed for file modifications only

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 4, Task 5 (conditional display and validation)
  - **Blocked By**: None (can start immediately)

  **References**:

  **State Pattern References**:
  - `./components/admin/ClassManagement.tsx:614-647` - Current formData structure
  - `./components/admin/ClassManagement.tsx:652-681` - resetForm() function pattern
  - `./types.ts` - Check for existing type definitions

  **Field Type References**:
  - `./components/admin/ClassManagement.tsx:643` - price field (string type in form, number in final)
  - `./components/admin/ClassManagement.tsx:645` - materialPrice field pattern

  **Default Value References**:
  - `./components/admin/ClassManagement.tsx:618` - year default value pattern
  - `./components/admin/ClassManagement.tsx:636` - startDate default pattern

  **WHY Each Reference Matters**:
  - Lines 614-647: Exact location to add new fields
  - Lines 652-681: Must update resetForm to maintain consistency
  - types.ts: May need to update TypeScript interfaces
  - Line 643: Pattern for numeric fields stored as strings in form state

  **Acceptance Criteria**:

  **Automated Verification**:
  ```bash
  # Agent executes via grep to verify state updates:
  # 1. Check new fields added to formData
  grep -n "salesMode" ./components/admin/ClassManagement.tsx
  # Assert: Match found in formData object

  grep -n "deposit" ./components/admin/ClassManagement.tsx
  # Assert: Match found in formData object

  grep -n "minClassSize" ./components/admin/ClassManagement.tsx
  # Assert: Match found in formData object

  # 2. Check resetForm includes new fields
  grep -A5 -B5 "salesMode:" ./components/admin/ClassManagement.tsx | grep -i "resetform\|formdata"
  # Assert: salesMode included in resetForm defaults

  # 3. Verify TypeScript compilation
  cd /Users/sury/Documents/Siyue && npx tsc --noEmit 2>&1 | grep -i "classmanagement" | head -10
  # Assert: No TypeScript errors related to new fields
  ```

  **Evidence to Capture**:
  - [ ] Terminal output from grep commands
  - [ ] TypeScript compilation output
  - [ ] File diff showing added fields

  **Commit**: YES (group with Task 1)
  - Message: `feat(class-creation): add sales mode and pre-sale fields to form state`
  - Files: `./components/admin/ClassManagement.tsx`, `./types.ts` (if modified)
  - Pre-commit: `npx tsc --noEmit` (verify no TypeScript errors)

- [ ] 3. **Enhance Pricing Form UI**

  **What to do**:
  - Locate pricing form in `ClassManagement.tsx` (lines 2674-2706)
  - Modify material fee field (line 2698):
    - Add red asterisk `*` to indicate required
    - Update label from "教辅费" to "教辅费 *"
  - Add sales mode field after charge mode (after line 2687):
    - Label: "售卖模式 *" with red asterisk
    - Select with options: "普通班", "预售班"
    - Default value: "普通班"
  - Add conditional pre-sale fields section (after material fee field):
    - Wrap in conditional div that shows only when salesMode === "预售班"
    - Include fields for: deposit, balance (readonly), minClassSize, confirmationMethod, groupDeadline
    - Balance field should be readonly with auto-calculation

  **Must NOT do**:
  - Don't modify existing field order unnecessarily
  - Don't change existing styling patterns
  - Don't add external UI libraries

  **Recommended Agent Profile**:
  - **Category**: `frontend-ui-ux`
    - Reason: UI form enhancements with conditional rendering
  - **Skills**: `frontend-ui-ux`
    - `frontend-ui-ux`: Needed for form layout and conditional UI patterns
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for static UI modifications

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 6 (final integration)
  - **Blocked By**: Task 1 (date filter modifications)

  **References**:

  **Form Layout References**:
  - `./components/admin/ClassManagement.tsx:2674-2706` - Current pricing form structure
  - `./components/admin/ClassManagement.tsx:2682-2687` - Select field pattern for charge mode
  - `./components/admin/ClassManagement.tsx:2697-2703` - Material fee field pattern

  **Conditional Rendering References**:
  - `./components/admin/ClassManagement.tsx:2473-2590` - Step-based conditional rendering pattern
  - `./components/admin/ClassManagement.tsx:1696-1708` - createStep conditional logic

  **Styling References**:
  - `./components/admin/ClassManagement.tsx:2683` - Select field styling classes
  - `./components/admin/ClassManagement.tsx:2692` - Input field styling pattern
  - `./components/admin/ClassManagement.tsx:2700` - Material fee input styling

  **WHY Each Reference Matters**:
  - Lines 2674-2706: Exact location to modify pricing form
  - Lines 2682-2687: Pattern for select/dropdown fields
  - Lines 2473-2590: Conditional rendering patterns to follow
  - Line 2683: Styling classes to maintain consistency

  **Acceptance Criteria**:

  **Automated Verification**:
  ```bash
  # Agent executes via grep and playwright to verify UI changes:
  # 1. Check material fee label updated with asterisk
  grep -n "教辅费 \*" ./components/admin/ClassManagement.tsx
  # Assert: Match found (label updated)

  # 2. Check sales mode field added
  grep -n "售卖模式" ./components/admin/ClassManagement.tsx
  # Assert: Match found (new field added)

  # 3. Check conditional rendering for pre-sale fields
  grep -n "salesMode === \"预售班\"" ./components/admin/ClassManagement.tsx
  # Assert: Match found (conditional rendering implemented)

  # 4. Check pre-sale fields exist
  grep -n "定金\|尾款\|最低开班人数\|确认开班方式\|组班截止时间" ./components/admin/ClassManagement.tsx
  # Assert: Matches found for all pre-sale field labels

  # 5. Verify balance field is readonly
  grep -n "readOnly\|readonly" ./components/admin/ClassManagement.tsx | grep -i "balance\|尾款"
  # Assert: Match found (balance field marked as readonly)
  ```

  **Evidence to Capture**:
  - [ ] Terminal output from grep commands
  - [ ] Screenshot of enhanced pricing form in browser
  - [ ] File diff showing UI modifications

  **Commit**: YES
  - Message: `feat(class-creation): enhance pricing form with sales mode and conditional pre-sale fields`
  - Files: `./components/admin/ClassManagement.tsx`
  - Pre-commit: `npm run build` (verify no errors)

- [ ] 4. **Implement Conditional Field Display**

  **What to do**:
  - Implement conditional rendering logic for pre-sale fields
  - Show pre-sale fields only when salesMode === "预售班"
  - Hide pre-sale fields when salesMode === "普通班"
  - Ensure smooth UI transitions (no layout shifts)
  - Update form validation to account for conditional fields

  **Must NOT do**:
  - Don't use complex state management libraries
  - Don't add unnecessary animations
  - Don't modify existing conditional rendering patterns

  **Recommended Agent Profile**:
  - **Category**: `frontend-ui-ux`
    - Reason: Conditional UI logic and state management
  - **Skills**: `frontend-ui-ux`
    - `frontend-ui-ux`: Needed for conditional rendering patterns
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for implementation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Task 6 (final integration)
  - **Blocked By**: Task 2 (form state updates)

  **References**:

  **Conditional Rendering References**:
  - `./components/admin/ClassManagement.tsx:2473-2590` - Step-based conditional rendering
  - `./components/admin/ClassManagement.tsx:1696-1708` - createStep conditional logic
  - `./components/admin/ClassManagement.tsx:2296-2300` - Conditional placeholder pattern

  **State Management References**:
  - `./components/admin/ClassManagement.tsx:2285` - onChange handler pattern
  - `./components/admin/ClassManagement.tsx:2683` - Select onChange pattern

  **UI Pattern References**:
  - `./components/admin/ClassManagement.tsx:2602-2668` - Form section patterns
  - `./components/admin/ClassManagement.tsx:2674-2706` - Pricing form structure

  **WHY Each Reference Matters**:
  - Lines 2473-2590: Pattern for conditional rendering based on state
  - Line 2285: Standard onChange handler pattern
  - Lines 2602-2668: Form section organization patterns
  - Lines 2674-2706: Location where conditional logic needs to be added

  **Acceptance Criteria**:

  **Automated Verification**:
  ```bash
  # Agent executes via playwright to verify conditional display:
  # 1. Check conditional rendering logic exists
  grep -n "salesMode === \"预售班\"" ./components/admin/ClassManagement.tsx
  # Assert: Match found (conditional logic implemented)

  # 2. Check pre-sale fields are wrapped in conditional
  grep -B5 -A5 "salesMode === \"预售班\"" ./components/admin/ClassManagement.tsx | grep -i "定金\|deposit"
  # Assert: Pre-sale fields are inside conditional block

  # 3. Verify TypeScript compilation
  cd /Users/sury/Documents/Siyue && npx tsc --noEmit 2>&1 | grep -i "classmanagement" | head -10
  # Assert: No TypeScript errors related to conditional logic

  # 4. Check that regular class mode hides pre-sale fields
  grep -B5 -A5 "salesMode === \"普通班\"" ./components/admin/ClassManagement.tsx | grep -i "return null\|{null}\|<!--"
  # Assert: Conditional logic handles regular class mode
  ```

  **Evidence to Capture**:
  - [ ] Terminal output from grep commands
  - [ ] Screenshots showing pre-sale fields visible when "预售班" selected
  - [ ] Screenshots showing pre-sale fields hidden when "普通班" selected
  - [ ] TypeScript compilation output

  **Commit**: YES (group with Task 3)
  - Message: `feat(class-creation): implement conditional display for pre-sale fields`
  - Files: `./components/admin/ClassManagement.tsx`
  - Pre-commit: `npx tsc --noEmit && npm run build`

- [ ] 5. **Add Validation Logic**

  **What to do**:
  - Update `handleNextStep()` function (lines 1695-1705) to include pricing step validation
  - Add validation for required material fee field
  - Add validation for pre-sale conditions when salesMode === "预售班":
    - Deposit must be provided and must be < course fee
    - Minimum class size must be positive integer
    - Confirmation method must be selected
  - Update `handleCreateClass()` to include validation before submission
  - Show appropriate alert messages for validation failures

  **Must NOT do**:
  - Don't add external validation libraries
  - Don't change existing validation patterns
  - Don't remove existing validation logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Logic implementation following existing patterns
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Validation is logic, not UI

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 6 (final integration)
  - **Blocked By**: Task 2 (form state updates)

  **References**:

  **Validation Pattern References**:
  - `./components/admin/ClassManagement.tsx:1697-1700` - Existing validation pattern (basic info)
  - `./components/admin/ClassManagement.tsx:1713-1800` - handleCreateClass validation pattern
  - `./components/admin/ProductManagement.tsx` - Example of form validation with alerts

  **Business Logic References**:
  - `./components/admin/ClassManagement.tsx:1754` - Price parsing pattern (parseFloat)
  - `./components/admin/ClassManagement.tsx:1756` - Material price parsing pattern

  **Error Handling References**:
  - `./components/admin/ClassManagement.tsx:1698` - Alert message pattern
  - `./components/admin/ClassManagement.tsx:1713` - Return early pattern on validation failure

  **WHY Each Reference Matters**:
  - Lines 1697-1700: Pattern for step validation with alerts
  - Lines 1713-1800: Final validation before submission
  - Line 1754: Pattern for numeric validation and parsing
  - Line 1698: Alert message format to maintain consistency

  **Acceptance Criteria**:

  **Automated Verification**:
  ```bash
  # Agent executes via grep to verify validation logic:
  # 1. Check material fee validation added
  grep -n "materialPrice" ./components/admin/ClassManagement.tsx | grep -i "validation\|check\|required\|if"
  # Assert: Match found (material fee validation implemented)

  # 2. Check pre-sale validation logic
  grep -n "预售班" ./components/admin/ClassManagement.tsx | grep -i "validation\|check\|if\|deposit"
  # Assert: Match found (pre-sale validation implemented)

  # 3. Check deposit < course fee validation
  grep -n "deposit.*<.*price\|price.*>.*deposit" ./components/admin/ClassManagement.tsx
  # Assert: Match found (deposit validation implemented)

  # 4. Check minimum class size validation
  grep -n "minClassSize" ./components/admin/ClassManagement.tsx | grep -i "validation\|check\|positive\|integer"
  # Assert: Match found (min class size validation implemented)

  # 5. Verify TypeScript compilation
  cd /Users/sury/Documents/Siyue && npx tsc --noEmit 2>&1 | grep -i "classmanagement" | head -10
  # Assert: No TypeScript errors related to validation logic
  ```

  **Evidence to Capture**:
  - [ ] Terminal output from grep commands
  - [ ] Screenshots of validation error messages in browser
  - [ ] TypeScript compilation output
  - [ ] Test cases: valid form submission, invalid material fee, invalid deposit amount

  **Commit**: YES (group with Tasks 3, 4)
  - Message: `feat(class-creation): add validation for material fee and pre-sale conditions`
  - Files: `./components/admin/ClassManagement.tsx`
  - Pre-commit: `npx tsc --noEmit && npm run build`

- [ ] 6. **Implement Auto-calculation and Final Integration**

  **What to do**:
  - Add useEffect hook to calculate balance (course fee - deposit)
  - Update balance field whenever course fee or deposit changes
  - Ensure balance field is readonly and displays calculated value
  - Test complete workflow: date filter → pricing form → validation → submission
  - Verify all features work together correctly
  - Perform final code review and cleanup

  **Must NOT do**:
  - Don't add complex state management
  - Don't modify unrelated functionality
  - Don't change existing calculation patterns

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Complex integration with multiple dependencies
  - **Skills**: None needed
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Integration task, not UI design
    - `playwright`: Not needed for implementation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential, final task)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 3, 4, 5 (all previous tasks)

  **References**:

  **useEffect Pattern References**:
  - `./components/admin/ClassManagement.tsx:606-611` - useEffect pattern for createTrigger
  - `./components/admin/ClassManagement.tsx:105-150` - Other useEffect examples in codebase

  **Calculation References**:
  - `./components/admin/ClassManagement.tsx:1754` - Price parsing (parseFloat)
  - `./components/admin/ClassManagement.tsx:1719` - Date calculation example
  - `./components/admin/Calendar.tsx` - Basic calculation patterns

  **State Update References**:
  - `./components/admin/ClassManagement.tsx:2285` - Standard onChange pattern
  - `./components/admin/ClassManagement.tsx:2683` - Select onChange with formData update

  **WHY Each Reference Matters**:
  - Lines 606-611: useEffect pattern to follow
  - Line 1754: parseFloat pattern for numeric calculations
  - Line 2285: Standard state update pattern
  - Line 2683: Form state update pattern for select fields

  **Acceptance Criteria**:

  **Automated Verification**:
  ```bash
  # Agent executes via grep and playwright to verify auto-calculation:
  # 1. Check useEffect for balance calculation
  grep -n "useEffect" ./components/admin/ClassManagement.tsx | grep -i "balance\|deposit\|price"
  # Assert: Match found (useEffect implemented for auto-calculation)

  # 2. Check balance calculation logic
  grep -n "balance.*=.*price.*-.*deposit\|deposit.*-.*price" ./components/admin/ClassManagement.tsx
  # Assert: Match found (balance calculation implemented)

  # 3. Check balance field is readonly
  grep -n "balance" ./components/admin/ClassManagement.tsx | grep -i "readonly\|readOnly"
  # Assert: Match found (balance field marked as readonly)

  # 4. Test complete workflow via playwright
  # Agent should:
  # - Navigate to class management page
  # - Open create class modal
  # - Fill in all required fields
  # - Select "预售班" sales mode
  # - Enter course fee and deposit
  # - Verify balance auto-calculates
  # - Submit form successfully
  # - Verify class created with correct pricing data

  # 5. Final TypeScript compilation check
  cd /Users/sury/Documents/Siyue && npm run build 2>&1 | tail -20
  # Assert: Build succeeds with no errors
  ```

  **Evidence to Capture**:
  - [ ] Terminal output from grep commands
  - [ ] Screenshots showing auto-calculated balance
  - [ ] Screenshots of successful form submission
  - [ ] Build output showing success
  - [ ] Playwright test results

  **Commit**: YES
  - Message: `feat(class-creation): implement auto-calculation and complete integration`
  - Files: `./components/admin/ClassManagement.tsx`
  - Pre-commit: `npm run build` (full build verification)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1, 2 | `feat(class-creation): modify date filter and add sales mode fields` | ClassManagement.tsx, types.ts | `npm run build` |
| 3, 4, 5 | `feat(class-creation): enhance pricing form with validation` | ClassManagement.tsx | `npx tsc --noEmit && npm run build` |
| 6 | `feat(class-creation): implement auto-calculation and final integration` | ClassManagement.tsx | `npm run build` (full) |

---

## Success Criteria

### Verification Commands
```bash
# Final verification of all features
cd /Users/sury/Documents/Siyue

# 1. Check date filter modifications
grep -n "datetime-local" ./components/admin/ClassManagement.tsx | grep -i "firstlesson"
# Expected: Match found

# 2. Check material fee is required
grep -n "教辅费 \*" ./components/admin/ClassManagement.tsx
# Expected: Match found

# 3. Check sales mode field
grep -n "售卖模式" ./components/admin/ClassManagement.tsx
# Expected: Match found

# 4. Check conditional pre-sale fields
grep -n "salesMode === \"预售班\"" ./components/admin/ClassManagement.tsx
# Expected: Match found

# 5. Check validation logic
grep -n "materialPrice" ./components/admin/ClassManagement.tsx | grep -i "validation\|required"
# Expected: Match found

# 6. Check auto-calculation
grep -n "useEffect" ./components/admin/ClassManagement.tsx | grep -i "balance\|deposit"
# Expected: Match found

# 7. Final build verification
npm run build
# Expected: Build succeeds with no errors
```

### Final Checklist
- [ ] Date filter uses datetime-local without calendar icon
- [ ] Material fee field is required with asterisk
- [ ] Sales mode selection works (普通班/预售班)
- [ ] Pre-sale fields conditionally displayed
- [ ] Deposit validation (must be < course fee)
- [ ] Balance auto-calculates correctly
- [ ] Minimum class size validation works
- [ ] All validation rules enforced
- [ ] Complete workflow functions end-to-end
- [ ] Code compiles without errors