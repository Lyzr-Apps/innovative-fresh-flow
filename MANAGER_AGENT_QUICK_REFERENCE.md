# Manager Agent Quick Reference

## What is the Manager Agent?

The Manager Agent (ID: `69235d3623b88b385103da57`) is the **central orchestrator** that intelligently routes requests to the appropriate specialized agent and coordinates multi-agent workflows.

## Agent Hierarchy

```
Manager Agent (Central)
├─ Session Sync (fetch task state)
├─ Task Collection (extract from Gmail/Drive)
├─ Task Update (save to Notion)
├─ Weekly Report (generate reports)
├─ Review Meeting (filter and discuss)
├─ Meeting Agenda (create agendas)
└─ Archive Management (archive completed)
```

## Request Types & Routing

| User Action | Request Type | Routed Agent | Function |
|-------------|--------------|--------------|----------|
| Click "Sync Now" | `sync-session` | Session Sync | Fetch current Notion state |
| Click "Scan for Tasks" | `scan-tasks` | Task Collection | Extract from Gmail/Drive |
| Edit & Save Task | `update-task` | Task Update | Save changes to Notion |
| Click "Generate Report" | `generate-report` | Weekly Report | Create team/company reports |
| Click "Start Review" | `review-meeting` | Review Meeting | Filter and organize tasks |
| Click "Prepare Agenda" | `generate-agenda` | Meeting Agenda | Create meeting agenda |
| Click "Archive Completed" | `archive-tasks` | Archive Management | Archive finished tasks |
| Click "Health" | `health-check` | Manager | Verify all agents operational |

## How It Works

```
User clicks button
    ↓
Manager Agent receives request
    ↓
Manager analyzes: "What type of request is this?"
    ↓
Manager routes to correct sub-agent
    ↓
Sub-agent executes operation
    ↓
Manager synthesizes results
    ↓
Returns unified response to user
```

## System Health Dashboard

New button in top-right: **"Health"**

Shows:
- Manager Agent: Operational or Error
- All 7 Sub-Agents: Operational or Error
- Last check timestamp
- Any error details

## Key Agent IDs

```
Manager Agent:          69235d3623b88b385103da57
Session Sync:           69222c62c69ec8d9a07826da
Task Collection:        69222c7423b88b385103d6f5
Task Update:            69222c87eb6b7de42273d8c1
Weekly Report:          69222c94c69ec8d9a07826db
Review Meeting:         69222ca57c7d73f7cbe8262c
Meeting Agenda:         69222cc57c7d73f7cbe8262d
Archive Management:     69222cd1c69ec8d9a07826dc
```

## Data Flow

```
Button Click
    → orchestrateRequest()
    → /api/agent
    → Lyzr Service
    → Manager Agent
    → Routes to Sub-Agent
    → Executes with OAuth
    → Returns JSON
    → App Updates UI
```

## API Response Format

Every agent response includes:

```json
{
  "success": true,
  "requestType": "sync-session",
  "routedToAgent": "69222c62c69ec8d9a07826da",
  "agentName": "Session Sync Agent",
  "response": { /* data */ },
  "raw_response": "original string",
  "timestamp": "2024-11-22T21:00:00Z",
  "executionTime": 245
}
```

## Usage Examples

### Check System Health
```
Click "Health" button
→ Manager verifies all agents operational
→ See status dashboard
```

### Sync Tasks
```
Click "Sync Now"
→ Manager routes to Session Sync
→ Fetches Notion task state
→ Updates UI with fresh tasks
```

### Scan for New Tasks
```
Click "Scan for Tasks"
→ Manager routes to Task Collection
→ Scans Gmail inbox/sent + Google Drive
→ Shows new tasks and potential duplicates
→ User confirms which to add
```

### Update a Task
```
Click task card → Edit → Save
→ Manager routes to Task Update
→ Saves to Notion immediately
→ Shows sync status
```

## Benefits of Manager Agent

1. **Single Entry Point**: All requests go through Manager
2. **Intelligent Routing**: Automatically picks the right agent
3. **Coordination**: Handles complex multi-agent workflows
4. **Conflict Prevention**: Prevents data conflicts between agents
5. **System Monitoring**: Tracks health of all agents
6. **Consistency**: Maintains coherent state across operations
7. **Extensibility**: Easy to add new agents

## Implementation Details

### In the App

```typescript
// Import the orchestrator
import { orchestrateRequest, REQUEST_TEMPLATES } from '@/utils/agentOrchestrator'

// Sync session example
const result = await orchestrateRequest(REQUEST_TEMPLATES.syncSession())

// Scan tasks example
const scanResult = await orchestrateRequest(REQUEST_TEMPLATES.scanTasks())

// Update task example
const updateResult = await orchestrateRequest(
  REQUEST_TEMPLATES.updateTask('task-001', { status: 'Completed' })
)
```

### Request Templates

Predefined request templates for common operations:

```
REQUEST_TEMPLATES.syncSession()           // Fetch current state
REQUEST_TEMPLATES.scanTasks()             // Scan emails/drive
REQUEST_TEMPLATES.updateTask(id, updates) // Update task
REQUEST_TEMPLATES.generateReport(company) // Generate report
REQUEST_TEMPLATES.startReviewMeeting(...)// Start review
REQUEST_TEMPLATES.generateAgenda(...)     // Create agenda
REQUEST_TEMPLATES.archiveTasks([ids])     // Archive tasks
REQUEST_TEMPLATES.healthCheck()           // Check health
```

## Troubleshooting

**Manager Agent not responding?**
- Click "Health" button to diagnose
- Check LYZR_API_KEY in .env.local
- Verify Manager Agent ID in Lyzr Studio

**Sub-agent not working?**
- Check Health dashboard for failing agent
- Verify agent in Lyzr Studio is enabled
- Check agent integrations (Notion, Gmail, Drive)

**Slow responses?**
- Click "Health" to see execution time
- Check which agent is slow
- Review Lyzr agent logs

## File Locations

- **Manager Code**: `/app/project/src/utils/agentOrchestrator.ts`
- **Full Guide**: `/app/project/MANAGER_AGENT_GUIDE.md`
- **Complete Docs**: `/app/project/COMPLETE_SYSTEM_OVERVIEW.md`

## Summary

The Manager Agent is the **heart** of the system:

- Routes all requests intelligently
- Coordinates multiple agents
- Monitors system health
- Ensures data consistency
- Provides unified interface

All 8 agents working together:
- 1 Manager (orchestrator)
- 7 Specialists (execution)

**Result**: Reliable, coordinated task management system!
