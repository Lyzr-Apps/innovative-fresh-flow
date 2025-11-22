# Agent Response Examples

This document shows what responses each agent should return from Lyzr.

## All Agents Return This Wrapper Format

```json
{
  "success": true,
  "response": { /* Agent-specific data */ },
  "raw_response": "string",
  "agent_id": "string",
  "user_id": "string",
  "session_id": "string",
  "timestamp": "2024-11-22T21:00:00Z"
}
```

---

## Agent 1: Session Sync (69222c62c69ec8d9a07826da)

**Purpose**: Fetch complete current task state from Notion on app load

**Request:**
```json
{
  "message": "Fetch complete current task state from Notion",
  "agent_id": "69222c62c69ec8d9a07826da"
}
```

**Expected Response:**
```json
{
  "success": true,
  "response": {
    "sessionState": {
      "totalTasks": 45,
      "openTasks": 12,
      "inProgressTasks": 8,
      "completedTasks": 25,
      "tasks": [
        {
          "id": "task-001",
          "title": "Complete Q4 infrastructure audit",
          "status": "In Progress",
          "assignedTo": "Vedant",
          "company": "AWS",
          "priority": "High",
          "dueDate": "2024-12-15",
          "meeting": "AWS Technical Review",
          "externalContact": null,
          "taskOwnerType": "Internal Team",
          "currentStatus": "Awaiting AWS team confirmation"
        }
      ]
    },
    "syncStatus": "success",
    "lastSyncTime": "2024-11-22T21:00:00Z",
    "taskCount": 45
  }
}
```

---

## Agent 2: Task Collection (69222c7423b88b385103d6f5)

**Purpose**: Scan Gmail/Drive and extract tasks with auto-tagging

**Request:**
```json
{
  "message": "Scan for new tasks from emails and meetings",
  "agent_id": "69222c7423b88b385103d6f5"
}
```

**Expected Response:**
```json
{
  "success": true,
  "response": {
    "scanSummary": {
      "inboxScanned": "2024-11-22T14:30:00Z",
      "sentScanned": "2024-11-22T14:28:00Z",
      "driveScanned": "2024-11-22T09:15:00Z",
      "newTasksCount": 5,
      "duplicatesCount": 2
    },
    "newTasks": [
      {
        "id": "new-task-1",
        "title": "GPU allocation review for Q4",
        "assignedTo": "Sarah",
        "company": "Nvidia",
        "externalContact": "john.doe@nvidia.com",
        "priority": "High",
        "meeting": "Nvidia Partnership Review - Nov 15",
        "detectedFrom": "email",
        "detectionMethod": "Found '@nvidia.com' domain + GPU keyword",
        "currentStatus": "Pending from Nvidia stakeholder feedback"
      },
      {
        "id": "new-task-2",
        "title": "AWS container optimization proposal",
        "assignedTo": "Jimmy",
        "company": "AWS",
        "priority": "Medium",
        "meeting": "AWS Technical Discussion",
        "detectedFrom": "meeting_notes",
        "detectionMethod": "Found 'AWS' in Google Drive meeting title",
        "currentStatus": "In drafting phase"
      }
    ],
    "duplicatesDetected": [
      {
        "potentialDuplicate": "Infrastructure audit",
        "existingTask": "task-025",
        "person": "Vedant",
        "company": "AWS",
        "confidence": 0.85
      }
    ],
    "updatedTasks": [
      {
        "id": "task-003",
        "title": "Cloud cost optimization analysis",
        "updatedFields": ["status", "dueDate"],
        "changes": {
          "status": "Open -> In Progress",
          "dueDate": "2024-12-01 -> 2024-12-08"
        }
      }
    ],
    "scanTimestampUpdated": true
  }
}
```

---

## Agent 3: Task Update (69222c87eb6b7de42273d8c1)

**Purpose**: Write inline edits to Notion immediately with sync tracking

**Request:**
```json
{
  "message": "Update task: Complete Q4 infrastructure audit with status: In Progress, assigned to: Vedant, company: AWS",
  "agent_id": "69222c87eb6b7de42273d8c1"
}
```

