# Patient Profile Scrolling Fix

## Issue
The patient profile in the appointment scheduling page (ExistingPatient.tsx) was scrollable, which was not desired for the lookup/scheduling workflow.

## Root Cause
The `PatientInfoCard` component had `overflow-auto` applied to its content area regardless of context, making it scrollable even when used in compact layouts.

## Solution Applied

### 1. Conditional Overflow Behavior
- Modified `PatientInfoCard` to use `overflow-auto` only when `showExpandableDetails={true}`
- When `showExpandableDetails={false}`, uses `overflow-hidden` to prevent scrolling

### 2. Compact Layout for Appointment Scheduling
- Reduced spacing in compact mode (`py-4 space-y-4` instead of `py-6 space-y-6`)
- Limited allergies and chronic conditions to show only first 3 items with "+X more" indicator
- Used smaller badges (`text-xs`) for compact display

### 3. Container Height Adjustments
- Changed card height from `h-full` to `h-fit max-h-full` when in compact mode
- Added `overflow-hidden` to the Panel container in ExistingPatient.tsx

## Files Modified

### `src/components/common/PatientInfoCard.tsx`
- **Conditional overflow**: Content area now uses `overflow-hidden` when `showExpandableDetails={false}`
- **Compact spacing**: Reduced padding and margins in compact mode
- **Limited content display**: Shows only first 3 allergies/conditions with count indicator
- **Flexible height**: Card adjusts height based on content when in compact mode

### `src/pages/ExistingPatient.tsx`
- **Panel overflow**: Added `overflow-hidden` to prevent Panel-level scrolling

## Usage Context

### Appointment Scheduling (Non-scrollable)
```tsx
<PatientInfoCard 
  patient={foundPatient} 
  variant="detailed" 
  showExpandableDetails={false} 
/>
```

### Patient Details Page (Scrollable)
```tsx
<PatientInfoCard patient={patient} />
// Uses default showExpandableDetails={true}
```

## Result
- ✅ Patient profile in appointment scheduling is now fixed height, non-scrollable
- ✅ Patient details page retains full scrollable functionality
- ✅ Compact display shows essential information without overwhelming the form
- ✅ Maintains responsive design and accessibility