# Getting Started with Notion Integration

## 5-Minute Quick Start

### Step 1: Verify Environment
```bash
# Check .env.local exists
cat .env.local
# Should output:
# LYZR_API_KEY=sk-default-...
```

### Step 2: Start the App
```bash
npm run dev
# App runs at http://localhost:3333
```

### Step 3: Create Notion Database

In your Notion workspace:

1. Create a new database called **"Rob's Task Management"**
2. Add these properties:
   - Status: Select (Open, In Progress, Completed, Archived)
   - Assigned To: Person
   - Company: Select (Nvidia, AWS, Microsoft, Google Cloud, Internal)
   - Priority: Select (High, Medium, Low)
   - Due Date: Date
   - Meeting: Text
   - External Contact: Text
   - Current Status: Text

3. Create a page called **"Task System Config"**
   - Add date properties: last_inbox_scan, last_sent_scan, last_drive_scan

### Step 4: Connect in Lyzr Studio

Go to https://studio.lyzr.ai:

1. Open "innovative-fresh-flow" project
2. For each agent (copy agent ID from code):
   - Click agent
   - Click "Tools" section
   - Ensure "Notion" is connected
   - For task collection: Also ensure "Gmail" and "Google Drive" connected

### Step 5: Test Connection

1. Go to http://localhost:3333
2. Click "Connected" button (lightning icon, top-right)
3. Should show "API Key Configured: Yes"
4. Session Sync Agent should show "connected"

### Step 6: Use the App

1. Click "Sync Now" → See tasks from Notion
2. Click "Scan for Tasks" → Extract from Gmail/Drive
3. Click task → Edit and save → Updates Notion
4. Click "Start Review" → Filter tasks by team/company
5. Click "Generate Report" → See team breakdown
6. Click "Prepare Agenda" → Create meeting agenda

## Detailed Setup

### Notion Database Structure

#### Main Database: Rob's Task Management

```
Title (default property)
├── Status: Open, In Progress, Completed, Archived
├── Assigned To: (select person from team)
├── Company: Nvidia, AWS, Microsoft, Google Cloud, Internal
├── Priority: High, Medium, Low
├── Due Date: (date field)
├── Meeting: (text field for meeting reference)
├── External Contact: (email or name)
├── Task Owner Type: Internal Team, External Partner
└── Current Status: (longer text description)
```

**Example task:**
- Title: "Complete Q4 infrastructure audit"
- Status: In Progress
- Assigned To: Vedant
- Company: AWS
- Priority: High
- Due Date: 2024-12-15
- Meeting: "AWS Technical Review"
- Current Status: "Awaiting AWS team confirmation"

#### System Configuration: Task System Config

Create as a single page (not a database) with properties:

```
Task System Config (page name)
├── last_inbox_scan: Date (2024-11-22)
├── last_sent_scan: Date (2024-11-22)
├── last_drive_scan: Date (2024-11-22)
├── commitment_keywords: (text: I'll, I will, Let me, I can)
└── company_domains: (text: JSON mapping domains to companies)
```

Example company_domains value:
```json
{
  "@nvidia.com": "Nvidia",
  "@amazon.com": "AWS",
  "@microsoft.com": "Microsoft",
  "@google.com": "Google Cloud"
}
```

### Lyzr Studio Configuration

For each agent, click the agent and verify under "Tools":

| Agent | Notion | Gmail | Google Drive |
|-------|--------|-------|--------------|
| Session Sync | ✓ | - | - |
| Task Collection | ✓ | ✓ | ✓ |
| Task Update | ✓ | - | - |
| Weekly Report | ✓ | - | - |
| Review Meeting | ✓ | - | - |
| Meeting Agenda | ✓ | ✓ | - |
| Archive Management | ✓ | - | ✓ |

### App Features

#### Dashboard
- Shows task metrics (Total, Open, In Progress, Completed, Overdue)
- Quick action buttons for all workflows
- Task list with filtering

#### Sync Now
- Pulls current task state from Notion
- Establishes baseline for session
- Shows last sync time

#### Scan for Tasks
- Searches Gmail inbox (emails since last scan)
- Searches Gmail sent (commitment keywords)
- Searches Google Drive meeting notes
- Auto-detects company from email domains
- Shows duplicates for confirmation
- Creates new Notion tasks

#### Edit Tasks
- Click any task card
- Change: Status, Assigned To, Company, Priority, Due Date, Meeting
- Saves immediately to Notion
- Updates are logged in task history

#### Start Review
- Filter by Team Member
- Filter by Company
- Group by: Team Member, Company, or Priority
- View update history
- Manage tasks during meetings

#### Generate Report
- Team member task breakdown
- Company task breakdown
- Completed/Overdue metrics
- Export to PDF or Email

#### Prepare Agenda
- Select Company and Meeting Date
- Pull open tasks for that company
- Extract from recent emails
- Generate structured agenda
- Export to PDF/Email

#### Archive Completed
- Select completed tasks
- Move to archive in Notion
- Track archival history

## Troubleshooting

### Connection Issues

**"Connection Error" in status button:**
```
Check:
1. .env.local has LYZR_API_KEY
2. Key is not empty or "sk-default-..."
3. No extra whitespace

Fix:
nano .env.local
# Verify: LYZR_API_KEY=sk-...
```

**Agent not responding:**
```
Check:
1. Go to https://studio.lyzr.ai
2. Open agent
3. Click "Test" or "Run"
4. Look at logs for errors

Common errors:
- "Tool not found" → Notion not connected
- "Permission denied" → Workspace not shared
- "Database not found" → Check database name
```