**Expected Response:**
```json
{
  "success": true,
  "response": {
    "updateStatus": "success",
    "taskId": "task-001",
    "syncStatus": "synced",
    "notionVersion": "2024-11-22T21:05:00Z",
    "localVersion": "2024-11-22T21:05:00Z",
    "updateLog": [
      {
        "timestamp": "2024-11-22T21:05:00Z",
        "person": "Rob",
        "changes": "Status: Open -> In Progress, Company: Internal -> AWS",
        "context": "Review meeting update"
      },
      {
        "timestamp": "2024-11-22T20:30:00Z",
        "person": "Vedant",
        "changes": "Due Date: 2024-12-08 -> 2024-12-15",
        "context": "Initial assessment"
      }
    ],
    "currentStatus": "Awaiting AWS team confirmation on infrastructure specifications",
    "syncIndicator": {
      "status": "synced",
      "timestamp": "2024-11-22T21:05:00Z",
      "conflictResolved": false
    }
  }
}
```

---

## Agent 4: Weekly Report (69222c94c69ec8d9a07826db)

**Purpose**: Generate team and company-filtered reports

**Request:**
```json
{
  "message": "Generate weekly report with team member breakdown and company filtering",
  "agent_id": "69222c94c69ec8d9a07826db"
}
```

**Expected Response:**
```json
{
  "success": true,
  "response": {
    "reportMetadata": {
      "generatedAt": "2024-11-22T21:00:00Z",
      "weekEndingDate": "2024-11-22",
      "reportType": "weekly"
    },
    "executiveSummary": {
      "totalTasks": 45,
      "completedThisWeek": 8,
      "overdueCount": 3,
      "inProgressCount": 12,
      "highPriorityCount": 7
    },
    "byTeamMember": {
      "Rob": {
        "totalTasks": 10,
        "completed": 2,
        "overdue": 0,
        "highPriority": 2,
        "tasks": [
          {
            "title": "Nvidia partnership review",
            "status": "In Progress",
            "company": "Nvidia",
            "priority": "High"
          }
        ]
      },
      "Sarah": {
        "totalTasks": 12,
        "completed": 3,
        "overdue": 1,
        "highPriority": 3,
        "tasks": []
      },
      "Jimmy": {
        "totalTasks": 8,
        "completed": 1,
        "overdue": 0,
        "highPriority": 1,
        "tasks": []
      },
      "Vedant": {
        "totalTasks": 9,
        "completed": 1,
        "overdue": 2,
        "highPriority": 1,
        "tasks": []
      },
      "Reed": {
        "totalTasks": 6,
        "completed": 1,
        "overdue": 0,
        "highPriority": 0,
        "tasks": []
      }
    },
    "byCompany": {
      "Nvidia": {
        "totalTasks": 8,
        "completed": 2,
        "overdue": 0,
        "externalContacts": ["john.doe@nvidia.com"]
      },
      "AWS": {
        "totalTasks": 12,
        "completed": 3,
        "overdue": 1,
        "externalContacts": ["contact@aws.amazon.com"]
      },
      "Internal": {
        "totalTasks": 25,
        "completed": 3,
        "overdue": 2
      }
    },
    "exportOptions": {
      "canExportPDF": true,
      "canEmailReports": true,
      "canExportIndividualReports": true
    }
  }
}
```

---

## Agent 5: Review Meeting (69222ca57c7d73f7cbe8262c)

**Purpose**: Display filtered tasks during review meetings

**Request:**
```json
{
  "message": "Start review meeting and fetch current tasks for filtering",
  "agent_id": "69222ca57c7d73f7cbe8262c"
}
```

**Expected Response:**
```json
{
  "success": true,
  "response": {
    "meetingSession": {
      "startTime": "2024-11-22T21:00:00Z",
      "sessionId": "meeting-session-001"
    },
    "filterControls": {
      "teamMembers": ["All", "Rob", "Sarah", "Jimmy", "Vedant", "Reed"],
      "companies": ["All", "Nvidia", "AWS", "Microsoft", "Google Cloud", "Internal"],
      "groupByOptions": ["Team Member", "Company", "Priority"]
    },
    "currentFilters": {
      "selectedMember": "All",
      "selectedCompany": "All",
      "groupBy": "Team Member"
    },
    "tasks": [
      {
        "id": "task-001",
        "title": "Complete Q4 infrastructure audit",
        "assignedTo": "Vedant",
        "company": "AWS",
        "status": "In Progress",
        "priority": "High",
        "updateHistory": [
          {
            "timestamp": "2024-11-22T21:05:00Z",
            "person": "Rob",
            "changes": "Status changed"
          }
        ],
        "currentStatus": "Awaiting AWS confirmation"
      }
    ],
    "meetingSummary": {
      "tasksReviewed": 3,
      "tasksUpdated": 1,
      "notesRecorded": true
    }
  }
}
```

