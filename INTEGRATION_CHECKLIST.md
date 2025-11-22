# Notion Integration Checklist

Complete these steps to activate Notion sync in your app:

## Lyzr Studio Setup

- [ ] Login to https://studio.lyzr.ai
- [ ] Open "innovative-fresh-flow" project
- [ ] **Session Sync Agent (69222c62c69ec8d9a07826da)**
  - [ ] Notion integration connected
  - [ ] Can read task database
  - [ ] Test: "What tasks are in my Notion database?"
- [ ] **Task Collection Agent (69222c7423b88b385103d6f5)**
  - [ ] Notion integration connected
  - [ ] Gmail integration connected
  - [ ] Google Drive integration connected
  - [ ] Test: "Scan for new tasks in Gmail and Notion"
- [ ] **Task Update Agent (69222c87eb6b7de42273d8c1)**
  - [ ] Notion integration connected
  - [ ] Can write to tasks
  - [ ] Test: "Update a task in Notion"
- [ ] **Weekly Report Agent (69222c94c69ec8d9a07826db)**
  - [ ] Notion integration connected
  - [ ] Can query database
- [ ] **Review Meeting Agent (69222ca57c7d73f7cbe8262c)**
  - [ ] Notion integration connected
  - [ ] Can read all tasks
- [ ] **Meeting Agenda Agent (69222cc57c7d73f7cbe8262d)**
  - [ ] Notion integration connected
  - [ ] Gmail integration connected
  - [ ] Can write Meeting Agendas database
- [ ] **Archive Management Agent (69222cd1c69ec8d9a07826dc)**
  - [ ] Notion integration connected
  - [ ] Google Drive integration connected
  - [ ] Can move files in Drive

## Notion Setup

- [ ] **Database: Rob's Task Management**
  - [ ] Created with Title property
  - [ ] Added Status: Select [Open, In Progress, Completed, Archived]
  - [ ] Added Assigned To: Person
  - [ ] Added Company: Select [Nvidia, AWS, Microsoft, Google Cloud, Internal]
  - [ ] Added Meeting: Text
  - [ ] Added Priority: Select [High, Medium, Low]
  - [ ] Added Due Date: Date
  - [ ] Added Current Status: Text
  - [ ] Added Update Log: Text (for JSON updates)
  - [ ] Added External Contact: Text

- [ ] **Page: Task System Config**
  - [ ] Created page with this name
  - [ ] Added properties:
    - [ ] last_inbox_scan: Date & Time
    - [ ] last_sent_scan: Date & Time
    - [ ] last_drive_scan: Date & Time
    - [ ] commitment_keywords: Multi-select
    - [ ] company_list: Multi-select

- [ ] **Database: Meeting Agendas** (Optional)
  - [ ] Created with Title property
  - [ ] Added Company: Select
  - [ ] Added Meeting Date: Date
  - [ ] Added Status: Select [Draft, Sent, Completed]

## Environment Configuration

- [ ] `.env.local` has LYZR_API_KEY
  - [ ] Key starts with `sk-`
  - [ ] Not hardcoded in source files
  - [ ] Not in git commits

## App Testing

1. **Start the app**
   ```bash
   npm run dev
   ```
   App runs at http://localhost:3333

2. **Test connection**
   - [ ] Click "Connected" button (lightning icon) in top-right
   - [ ] Dialog shows "API Key Configured: Yes"
   - [ ] Shows "Status: connected" for Session Sync Agent

3. **Test Sync**
   - [ ] Click "Sync Now" button
   - [ ] Status changes to "Syncing..."
   - [ ] Status updates to "Synced just now"

4. **Test Task Collection**
   - [ ] Click "Scan for Tasks"
   - [ ] Click "Start Scan" in dialog
   - [ ] Wait for results
   - [ ] Shows "Found X new tasks, Y potential duplicates"
   - [ ] Can select tasks to add

5. **Test Task Editing**
   - [ ] Click any task card in the list
   - [ ] Edit dialog opens
   - [ ] Change status, company, or other fields
   - [ ] Click "Save Changes"
   - [ ] Verify update in Notion database

6. **Test Review Meeting**
   - [ ] Click "Start Review"
   - [ ] Try filtering by Team Member
   - [ ] Try filtering by Company
   - [ ] Try grouping by different options
   - [ ] Close dialog

7. **Test Reports**
   - [ ] Click "Generate Report"
   - [ ] Filter by company
   - [ ] Verify counts match tasks
   - [ ] Close dialog

## Verification Steps

After completing all checkboxes:

1. **Connection Works**
   ```bash
   curl http://localhost:3333/api/test-agent
   # Should return success: true if agents connected
   ```

2. **Notion Synced**
   - [ ] Click "Sync Now"
   - [ ] Tasks appear in app matching your Notion database
   - [ ] Company tags match Notion
   - [ ] Assigned To matches team members

3. **All Features Work**
   - [ ] Scan detects new tasks from Gmail
   - [ ] Editing saves to Notion in real-time
   - [ ] Reports show correct counts
   - [ ] Filtering works across all features

## Troubleshooting

If any test fails, check:

1. **Connection Error**
   - [ ] LYZR_API_KEY correct in .env.local
   - [ ] All agent IDs match Lyzr Studio
   - [ ] Notion integrations connected in agents

2. **Tasks not appearing**
   - [ ] Database name is "Rob's Task Management"
   - [ ] All required properties exist
   - [ ] Notion workspace is shared with Lyzr

3. **Scans not working**
   - [ ] Gmail/Google Drive integrations enabled
   - [ ] Gmail account has emails with action items
   - [ ] Google Drive has "RobMeetingNotes" folder

4. **Updates not saving**
   - [ ] Task Update Agent has write permissions
   - [ ] Person is not in read-only workspace
   - [ ] No concurrent edits from Notion directly

## Quick Reference

**Notion Database URL**
- Get from Notion: Share → Copy link
- Format: `https://notion.so/[DATABASE_ID]`
- Database ID = last 32 chars after `-`

**Agent Test Endpoint**
- URL: `http://localhost:3333/api/test-agent`
- Shows: All agent connection statuses
- Use to debug connection issues

**Lyzr Studio**
- URL: https://studio.lyzr.ai
- Check: Agent configurations and logs
- Debug: Run agents manually to test

**Environment**
- File: `/app/project/.env.local`
- Key: `LYZR_API_KEY`
- Never commit to git
