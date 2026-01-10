# HandheldLab - UI/UX Specification Document

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Status:** Complete - LOCKED ✅

---

## Purpose

This document defines the visual design system and component specifications for HandheldLab MVP to ensure:
- Consistent UI across all pages
- Accessible design from the start (WCAG AA)
- Clear component patterns for implementation
- Responsive layouts for mobile/tablet/desktop

**Scope:** Design tokens, custom components, responsive breakpoints, accessibility  
**Non-Scope:** Pixel-perfect mockups, animation specs, every component variant

---

## Table of Contents

1. [Design Tokens](#1-design-tokens)
2. [Component Specifications](#2-component-specifications)
3. [Layout Patterns](#3-layout-patterns)
4. [Responsive Breakpoints](#4-responsive-breakpoints)
5. [Accessibility Requirements](#5-accessibility-requirements)
6. [Implementation Notes](#6-implementation-notes)

---

## 1. Design Tokens

### 1.1 Color Palette

**Primary (Brand):**
```javascript
// Tailwind config
colors: {
  primary: {
    50: '#f0f9ff',   // Very light blue
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',  // Main brand color
    600: '#0284c7',  // Hover/active states
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  }
}
```

**Usage:**
- Buttons (primary action): `bg-primary-600 hover:bg-primary-700`
- Links: `text-primary-600 hover:text-primary-700`
- Focus rings: `ring-primary-500`
- Badges (verified): `bg-primary-100 text-primary-800`

---

**Neutral (Grays):**
```javascript
colors: {
  gray: {
    50: '#f9fafb',   // Backgrounds
    100: '#f3f4f6',  // Card backgrounds
    200: '#e5e7eb',  // Borders
    300: '#d1d5db',  // Disabled states
    400: '#9ca3af',  // Placeholder text
    500: '#6b7280',  // Secondary text
    600: '#4b5563',  // Body text
    700: '#374151',  // Headings
    800: '#1f2937',
    900: '#111827',  // Strong headings
  }
}
```

**Usage:**
- Body text: `text-gray-600`
- Headings: `text-gray-900`
- Borders: `border-gray-200`
- Card backgrounds: `bg-gray-50` or `bg-white`
- Disabled: `text-gray-400 bg-gray-100`

---

**Semantic Colors:**

```javascript
colors: {
  success: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
  },
  warning: {
    50:  '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
  },
  error: {
    50:  '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
  },
  info: {
    50:  '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
  }
}
```


**Usage:**
- Success badges (verified): `bg-success-100 text-success-800`
- Warning badges (pending): `bg-warning-100 text-warning-800`
- Error badges (rejected): `bg-error-100 text-error-800`
- Form errors: `text-error-600 border-error-500`

---

**FPS Class Colors (Custom):**
```javascript
colors: {
  'fps-excellent': '#22c55e',  // 60+ FPS (green)
  'fps-good': '#3b82f6',       // 45-59 FPS (blue)
  'fps-fair': '#f59e0b',       // 30-44 FPS (amber)
  'fps-poor': '#ef4444',       // <30 FPS (red)
}
```

**Usage:**
- FPS badges on report cards
- Color-coded metrics

---

### 1.2 Typography

**Font Families:**
```javascript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'], // For FPS numbers
}
```

**Font Sizes:**
```javascript
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px - Small labels
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px - Body small
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px - Body
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px - Large body
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px - H3
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px - H2
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - H1
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px - Hero
}
```

**Font Weights:**
```javascript
fontWeight: {
  normal: '400',    // Body text
  medium: '500',    // Emphasized text, buttons
  semibold: '600',  // Headings
  bold: '700',      // Strong headings
}
```

**Usage:**
- Page titles: `text-3xl font-bold text-gray-900`
- Section headings: `text-2xl font-semibold text-gray-900`
- Card titles: `text-lg font-semibold text-gray-800`
- Body text: `text-base text-gray-600`
- Small labels: `text-xs font-medium text-gray-500`
- FPS numbers: `font-mono text-xl font-bold`

---

### 1.3 Spacing Scale

**Tailwind default scale (4px base):**
```javascript
spacing: {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
}
```

**Common Usage:**
- Component padding: `p-4` (16px) or `p-6` (24px)
- Card gap: `gap-6` (24px)
- Section margin: `mb-8` (32px) or `mb-12` (48px)
- Button padding: `px-4 py-2` (16px horizontal, 8px vertical)
- Grid gap: `gap-4` (16px) mobile, `gap-6` (24px) desktop

---

### 1.4 Border Radius
```javascript
borderRadius: {
  none: '0px',
  sm: '0.125rem',   // 2px - Badges
  DEFAULT: '0.25rem', // 4px - Inputs, small buttons
  md: '0.375rem',   // 6px - Cards, buttons
  lg: '0.5rem',     // 8px - Modals
  xl: '0.75rem',    // 12px - Large cards
  '2xl': '1rem',    // 16px - Hero sections
  full: '9999px',   // Pills, avatars
}
```

**Usage:**
- Buttons: `rounded-md` (6px)
- Cards: `rounded-lg` (8px)
- Inputs: `rounded` (4px)
- Badges: `rounded-sm` (2px)
- Avatar placeholders: `rounded-full`

---

### 1.5 Shadows
```javascript
boxShadow: {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',        // Subtle hover
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1)',   // Cards
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',     // Elevated cards
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',   // Modals
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',   // Dropdowns
  none: '0 0 #0000',                          // No shadow
}
```

**Usage:**
- Cards (default): `shadow`
- Cards (hover): `hover:shadow-md transition-shadow`
- Modals: `shadow-lg`
- Dropdowns: `shadow-xl`

---

## 2. Component Specifications

### 2.1 ReportCard (Custom Component)

**Purpose:** Display performance report in grid/list views

**Anatomy:**
```
┌─────────────────────────────────────┐
│  📷 Screenshot (16:9 aspect)        │
│                                     │
├─────────────────────────────────────┤
│  Device Name                 ⏳/✓   │ (badge)
│  @username                          │
├─────────────────────────────────────┤
│  60 FPS AVG    │   15W TDP          │
│  Native Res    │   High Preset      │
├─────────────────────────────────────┤
│  ❤️ 24 upvotes             [More →] │
└─────────────────────────────────────┘
```

**Structure:**
```tsx
<div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
  {/* Screenshot */}
  <div className="relative aspect-video bg-gray-100">
    <Image 
      src={signedUrl} 
      alt="Performance screenshot"
      fill
      className="object-cover"
    />
    {/* FPS Badge (overlay) */}
    <div className="absolute top-2 right-2 bg-fps-excellent/90 text-white px-2 py-1 rounded-sm text-xs font-mono font-bold">
      60 FPS
    </div>
  </div>
  
  {/* Header */}
  <div className="p-4 space-y-2">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-gray-800">Steam Deck OLED</h3>
      <StatusBadge status={status} />
    </div>
    <p className="text-sm text-gray-500">@username</p>
  </div>
  
  {/* Metrics Grid */}
  <div className="px-4 pb-4 grid grid-cols-2 gap-2 text-sm">
    <div>
      <span className="font-mono font-bold text-gray-900">60 FPS</span>
      <span className="text-gray-500"> AVG</span>
    </div>
    <div>
      <span className="font-mono font-bold text-gray-900">15W</span>
      <span className="text-gray-500"> TDP</span>
    </div>
    <div className="text-gray-600">Native Res</div>
    <div className="text-gray-600">High Preset</div>
  </div>
  
  {/* Footer */}
  <div className="px-4 pb-4 flex items-center justify-between border-t border-gray-100 pt-3">
    <UpvoteButton reportId={id} count={upvotes} />
    <button className="text-sm text-primary-600 hover:text-primary-700">
      View Details →
    </button>
  </div>
</div>
```

**States:**
- Default: `shadow`
- Hover: `hover:shadow-md` (interactive elevation)
- Loading: Skeleton placeholder (gray rectangles)

**Responsive:**
- Mobile (<768px): Full width, single column
- Desktop (≥768px): Grid (2-3 columns)

---

### 2.2 UpvoteButton (Custom Component)

**Purpose:** Toggle upvote on reports

**Anatomy:**
```
┌──────────────┐
│  ❤️ 24       │  (filled heart, upvoted)
└──────────────┘

┌──────────────┐
│  🤍 24       │  (outline heart, not upvoted)
└──────────────┘
```

**Structure:**
```tsx
<button
  onClick={handleToggle}
  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
  aria-label={upvoted ? "Remove upvote" : "Upvote this report"}
>
  {upvoted ? (
    <Heart className="w-5 h-5 text-error-500 fill-current" />
  ) : (
    <Heart className="w-5 h-5 text-gray-400" />
  )}
  <span className="text-sm font-medium text-gray-700">{count}</span>
</button>
```

**States:**
- Not upvoted: Outline heart, gray
- Upvoted: Filled heart, red (`text-error-500 fill-current`)
- Hover: `hover:bg-gray-100`
- Disabled (anon): `cursor-not-allowed opacity-50`

**Interaction:**
- Anonymous: Click → Login modal
- Authenticated: Click → Toggle vote (optimistic UI)

---

### 2.3 StatusBadge (Custom Component)

**Purpose:** Show report verification status

**Variants:**
```tsx
// Pending
<span className="inline-flex items-center gap-1 px-2 py-1 bg-warning-100 text-warning-800 text-xs font-medium rounded-sm">
  <Clock className="w-3 h-3" />
  Pending
</span>

// Verified
<span className="inline-flex items-center gap-1 px-2 py-1 bg-success-100 text-success-800 text-xs font-medium rounded-sm">
  <Check className="w-3 h-3" />
  Verified
</span>

// Rejected
<span className="inline-flex items-center gap-1 px-2 py-1 bg-error-100 text-error-800 text-xs font-medium rounded-sm">
  <X className="w-3 h-3" />
  Rejected
</span>
```

**Usage:**
- Profile page: All statuses visible
- Game page: Only "Verified" shown (implicit)
- Admin queue: "Pending" only

---

### 2.4 FPSClassBadge (Custom Component)

**Purpose:** Color-coded FPS performance indicator

**Variants:**
```tsx
// Excellent (60+ FPS)
<span className="px-2 py-1 bg-fps-excellent text-white text-xs font-mono font-bold rounded-sm">
  60+ FPS
</span>

// Good (45-59 FPS)
<span className="px-2 py-1 bg-fps-good text-white text-xs font-mono font-bold rounded-sm">
  45-59 FPS
</span>

// Fair (30-44 FPS)
<span className="px-2 py-1 bg-fps-fair text-white text-xs font-mono font-bold rounded-sm">
  30-44 FPS
</span>

// Poor (<30 FPS)
<span className="px-2 py-1 bg-fps-poor text-white text-xs font-mono font-bold rounded-sm">
  &lt;30 FPS
</span>
```

**Logic:**
```typescript
function getFPSClass(fps: number): string {
  if (fps >= 60) return 'fps-excellent'
  if (fps >= 45) return 'fps-good'
  if (fps >= 30) return 'fps-fair'
  return 'fps-poor'
}
```

---

### 2.5 Button (Standard Variants)

**Primary Button:**
```tsx
<button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed">
  Submit Report
</button>
```

**Secondary Button:**
```tsx
<button className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md border border-gray-300 shadow-sm hover:shadow transition-all">
  Cancel
</button>
```

**Danger Button (Admin):**
```tsx
<button className="px-4 py-2 bg-error-600 hover:bg-error-700 text-white font-medium rounded-md shadow-sm hover:shadow transition-all">
  Reject Report
</button>
```

**Ghost Button (tertiary):**
```tsx
<button className="px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium rounded-md transition-colors">
  Learn More
</button>
```

**States:**
- Default: Base styles
- Hover: Darker background + elevated shadow
- Active: `active:scale-[0.98]` (subtle press effect)
- Disabled: `opacity-50 cursor-not-allowed`
- Focus: `focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`

---

### 2.6 Form Inputs

**Text Input:**
```tsx
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400"
  placeholder="Enter username..."
/>
```

**Error State:**
```tsx
<input
  type="text"
  className="w-full px-3 py-2 border-2 border-error-500 rounded focus:ring-2 focus:ring-error-500"
  aria-invalid="true"
  aria-describedby="username-error"
/>
<p id="username-error" className="mt-1 text-sm text-error-600">
  Username is required
</p>
```

**Select Dropdown (Radix):**
```tsx
<Select.Root>
  <Select.Trigger className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-primary-500">
    <Select.Value placeholder="Select device..." />
  </Select.Trigger>
  <Select.Content className="bg-white border border-gray-200 rounded-md shadow-lg">
    <Select.Item value="steam-deck" className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
      Steam Deck OLED
    </Select.Item>
  </Select.Content>
</Select.Root>
```

---

### 2.7 Modal (Radix Dialog)

**Structure:**
```tsx
<Dialog.Root>
  <Dialog.Trigger asChild>
    <button>Open Modal</button>
  </Dialog.Trigger>
  
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-50">
      <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
        Modal Title
      </Dialog.Title>
      <Dialog.Description className="text-gray-600 mb-4">
        Modal content goes here...
      </Dialog.Description>
      
      <div className="flex gap-3 justify-end">
        <Dialog.Close asChild>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
            Cancel
          </button>
        </Dialog.Close>
        <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md">
          Confirm
        </button>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

**Usage:**
- Login/Signup modals
- Screenshot full-view modal
- Admin rejection reason modal

---

## 3. Layout Patterns

### 3.1 Page Container

**Standard page wrapper:**
```tsx
<div className="min-h-screen bg-gray-50">
  {/* Header */}
  <header className="bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      {/* Logo, nav, user menu */}
    </div>
  </header>
  
  {/* Main content */}
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Page content */}
  </main>
  
  {/* Footer */}
  <footer className="bg-white border-t border-gray-200 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Footer links */}
    </div>
  </footer>
</div>
```

**Max Width:** `max-w-7xl` (1280px)  
**Padding:** `px-4` mobile, `px-6` tablet, `px-8` desktop

---

### 3.2 Grid Layout (Reports)

**Mobile:**
```tsx
<div className="grid grid-cols-1 gap-4">
  {/* Single column */}
</div>
```

**Tablet:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  {/* 2 columns */}
</div>
```

**Desktop:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 3 columns */}
</div>
```

---

### 3.3 Header (Sticky)
```tsx
<header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
    {/* Logo */}
    <a href="/" className="flex items-center gap-2">
      <span className="text-xl font-bold text-gray-900">HandheldLab</span>
    </a>
    
    {/* Nav */}
    <nav className="hidden md:flex gap-6">
      <a href="/games" className="text-gray-700 hover:text-gray-900">Browse</a>
      <a href="/submit" className="text-gray-700 hover:text-gray-900">Submit</a>
    </nav>
    
    {/* User menu */}
    <div>
      {user ? (
        <DropdownMenu />
      ) : (
        <button className="px-4 py-2 bg-primary-600 text-white rounded-md">
          Sign In
        </button>
      )}
    </div>
  </div>
</header>
```

---

## 4. Responsive Breakpoints

### 4.1 Tailwind Breakpoints
```javascript
screens: {
  sm: '640px',   // Tablet portrait
  md: '768px',   // Tablet landscape
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large desktop
}
```

**Usage:**
- Mobile-first approach (base styles = mobile)
- Use `sm:`, `md:`, `lg:` prefixes for larger screens
- Example: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

### 4.2 Common Responsive Patterns

**Typography:**
```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Page Title
</h1>
```

**Spacing:**
```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Adaptive padding */}
</div>
```

**Grid Columns:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* Adaptive grid */}
</div>
```

**Hide/Show Elements:**
```tsx
{/* Show on mobile only */}
<div className="block md:hidden">Mobile Menu</div>

{/* Show on desktop only */}
<nav className="hidden md:flex">Desktop Nav</nav>
```

---

### 4.3 Mobile Considerations

**Touch Targets:**
- Minimum 44x44px (Tailwind: `min-h-11 min-w-11`)
- Buttons: `py-3` instead of `py-2` on mobile

**Navigation:**
- Mobile: Hamburger menu (Radix DropdownMenu)
- Desktop: Horizontal nav

**Forms:**
- Mobile: Full-width inputs (`w-full`)
- Desktop: Constrained width (`max-w-md`)

**Modals:**
- Mobile: Full screen or bottom sheet
- Desktop: Centered overlay (`max-w-md`)

---

## 5. Accessibility Requirements

### 5.1 Color Contrast (WCAG AA)

**Text Contrast Ratios:**
- Normal text (16px+): 4.5:1 minimum
- Large text (24px+ or 18px+ bold): 3:1 minimum
- UI components (buttons, inputs): 3:1 minimum

**Check:**
- `text-gray-900` on `bg-white`: ✅ Pass (21:1)
- `text-gray-600` on `bg-white`: ✅ Pass (7:1)
- `text-gray-400` on `bg-white`: ⚠️ Fail (use for disabled only)
- `text-white` on `bg-primary-600`: ✅ Pass (4.9:1)

**Tools:**
- WebAIM Contrast Checker
- Browser DevTools Accessibility panel

---

### 5.2 Keyboard Navigation

**Focus States:**
```tsx
// All interactive elements MUST have visible focus
<button className="... focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
  Click Me
</button>

<input className="... focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />

<a className="... focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" />
```

**Tab Order:**
- Logical flow (top to bottom, left to right)
- Skip links for navigation (optional v2)
- Modal traps focus (Radix handles this)

**Keyboard Shortcuts:**
- Enter/Space: Activate buttons/links
- Escape: Close modals
- Tab/Shift+Tab: Navigate
- Arrow keys: Navigate dropdown menus (Radix handles this)

---

### 5.3 Screen Reader Support

**Semantic HTML:**
```tsx
<header>
  <nav aria-label="Main navigation">
    {/* Nav links */}
  </nav>
</header>

<main>
  <h1>Page Title</h1>
  {/* Content */}
</main>

<footer>
  {/* Footer content */}
</footer>
```

**ARIA Labels:**
```tsx
// Icon-only buttons
<button aria-label="Close modal">
  <X className="w-5 h-5" />
</button>

// Form inputs
<label htmlFor="username">Username</label>
<input id="username" name="username" />

// Status badges
<span role="status" aria-live="polite">
  <Check className="w-4 h-4" aria-hidden="true" />
  Verified
</span>

// Upvote button
<button aria-label={upvoted ? "Remove upvote" : "Upvote this report"}>
  {/* Heart icon */}
</button>
```

**Image Alt Text:**
```tsx
<Image 
  src={screenshot} 
  alt={`Performance screenshot showing ${fpsAverage} FPS on ${deviceName}`}
/>
```

---

### 5.4 Form Accessibility

**Labels:**
```tsx
<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
  Email Address
</label>
<input 
  id="email" 
  name="email" 
  type="email" 
  required
  aria-required="true"
  className="..."
/>
```

**Error Messages:**
```tsx
<input 
  id="username" 
  aria-invalid={hasError}
  aria-describedby={hasError ? "username-error" : undefined}
/>
{hasError && (
  <p id="username-error" className="mt-1 text-sm text-error-600" role="alert">
    Username is required
  </p>
)}
```

**Required Fields:**
```tsx
<label>
  Username <span className="text-error-600" aria-label="required">*</span>
</label>
<input required aria-required="true" />
```

---

### 5.5 Accessibility Checklist

**Before Launch:**
- [ ] All interactive elements have visible focus states
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] All images have descriptive alt text
- [ ] Form inputs have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Keyboard navigation works for all interactive elements
- [ ] Modal focus trapping works (Radix handles this)
- [ ] Semantic HTML used (`<header>`, `<main>`, `<nav>`, `<footer>`)
- [ ] ARIA labels for icon-only buttons
- [ ] Page titles are descriptive (`<title>Game Name - HandheldLab</title>`)

**Testing:**
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Run Lighthouse accessibility audit (score >90)
- [ ] Run axe DevTools (0 violations)

---

## 6. Implementation Notes

### 6.1 Tailwind Configuration

**Install:**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js:**
```javascript
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { /* ... */ },
        'fps-excellent': '#22c55e',
        'fps-good': '#3b82f6',
        'fps-fair': '#f59e0b',
        'fps-poor': '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

---

### 6.2 CSS Variables (Optional Alternative)

**If you prefer CSS variables over Tailwind config:**
```css
/* globals.css */
:root {
  --color-primary-500: #0ea5e9;
  --color-primary-600: #0284c7;
  --color-fps-excellent: #22c55e;
  --color-fps-good: #3b82f6;
  --color-fps-fair: #f59e0b;
  --color-fps-poor: #ef4444;
}
```

**Usage:**
```tsx
<div style={{ backgroundColor: 'var(--color-primary-600)' }}>
  {/* Content */}
</div>
```

**Recommendation:** Use Tailwind config (better DX, autocomplete)

---

### 6.3 Component Library Setup

**Radix UI Installation:**
```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
```

**Lucide Icons:**
```bash
npm install lucide-react
```

**Usage:**
```tsx
import { Heart, Check, X, Clock, ChevronDown } from 'lucide-react'

<Heart className="w-5 h-5 text-error-500" />
```

---

### 6.4 Responsive Image Handling

**Next.js Image Component:**
```tsx
import Image from 'next/image'

<Image
  src={signedUrl}
  alt="Performance screenshot"
  width={1920}
  height={1080}
  className="rounded-lg"
  loading="lazy"
  quality={85}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

**Aspect Ratio Container:**
```tsx
<div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
  <Image 
    src={screenshot} 
    alt="Screenshot"
    fill
    className="object-cover"
  />
</div>
```

---

### 6.5 Dark Mode (Future Consideration)

**Not in MVP, but prepared for v2:**
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
  theme: {
    extend: {
      colors: {
        // Add dark variants
      }
    }
  }
}
```

**Usage:**
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  {/* Content adapts to dark mode */}
</div>
```

---

## End of Document

**Status:** 05-UI-UX-SPECIFICATION.md COMPLETE ✅

**Next Steps:**
- Proceed to `06-IMPLEMENTATION-PLAN.md` for phase-by-phase development tasks
- Copy design tokens to Tailwind config during implementation
- Build component library incrementally (start with buttons, inputs, cards)

**Implementation Priority:**
1. Set up Tailwind config with design tokens
2. Build layout components (Header, Footer, Container)
3. Build form components (Input, Select, Button)
4. Build custom components (ReportCard, UpvoteButton, StatusBadge)
5. Implement responsive patterns
6. Test accessibility (keyboard, screen reader, contrast)