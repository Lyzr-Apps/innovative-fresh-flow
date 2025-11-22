import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/test-agent
 * Diagnostic endpoint to test Notion connectivity through agents
 */

const LYZR_API_URL = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/'
const LYZR_API_KEY = process.env.LYZR_API_KEY

const AGENTS = {
  SESSION_SYNC: '69222c62c69ec8d9a07826da',
  TASK_COLLECTION: '69222c7423b88b385103d6f5',
  TASK_UPDATE: '69222c87eb6b7de42273d8c1',
  WEEKLY_REPORT: '69222c94c69ec8d9a07826db',
  REVIEW_MEETING: '69222ca57c7d73f7cbe8262c',
  MEETING_AGENDA: '69222cc57c7d73f7cbe8262d',
  ARCHIVE_MANAGEMENT: '69222cd1c69ec8d9a07826dc',
}

export async function GET() {
  const results: Record<string, any> = {
    apiKeyConfigured: !!LYZR_API_KEY,
    timestamp: new Date().toISOString(),
    agents: {},
  }

  if (!LYZR_API_KEY) {
    return NextResponse.json(
      {
        success: false,
        error: 'LYZR_API_KEY not configured',
        details: 'Add LYZR_API_KEY to .env.local',
        ...results,
      },
      { status: 500 }
    )
  }

  // Test Session Sync Agent (simplest test - just fetch current state)
  try {
    console.log('Testing Session Sync Agent...')
    const testResponse = await fetch(LYZR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LYZR_API_KEY,
      },
      body: JSON.stringify({
        user_id: 'test-user',
        agent_id: AGENTS.SESSION_SYNC,
        session_id: 'test-session',
        message: 'What is the current task state in the Notion database? Respond with JSON only.',
      }),
    })

    const data = await testResponse.json()
    results.agents[AGENTS.SESSION_SYNC] = {
      agentName: 'Session Sync Agent',
      status: testResponse.ok ? 'connected' : 'error',
      statusCode: testResponse.status,
      hasResponse: !!data.response,
      responsePreview:
        typeof data.response === 'string'
          ? data.response.substring(0, 200)
          : JSON.stringify(data.response).substring(0, 200),
      rawResponsePreview:
        typeof data.raw_response === 'string'
          ? data.raw_response.substring(0, 200)
          : JSON.stringify(data.raw_response).substring(0, 200),
      fullResponse: data,
    }
  } catch (error) {
    results.agents[AGENTS.SESSION_SYNC] = {
      agentName: 'Session Sync Agent',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    }
  }

  const hasErrors = Object.values(results.agents).some(
    (agent: any) => agent.status === 'error'
  )

  return NextResponse.json(
    {
      success: !hasErrors,
      results,
    },
    { status: hasErrors ? 500 : 200 }
  )
}
