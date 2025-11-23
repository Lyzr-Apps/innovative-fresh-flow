# Task Management Manager Agent

## Overview

The Task Management Manager Agent (Agent ID: `69235d3623b88b385103da57`) is the central orchestrator of the task management system. It intelligently routes requests to the appropriate specialized sub-agents and coordinates complex multi-agent workflows.

## Architecture

### Manager Agent Position

```
User Request
    ↓
Manager Agent (69235d3623b88b385103da57)
    ├─ Routes to Session Sync Agent (69222c62c69ec8d9a07826da)
    ├─ Routes to Task Collection Agent (69222c7423b88b385103d6f5)
    ├─ Routes to Task Update Agent (69222c87eb6b7de42273d8c1)
    ├─ Routes to Weekly Report Agent (69222c94c69ec8d9a07826db)
    ├─ Routes to Review Meeting Agent (69222ca57c7d73f7cbe8262c)
    ├─ Routes to Meeting Agenda Agent (69222cc57c7d73f7cbe8262d)
    └─ Routes to Archive Management Agent (69222cd1c69ec8d9a07826dc)
    ↓
Synthesized Results Back to User
```

## Manager Agent Capabilities

### 1. Intelligent Request Routing

The Manager Agent analyzes user requests and determines which specialized agent(s) should handle them:

```
Request Type → Appropriate Agent
"Fetch task state" → Session Sync Agent
"Scan for new tasks" → Task Collection Agent
"Update task status" → Task Update Agent
"Generate report" → Weekly Report Agent
"Review meeting" → Review Meeting Agent
"Create agenda" → Meeting Agenda Agent
"Archive tasks" → Archive Management Agent
```

### 2. Multi-Agent Coordination

For complex requests, the Manager Agent coordinates multiple agents:

**Example: End-of-week workflow**
1. Manager routes to Weekly Report Agent (generate report)
2. Manager routes to Archive Management Agent (archive completed)
3. Manager synthesizes results (combined status)

**Example: Meeting preparation**
1. Manager routes to Session Sync Agent (get current state)
2. Manager routes to Meeting Agenda Agent (generate agenda from current tasks)
3. Manager synthesizes results (complete meeting prep)

### 3. Conflict Resolution

When multiple agents need to write data, Manager ensures:
- No conflicting updates
- Proper sequencing of operations
- Data consistency across Notion

### 4. System Health Monitoring

Manager can check the operational status of all sub-agents:
- Connection status
- Response times
- Error rates
- Data consistency

### 5. Context Awareness

Manager maintains understanding of:
- Current session state
- User's team/company context
- Workflow progress
- Historical context from previous operations

## Integration in the App

### UI Elements

The app now includes:

1. **Health Button** (top-right, activity icon)
   - Click to check system health
   - Shows Manager Agent and all sub-agents status
   - Verifies all 7 specialized agents are operational

2. **Connection Button** (lightning icon)
   - Tests connection to Lyzr service
   - Shows API key configuration
   - Displays agent response samples

3. **Sync Button**
   - Routes through Manager to Session Sync Agent
   - Establishes baseline task state

### Agent Orchestrator Utility

Located at: `src/utils/agentOrchestrator.ts`

**Core functions:**

```typescript
// Route any request through Manager Agent
orchestrateRequest(request: OrchestratorRequest): Promise<OrchestratorResponse>

// Check system health through Manager
checkAgentHealth(): Promise<HealthStatus>

// Request templates for common operations
REQUEST_TEMPLATES.syncSession()
REQUEST_TEMPLATES.scanTasks()
REQUEST_TEMPLATES.updateTask(taskId, updates)
REQUEST_TEMPLATES.generateReport(company?)
REQUEST_TEMPLATES.startReviewMeeting(teamMember?, company?)
REQUEST_TEMPLATES.generateAgenda(company, date)
REQUEST_TEMPLATES.archiveTasks(taskIds)
REQUEST_TEMPLATES.healthCheck()
```

**Example usage:**

```typescript
import { orchestrateRequest, REQUEST_TEMPLATES } from '@/utils/agentOrchestrator'

// Sync session through Manager
const result = await orchestrateRequest(REQUEST_TEMPLATES.syncSession())

// Scan for tasks
const scanResult = await orchestrateRequest(REQUEST_TEMPLATES.scanTasks())

// Update specific task
const updateResult = await orchestrateRequest(
  REQUEST_TEMPLATES.updateTask('task-001', { status: 'Completed' })
)
```

## Request Types

The Manager Agent handles these request types:

