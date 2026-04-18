# Todo App (Version 1.0)

## Overview

A lightweight, functional Todo application designed to help users manage their daily tasks. The app features a centralized task creation panel, dynamic filtering, and a live-updating task list.

## Core Features

- **Task Management**: Create, edit, and delete tasks with ease.
- **Rich Metadata**: Each task supports a title, detailed description, priority levels (High, Medium, Low), and due dates.
- **Categorization**: Add tags to tasks for better organization (e.g., Work, Urgent, Design).
- **Dynamic Filtering**: Quickly view tasks based on their status: All, Active, Overdue, or Done.
- **Live Statistics**: Real-time badges at the top of the app provide a summary of total, overdue, and completed tasks.
- **Responsive Design**: Optimized for various screen sizes, ensuring a consistent experience across desktop and mobile devices.

## Technical Specifications

- **HTML5**: Semantic structure for accessibility and SEO.
- **CSS3**: Modern styling with custom properties and responsive grid/flexbox layouts.
- **JavaScript (ES6+)**: Vanilla JS logic for state management, DOM manipulation, and real-time updates without external dependencies.

## Key Components

- **Add-Task Panel**: A comprehensive form for entering new task details including tag chip management.
- **Filter Bar**: An interactive navigation element to refine the visible task list.
- **Task List**: A dynamic container that renders task cards based on user interactions and filters.

## Detailed Changes List

### 1. Structural & Functional Refactoring

- **Removed "Add Task" Panel**: Stripped the global entry form and pending tag logic to focus on a standalone card component.
- **Standalone Card Focus**: Refactored the DOM structure to treat the task card as a self-contained module.
- **Data Cleanup**: Simplified the `tasks` array to focus on the advanced state requirements of a single persistent entity.

### 2. Status & Interactivity Logic

- **Two-Way Status Sync**:
  - Toggling the completion checkbox now programmatically sets the status to "Done".
  - Manually selecting "Done" in the status dropdown now automatically checks the completion checkbox.
  - Unchecking a "Done" task now reverts the status back to "Pending".
- **Status Options**: Standardized status values to "Pending", "In Progress", and "Done".

### 3. Priority Indicator Enhancement

- **Visual Priority Bar**: Added a 6px vertical accent bar (`data-testid="test-todo-priority-indicator"`) on the left edge of the card.
- **Dynamic Coloring**: Implemented CSS classes to change the bar color based on priority:
  - **High**: Red/Orange (#d85a30)
  - **Medium**: Amber/Yellow (#ef9f27)
  - **Low**: Green (#639922)

### 4. Advanced Editing Mode

- **Inline Edit Form**: Implemented a comprehensive edit state (`data-testid="test-todo-edit-form"`) that replaces view-mode content.
- **JavaScript Focus Trap**: Added a listener to trap the `Tab` key within the edit form elements to prevent keyboard users from losing focus.
- **Focus Restoration**: Added logic to return focus to the "Edit" button upon form closure.
- **Form Persistence**: Added "Save" and "Cancel" logic to either commit state changes or revert to original values.

### 5. Expand / Collapse Behavior

- **Automatic Clamping**: Added logic to detect descriptions longer than 120 characters and apply a 2-line clamp.
- **Accessible Toggle**: Added a "Show More/Less" button (`data-testid="test-todo-expand-toggle"`) with dynamic `aria-expanded` and `aria-controls` attributes.

### 6. Dynamic Time & Overdue Logic

- **Granular Time Display**: Replaced static dates with relative time calculations (e.g., "Due in 3 hours", "Overdue by 1 day").
- **Overdue Indicator**: Added a persistent "Overdue" badge and red-accented text logic.
- **Real-Time Updates**: Implemented a 30-second `setInterval` to refresh time-remaining labels without page reloads.
- **Completion Label**: Added logic to stop time tracking and display "Completed" once a task is marked as "Done".

### 7. Accessibility (A11y) & Testing

- **ARIA Implementation**: Added `aria-live="polite"` to time updates and `aria-label` to inputs.
- **Semantic Labels**: Linked every input and select field in the edit form with specific `<label for="...">` tags.
- **Test Instrumenting**: Added all required `data-testid` attributes across the HTML and JS templates.

### 8. CSS Optimization

- **Cleanup**: Removed over 50 lines of unused styles related to the initial app's tag inputs, statistics badges, and headers.
- **Responsive Stacking**: Added media queries to ensure the edit form fields stack vertically on mobile (320px+) while remaining horizontal on desktop.
