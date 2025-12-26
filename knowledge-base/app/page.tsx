"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import {
  Upload,
  Search,
  FileText,
  X,
  Clock,
  FileUp,
  FilePlus,
  FilePenLine,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Topic, Entry } from "@/lib/types"

interface EntryWithNames extends Entry {
  topic_name: string
  subtopic_name: string
}

interface ActivityLogItem {
  id: number
  action: string
  entity_type: string
  entity_id: number | null
  details: string
  user_name: string
  created_at: string
}

export default function HomePage() {
  const { currentWorkspace } = useWorkspace()
  
  const [entries, setEntries] = useState<EntryWithNames[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [activities, setActivities] = useState<ActivityLogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [topicFilter, setTopicFilter] = useState("all")
  const [riskFilter, setRiskFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedEntry, setSelectedEntry] = useState<EntryWithNames | null>(null)
  const [activityLogOpen, setActivityLogOpen] = useState(true)
  const [activityFilter, setActivityFilter] = useState("all")
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)

  // Define all fetch functions with useCallback BEFORE using them in useEffect
  const fetchTopics = useCallback(async () => {
    if (!currentWorkspace) return
    try {
      const params = new URLSearchParams()
      params.append('workspace_id', String(currentWorkspace.id))
      
      const response = await fetch(`/api/topics?${params}`)
      const data = await response.json()
      setTopics(data.topics || [])
    } catch (error) {
      console.error('Failed to fetch topics:', error)
    }
  }, [currentWorkspace])

  const fetchEntries = useCallback(async () => {
    if (!currentWorkspace) return
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('workspace_id', String(currentWorkspace.id))
      if (topicFilter !== 'all') params.append('topic', topicFilter)
      if (riskFilter !== 'all') params.append('risk_level', riskFilter.charAt(0).toUpperCase() + riskFilter.slice(1))
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/entries?${params}`)
      const data = await response.json()
      setEntries(data.entries || [])
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentWorkspace, topicFilter, riskFilter, searchQuery])

  const fetchActivities = useCallback(async (filter?: string) => {
    if (!currentWorkspace) return
    setIsLoadingActivities(true)
    try {
      const params = new URLSearchParams()
      params.append('workspace_id', String(currentWorkspace.id))
      if (filter && filter !== 'all') {
        const filterMap: Record<string, string> = {
          'uploads': 'Uploads',
          'edits': 'Edits',
          'deletions': 'Deletions',
          'created': 'Created'
        }
        params.append('filter', filterMap[filter] || 'All Activity')
      }
      
      const response = await fetch(`/api/activity?${params}`)
      const data = await response.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setIsLoadingActivities(false)
    }
  }, [currentWorkspace])

  // Fetch entries and topics on load and when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      fetchTopics()
      fetchEntries()
      fetchActivities()
    }
  }, [currentWorkspace, fetchTopics, fetchEntries, fetchActivities])

  // Refetch entries when filters change
  useEffect(() => {
    if (currentWorkspace) {
      fetchEntries()
    }
  }, [fetchEntries, currentWorkspace])

  // Refetch activities when filter changes
  useEffect(() => {
    if (currentWorkspace) {
      fetchActivities(activityFilter)
    }
  }, [activityFilter, fetchActivities, currentWorkspace])

  // Sort entries client-side
  const sortedEntries = useMemo(() => {
    const sorted = [...entries]
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.last_reviewed || '').getTime() - new Date(a.last_reviewed || '').getTime()
        case "oldest":
          return new Date(a.last_reviewed || '').getTime() - new Date(b.last_reviewed || '').getTime()
        case "topic-az":
          return (a.topic_name || '').localeCompare(b.topic_name || '') || (a.subtopic_name || '').localeCompare(b.subtopic_name || '')
        default:
          return 0
      }
    })
    return sorted
  }, [entries, sortBy])

  const getTopicBadgeColor = (topic: string) => {
    switch (topic) {
      case "Bankruptcy":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Probate":
        return "bg-green-100 text-green-700 border-green-200"
      case "Trusts":
        return "bg-purple-100 text-purple-700 border-purple-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const truncateText = (text: string, maxLength = 150) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  const getActivityIcon = (action: string) => {
    if (action.includes('upload')) return <FileUp className="w-4 h-4" />
    if (action.includes('created') || action.includes('added')) return <FilePlus className="w-4 h-4" />
    if (action.includes('updated')) return <FilePenLine className="w-4 h-4" />
    if (action.includes('deleted')) return <Trash2 className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const getActivityIconColor = (action: string) => {
    if (action.includes('upload')) return "bg-blue-100 text-blue-700"
    if (action.includes('created') || action.includes('added')) return "bg-green-100 text-green-700"
    if (action.includes('updated')) return "bg-yellow-100 text-yellow-700"
    if (action.includes('deleted')) return "bg-red-100 text-red-700"
    return "bg-gray-100 text-gray-700"
  }

  const formatActivityTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return `Today at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`
    } else if (diffInHours < 48) {
      return `Yesterday at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    }
  }

  // Get workspace-specific title and subtitle
  const getWorkspaceTitle = () => {
    if (!currentWorkspace) return { title: 'Knowledge Base', subtitle: 'Your knowledge repository' }
    
    switch (currentWorkspace.slug) {
      case 'underwriting':
        return { 
          title: 'Underwriting Knowledge Base', 
          subtitle: 'Title insurance underwriting guidance and procedures' 
        }
      case 'operations':
        return { 
          title: 'Operations SOPs', 
          subtitle: 'Standard operating procedures and department policies' 
        }
      default:
        return { 
          title: `${currentWorkspace.name} Knowledge Base`, 
          subtitle: currentWorkspace.description || 'Your knowledge repository' 
        }
    }
  }

  const { title, subtitle } = getWorkspaceTitle()

  return (
    <div className="min-h-screen bg-background flex">
      <div className={`flex-1 transition-all duration-300 ${activityLogOpen ? "mr-80" : "mr-0"}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-8 gap-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">{title}</h1>
              <p className="text-base text-muted-foreground">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setActivityLogOpen(!activityLogOpen)}
                className="h-11 px-4 font-semibold flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Activity
                {activityLogOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
              <Link href="/upload">
                <Button className="h-11 px-6 font-semibold flex items-center gap-2 whitespace-nowrap">
                  <Upload className="w-4 h-4" />
                  Upload New Document
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search scenarios, documents, guidance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.name}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="topic-az">Topic A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
            <span>
              Showing {sortedEntries.length} {sortedEntries.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {/* Results Section */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Spinner className="w-8 h-8 mb-4" />
              <p className="text-muted-foreground">Loading entries...</p>
            </div>
          ) : sortedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-5">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Your knowledge base is empty</h3>
              <p className="text-base text-muted-foreground mb-6 max-w-md">
                Upload your first document to get started building your knowledge base
              </p>
              <Link href="/upload">
                <Button className="h-11 px-6 font-semibold flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className="mb-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${getTopicBadgeColor(entry.topic_name)}`}
                    >
                      {entry.topic_name}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                    {entry.subtopic_name}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{truncateText(entry.scenario)}</p>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(entry.risk_level)}`}
                    >
                      {entry.risk_level} Risk
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {entry.last_reviewed && new Date(entry.last_reviewed).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Log Sidebar */}
      <div
        className={`fixed right-0 top-14 h-[calc(100%-3.5rem)] w-80 bg-muted/30 border-l border-border shadow-lg transition-transform duration-300 z-40 ${
          activityLogOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="bg-card border-b border-border px-6 py-5">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-lg font-bold text-foreground">Activity Log</h2>
              <Button variant="ghost" size="sm" onClick={() => setActivityLogOpen(false)} className="h-8 w-8 p-0 -mr-2">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Recent changes to your knowledge base</p>

            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue placeholder="Filter activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="uploads">Uploads</SelectItem>
                <SelectItem value="edits">Edits</SelectItem>
                <SelectItem value="deletions">Deletions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoadingActivities ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner className="w-6 h-6 mb-2" />
                <p className="text-sm text-muted-foreground">Loading activity...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No activity yet</p>
                <p className="text-xs text-muted-foreground">
                  Activity will appear here as you upload and edit documents
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="relative pl-10">
                      <div
                        className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityIconColor(activity.action)} border-2 border-background`}
                      >
                        {getActivityIcon(activity.action)}
                      </div>

                      <button
                        onClick={() => setExpandedActivity(expandedActivity === String(activity.id) ? null : String(activity.id))}
                        className="w-full text-left bg-card border border-border rounded-lg p-3 hover:border-primary/50 hover:shadow-sm transition-all duration-200"
                      >
                        <p className="text-sm font-medium text-foreground mb-1 leading-snug">{activity.details}</p>
                        <p className="text-xs text-muted-foreground mb-1">by {activity.user_name}</p>
                        <p className="text-xs text-muted-foreground">{formatActivityTimestamp(activity.created_at)}</p>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-end p-0 z-50 animate-in fade-in duration-200"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="bg-card border-l border-border shadow-2xl w-full max-w-2xl h-full overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-border px-8 py-6 flex items-start justify-between z-10">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${getTopicBadgeColor(selectedEntry.topic_name)}`}
                  >
                    {selectedEntry.topic_name}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(selectedEntry.risk_level)}`}
                  >
                    {selectedEntry.risk_level} Risk
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground leading-tight">{selectedEntry.subtopic_name}</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEntry(null)}
                className="h-9 w-9 p-0 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="px-8 py-8 space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Scenario</h3>
                <p className="text-base text-foreground leading-relaxed">{selectedEntry.scenario}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  Required Documents
                </h3>
                <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
                  {selectedEntry.required_documents}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Decision Steps</h3>
                <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
                  {selectedEntry.decision_steps}
                </p>
              </div>

              {selectedEntry.exception_language && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                    Exception Language
                  </h3>
                  <p className="text-base text-foreground leading-relaxed">{selectedEntry.exception_language}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Source Reference</h3>
                <p className="text-sm text-muted-foreground font-mono bg-muted px-4 py-3 rounded-md">
                  {selectedEntry.source_reference}
                </p>
              </div>

              <div className="pt-6 border-t border-border grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">Owner</h3>
                  <p className="text-base text-muted-foreground">{selectedEntry.owner}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">Last Reviewed</h3>
                  <p className="text-base text-muted-foreground">
                    {selectedEntry.last_reviewed && new Date(selectedEntry.last_reviewed).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border px-8 py-5 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedEntry(null)} className="h-10 px-5">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
