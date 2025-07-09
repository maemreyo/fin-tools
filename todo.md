# TODO: Remove Timeline Features

## PLAN: Timeline Feature Removal

### Files to Process:
1. `src/app/page.tsx` - Main app component
2. `src/components/AIAdvisorySystem.tsx` - AI advisory system
3. `src/components/CalculationResultsModal.tsx` - Results modal
4. `src/components/PropertyInputForm.tsx` - Input form

### Timeline-Related Elements to Remove:

#### 1. src/app/page.tsx
- [x] Remove Timeline mode from AppState interface
- [x] Remove timeline-related state management
- [x] Remove timeline handlers (handleTimelineActivate, handleTimelineScenarioSave)
- [x] Remove timeline upgrade card rendering
- [x] Remove Timeline mode badge/button
- [x] Remove timeline localStorage handling
- [x] Clean up imports related to timeline

#### 2. src/components/AIAdvisorySystem.tsx
- [x] Remove timeline integration imports and comments
- [x] Remove timeline-related state (timelineUpgradeAnalysis, isLoadingTimeline)
- [x] Remove timeline upgrade analysis functions
- [x] Remove timeline section from activeSection state
- [x] Remove timeline upgrade section from UI
- [x] Remove timeline-related event handlers and utilities
- [x] Clean up timeline-related types and interfaces

#### 3. src/components/CalculationResultsModal.tsx
- [x] Remove onUpgradeToTimeline prop and handler
- [x] Remove Timeline Mode button from action buttons
- [x] Clean up any timeline-related UI elements

#### 4. src/components/PropertyInputForm.tsx
- [x] Remove timeline-related imports (TimelineEnabledInputs)
- [x] Remove timeline schema and validation
- [x] Remove timeline-related props (onTimelineActivate, mode, showTimelineToggle)
- [x] Remove timeline state management
- [x] Remove timeline mode toggle functionality
- [x] Remove timeline-specific form fields and settings
- [x] Clean up timeline-related handlers and effects

### Status: COMPLETED