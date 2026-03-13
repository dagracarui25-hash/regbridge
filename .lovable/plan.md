

## Plan: Fix sidebar overflow hiding tab bar

### Root cause
The `SidebarHeader` in `ChatSidebar.tsx` has `overflow-visible` (line 45), allowing the button to visually escape the sidebar bounds. The `Sidebar` component itself doesn't enforce a fixed width with overflow hidden.

### Changes (2 files, CSS only)

**1. `src/components/ChatSidebar.tsx` (line 45)**
Change `overflow-visible` to `overflow-hidden` on the `SidebarHeader`:
```tsx
// Before
<SidebarHeader className="p-3 overflow-visible">
// After
<SidebarHeader className="p-3 overflow-hidden">
```

Also add `truncate` to the button text span (line 60) to handle long translations:
```tsx
// Before
{!collapsed && <span className="ml-1.5 font-display">{t("chat.newConversation")}</span>}
// After
{!collapsed && <span className="ml-1.5 font-display truncate">{t("chat.newConversation")}</span>}
```

**2. `src/components/ChatSidebar.tsx` (line 44)**
Add `overflow-hidden` to the `Sidebar` container:
```tsx
// Before
<Sidebar collapsible="icon" className="border-r border-white/[0.06]">
// After
<Sidebar collapsible="icon" className="border-r border-white/[0.06] overflow-hidden">
```

### What this fixes
- Sidebar content (especially the button) can no longer visually overflow into the tab bar area
- Long button text in any language gets truncated with ellipsis instead of overflowing
- No changes to colors, design, logic, or any other component

