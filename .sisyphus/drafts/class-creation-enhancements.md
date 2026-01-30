# Draft: Class Creation System Enhancements

## Requirements (confirmed)
1. **FEATURE 1: Create Class - First Lesson Date Filter**
   - Remove calendar icon from existing date filter
   - Date picker should not show "年/月/" format (clean date display)
   - Clicking should allow time selection (date + time picker)

2. **FEATURE 2: Create Class - Pricing Standards Page Enhancements**
   - **教辅费** (material fee): Change from optional to REQUIRED field
   - **新增售卖模式** (new sales mode field):
     - Options: "普通班" (regular class), "预售班" (pre-sale class)
   - **预售班条件字段** (pre-sale class conditional fields):
     - 定金 (deposit): REQUIRED, must be < course fee
     - 尾款 (balance): AUTO-CALCULATED (course fee - deposit)
     - 最低开班人数 (min class size): REQUIRED, positive integer
     - 确认开班方式 (confirmation method): "手动确认" (manual) or "自动确认" (auto), default: manual
     - 组班截止时间 (group deadline): OPTIONAL

## Current Context Discovered
1. **File Location**: `./components/admin/ClassManagement.tsx`
2. **Date Filter**: Line 2280-2301, uses native HTML5 date input with calendar icon
3. **Pricing Step**: Step 3 of create class flow (lines 2674-2706)
4. **Material Fee**: Currently optional field at line 2698
5. **No external date picker library**: Using native HTML5 date input
6. **No validation library**: Simple form state management with useState

## Technical Decisions Needed
1. **Date+Time Picker Approach**: 
   - Option A: Use native HTML5 datetime-local input (simplest, follows existing patterns)
   - Option B: Implement custom date+time picker component (better UX, more work)
   - Option C: Add external date picker library (adds dependency)

2. **Form Validation Approach**:
   - Option A: Implement custom validation functions (follows existing patterns)
   - Option B: Add validation library (Zod, Yup, etc.) (more robust, adds dependency)

3. **Conditional Field Display**:
   - Show/hide pre-sale fields based on sales mode selection using conditional rendering

4. **Auto-calculation Logic**:
   - Balance = course fee - deposit (real-time calculation using useEffect or onChange)

5. **Test Infrastructure**:
   - Need to assess if test infrastructure exists and decide on TDD vs manual verification

## Research Findings (Explore Agent)
1. **Date Filter Implementation**: Native HTML5 `<input type="date">` with calendar emoji overlay (lines 2280-2301)
2. **No External Date Picker Library**: Codebase uses native browser inputs exclusively
3. **Form Patterns**: Multi-step wizard (3 steps: basic → session → pricing)
4. **Validation**: Basic manual validation in `handleNextStep()` function
5. **Material Fee Field**: Already exists as optional field `materialPrice` in form
6. **Sales Mode**: Existing `chargeMode` field with 'whole'/'installment' options
7. **Conditional Rendering**: Based on `createStep` state variable
8. **Component Patterns**: `SearchableMultiSelect` component for reusable dropdowns

## Open Questions
1. Should we use native `datetime-local` input or implement custom date+time picker?
2. Should we add a validation library or implement custom validation functions?
3. How should conditional field display be implemented (show/hide pre-sale fields)?
4. What's the best approach for real-time balance calculation (course fee - deposit)?
5. Should we add a date picker library or stick with native inputs?