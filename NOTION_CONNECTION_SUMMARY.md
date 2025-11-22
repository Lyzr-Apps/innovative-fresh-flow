# Notion Connection - Quick Summary

## The Short Answer

The app connects to Notion through **Lyzr AI Agents** that have OAuth access. Your API key is already configured. You just need to:

1. **Set up Notion databases** (4 tables with specific properties)
2. **Verify agent configurations** in Lyzr Studio (ensure Notion/Gmail/Drive are connected)
3. **Test the connection** by clicking the "Connected" button in the app

## Architecture

```
Your App (Next.js)
    ↓
Secure API Route (/api/agent)
    ↓
Lyzr Service (with LYZR_API_KEY)
    ↓
Lyzr Agents (with OAuth credentials)
    ↓
External Services:
  - Notion (Read/Write tasks)
  - Gmail (Read emails for task extraction)
  - Google Drive (Read meeting notes)
```

**Key Point:** No OAuth login needed in your app - OAuth is handled by the agents in Lyzr.

## Required Setup

### 1. Environment (Already Done)
```
.env.local has:
LYZR_API_KEY=sk-default-wuvAFHdmD06fylLVkibtk1Fz2QvoI58l
```

### 2. Lyzr Studio Agent Configuration
Visit https://studio.lyzr.ai and for each of the 7 agent IDs:
- Verify Notion integration is connected
- Verify Gmail integration is connected (for task agents)
- Verify Google Drive integration is connected (for agenda agents)

**The 7 Agent IDs:**
```
69222c62c69ec8d9a07826da - Session Sync
69222c7423b88b385103d6f5 - Task Collection
69222c87eb6b7de42273d8c1 - Task Update
69222c94c69ec8d9a07826db - Weekly Report
69222ca57c7d73f7cbe8262c - Review Meeting
69222cc57c7d73f7cbe8262d - Meeting Agenda
69222cd1c69ec8d9a07826dc - Archive Management
```

### 3. Notion Database Setup
Create these in your Notion workspace:

**Database: Rob's Task Management**
- Title, Status, Assigned To, Company, Priority, Due Date, Meeting, External Contact, etc.
- [See NOTION_SETUP.md for full properties list]

**Page: Task System Config**
- Stores scan timestamps and configuration
- [See NOTION_SETUP.md for full details]

**Database: Meeting Agendas** (Optional)
- Stores generated meeting agendas
- [See NOTION_SETUP.md for full details]

## How It Works

### Data Flow Example: Sync Now Button

1. User clicks "Sync Now" button
2. App calls `/api/agent` with:
   - `message`: "Fetch complete current task state from Notion"
   - `agent_id`: "69222c62c69ec8d9a07826da" (Session Sync Agent)
3. Server makes secure HTTPS request to Lyzr with LYZR_API_KEY header
4. Lyzr invokes agent with Notion OAuth access
5. Agent reads all tasks from "Rob's Task Management" database
6. Agent returns JSON response
7. Server parses response (handles formatting quirks)
8. App updates UI with fresh tasks

### Data Flow Example: Scan for Tasks

1. User clicks "Scan for Tasks"
2. App calls Task Collection Agent (69222c7423b88b385103d6f5)
3. Agent uses Gmail OAuth to:
   - Read emails since last scan timestamp
   - Search for commitment keywords ("I'll", "I will", etc.)
   - Extract action items
4. Agent uses Google Drive OAuth to:
   - Read meeting notes in "RobMeetingNotes" folder
   - Extract action items
5. Agent detects company from email domains:
   - "john@nvidia.com" → Nvidia
   - "sarah@amazon.com" → AWS
6. Agent deduplicates against existing Notion tasks
7. Agent creates new tasks in Notion with Company tags
8. App displays results with confirmation UI
9. User selects which tasks to add
10. Agent creates them in Notion

## Testing

**Test Connection:**
1. Open app at http://localhost:3333
2. Click "Connected" button (lightning icon, top-right)
3. Dialog shows agent connection status
4. Should show "API Key Configured: Yes"
5. Session Sync Agent should show "connected"

**Test Real Sync:**
1. Click "Sync Now"
2. Check console/logs for agent response
3. Verify tasks appear in app
4. Verify company tags match Notion

**Test Full Workflow:**
1. Click "Scan for Tasks" and run scan
2. Add discovered tasks
3. Edit a task (change status, company, etc.)
4. Verify changes in Notion database
5. Click "Sync Now" to confirm

## Troubleshooting

| Issue | Check |
|-------|-------|
| "Connection Error" button | LYZR_API_KEY in .env.local |
| Agents not connecting | Agent IDs in Lyzr match code |
| Notion not syncing | Database name is "Rob's Task Management" |
| No tasks appearing | Click "Sync Now" to pull from Notion |
| Scan not finding tasks | Gmail/Drive connected in Lyzr agents |
| Updates not saving | Person has write access to Notion |

## File References

- **Setup Guide:** `NOTION_SETUP.md` - Complete step-by-step setup
- **Checklist:** `INTEGRATION_CHECKLIST.md` - Verification checklist
- **Agent Responses:** `AGENT_RESPONSE_EXAMPLES.md` - What agents return
- **API Route:** `app/api/agent/route.ts` - Secure agent wrapper
- **Test Endpoint:** `app/api/test-agent/route.ts` - Connection diagnostics
- **UI Code:** `app/page.tsx` - React component with agent integration

## Environment Variables

**File:** `.env.local`
```bash
# Lyzr API key (server-side only, never exposed to browser)
LYZR_API_KEY=sk-default-wuvAFHdmD06fylLVkibtk1Fz2QvoI58l
```

**Never:**
- Commit to git
- Use in client-side code
- Hardcode in source files
- Share publicly

## Common Tasks

**To add a new agent:**
1. Get agent ID from Lyzr Studio
2. Add to AGENTS constant in `app/page.tsx`
3. Call with: `callAgent(AGENTS.YOUR_AGENT, 'prompt')`
4. Handle response with safe access: `result.response?.field ?? 'default'`

**To change Notion database name:**
1. Update in Lyzr agent configuration
2. No code changes needed (agents are config-based)

**To add company:**
1. Update `COMPANIES` array in `app/page.tsx`
2. Add to company_list in Notion System Config
3. Add to company_domains mapping if email domain exists

**To change scan frequency:**
1. Not implemented yet (currently manual "Scan for Tasks" button)
2. Could add scheduled scans with serverless functions

## Next Steps

1. Open https://studio.lyzr.ai
2. Verify all 7 agents have Notion connected
3. Create Notion databases with properties from NOTION_SETUP.md
4. Test connection with "Connected" button
5. Click "Sync Now" to pull initial tasks
6. Verify tasks appear and have correct company tags
7. Test "Scan for Tasks" to extract from emails
8. Verify updates save back to Notion

## Support Resources

- **Lyzr Docs:** https://docs.lyzr.ai
- **Notion API:** https://developers.notion.com
- **This Repo:**
  - NOTION_SETUP.md
  - INTEGRATION_CHECKLIST.md
  - AGENT_RESPONSE_EXAMPLES.md
  - /api/test-agent endpoint
