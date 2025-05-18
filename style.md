# Design System & Styling Guide

This document outlines the styling patterns and components used in the HIR3D application to ensure visual consistency across the platform.

## Layout Structure

### Page Layout
- Full-height pages using `min-h-screen flex flex-col`
- SiteHeader at the top
- Main content area with `flex-1` to fill available space
- Overflow handling with `overflow-hidden` when appropriate

### Content Containers
- Container with max-width: `container mx-auto max-w-3xl`
- Two-column layouts with responsive breakpoints:
  - Single column on mobile: `flex-col lg:flex-row`
  - Column proportions: `lg:w-2/3` and `lg:w-1/3` 
- Centered content: `flex items-center justify-center`
- Default spacing: `p-4 md:p-6 lg:p-8`

### Background Elements
- Gradient backgrounds: `bg-gradient-to-b from-primary/5 to-background`
- Pattern backgrounds: 
  ```css
  [background-size:20px_20px]
  [background-image:radial-gradient(#e0e0e0_1px,transparent_1px)]
  dark:[background-image:radial-gradient(#333333_1px,transparent_1px)]
  ```
- Spotlight effect with radial mask:
  ```css
  [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]
  ```

## Typography

### Headings
- Page title: `text-3xl sm:text-4xl font-bold tracking-tight`
- Section title: `text-xl font-semibold`
- Card title: `text-lg font-medium`
- Active state: `text-white`
- Gradient titles: `bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70`

### Body Text
- Base text: Default system font with text-foreground
- Subdued text: `text-muted-foreground`
- Small text: `text-sm`
- Extra small text: `text-xs`
- Form labels: `text-base font-medium`

## Component Styling

### Cards
- Standard card:
  ```css
  overflow-hidden border-none shadow-md
  ```
- Card header: 
  ```css
  bg-card border-b px-6 py-4
  ```
- Card content:
  ```css
  space-y-6 p-6
  ```
- Card with numbered section:
  ```css
  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
    {sectionNumber}
  </div>
  ```

### Timeline Components
- Dark-themed timelines on black background
- Step indicators: 
  ```css
  w-5 h-5 rounded-full
  ```
- Status colors:
  - Completed: `bg-green-500 text-white`
  - Active: `bg-white text-black`
  - Failed: `bg-red-500 text-white`
  - Pending: `bg-gray-700 text-white`
- Connector line:
  ```css
  absolute left-2.5 top-5 w-0.5 h-[calc(100%+1px)] bg-gray-700
  ```
- Timeline layout: 
  ```css
  relative pl-8
  ```

### Form Elements
- Input fields: `text-lg font-medium h-12`
- Select components: Base from shadcn/ui
- Textareas: Standard with appropriate height
- Sliders: For range selection
- Buttons:
  - Primary: Default shadcn/ui primary variant
  - Secondary: `variant="outline"` 
  - Small: `size="sm" className="h-8"`
- Badges:
  - Standard: `bg-background/80`
  - Highlight: `text-primary`
- Custom input with placeholders and vanishing animation:
  ```tsx
  <PlaceholdersAndVanishInput 
    placeholders={placeholders}
    onSubmit={handleInputSubmit}
    isLoading={isJobProcessing}
  />
  ```

### Icons
- Small UI icons: `h-4 w-4`
- Medium icons: `h-5 w-5`
- Accent icons: `text-primary`
- Muted icons: `text-muted-foreground`
- Status icons: `h-3.5 w-3.5` with appropriate colors
- Featured icons in rounded containers:
  ```css
  inline-flex items-center justify-center p-2 bg-primary/10 rounded-full
  ```

## Spacing

### Consistent spacing scale
- Micro spacing: `gap-1`, `gap-1.5`, `gap-2`
- Standard spacing: `gap-3`, `gap-4`, `space-y-4`, `mb-4`
- Large spacing: `gap-6`, `gap-8`, `space-y-6`, `mb-8`

### Section spacing
- Between sections: `space-y-6`
- Card spacing: `gap-8`
- Form element spacing: `space-y-2`

## Animations & Transitions

### Standard transitions
- All transitions: 
  ```css
  transition-all duration-500 ease-in-out
  ```
- State transitions:
  ```css
  transform scale-90 origin-top
  ```

### Loading states
- Loading spinner: 
  ```css
  <Loader2Icon className="h-3 w-3 animate-spin" />
  ```
- Pulse effect: 
  ```css
  animate-pulse
  ```
- Progress indicators with visibility toggles:
  ```css
  opacity-100 max-h-[1000px] vs opacity-0 max-h-0
  ```

## Responsive Design

### Breakpoints
- Mobile first with progressive enhancement
- md breakpoint for tablets (768px)
- lg breakpoint for desktop (1024px)

### Responsive adjustments
- Padding: `p-4 md:p-6 lg:p-8`
- Font sizes: `text-2xl md:text-3xl`
- Layout shifts: `flex-col lg:flex-row`
- Element sizing: Smaller on mobile, larger on desktop

## Color System

### Primary colors
- Primary: Brand blue (token: `text-primary`, `bg-primary`)
- Primary with opacity: `bg-primary/10` for subtle accents

### Semantic colors
- Success: `bg-green-500`
- Error: `bg-red-500`
- Warning: `text-yellow-500`
- Muted: `text-muted-foreground`

### Dark theme optimizations
- Background: `bg-background`
- Card background: `bg-card`
- Dark UI elements: `bg-[#111]`
- Border colors: `border-gray-800`
- Text on dark: `text-white`, `text-gray-400`

## Best Practices

1. Use Tailwind's arbitraryValues syntax for specific values: `mt-[calc(100vh-64px)]`
2. Use the `cn()` utility for conditional classes
3. Group related styles with comments for readability
4. Apply responsive styles progressively from mobile to desktop
5. Use CSS variables for theming rather than hardcoded colors when possible
6. Prefer flex and grid layouts over absolute positioning
7. Use consistent spacing across components
8. Scale down UI elements in compact/active states 