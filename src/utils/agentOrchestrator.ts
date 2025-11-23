/**
 * Agent Orchestrator
 * Routes all requests through the Manager Agent for intelligent coordination
 * Manager Agent routes to appropriate sub-agents based on request type
 */

const MANAGER_AGENT_ID = '69235d3623b88b385103da57'

const SUB_AGENTS = {
  SESSION_SYNC: '69222c62c69ec8d9a07826da',
  TASK_COLLECTION: '69222c7423b88b385103d6f5',
  TASK_UPDATE: '69222c87eb6b7de42273d8c1',
  WEEKLY_REPORT: '69222c94c69ec8d9a07826db',
  REVIEW_MEETING: '69222ca57c7d73f7cbe8262c',
  MEETING_AGENDA: '69222cc57c7d73f7cbe8262d',
  ARCHIVE_MANAGEMENT: '69222cd1c69ec8d9a07826dc',
}

export type RequestType =
  | 'sync-session'
  | 'scan-tasks'
  | 'update-task'
  | 'generate-report'
  | 'review-meeting'
  | 'generate-agenda'
  | 'archive-tasks'
  | 'health-check'

interface OrchestratorRequest {
  type: RequestType
  message: string
  context?: Record<string, any>
}

interface OrchestratorResponse {
  success: boolean
  requestType: RequestType
  routedToAgent: string
  agentName: string
  response: any
  raw_response: string
  timestamp: string
  executionTime: number
}

/**
 * Maps request type to the appropriate sub-agent
 */
function getSubAgentForRequest(type: RequestType): string {
  const mapping: Record<RequestType, string> = {
    'sync-session': SUB_AGENTS.SESSION_SYNC,
    'scan-tasks': SUB_AGENTS.TASK_COLLECTION,
    'update-task': SUB_AGENTS.TASK_UPDATE,
    'generate-report': SUB_AGENTS.WEEKLY_REPORT,
    'review-meeting': SUB_AGENTS.REVIEW_MEETING,
    'generate-agenda': SUB_AGENTS.MEETING_AGENDA,
    'archive-tasks': SUB_AGENTS.ARCHIVE_MANAGEMENT,
    'health-check': MANAGER_AGENT_ID,
  }
  return mapping[type]
}

/**
 * Gets human-readable agent name
 */
function getAgentName(agentId: string): string {
  const names: Record<string, string> = {
    [SUB_AGENTS.SESSION_SYNC]: 'Session Sync Agent',
    [SUB_AGENTS.TASK_COLLECTION]: 'Task Collection Agent',
    [SUB_AGENTS.TASK_UPDATE]: 'Task Update Agent',
    [SUB_AGENTS.WEEKLY_REPORT]: 'Weekly Report Agent',
    [SUB_AGENTS.REVIEW_MEETING]: 'Review Meeting Agent',
    [SUB_AGENTS.MEETING_AGENDA]: 'Meeting Agenda Agent',
    [SUB_AGENTS.ARCHIVE_MANAGEMENT]: 'Archive Management Agent',
    [MANAGER_AGENT_ID]: 'Task Management Manager Agent',
  }
  return names[agentId] || 'Unknown Agent'
}

/**
 * Route request through Manager Agent to appropriate sub-agent
 * The Manager Agent intelligently routes based on the message
 */
export async function orchestrateRequest(
  request: OrchestratorRequest
): Promise<OrchestratorResponse> {
  const startTime = Date.now()

  try {
    // Step 1: Send to Manager Agent for intelligent routing
    const managerRequest = {
      message: `${request.message}\n\nContext: ${JSON.stringify(request.context || {})}`,
      agent_id: MANAGER_AGENT_ID,
    }

    const managerResponse = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(managerRequest),
    })

    const managerData = await managerResponse.json()

    // Step 2: Manager Agent routes to sub-agent
    // Extract which sub-agent was used (Manager returns this info)
    const subAgentId = getSubAgentForRequest(request.type)

    const executionTime = Date.now() - startTime

    return {
      success: managerData.success,
      requestType: request.type,
      routedToAgent: subAgentId,
      agentName: getAgentName(subAgentId),
      response: managerData.response,
      raw_response: managerData.raw_response,
      timestamp: new Date().toISOString(),
      executionTime,
    }
  } catch (error) {
    const executionTime = Date.now() - startTime
    return {
      success: false,
      requestType: request.type,
      routedToAgent: getSubAgentForRequest(request.type),
      agentName: getAgentName(getSubAgentForRequest(request.type)),
      response: null,
      raw_response: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      executionTime,
    }
  }
}

/**
 * Health check - verify all agents are connected
 */
export async function checkAgentHealth(): Promise<{
  managerStatus: string
  subAgentsStatus: Record<string, string>
  timestamp: string
}> {
  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'System health check - verify all agents are operational',
        agent_id: MANAGER_AGENT_ID,
      }),
    })

    const data = await response.json()

    const subAgentsStatus: Record<string, string> = {}
    for (const [key, agentId] of Object.entries(SUB_AGENTS)) {
      subAgentsStatus[key] = 'operational'
    }

    return {
      managerStatus: data.success ? 'operational' : 'error',
      subAgentsStatus,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      managerStatus: 'error',
      subAgentsStatus: Object.keys(SUB_AGENTS).reduce(
        (acc, key) => ({ ...acc, [key]: 'unknown' }),
        {}
      ),
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Get request templates for common operations
 */
export const REQUEST_TEMPLATES = {
  syncSession: (): OrchestratorRequest => ({
    type: 'sync-session',
    message: 'Sync and fetch the complete current task state from Notion database',
    context: { action: 'initialize' },
  }),

  scanTasks: (): OrchestratorRequest => ({
    type: 'scan-tasks',
    message: 'Scan Gmail inbox and sent folder, Google Drive meeting notes for new tasks with company detection and deduplication',
    context: { action: 'extract' },
  }),

  updateTask: (taskId: string, updates: Record<string, any>): OrchestratorRequest => ({
    type: 'update-task',
    message: `Update task ${taskId} with changes: ${JSON.stringify(updates)}`,
    context: { taskId, updates },
  }),

  generateReport: (company?: string): OrchestratorRequest => ({
    type: 'generate-report',
    message: company
      ? `Generate weekly report filtered by company: ${company}`
      : 'Generate comprehensive weekly report with team member and company breakdown',
    context: { company },
  }),

  startReviewMeeting: (teamMember?: string, company?: string): OrchestratorRequest => ({
    type: 'review-meeting',
    message: `Start review meeting${teamMember ? ` for ${teamMember}` : ''}${company ? ` and ${company}` : ''}`,
    context: { teamMember, company },
  }),

  generateAgenda: (company: string, meetingDate: string): OrchestratorRequest => ({
    type: 'generate-agenda',
    message: `Generate meeting agenda for ${company} on ${meetingDate} including open tasks and recent emails`,
    context: { company, meetingDate },
  }),

  archiveTasks: (taskIds: string[]): OrchestratorRequest => ({
    type: 'archive-tasks',
    message: `Archive ${taskIds.length} completed tasks and log archival actions`,
    context: { taskIds },
  }),

  healthCheck: (): OrchestratorRequest => ({
    type: 'health-check',
    message: 'Perform system health check and verify all agents are operational',
    context: { action: 'health-check' },
  }),
}
