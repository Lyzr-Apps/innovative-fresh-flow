# Notion Integration Setup Guide

## Overview

The Task Management System connects to Notion through **Lyzr AI Agents**. The agents handle all Notion operations (read/write) via OAuth that's already configured in Lyzr Studio.

## Current Status

- **App Status**: Running at http://localhost:3333
- **API Key**: Configured in `.env.local`
- **Agents**: 7 agents integrated and ready
- **Connection**: Use the "Connected" button (lightning icon) in the top-right to test

## Step-by-Step Setup

### 1. Verify Lyzr Studio Setup

Go to **https://studio.lyzr.ai** and:

1. Open your "innovative-fresh-flow" project
2. For **each agent**, verify these integrations exist:
   - **Notion** - Connected (must have read/write permissions)
   - **Gmail** - Connected (for task collection)
   - **Google Drive** - Connected (for meeting notes)

**Agent IDs to check:**
- Session Sync: `69222c62c69ec8d9a07826da`
- Task Collection: `69222c7423b88b385103d6f5`
- Task Update: `69222c87eb6b7de42273d8c1`
- Weekly Report: `69222c94c69ec8d9a07826db`
- Review Meeting: `69222ca57c7d73f7cbe8262c`
- Meeting Agenda: `69222cc57c7d73f7cbe8262d`
- Archive Management: `69222cd1c69ec8d9a07826dc`

### 2. Create Required Notion Databases

The agents expect these databases in your Notion workspace:

#### Database 1: Rob's Task Management
**Properties:**
- Title (default)
- Status: Select [Open, In Progress, Completed, Archived]
- Assigned To: Person
- Company: Select [Nvidia, AWS, Microsoft, Google Cloud, Internal]
- Meeting: Text
- External Contact: Text
- Task Owner Type: Select [Internal Team, External Partner]
- Priority: Select [High, Medium, Low]
- Due Date: Date
- Current Status: Text (longer description)
- Update Log: Text (stores JSON array of updates)

#### Database 2: Meeting Agendas (Optional)
**Properties:**
- Meeting Title (Title)
- Company: Select
- Meeting Date: Date
- Agenda Generated: Created time
- Open Tasks Count: Number
- Participants: Text
- Agenda Body: Text
- Status: Select [Draft, Sent, Completed]

#### Database 3: System Config (Single Page)
Create a page named "Task System Config" with these properties:
- last_inbox_scan: Date & Time
- last_sent_scan: Date & Time
- last_drive_scan: Date & Time
- last_report_date: Date & Time
- commitment_keywords: Multi-select [I'll, I will, Let me, I can]
- company_list: Multi-select [Nvidia, AWS, Microsoft, Google Cloud, Internal]
- company_domains: Text (JSON format)

Example for company_domains:
```json
{
  "@nvidia.com": "Nvidia",
  "@amazon.com": "AWS",
  "@microsoft.com": "Microsoft",
  "@google.com": "Google Cloud"
}
```

### 3. Test Connection

1. Click the **"Connected"** button (lightning icon) in the top-right of the app
2. A dialog will open showing:
   - **API Key Configured**: Should show "Yes"
   - **Session Sync Agent**: Should show "connected"
   - Response preview from Notion

**If it shows "Connection Error":**
- Check LYZR_API_KEY in `.env.local` is correct
- Verify agent IDs exist in Lyzr Studio
- Check Notion permissions in each agent

### 4. How Data Flows

```
App (page.tsx)
    ↓
/api/agent route (server-side, secure)
    ↓
Lyzr API (with LYZR_API_KEY header)
    ↓
Lyzr Agents (with OAuth Notion access)
    ↓
Notion Database (read/write)
```

### 5. Using the App

**Sync Now**
- Fetches current task state from Notion
- Establishes baseline for the session
- Agent: Session Sync

**Scan for Tasks**
- Searches Gmail inbox/sent (since last scan)
- Searches Google Drive meeting notes
- Auto-detects company and assignee
- Shows duplicates for confirmation
- Creates new Notion tasks
- Agent: Task Collection

**Edit Tasks**
- Click any task card to edit
- Changes saved immediately to Notion
- Update Log tracks all changes
- Agent: Task Update

**Start Review**
- Filter by Team Member and Company
- Group by Team Member, Company, or Priority
- View update history
- Agent: Review Meeting

**Generate Report**
- Team member breakdown
- Company breakdown
- Completed/Overdue metrics
- Agent: Weekly Report

**Prepare Agenda**
- Select company and date
- Pulls open tasks + recent emails
- Exports to PDF/Email
- Agent: Meeting Agenda

**Archive Completed**
- Select completed tasks
- Move to archive in Notion
- Agent: Archive Management

## Troubleshooting

### "Connection Error" on startup

**Check:**
1. `.env.local` has LYZR_API_KEY
2. Agent IDs match Lyzr Studio
3. Notion database permissions in agents
4. Test with "Retry Connection" button

### Tasks not syncing

**Check:**
1. Run "Sync Now" to fetch fresh state
2. Database name matches agents' config
3. Properties exist on all tasks
4. No permission errors in agent logs

### Scan not finding tasks

**Check:**
1. Gmail/Google Drive connected in Lyzr agents
2. Last scan timestamps in System Config page
3. Commitment keywords configured
4. Email contains action items

### Updates not saving

**Check:**
1. Person has write access to Notion
2. Task Update Agent has correct permissions
3. Check "Connected" status first
4. Verify company/meeting tags exist in Notion

## Development Notes

### Agent Response Format

All agents return standardized JSON:
```typescript
{
  success: boolean
  response: any  // Parsed response from agent
  raw_response: string  // Original unparsed response
  agent_id: string
  user_id: string
  session_id: string
  timestamp: string
}
```

### Error Handling

The `/api/agent` route uses 5-strategy JSON parsing:
1. Direct JSON.parse
2. Advanced parsing with auto-fixes
3. JSON extraction from text
4. Last resort with all fixes
5. Falls back to plain text

### Adding New Agents

To add new agents:

1. Get agent ID from Lyzr Studio
2. Add to AGENTS constant in `page.tsx`
3. Create agent call function
4. Handle response with optional chaining and fallbacks

```typescript
const result = await callAgent(
  AGENTS.YOUR_AGENT,
  'Your prompt here'
)

// Safe access:
const data = result.response?.field ?? 'default'
```

## Support

If connection issues persist:
1. Check Lyzr Studio agent configurations
2. Verify Notion database structure
3. Test with diagnostic endpoint: `/api/test-agent`
4. Review agent logs in Lyzr Studio
