# TODO: Remove Timeline Features

## PLAN: Timeline Feature Removal

### Files to Process:
1. `src/app/page.tsx` - Main app component
2. `src/components/AIAdvisorySystem.tsx` - AI advisory system
3. `src/components/CalculationResultsModal.tsx` - Results modal
4. `src/components/PropertyInputForm.tsx` - Input form

### Timeline-Related Elements to Remove:

#### 1. src/app/page.tsx
- [ ] Remove Timeline mode from AppState interface
- [ ] Remove timeline-related state management
- [ ] Remove timeline handlers (handleTimelineActivate, handleTimelineScenarioSave)
- [ ] Remove timeline upgrade card rendering
- [ ] Remove Timeline mode badge/button
- [ ] Remove timeline localStorage handling
- [ ] Clean up imports related to timeline

#### 2. src/components/AIAdvisorySystem.tsx
- [ ] Remove timeline integration imports and comments
- [ ] Remove timeline-related state (timelineUpgradeAnalysis, isLoadingTimeline)
- [ ] Remove timeline upgrade analysis functions
- [ ] Remove timeline section from activeSection state
- [ ] Remove timeline upgrade section from UI
- [ ] Remove timeline-related event handlers and utilities
- [ ] Clean up timeline-related types and interfaces

#### 3. src/components/CalculationResultsModal.tsx
- [ ] Remove onUpgradeToTimeline prop and handler
- [ ] Remove Timeline Mode button from action buttons
- [ ] Clean up any timeline-related UI elements

#### 4. src/components/PropertyInputForm.tsx
- [ ] Remove timeline-related imports (TimelineEnabledInputs)
- [ ] Remove timeline schema and validation
- [ ] Remove timeline-related props (onTimelineActivate, mode, showTimelineToggle)
- [ ] Remove timeline state management
- [ ] Remove timeline mode toggle functionality
- [ ] Remove timeline-specific form fields and settings
- [ ] Clean up timeline-related handlers and effects

### Status: READY TO EXECUTE