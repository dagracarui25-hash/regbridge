

## Plan: Fix quick question buttons hidden behind tab bar

### Problem
The suggestion buttons in `QuestionFinma` (and potentially `AnalyseCroisee`) appear behind the tab bar because the content `motion.div` in `Index.tsx` uses `absolute inset-0`, which can cause overlap with the tab bar. The tab bar has `z-[10]`.

### Fix (single file change)

**File: `src/pages/Index.tsx` (line 118)**

Change the motion.div's z-index to be lower than the tab bar's `z-[10]`:

```tsx
// Before
className="flex-1 flex flex-col overflow-hidden absolute inset-0"

// After  
className="flex-1 flex flex-col overflow-hidden absolute inset-0 z-[1]"
```

This ensures the tab bar (`z-[10]`) always renders above the content area (`z-[1]`), preventing the suggestion buttons from visually overlapping the tabs.

Additionally, in **`src/components/QuestionFinma.tsx` (line 94)**, increase the top padding of the scrollable area to provide more clearance:

```tsx
// Before
className="h-full overflow-y-auto px-4 sm:px-8 lg:px-16 pt-14 py-6 pb-8"

// After
className="h-full overflow-y-auto px-4 sm:px-8 lg:px-16 pt-16 py-6 pb-8"
```

No changes to styles, colors, icons, content, or any other functionality.