| Type | Agent Routed To | Purpose |
|------|-----------------|---------|
| `sync-session` | Session Sync | Fetch current task state from Notion |
| `scan-tasks` | Task Collection | Extract tasks from Gmail/Drive |
| `update-task` | Task Update | Save task changes to Notion |
| `generate-report` | Weekly Report | Create team/company reports |
| `review-meeting` | Review Meeting | Filter and discuss tasks |
| `generate-agenda` | Meeting Agenda | Create meeting agenda |
| `archive-tasks` | Archive Management | Archive completed tasks |
| `health-check` | Manager | System health verification |

## Response Format

All Manager Agent responses include:

```json
{
  "success": true,
  "requestType": "sync-session",
  "routedToAgent": "69222c62c69ec8d9a07826da",
  "agentName": "Session Sync Agent",
  "response": { /* Agent-specific data */ },
  "raw_response": "original response string",
  "timestamp": "2024-11-22T21:00:00Z",
  "executionTime": 245
}
```

**Fields:**
- `success`: Boolean indicating successful execution
- `requestType`: Type of request (see request types table)
- `routedToAgent`: Which sub-agent was used
- `agentName`: Human-readable sub-agent name
- `response`: Parsed response data from the sub-agent
- `raw_response`: Original unparsed response
- `timestamp`: When request was processed
- `executionTime`: Milliseconds to execute

## System Health Dashboard

The app includes a System Health Dashboard accessible via the "Health" button in the top-right.

### What It Shows

- **Manager Agent Status**: Operational or Error
- **All 7 Sub-Agents Status**: Operational or Error
- **Timestamp**: When health check was performed
- **Error Details**: If any agent failed

### How It Works

1. User clicks "Health" button
2. App calls Manager Agent with health check request
3. Manager verifies all sub-agents respond correctly
4. Results displayed in a grid showing each agent's status

### Health Check Request

```json
{
  "message": "System health check - verify all agents are operational",
  "agent_id": "69235d3623b88b385103da57"
}
```

## Use Cases

### Use Case 1: Complete Session Initialization

User opens app → Health check → Sync session

```typescript
// Check system is healthy
const health = await orchestrateRequest(REQUEST_TEMPLATES.healthCheck())

// If healthy, sync current state
const sync = await orchestrateRequest(REQUEST_TEMPLATES.syncSession())

// Display tasks to user
updateUIWithTasks(sync.response.tasks)
```

### Use Case 2: Weekly Task Review

Rob reviews team progress:

```typescript
// Get current state
const sync = await orchestrateRequest(REQUEST_TEMPLATES.syncSession())

// Generate report
const report = await orchestrateRequest(REQUEST_TEMPLATES.generateReport('AWS'))

// Start review meeting
const review = await orchestrateRequest(
  REQUEST_TEMPLATES.startReviewMeeting('Sarah', 'AWS')
)
```

### Use Case 3: Complete Meeting Preparation

Rob prepares for Nvidia meeting:

```typescript
// Sync latest state
const sync = await orchestrateRequest(REQUEST_TEMPLATES.syncSession())

// Generate agenda with current tasks and recent emails
const agenda = await orchestrateRequest(
  REQUEST_TEMPLATES.generateAgenda('Nvidia', '2024-11-28')
)

// Export agenda
exportToEmail(agenda.response.agendaDocument, 'nvidia-team@company.com')
```

### Use Case 4: End-of-Week Cleanup

After meetings conclude:

```typescript
// Get current state
const sync = await orchestrateRequest(REQUEST_TEMPLATES.syncSession())

// Archive completed tasks
const archive = await orchestrateRequest(
  REQUEST_TEMPLATES.archiveTasks(['task-001', 'task-002', 'task-003'])
)

// Generate final report
const report = await orchestrateRequest(REQUEST_TEMPLATES.generateReport())
```

## Manager Agent Prompts

### Sync Session Prompt

```
"Fetch complete current task state from Notion database and establish baseline for session"
```

The Manager Agent routes this to Session Sync Agent.

### Scan Tasks Prompt

```
"Scan Gmail inbox and sent folder for new tasks with commitment keywords, search Google Drive meeting notes, extract action items with company detection, and deduplicate against existing Notion tasks"
```

The Manager Agent routes this to Task Collection Agent.

### Update Task Prompt

```
"Update task [ID] with changes: [JSON updates]. Verify sync, log update, and detect conflicts"
```

The Manager Agent routes this to Task Update Agent.

### Generate Report Prompt

```
"Generate weekly report with team member and company breakdown. If company specified, filter to that company only"
```

