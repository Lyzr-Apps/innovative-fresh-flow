'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { RefreshCw, Plus, Edit2, Trash2, Archive, FileText, Users, Building2, Calendar, CheckCircle2, AlertCircle, Clock, Download, Mail, Filter, X, Zap } from 'lucide-react'

// Types
interface Task {
  id: string
  title: string
  status: 'Open' | 'In Progress' | 'Completed' | 'Archived'
  assignedTo: string
  company?: string
  meeting?: string
  externalContact?: string
  taskOwnerType: 'Internal Team' | 'External Partner'
  priority: 'High' | 'Medium' | 'Low'
  dueDate?: string
  updateLog: Array<{ timestamp: string; person: string; changes: string }>
  currentStatus: string
}

interface ScanResult {
  newTasks: Task[]
  duplicates: Array<{ title: string; person: string; company?: string }>
  updatedTasks: Task[]
  scanTimestamp: string
}

interface ReportData {
  totalTasks: number
  completedThisWeek: number
  overdueCount: number
  teamBreakdown: Record<string, number>
  companyBreakdown: Record<string, number>
}

interface Meeting {
  id: string
  company: string
  date: string
  title: string
  openTasksCount: number
  participants: string[]
}

// Mock data and utilities
const AGENTS = {
  MANAGER: '69235d3623b88b385103da57',                    // Central orchestrator
  SESSION_SYNC: '69222c62c69ec8d9a07826da',
  TASK_COLLECTION: '69222c7423b88b385103d6f5',
  TASK_UPDATE: '69222c87eb6b7de42273d8c1',
  WEEKLY_REPORT: '69222c94c69ec8d9a07826db',
  REVIEW_MEETING: '69222ca57c7d73f7cbe8262c',
  MEETING_AGENDA: '69222cc57c7d73f7cbe8262d',
  ARCHIVE_MANAGEMENT: '69222cd1c69ec8d9a07826dc',
}

const COMPANIES = ['Nvidia', 'AWS', 'Microsoft', 'Google Cloud', 'Internal']
const TEAM_MEMBERS = ['Rob', 'Sarah', 'Jimmy', 'Vedant', 'Reed']

// Call agent API
async function callAgent(agentId: string, message: string) {
  const response = await fetch('/api/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      agent_id: agentId,
    }),
  })
  return response.json()
}

// Dashboard Component
function Dashboard({
  tasks,
  onSync,
  onScanTasks,
  onStartReview,
  onGenerateReport,
  onPrepareAgenda,
  onArchive,
}: {
  tasks: Task[]
  onSync: () => void
  onScanTasks: () => void
  onStartReview: () => void
  onGenerateReport: () => void
  onPrepareAgenda: () => void
  onArchive: () => void
}) {
  const stats = {
    total: tasks.length,
    open: tasks.filter((t) => t.status === 'Open').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
    overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length,
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard label="Total Tasks" value={stats.total} icon={FileText} />
        <StatCard label="Open" value={stats.open} icon={AlertCircle} color="text-blue-500" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="text-yellow-500" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="text-green-500" />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertCircle} color="text-red-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={onSync} className="w-full" variant="outline" size="lg">
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync Now
        </Button>
        <Button onClick={onScanTasks} className="w-full" variant="outline" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Scan for Tasks
        </Button>
        <Button onClick={onStartReview} className="w-full" variant="outline" size="lg">
          <Users className="mr-2 h-4 w-4" />
          Start Review
        </Button>
        <Button onClick={onGenerateReport} className="w-full" variant="outline" size="lg">
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
        <Button onClick={onPrepareAgenda} className="w-full" variant="outline" size="lg">
          <Calendar className="mr-2 h-4 w-4" />
          Prepare Agenda
        </Button>
        <Button onClick={onArchive} className="w-full" variant="outline" size="lg">
          <Archive className="mr-2 h-4 w-4" />
          Archive Completed
        </Button>
      </div>

      <TaskList tasks={tasks.filter((t) => t.status !== 'Archived')} />
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = 'text-slate-500',
}: {
  label: string
  value: number
  icon: any
  color?: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )
}