---

## Agent 6: Meeting Agenda (69222cc57c7d73f7cbe8262d)

**Purpose**: Generate agenda from tasks and recent emails

**Request:**
```json
{
  "message": "Generate agenda for Nvidia meeting on 2024-11-28",
  "agent_id": "69222cc57c7d73f7cbe8262d"
}
```

**Expected Response:**
```json
{
  "success": true,
  "response": {
    "agendaMetadata": {
      "company": "Nvidia",
      "meetingDate": "2024-11-28",
      "generatedAt": "2024-11-22T21:00:00Z",
      "participants": ["Rob", "john.doe@nvidia.com", "sarah.nvidia@nvidia.com"]
    },
    "agendaDocument": {
      "header": "Meeting Agenda: Nvidia Partnership Review - November 28, 2024",
      "sections": {
        "openTasksFromLastMeeting": [
          {
            "title": "GPU allocation review for Q4",
            "assignedTo": "Sarah",
            "dueDate": "2024-11-30",
            "status": "In Progress",
            "description": "Pending from Nvidia stakeholder feedback"
          }
        ],
        "newTasksFromRecentEmails": [
          {
            "title": "API documentation for GPU integration",
            "fromEmail": "john.doe@nvidia.com",
            "date": "2024-11-20",
            "summary": "Nvidia requested updated API docs"
          }
        ],
        "followupItems": [
          {
            "category": "Outstanding Deliverables",
            "items": ["SDK update", "Performance benchmarks"]
          }
        ],
        "discussionTopics": [
          {
            "topic": "Q1 2025 partnership roadmap",
            "extractedFrom": "Recent emails"
          }
        ],
        "nextSteps": "TBD during meeting"
      }
    },
    "exportOptions": {
      "formatsPDF": true,
      "formatsDOCX": true,
      "canEmailAgenda": true,
      "canSaveToNotion": true
    }
  }
}
```

---

## Agent 7: Archive Management (69222cd1c69ec8d9a07826dc)

**Purpose**: Move completed tasks and meeting notes to archive

**Request:**
```json
{
  "message": "Archive 5 completed tasks",
  "agent_id": "69222cd1c69ec8d9a07826dc"
}
```

**Expected Response:**
```json
{
  "success": true,
  "response": {
    "archiveSummary": {
      "tasksArchivedCount": 5,
      "notesArchivedCount": 2,
      "archiveDate": "2024-11-22T21:00:00Z"
    },
    "archivedTasks": [
      {
        "id": "task-010",
        "title": "Complete Q3 planning",
        "movedFrom": "Completed",
        "movedTo": "Archived",
        "archiveDate": "2024-11-22"
      }
    ],
    "archivedNotes": [
      {
        "filename": "Q3_Review_Meeting_Notes.md",
        "movedFrom": "/RobMeetingNotes",
        "movedTo": "/RobNotesArchive",
        "archiveDate": "2024-11-22"
      }
    ],
    "archivalLog": [
      {
        "timestamp": "2024-11-22T21:00:00Z",
        "action": "Archive",
        "itemsCount": 7,
        "triggeredBy": "User"
      }
    ],
    "quarterlyReviewData": {
      "tasksCompletedThisQuarter": 95,
      "tasksArchivedThisQuarter": 45,
      "averageCompletionTime": "8 days"
    }
  }
}
```

---

## Response Parsing

The `/api/agent` route automatically handles these response formats:

**Plain JSON**
```json
{"result": "success"}
```

**Markdown JSON**
```markdown
Here's the result:
```json
{"result": "success"}
```
```

**Escaped JSON**
```json
"{\"result\": \"success\"}"
```

**Mixed content**
```
The task was updated successfully.
{"result": "success", "taskId": "123"}
```

All are automatically parsed and returned as:
```json
{
  "success": true,
  "response": {"result": "success"},  // Parsed object
  "raw_response": "{\"result\": \"success\"}",  // Original string
  ...
}
```

---

## Error Responses

If agents encounter errors:

```json
{
  "success": false,
  "error": "Agent execution failed",
  "details": "Notion database 'Rob's Task Management' not found"
}
```

Common errors:
- "Notion database not found" → Check database name
- "Permission denied" → Check Notion workspace sharing
- "Gmail access denied" → Reconnect Gmail in Lyzr
- "Google Drive access denied" → Reconnect Drive in Lyzr
