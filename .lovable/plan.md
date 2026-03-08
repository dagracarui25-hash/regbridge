

## Plan

Two changes needed:

1. **`src/pages/Index.tsx` (line 99)**: Add `flex flex-col` to the documents `TabsContent` so it can pass flex context to its child:
   ```
   className="flex-1 flex flex-col overflow-y-auto mt-0 ring-0 focus-visible:ring-0"
   ```

2. **`src/components/DocumentsInternes.tsx` (line 161)**: Update the root div to center content vertically and horizontally:
   ```
   className="min-h-full w-full flex flex-col items-center justify-center px-4 sm:px-8 lg:px-16 py-6"
   ```
   Using `min-h-full` (not `min-h-screen`) because the component lives inside a flex container that already fills the available screen height minus header/tabs/footer.

No visual, color, or component changes.