### Notion Issues

**Tasks not appearing:**
```
Check:
1. Click "Sync Now"
2. Check browser console (F12) for errors
3. Verify database name is "Rob's Task Management"
4. Check /api/test-agent endpoint (http://localhost:3333/api/test-agent)
```

**Updates not saving:**
```
Check:
1. Person has write access to Notion database
2. No permission errors in Lyzr logs
3. Click "Sync Now" to verify connection

If still failing:
- Check Notion database share settings
- Verify Lyzr account has editor access
- Test agent manually in Lyzr Studio
```

### Email Scanning Issues

**"Scan for Tasks" finds nothing:**
```
Check:
1. Gmail account is connected in Lyzr
2. Inbox has emails with keywords: "I'll", "I will", "Let me"
3. Check last_inbox_scan date in Task System Config

Example email that would be found:
"Hi Rob, I'll complete the GPU review by Friday."
```

**Wrong company detection:**
```
Check:
1. Email domain is in company_domains mapping
2. Person's email is from correct company

Add domain:
1. Open Task System Config page
2. Edit company_domains JSON
3. Add: "@company.com": "Company Name"
```

## File Structure

```
/app/project/
├── app/
│   ├── page.tsx              ← Main app (React component)
│   ├── layout.tsx            ← Root layout
│   ├── globals.css           ← Tailwind styles
│   └── api/
│       ├── agent/
│       │   └── route.ts      ← Agent API wrapper (secure)
│       └── test-agent/
│           └── route.ts      ← Connection test endpoint
├── src/
│   ├── components/ui/        ← shadcn/ui components
│   ├── utils/
│   │   └── jsonParser.ts     ← JSON parsing helper
│   └── lib/
│       └── utils.ts          ← cn() utility
├── .env.local                ← API key (NEVER commit)
├── next.config.js            ← Next.js config
├── tsconfig.json             ← TypeScript config
├── NOTION_SETUP.md           ← Complete setup guide
├── INTEGRATION_CHECKLIST.md  ← Verification checklist
├── AGENT_RESPONSE_EXAMPLES.md ← What agents return
├── NOTION_CONNECTION_SUMMARY.md ← Quick reference
└── GETTING_STARTED.md        ← This file
```

## Environment Variables

**File:** `.env.local` (in project root)

```bash
# Required: Lyzr API key (keep secret!)
LYZR_API_KEY=sk-default-...

# Do NOT add:
# - OAuth credentials (handled by agents)
# - Database URLs (agents have Notion access)
# - Gmail/Drive keys (agents have OAuth access)
```

**Never commit .env.local to git!** It's already in .gitignore.

## Terminal Commands

```bash
# Start development server
npm run dev
# Opens at http://localhost:3333

# Build for production
npm run build

# Run TypeScript check
npx tsc --noEmit

# Test agent connection
curl http://localhost:3333/api/test-agent

# View environment
cat .env.local
```

## Key Concepts

### How OAuth Works (You Don't Need to Do Anything)

1. Lyzr agents have pre-configured OAuth access
2. Agents use OAuth tokens to access Notion, Gmail, Google Drive
3. Your app **never** touches OAuth credentials
4. Your app only calls agents via secure API route
5. API route uses LYZR_API_KEY (server-side only)

### How Data Is Secured

```
Browser
  ↓ (no secrets exposed)
Next.js Server
  ↓ (has LYZR_API_KEY in .env.local)
Lyzr Service
  ↓ (handles OAuth securely)
External Services (Notion, Gmail, Drive)
  ↓
Returns data to browser
```

### Response Parsing

All agent responses go through bulletproof parsing:

```typescript
// Agent returns any of these:
"```json\n{...}\n```"     // Markdown block
"{\"result\": \"ok\"}"    // Escaped
{"result": "ok"}          // Direct JSON
"Some text {"result": "ok"}" // Mixed

// All automatically parsed to:
{
  success: true,
  response: {result: "ok"},      // Parsed object
  raw_response: "original string"
}
```

## Next Steps

1. **Verify Setup:**
   - Run npm run dev
   - Click "Connected" button
   - Should show agents are connected

2. **Create Notion Database:**
   - Create "Rob's Task Management" database
   - Add all required properties
   - Create "Task System Config" page

3. **Connect Lyzr Studio:**
   - Go to studio.lyzr.ai
   - Connect Notion to all agents
   - Connect Gmail/Drive to relevant agents

4. **Test Each Feature:**
   - Click "Sync Now" → See Notion tasks
   - Click "Scan for Tasks" → Extract from email
   - Edit a task → Verify saves to Notion
   - Try filters and reports

5. **Iterate and Customize:**
   - Add more team members
   - Add more companies
   - Customize task properties
   - Adjust scan keywords

## Success Criteria

Your setup is working when:

- ✓ "Connected" button shows "connected"
- ✓ "Sync Now" pulls tasks from Notion
- ✓ "Scan for Tasks" finds emails with action items
- ✓ Editing a task saves to Notion
- ✓ Reports show correct team/company breakdown
- ✓ Filtering works in all views
- ✓ Meeting agenda generates from tasks and emails

## Still Need Help?

See:
- **NOTION_SETUP.md** - Detailed Notion database setup
- **INTEGRATION_CHECKLIST.md** - Step-by-step checklist
- **AGENT_RESPONSE_EXAMPLES.md** - What each agent returns
- **NOTION_CONNECTION_SUMMARY.md** - Architecture overview
- **http://localhost:3333/api/test-agent** - Connection diagnostics