The Manager Agent routes this to Weekly Report Agent.

### Review Meeting Prompt

```
"Start review meeting. If team member specified, filter to that person. If company specified, filter to that company. Enable dynamic grouping and inline editing"
```

The Manager Agent routes this to Review Meeting Agent.

### Generate Agenda Prompt

```
"Generate agenda for [COMPANY] meeting on [DATE]. Fetch open tasks for that company, search recent emails from that company domain, compile structured agenda document with sections for open tasks, new tasks from emails, follow-ups, and discussion topics"
```

The Manager Agent routes this to Meeting Agenda Agent.

### Archive Prompt

```
"Archive [N] completed tasks. Move to Notion archive status. Move meeting notes in Google Drive to archive folder. Log all archival actions"
```

The Manager Agent routes this to Archive Management Agent.

## Manager Agent Benefits

1. **Single Entry Point**: All requests go through Manager
2. **Intelligent Routing**: Automatically selects the right agent(s)
3. **Coordination**: Handles complex multi-agent workflows
4. **Conflict Prevention**: Ensures no data conflicts between agents
5. **System Monitoring**: Tracks health of all sub-agents
6. **Consistency**: Maintains coherent state across operations
7. **Extensibility**: Easy to add new specialized agents

## Implementation Details

### Manager Agent Configuration (Lyzr Studio)

The Manager Agent is configured in Lyzr Studio with:

- **Name**: Task Management Manager Agent
- **ID**: `69235d3623b88b385103da57`
- **Role**: Central Orchestrator
- **Model**: gpt-4o or gpt-4o-mini (depending on complexity)
- **Temperature**: 0.3 (deterministic routing)
- **Tools Available**:
  - Access to all sub-agent capabilities
  - Notion database access (for state queries)
  - Gmail/Drive access (for context)

### App Integration Points

1. **System Health Dashboard**: Calls Manager for health check
2. **Connection Tester**: Tests Manager connectivity
3. **All Feature Buttons**: Use Orchestrator utility
4. **Request Templates**: Provide formatted prompts

### Data Flow

```
User Action
    ↓
React Component
    ↓
orchestrateRequest(REQUEST_TEMPLATES.*)
    ↓
POST /api/agent
    ↓
Server: /api/agent/route.ts
    ├─ Validates request
    ├─ Adds LYZR_API_KEY
    ├─ Calls Lyzr service
    ↓
Lyzr Service + Manager Agent
    ├─ Routes to sub-agent
    ├─ Executes operation
    ├─ Returns result
    ↓
Server: Parses response
    ↓
React Component
    ↓
User sees result
```

## Troubleshooting

### Manager Agent Not Responding

**Check:**
1. Manager Agent ID is correct: `69235d3623b88b385103da57`
2. In Lyzr Studio, Manager Agent is active
3. LYZR_API_KEY in .env.local is valid
4. All sub-agents are connected

**Fix:**
1. Click "Health" button to check status
2. Review error details in health dashboard
3. Reconnect any failed sub-agents in Lyzr

### Sub-Agent Not Routed Correctly

**Check:**
1. Manager is routing based on request type
2. Request template matches the sub-agent's purpose
3. Sub-agent is operational (check Health dashboard)

**Fix:**
1. Verify sub-agent IDs in AGENTS constant
2. Check request type matches routing rules
3. Test sub-agent directly in Lyzr Studio

### Slow Response Times

**Check:**
1. Manager Agent execution time (shown in response)
2. Sub-agent execution time (shown in response)
3. Total time typically 2-5 seconds

**Optimize:**
1. Run Health check to identify slow agent
2. Review Lyzr agent logs for bottlenecks
3. Optimize Notion query complexity

## Future Enhancements

Potential improvements to Manager Agent:

1. **Learning**: Remember successful routing patterns
2. **Caching**: Cache frequently-requested state
3. **Batching**: Batch multiple requests to sub-agents
4. **Prioritization**: Prioritize urgent requests
5. **Analytics**: Track request patterns and performance
6. **Auto-recovery**: Retry failed sub-agents automatically
7. **Load Balancing**: Distribute requests across multiple instances

## Summary

The Task Management Manager Agent provides:

- **Unified Interface**: Single entry point for all operations
- **Intelligent Coordination**: Smart routing to 7 specialized agents
- **System Oversight**: Monitoring and health checks
- **Reliable Orchestration**: Consistent multi-agent workflows
- **Extensibility**: Foundation for future enhancements

The Manager Agent is essential to the task management system's architecture, ensuring reliable, coordinated operation across all specialized agents.
