# Task Management System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       User Interface                        │
│  (Next.js React App - http://localhost:3333)               │
│                                                             │
│  ┌─────────────┐  ┌──────────┐  ┌───────────┐             │
│  │  Dashboard  │  │  Review  │  │  Reports  │             │
│  │   Metrics   │  │ Meetings │  │  Agenda   │             │
│  └─────────────┘  └──────────┘  └───────────┘             │
│                      ↓                                      │
│              React State Management                         │
│         (useState, useCallback, Dialogs)                   │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│              API Routes (Server-Side)                       │
│                                                             │
│  /api/agent          - Agent API wrapper (secure)          │
│    └─ LYZR_API_KEY (server-only, never exposed)           │
│                                                             │
│  /api/test-agent     - Connection diagnostics             │
│    └─ Tests all 7 agents and returns status              │
│                                                             │
│  Features:                                                  │
│  • Multi-strategy JSON parsing                             │
│  • Error handling                                           │
│  • Request logging                                         │
│  • Response validation                                     │
└─────────────────────────────────────────────────────────────┘
                        ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│       Lyzr AI Agent Service                                │
│     (https://agent-prod.studio.lyzr.ai)                   │
│                                                             │
│  Executes 7 specialized agents:                            │
│  1. Session Sync Agent                                     │
│  2. Task Collection Agent                                  │
│  3. Task Update Agent                                      │
│  4. Weekly Report Agent                                    │
│  5. Review Meeting Agent                                   │
│  6. Meeting Agenda Agent                                   │
│  7. Archive Management Agent                               │
│                                                             │
│  Each agent has pre-configured OAuth access to:           │
│  • Notion (read/write)                                     │
│  • Gmail (read)                                            │
│  • Google Drive (read/write)                               │
└─────────────────────────────────────────────────────────────┘
           ↓         ↓         ↓
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │  Notion  │ │  Gmail   │ │  Drive   │
    │ Database │ │ Inbox    │ │ Meeting  │
    │ Tables   │ │ Sent     │ │ Notes    │
    └──────────┘ └──────────┘ └──────────┘
```

## Agent Flow Diagram

```
User Action on App
    ↓
[Event Handler] (onClick, onBlur, etc)
    ↓
State Update (React useState)
    ↓
API Call: fetch('/api/agent', {agent_id, message})
    ↓
Server Route: POST /api/agent
    ├─ Validate request
    ├─ Add LYZR_API_KEY header
    ├─ Call Lyzr service
    ↓
Lyzr Service
    ├─ Authenticate with API key
    ├─ Route to correct agent
    ├─ Execute agent with tools
    ↓
Agent Executes
    ├─ Uses OAuth token for Notion/Gmail/Drive
    ├─ Performs requested operation
    ├─ Returns JSON response
    ↓
Server: Parse Response
    ├─ Strategy 1: Direct JSON.parse
    ├─ Strategy 2: Advanced parsing
    ├─ Strategy 3: JSON extraction
    ├─ Strategy 4: Aggressive parsing
    ├─ Strategy 5: Plain text fallback
    ↓
Return to Client
    {
      success: true,
      response: {...},
      raw_response: "...",
      agent_id: "...",
      timestamp: "..."
    }
    ↓
React State Update
    ↓
UI Re-render
    ↓
User Sees Result
```

## Data Models

### Task Object

```typescript
interface Task {
  id: string
  title: string
  status: 'Open' | 'In Progress' | 'Completed' | 'Archived'
  assignedTo: string                    // Team member name
  company?: string                      // Auto-detected from email domain
  meeting?: string                      // Reference to meeting
  externalContact?: string              // External party email
  taskOwnerType: 'Internal Team' | 'External Partner'
  priority: 'High' | 'Medium' | 'Low'
  dueDate?: string                      // ISO date
  updateLog: Array<{
    timestamp: string
    person: string
    changes: string
  }>
  currentStatus: string                 // Longer description
}
```

### Agent Response Wrapper

```typescript
interface AgentResponse {
  success: boolean
  response: any                         // Agent-specific data (parsed)
  raw_response: string                  // Original unparsed response
  agent_id: string
  user_id: string
  session_id: string
  timestamp: string
}
```

## Feature Architecture

### 1. Dashboard (Entry Point)

```
Dashboard Component
├─ Metrics Cards (Total, Open, In Progress, Completed, Overdue)
├─ Action Buttons
│  ├─ Sync Now
│  ├─ Scan for Tasks
│  ├─ Start Review
│  ├─ Generate Report
│  ├─ Prepare Agenda
│  └─ Archive Completed
└─ Task List View
   └─ Filter/Sort options
```

**Agent:** Session Sync (on component mount)

### 2. Task Collection

```
Scan Dialog
├─ Start Scan button
├─ Loading state
└─ Results view
   ├─ New Tasks (with checkboxes)
   ├─ Potential Duplicates (warnings)
   └─ Confirmation buttons
```

**Flow:**
1. User clicks "Scan for Tasks"
2. Task Collection Agent searches:
   - Gmail inbox (since last_inbox_scan)
   - Gmail sent (commitment keywords)
   - Google Drive meeting notes
3. Extracts action items and auto-detects:
   - Assigned person (from email/meeting)
   - Company (from email domain or meeting title)
   - Meeting context
4. Deduplicates against existing Notion tasks
5. Shows results with confirmation
6. User selects which to add
7. Creates in Notion

**Agent:** Task Collection

### 3. Inline Editing

```
Task Card
├─ Click to edit
└─ Edit Dialog
   ├─ Title field
   ├─ Status dropdown
   ├─ Assigned To dropdown
   ├─ Company dropdown
   ├─ Priority dropdown
   ├─ Due Date picker
   ├─ Meeting text field
   └─ Save button
        ↓
   Calls Task Update Agent
        ↓
   Saves to Notion
        ↓
   Updates Update Log
        ↓
   Refreshes local state
```

**Agent:** Task Update

### 4. Review Meeting Interface

```
Review Meeting Dialog
├─ Filter Controls
│  ├─ Team Member selector
│  ├─ Company selector
│  └─ Group By selector (Team Member/Company/Priority)
├─ Grouped Task Display
│  └─ For each group:
│     ├─ Group header
│     └─ Task cards
└─ Update History for each task
```

**Usage Example:**
- Filter to "Sarah" + "AWS" → See Sarah's AWS tasks
- Group by "Company" → See tasks organized by partnership
- View update history → Track discussion points

**Agent:** Review Meeting

### 5. Weekly Reporting

```
Report Dialog
├─ Company filter dropdown
├─ Metrics Cards
│  ├─ Completed This Week
│  └─ Overdue
├─ Team Member Breakdown
│  └─ For each person:
│     └─ Task count
├─ Company Breakdown
│  └─ For each company:
│     └─ Task count
└─ Export Options
   ├─ Export PDF
   └─ Email Reports
```

**Agent:** Weekly Report

### 6. Meeting Agenda Generation

```
Agenda Dialog
├─ Company selector
├─ Meeting Date picker
├─ Generate button
└─ Generated Agenda
   ├─ Meeting Info
   ├─ Open Tasks from Last Meeting
   ├─ New Tasks from Recent Emails
   ├─ Follow-up Items
   ├─ Discussion Topics (from emails)
   └─ Export Options (PDF, Email, Notion)
```

**Agent:** Meeting Agenda

### 7. Archive Management

```
Archive Dialog
├─ Completed Tasks List
│  ├─ Checkboxes to select
│  └─ Task info (title, person, company)
├─ Archive button
└─ Archival confirmation
```

**Agent:** Archive Management

## Data Flow Examples

### Example 1: Sync Now

```
User: Click "Sync Now"
  ↓
App: callAgent(SESSION_SYNC, "Fetch current task state")
  ↓
Server: /api/agent receives request
  ├─ Validates agent_id
  ├─ Adds LYZR_API_KEY header
  ├─ POSTs to Lyzr
  ↓
Lyzr: Routes to Session Sync Agent
  ├─ Agent uses OAuth to access Notion
  ├─ Queries "Rob's Task Management" database
  ├─ Reads all tasks
  ├─ Formats as JSON
  ↓
Server: Receives response
  ├─ Parses JSON (multi-strategy)
  ├─ Validates structure
  ├─ Returns to client
  ↓
App: Updates state
  ├─ Replaces tasks array
  ├─ Shows success message
  ↓
UI: Re-renders
  ├─ Task cards update
  ├─ Metrics recalculate
```

### Example 2: Scan for Tasks

```
User: Click "Scan for Tasks" → Click "Start Scan"
  ↓
App: callAgent(TASK_COLLECTION, "Scan for new tasks from emails and meetings")
  ↓
Lyzr: Task Collection Agent
  ├─ Reads last_inbox_scan from Notion System Config
  ├─ Searches Gmail inbox for emails since that date
  ├─ Searches Gmail sent for emails with keywords
  ├─ Searches Google Drive "RobMeetingNotes" for new files
  ├─ For each email/meeting:
  │  ├─ Extracts action items
  │  ├─ Detects person (from email/signatures)
  │  ├─ Detects company (from email domain @nvidia.com → Nvidia)
  │  ├─ Detects meeting context
  │  └─ Adds to new tasks list
  ├─ Searches Notion for duplicates (fuzzy match)
  ├─ Creates new tasks in Notion
  ├─ Updates last_inbox_scan, last_sent_scan, last_drive_scan
  ├─ Returns JSON with new tasks and duplicates
  ↓
App: Displays results
  ├─ Shows "Found 5 new tasks, 2 potential duplicates"
  ├─ User reviews and selects which to add
  ├─ Selected tasks added to state
  └─ UI updates with new tasks
```

### Example 3: Edit and Update Task

```
User: Click task → Edit status → Save
  ↓
App:
  ├─ Opens edit dialog
  ├─ User changes "Status: Open → In Progress"
  ├─ User clicks "Save Changes"
  ↓
callAgent(TASK_UPDATE, "Update task: ... status: In Progress")
  ↓
Lyzr: Task Update Agent
  ├─ Receives update request
  ├─ Validates against Notion (check for conflicts)
  ├─ Writes to Notion task properties
  ├─ Adds entry to "Update Log" property:
  │  {
  │    "timestamp": "2024-11-22T21:05:00Z",
  │    "person": "Rob",
  │    "changes": "Status: Open -> In Progress"
  │  }
  ├─ Updates "Current Status" field
  ├─ Returns success confirmation
  ↓
App: Updates state
  ├─ Closes edit dialog
  ├─ Updates local task object
  ├─ Shows "Synced" indicator
  ↓
Notion: Stores changes persistently
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│  Browser (React App)                    │
│  • No API keys                          │
│  • No OAuth credentials                 │
│  • No secrets                           │
│  • Safe to expose publicly              │
└─────────────────────────────────────────┘
              ↓ (HTTPS)
┌─────────────────────────────────────────┐
│  Next.js Server                         │
│  • Environment: .env.local              │
│  • LYZR_API_KEY (server-only)          │
│  • Request validation                   │
│  • Error handling                       │
│  • Rate limiting (could add)            │
│  • Input sanitization                   │
└─────────────────────────────────────────┘
              ↓ (HTTPS + API Key)
┌─────────────────────────────────────────┐
│  Lyzr Service                           │
│  • Authenticates with LYZR_API_KEY     │
│  • Routes to correct agent              │
│  • Manages OAuth tokens securely        │
└─────────────────────────────────────────┘
              ↓ (OAuth)
┌─────────────────────────────────────────┐
│  External Services                      │
│  • Notion (OAuth access)                │
│  • Gmail (OAuth access)                 │
│  • Google Drive (OAuth access)          │
└─────────────────────────────────────────┘
```

## Component Tree

```
HomePage (main component)
├─ ConnectionStatus (connection indicator)
│  └─ Dialog (connection details)
├─ Dashboard (metric cards + buttons)
│  ├─ StatCard (individual metrics)
│  └─ TaskList (task cards)
├─ TaskEditDialog (edit task properties)
├─ ScanTasksDialog (scan and import tasks)
│  ├─ Checkbox list (new tasks)
│  └─ Duplicate warnings
├─ ReviewMeeting (filter and review tasks)
│  ├─ Selectors (team/company/grouping)
│  └─ Grouped task cards
├─ WeeklyReport (report generation)
│  ├─ Company filter
│  ├─ Metrics cards
│  ├─ Breakdown tables
│  └─ Export buttons
├─ MeetingAgendaDialog (agenda generation)
│  ├─ Form (company, date)
│  └─ Generated agenda display
└─ ArchiveDialog (archive completed tasks)
   ├─ Checkbox list (completed tasks)
   └─ Archive button
```

## Performance Considerations

- **State Management:** React useState (simple, single page)
- **API Calls:** Minimal, triggered only by user actions
- **Parsing:** Bulletproof parsing handles all response formats
- **UI Updates:** Dialog-based to avoid full page renders
- **Caching:** Could add local storage caching for tasks

## Future Enhancements

```
Current:
- Manual "Scan for Tasks" button
- Manual "Sync Now" button
- In-memory state (resets on refresh)

Could Add:
- Scheduled scans (every hour)
- WebSocket for real-time Notion updates
- IndexedDB for offline support
- Service worker for offline mode
- Collaborative editing indicators
- Advanced search/filtering
- Custom views (Kanban, Timeline)
- Notifications for overdue tasks
- Integration with Slack/Teams
```