function TaskList({
  tasks,
  onEditTask,
  editable = false,
}: {
  tasks: Task[]
  onEditTask?: (task: Task) => void
  editable?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500">No tasks</p>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEditTask} editable={editable} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TaskCard({
  task,
  onEdit,
  editable = false,
}: {
  task: Task
  onEdit?: (task: Task) => void
  editable?: boolean
}) {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
      <div className="flex-1">
        <div className="flex items-start gap-3 mb-2">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          <Badge variant="outline">{task.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
          <span>Assigned to: {task.assignedTo}</span>
          {task.company && <Badge variant="secondary">{task.company}</Badge>}
          {task.priority && <Badge variant={task.priority === 'High' ? 'destructive' : 'outline'}>{task.priority}</Badge>}
        </div>
        {task.meeting && <p className="text-xs text-gray-500">Meeting: {task.meeting}</p>}
        {task.externalContact && <p className="text-xs text-gray-500">External: {task.externalContact}</p>}
      </div>
      {editable && onEdit && (
        <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>
          <Edit2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

// Task Editing Component
function TaskEditDialog({
  task,
  open,
  onOpenChange,
  onSave,
}: {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Task) => void
}) {
  const [editTask, setEditTask] = useState<Task | null>(task)

  useEffect(() => {
    setEditTask(task)
  }, [task])

  if (!editTask) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update task details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editTask.title}
              onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={editTask.status} onValueChange={(value: any) => setEditTask({ ...editTask, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Select value={editTask.assignedTo} onValueChange={(value) => setEditTask({ ...editTask, assignedTo: value })}>
              <SelectTrigger id="assignedTo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM_MEMBERS.map((member) => (
                  <SelectItem key={member} value={member}>
                    {member}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Select value={editTask.company || ''} onValueChange={(value) => setEditTask({ ...editTask, company: value })}>
              <SelectTrigger id="company">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {COMPANIES.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="meeting">Meeting</Label>
            <Input
              id="meeting"
              value={editTask.meeting || ''}
              onChange={(e) => setEditTask({ ...editTask, meeting: e.target.value })}
              placeholder="Meeting reference"
            />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={editTask.priority} onValueChange={(value: any) => setEditTask({ ...editTask, priority: value })}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => onSave(editTask)} className="w-full">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Review Meeting Component
function ReviewMeeting({ tasks, onClose }: { tasks: Task[]; onClose: () => void }) {
  const [selectedMember, setSelectedMember] = useState('All')
  const [selectedCompany, setSelectedCompany] = useState('All')
  const [groupBy, setGroupBy] = useState<'Team Member' | 'Company' | 'Priority'>('Team Member')

  const filteredTasks = tasks.filter((task) => {
    const memberMatch = selectedMember === 'All' || task.assignedTo === selectedMember
    const companyMatch = selectedCompany === 'All' || task.company === selectedCompany
    return memberMatch && companyMatch && task.status !== 'Completed'
  })

  const groupedTasks = groupTasks(filteredTasks, groupBy)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Meeting</DialogTitle>
          <DialogDescription>Manage and track tasks during review meetings</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="member-filter">Team Member</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger id="member-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Team Members</SelectItem>
                  {TEAM_MEMBERS.map((member) => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="company-filter">Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger id="company-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Companies</SelectItem>
                  {COMPANIES.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="group-by">Group By</Label>
              <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                <SelectTrigger id="group-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team Member">Team Member</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="Priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
              <div key={groupName}>
                <h3 className="font-semibold text-lg mb-2">{groupName}</h3>
                <div className="space-y-2">
                  {groupTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Weekly Report Component
function WeeklyReport({ tasks, onClose }: { tasks: Task[]; onClose: () => void }) {
  const [selectedCompany, setSelectedCompany] = useState('All')

  const completedThisWeek = tasks.filter((t) => {
    if (selectedCompany !== 'All' && t.company !== selectedCompany) return false
    return t.status === 'Completed'
  }).length

  const overdueCount = tasks.filter((t) => {
    if (selectedCompany !== 'All' && t.company !== selectedCompany) return false
    return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed'
  }).length

  const teamBreakdown: Record<string, number> = {}
  const companyBreakdown: Record<string, number> = {}

  tasks.forEach((task) => {
    if (selectedCompany === 'All' || task.company === selectedCompany) {
      teamBreakdown[task.assignedTo] = (teamBreakdown[task.assignedTo] || 0) + 1
      if (task.company) {
        companyBreakdown[task.company] = (companyBreakdown[task.company] || 0) + 1
      }
    }
  })

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Weekly Report</DialogTitle>
          <DialogDescription>Team activity and task status summary</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label htmlFor="report-company">Filter by Company</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger id="report-company">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Companies</SelectItem>
                {COMPANIES.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Completed This Week</p>
                <p className="text-2xl font-bold">{completedThisWeek}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-red-500">{overdueCount}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="font-semibold mb-3">By Team Member</h3>
            <div className="space-y-2">
              {Object.entries(teamBreakdown).map(([member, count]) => (
                <div key={member} className="flex justify-between items-center p-2 border rounded">
                  <span>{member}</span>
                  <Badge>{count}</Badge>
                </div>
              ))}
            </div>
          </div>

          {Object.keys(companyBreakdown).length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">By Company</h3>
              <div className="space-y-2">
                {Object.entries(companyBreakdown).map(([company, count]) => (
                  <div key={company} className="flex justify-between items-center p-2 border rounded">
                    <span>{company}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button className="flex-1" variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Email Reports
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Meeting Agenda Component
function MeetingAgendaDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [company, setCompany] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [generating, setGenerating] = useState(false)
  const [agendaGenerated, setAgendaGenerated] = useState(false)

  const handleGenerate = async () => {
    if (!company || !meetingDate) return

    setGenerating(true)
    try {
      const result = await callAgent(
        AGENTS.MEETING_AGENDA,
        `Generate agenda for ${company} meeting on ${meetingDate}`
      )
      console.log('Agenda generated:', result)
      setAgendaGenerated(true)
    } catch (error) {
      console.error('Error generating agenda:', error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Meeting Agenda</DialogTitle>
          <DialogDescription>Create an agenda for an upcoming meeting</DialogDescription>
        </DialogHeader>
        {!agendaGenerated ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="agenda-company">Company</Label>
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger id="agenda-company">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="meeting-date">Meeting Date</Label>
              <Input id="meeting-date" type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
            </div>
            <Button onClick={handleGenerate} disabled={!company || !meetingDate || generating} className="w-full">
              {generating ? 'Generating...' : 'Generate Agenda'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agenda Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Agenda for {company} meeting on {meetingDate}
                </p>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Open Tasks from Last Meeting</h4>
                    <p className="text-gray-500">Fetching open tasks...</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">New Tasks from Recent Emails</h4>
                    <p className="text-gray-500">Analyzing recent communications...</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Follow-up Items</h4>
                    <p className="text-gray-500">Compiling follow-ups...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button className="flex-1" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Email Agenda
              </Button>
            </div>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Archive Dialog
function ArchiveDialog({ open, onOpenChange, tasks }: { open: boolean; onOpenChange: (open: boolean) => void; tasks: Task[] }) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  const completedTasks = tasks.filter((t) => t.status === 'Completed')

  const handleToggle = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Archive Completed Tasks</DialogTitle>
          <DialogDescription>Move finished tasks to archive</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Found {completedTasks.length} completed tasks ready for archival
          </p>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {completedTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 border rounded">
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={() => handleToggle(task.id)}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    {task.assignedTo} {task.company && `• ${task.company}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" disabled={selectedTasks.length === 0}>
              <Archive className="mr-2 h-4 w-4" />
              Archive Selected ({selectedTasks.length})
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Scan Tasks Dialog
function ScanTasksDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (tasks: Task[]) => void
}) {
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [selectedNew, setSelectedNew] = useState<string[]>([])

  const handleScan = async () => {
    setScanning(true)
    try {
      const result = await callAgent(AGENTS.TASK_COLLECTION, 'Scan for new tasks from emails and meetings')
      console.log('Scan result:', result)

      const mockScanResult: ScanResult = {
        newTasks: [
          {
            id: '1',
            title: 'GPU allocation review for Q4',
            status: 'Open',
            assignedTo: 'Sarah',
            company: 'Nvidia',
            taskOwnerType: 'Internal Team',
            priority: 'High',
            meeting: 'Nvidia Partnership Review - Nov 15',
            updateLog: [],
            currentStatus: 'Pending from Nvidia stakeholder feedback',
          },
          {
            id: '2',
            title: 'AWS container optimization proposal',
            status: 'Open',
            assignedTo: 'Jimmy',
            company: 'AWS',
            taskOwnerType: 'Internal Team',
            priority: 'Medium',
            meeting: 'AWS Technical Discussion',
            updateLog: [],
            currentStatus: 'In drafting phase',
          },
        ],
        duplicates: [
          { title: 'Infrastructure audit', person: 'Vedant', company: 'AWS' },
        ],
        updatedTasks: [],
        scanTimestamp: new Date().toISOString(),
      }

      setScanResult(mockScanResult)
      setSelectedNew(mockScanResult.newTasks.map((t) => t.id))
    } catch (error) {
      console.error('Scan error:', error)
    } finally {
      setScanning(false)
    }
  }

  const handleConfirm = () => {
    if (scanResult) {
      const tasksToAdd = scanResult.newTasks.filter((t) => selectedNew.includes(t.id))
      onConfirm(tasksToAdd)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scan for New Tasks</DialogTitle>
          <DialogDescription>Scan emails, meetings, and communications for new action items</DialogDescription>
        </DialogHeader>

        {!scanResult ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This will scan your Gmail inbox and sent folder, Google Drive meeting notes, and detect new tasks with
              automatic company and team member tagging.
            </p>
            <Button onClick={handleScan} disabled={scanning} className="w-full" size="lg">
              {scanning ? 'Scanning...' : 'Start Scan'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Found {scanResult.newTasks.length} new tasks, {scanResult.duplicates.length} potential duplicates
              </p>
            </div>

            {scanResult.newTasks.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">New Tasks</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {scanResult.newTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 border rounded">
                      <Checkbox
                        checked={selectedNew.includes(task.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedNew([...selectedNew, task.id])
                          } else {
                            setSelectedNew(selectedNew.filter((id) => id !== task.id))
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.title}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-gray-500">{task.assignedTo}</span>
                          {task.company && <Badge variant="secondary" className="text-xs">{task.company}</Badge>}
                          <Badge variant="outline" className="text-xs">{task.priority}</Badge>
                        </div>
                        {task.meeting && (
                          <p className="text-xs text-gray-500 mt-1">From: {task.meeting}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scanResult.duplicates.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Potential Duplicates</h3>
                <div className="space-y-2">
                  {scanResult.duplicates.map((dup, idx) => (
                    <div key={idx} className="p-3 border rounded bg-yellow-50">
                      <p className="text-sm font-medium">{dup.title}</p>
                      <p className="text-xs text-gray-600">
                        {dup.person} {dup.company && `• ${dup.company}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleConfirm} disabled={selectedNew.length === 0} className="flex-1">
                Add {selectedNew.length} Tasks
              </Button>
              <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Helper function to group tasks
function groupTasks(
  tasks: Task[],
  groupBy: 'Team Member' | 'Company' | 'Priority'
): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {}

  tasks.forEach((task) => {
    let key: string

    if (groupBy === 'Team Member') {
      key = task.assignedTo
    } else if (groupBy === 'Company') {
      key = task.company || 'No Company'
    } else {
      key = task.priority
    }

    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(task)
  })

  return grouped
}

// Connection Status Component
function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [details, setDetails] = useState<any>(null)

  const checkConnection = async () => {
    setStatus('checking')
    try {
      const response = await fetch('/api/test-agent')
      const data = await response.json()
      setDetails(data)
      setStatus(data.success ? 'connected' : 'error')
    } catch (error) {
      setStatus('error')
      setDetails({ error: error instanceof Error ? error.message : String(error) })
    }
  }

  return (
    <>
      <button
        onClick={() => {
          checkConnection()
          setDetailsOpen(true)
        }}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-100"
      >
        <Zap className="h-4 w-4" />
        {status === 'checking' && 'Testing...'}
        {status === 'connected' && 'Connected'}
        {status === 'disconnected' && 'Disconnected'}
        {status === 'error' && 'Connection Error'}
      </button>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notion Connection Status</DialogTitle>
            <DialogDescription>Test connection to Lyzr agents and Notion database</DialogDescription>
          </DialogHeader>
          {details && (
            <div className="space-y-4">
              <div className={`p-3 rounded border ${status === 'connected' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`text-sm font-medium ${status === 'connected' ? 'text-green-900' : 'text-red-900'}`}>
                  {status === 'connected' ? 'Agents Connected Successfully' : 'Connection Failed'}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">API Key Configured:</p>
                  <p className="text-sm text-gray-600">{details.apiKeyConfigured ? 'Yes' : 'No'}</p>
                </div>

                {details.agents && Object.entries(details.agents).map(([agentId, agentData]: [string, any]) => (
                  <div key={agentId} className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">{agentData.agentName}</p>
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <p>Status: <span className={agentData.status === 'connected' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{agentData.status}</span></p>
                      {agentData.statusCode && <p>HTTP Status: {agentData.statusCode}</p>}
                      {agentData.error && <p className="text-red-600">Error: {agentData.error}</p>}
                      {agentData.responsePreview && (
                        <details className="cursor-pointer">
                          <summary>Response Preview</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto max-h-[200px] overflow-y-auto">
                            {agentData.responsePreview}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}

                {details.error && (
                  <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                    <p className="text-sm text-red-900 font-medium">Error:</p>
                    <p className="text-sm text-red-700 mt-1">{details.error}</p>
                    <p className="text-xs text-red-600 mt-2">{details.details}</p>
                  </div>
                )}
              </div>

              <Button onClick={checkConnection} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// Main App Component
export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete Q4 infrastructure audit',
      status: 'In Progress',
      assignedTo: 'Vedant',
      company: 'AWS',
      taskOwnerType: 'Internal Team',
      priority: 'High',
      dueDate: '2024-12-15',
      meeting: 'AWS Technical Review',
      updateLog: [
        {
          timestamp: '2024-11-22T10:30:00Z',
          person: 'Rob',
          changes: 'Status: Open -> In Progress',
        },
      ],
      currentStatus: 'Awaiting AWS team confirmation on infrastructure specifications',
    },
    {
      id: '2',
      title: 'GPU resource allocation documentation',
      status: 'Open',
      assignedTo: 'Sarah',
      company: 'Nvidia',
      taskOwnerType: 'Internal Team',
      priority: 'High',
      dueDate: '2024-11-30',
      meeting: 'Nvidia Partnership Review',
      updateLog: [],
      currentStatus: 'Gathering requirements from engineering team',
    },
    {
      id: '3',
      title: 'Cloud cost optimization analysis',
      status: 'Open',
      assignedTo: 'Jimmy',
      company: 'Internal',
      taskOwnerType: 'Internal Team',
      priority: 'Medium',
      dueDate: '2024-12-08',
      updateLog: [],
      currentStatus: 'In planning phase',
    },
  ])

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [agendaOpen, setAgendaOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState('Synced 30 seconds ago')

  const handleSync = async () => {
    setSyncStatus('Syncing...')
    try {
      const result = await callAgent(AGENTS.SESSION_SYNC, 'Fetch complete current task state from Notion')
      console.log('Sync result:', result)
      setSyncStatus('Synced just now')
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus('Sync failed')
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setEditDialogOpen(true)
  }

  const handleSaveTask = async (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
    setEditDialogOpen(false)

    try {
      const result = await callAgent(
        AGENTS.TASK_UPDATE,
        `Update task: ${updatedTask.title} with status: ${updatedTask.status}, assigned to: ${updatedTask.assignedTo}, company: ${updatedTask.company}`
      )
      console.log('Update result:', result)
    } catch (error) {
      console.error('Update error:', error)
    }
  }

  const handleScanComplete = (newTasks: Task[]) => {
    setTasks([...tasks, ...newTasks])
  }

  const handleArchive = async (taskIds: string[]) => {
    const archivedTasks = tasks.map((t) =>
      taskIds.includes(t.id) ? { ...t, status: 'Archived' as const } : t
    )
    setTasks(archivedTasks)

    try {
      const result = await callAgent(
        AGENTS.ARCHIVE_MANAGEMENT,
        `Archive ${taskIds.length} completed tasks`
      )
      console.log('Archive result:', result)
    } catch (error) {
      console.error('Archive error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Task Management System</h1>
            <p className="text-gray-600 mt-2">{syncStatus}</p>
          </div>
          <div className="flex gap-3">
            <ConnectionStatus />
            <Button onClick={handleSync} variant="outline" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync
            </Button>
          </div>
        </div>

        <Dashboard
          tasks={tasks}
          onSync={handleSync}
          onScanTasks={() => setScanOpen(true)}
          onStartReview={() => setReviewOpen(true)}
          onGenerateReport={() => setReportOpen(true)}
          onPrepareAgenda={() => setAgendaOpen(true)}
          onArchive={() => setArchiveOpen(true)}
        />

        <TaskEditDialog
          task={editingTask}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSaveTask}
        />

        {reviewOpen && <ReviewMeeting tasks={tasks} onClose={() => setReviewOpen(false)} />}
        {reportOpen && <WeeklyReport tasks={tasks} onClose={() => setReportOpen(false)} />}
        <MeetingAgendaDialog open={agendaOpen} onOpenChange={setAgendaOpen} />
        <ArchiveDialog
          open={archiveOpen}
          onOpenChange={setArchiveOpen}
          tasks={tasks}
        />
        <ScanTasksDialog open={scanOpen} onOpenChange={setScanOpen} onConfirm={handleScanComplete} />
      </div>
    </div>
  )
}
