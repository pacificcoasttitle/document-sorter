"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface KnowledgeEntry {
  id: string
  topic: string
  subtopic: string
  scenario: string
  requiredDocuments: string
  decisionSteps: string
  riskLevel: "low" | "medium" | "high"
  exceptionLanguage: string
  sourceReference: string
  owner: string
  lastReviewed: string
}

interface ActivityLogItem {
  id: string
  type: "upload" | "created" | "updated" | "deleted"
  description: string
  user: string
  timestamp: string
  entryId?: string
  details?: string
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [topicFilter, setTopicFilter] = useState("all")
  const [subtopicFilter, setSubtopicFilter] = useState("all")
  const [riskFilter, setRiskFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null)
  const [activityLogOpen, setActivityLogOpen] = useState(true)
  const [activityFilter, setActivityFilter] = useState("all")
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)

  // Sample data - replace with actual data from API/database
  const [entries] = useState<KnowledgeEntry[]>([
    {
      id: "1",
      topic: "Bankruptcy",
      subtopic: "Chapter 7 Filing",
      scenario:
        "Client has unsecured debt exceeding $50,000 and limited income. All attempts at debt negotiation have failed. Client qualifies for Chapter 7 based on means test.",
      requiredDocuments:
        "Pay stubs (6 months), Tax returns (2 years), List of creditors, Asset inventory, Bank statements",
      decisionSteps:
        "1. Conduct means test\n2. Review all debts and assets\n3. Determine discharge eligibility\n4. File petition with court\n5. Attend 341 meeting",
      riskLevel: "medium",
      exceptionLanguage:
        "If client has significant assets, consider Chapter 13 instead. Recent income increases may affect eligibility.",
      sourceReference: "11 U.S.C. § 707 - Bankruptcy Code",
      owner: "Sarah Johnson",
      lastReviewed: "2025-12-15",
    },
    {
      id: "2",
      topic: "Probate",
      subtopic: "Estate Administration",
      scenario:
        "Deceased left a valid will with multiple beneficiaries. Estate value exceeds $150,000 requiring formal probate process. No disputes among heirs.",
      requiredDocuments:
        "Original will, Death certificate, Estate inventory, Creditor notices, Tax identification documents",
      decisionSteps:
        "1. File petition for probate\n2. Notify all beneficiaries and creditors\n3. Inventory all assets\n4. Pay outstanding debts\n5. Distribute remaining assets",
      riskLevel: "low",
      exceptionLanguage:
        "Small estates under $150,000 may qualify for simplified procedures. Contested wills require separate litigation.",
      sourceReference: "State Probate Code § 8400-8465",
      owner: "Michael Chen",
      lastReviewed: "2025-12-10",
    },
    {
      id: "3",
      topic: "Trusts",
      subtopic: "Revocable Living Trust",
      scenario:
        "Client wishes to avoid probate and maintain control of assets during lifetime. Estate includes real property and investment accounts totaling $500,000.",
      requiredDocuments: "Property deeds, Account statements, Beneficiary designations, Trust agreement template",
      decisionSteps:
        "1. Draft trust agreement\n2. Execute and notarize document\n3. Transfer property titles to trust\n4. Update beneficiary designations\n5. Fund trust accounts",
      riskLevel: "low",
      exceptionLanguage:
        "Irrevocable trusts offer different tax benefits but cannot be modified. Complex estates may require professional trustee.",
      sourceReference: "Probate Code § 15000-15004",
      owner: "Emily Rodriguez",
      lastReviewed: "2025-12-12",
    },
    {
      id: "4",
      topic: "Bankruptcy",
      subtopic: "Chapter 13 Repayment Plan",
      scenario:
        "Client has regular income but cannot meet current debt obligations. Desires to keep home despite mortgage arrears. Total debt includes secured and unsecured obligations.",
      requiredDocuments:
        "Income verification, Payment history, Mortgage statements, List of all debts, Proposed budget, Tax returns",
      decisionSteps:
        "1. Calculate disposable income\n2. Propose repayment plan (3-5 years)\n3. File petition and plan\n4. Attend confirmation hearing\n5. Make trustee payments",
      riskLevel: "high",
      exceptionLanguage:
        "Plan must pay priority debts in full. If income drops significantly, may need to convert to Chapter 7. Missed payments can result in dismissal.",
      sourceReference: "11 U.S.C. § 1325 - Chapter 13 Plans",
      owner: "David Martinez",
      lastReviewed: "2025-12-08",
    },
    {
      id: "5",
      topic: "Probate",
      subtopic: "Will Contest",
      scenario:
        "Beneficiary challenges validity of will based on allegations of undue influence. Decedent was elderly and in poor health when will was executed. Significant changes favor one beneficiary.",
      requiredDocuments:
        "Original will, Prior wills, Medical records, Witness statements, Financial records, Communication evidence",
      decisionSteps:
        "1. File objection to probate\n2. Conduct discovery\n3. Depose witnesses\n4. Obtain expert testimony\n5. Proceed to trial if not settled",
      riskLevel: "high",
      exceptionLanguage:
        "Contest must be filed within statutory deadline. Strong evidence of capacity and independent judgment required to uphold will. Consider mediation to avoid costly litigation.",
      sourceReference: "Probate Code § 8250-8270",
      owner: "Jennifer Lee",
      lastReviewed: "2025-12-05",
    },
    {
      id: "6",
      topic: "Trusts",
      subtopic: "Special Needs Trust",
      scenario:
        "Disabled beneficiary receives government benefits (SSI/Medicaid). Family wants to provide additional support without jeopardizing eligibility. Trust must comply with federal and state requirements.",
      requiredDocuments:
        "Disability documentation, Benefits statements, Trust agreement, Letter of intent, Asset inventory",
      decisionSteps:
        "1. Draft compliant trust document\n2. Name appropriate trustee\n3. Fund trust properly\n4. Notify benefit agencies\n5. Establish distribution guidelines",
      riskLevel: "medium",
      exceptionLanguage:
        "First-party trusts (funded with beneficiary's assets) require payback provision. Third-party trusts have more flexibility. Trustee must understand benefit rules to avoid disqualification.",
      sourceReference: "42 U.S.C. § 1396p(d)(4) - Special Needs Trusts",
      owner: "Amanda Thompson",
      lastReviewed: "2025-12-18",
    },
  ])

  // Get unique subtopics based on selected topic
  const availableSubtopics = useMemo(() => {
    if (topicFilter === "all") return []
    return [...new Set(entries.filter((e) => e.topic === topicFilter).map((e) => e.subtopic))]
  }, [topicFilter, entries])

  // Filter and sort entries
  const filteredAndSortedEntries = useMemo(() => {
    const filtered = entries.filter((entry) => {
      const matchesSearch =
        searchQuery === "" ||
        entry.scenario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.subtopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.requiredDocuments.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.decisionSteps.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTopic = topicFilter === "all" || entry.topic === topicFilter
      const matchesSubtopic = subtopicFilter === "all" || entry.subtopic === subtopicFilter
      const matchesRisk = riskFilter === "all" || entry.riskLevel === riskFilter

      return matchesSearch && matchesTopic && matchesSubtopic && matchesRisk
    })

    // Sort entries
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.lastReviewed).getTime() - new Date(a.lastReviewed).getTime()
        case "oldest":
          return new Date(a.lastReviewed).getTime() - new Date(b.lastReviewed).getTime()
        case "last-reviewed":
          return new Date(b.lastReviewed).getTime() - new Date(a.lastReviewed).getTime()
        case "topic-az":
          return a.topic.localeCompare(b.topic) || a.subtopic.localeCompare(b.subtopic)
        default:
          return 0
      }
    })

    return filtered
  }, [entries, searchQuery, topicFilter, subtopicFilter, riskFilter, sortBy])

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
    switch (riskLevel) {
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
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  const [activities] = useState<ActivityLogItem[]>([
    {
      id: "1",
      type: "upload",
      description: "Document uploaded: CA_Probate_Guide.pdf",
      user: "Sarah Johnson",
      timestamp: "2025-12-18T14:34:00",
      details: "Extracted 3 new guidance entries from uploaded document",
    },
    {
      id: "2",
      type: "updated",
      description: 'Updated entry: "Chapter 7 Filing"',
      user: "Michael Chen",
      timestamp: "2025-12-18T10:15:00",
      entryId: "1",
      details: "Modified required documents and decision steps",
    },
    {
      id: "3",
      type: "created",
      description: 'New entry created: "Special Needs Trust"',
      user: "Amanda Thompson",
      timestamp: "2025-12-18T09:20:00",
      entryId: "6",
      details: "Manually added entry for Trusts topic",
    },
    {
      id: "4",
      type: "upload",
      description: "Document uploaded: Bankruptcy_Chapter13_Guide.docx",
      user: "David Martinez",
      timestamp: "2025-12-17T16:45:00",
      details: "Extracted 2 new guidance entries from uploaded document",
    },
    {
      id: "5",
      type: "updated",
      description: 'Updated entry: "Will Contest"',
      user: "Jennifer Lee",
      timestamp: "2025-12-17T14:22:00",
      entryId: "5",
      details: "Updated exception language and source references",
    },
    {
      id: "6",
      type: "deleted",
      description: 'Deleted entry: "Outdated Tax Guidance"',
      user: "Emily Rodriguez",
      timestamp: "2025-12-17T11:30:00",
      details: "Removed obsolete guidance that no longer applies",
    },
    {
      id: "7",
      type: "created",
      description: 'New entry created: "Estate Administration"',
      user: "Michael Chen",
      timestamp: "2025-12-16T15:10:00",
      entryId: "2",
      details: "Manually added entry for Probate topic",
    },
    {
      id: "8",
      type: "upload",
      description: "Document uploaded: Trust_Guidelines_2025.txt",
      user: "Sarah Johnson",
      timestamp: "2025-12-15T13:05:00",
      details: "Extracted 1 new guidance entry from uploaded document",
    },
  ])

  const filteredActivities = useMemo(() => {
    if (activityFilter === "all") return activities
    return activities.filter((activity) => {
      if (activityFilter === "uploads") return activity.type === "upload"
      if (activityFilter === "edits") return activity.type === "updated"
      if (activityFilter === "deletions") return activity.type === "deleted"
      return true
    })
  }, [activities, activityFilter])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <FileUp className="w-4 h-4" />
      case "created":
        return <FilePlus className="w-4 h-4" />
      case "updated":
        return <FilePenLine className="w-4 h-4" />
      case "deleted":
        return <Trash2 className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getActivityIconColor = (type: string) => {
    switch (type) {
      case "upload":
        return "bg-blue-100 text-blue-700"
      case "created":
        return "bg-green-100 text-green-700"
      case "updated":
        return "bg-yellow-100 text-yellow-700"
      case "deleted":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
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

  return (
    <div className="min-h-screen bg-background flex">
      <div className={`flex-1 transition-all duration-300 ${activityLogOpen ? "mr-80" : "mr-0"}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-8 gap-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Tessa Knowledge Tool</h1>
              <p className="text-base text-muted-foreground">Your underwriting knowledge base</p>
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
            <Select
              value={topicFilter}
              onValueChange={(value) => {
                setTopicFilter(value)
                setSubtopicFilter("all")
              }}
            >
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                <SelectItem value="Bankruptcy">Bankruptcy</SelectItem>
                <SelectItem value="Probate">Probate</SelectItem>
                <SelectItem value="Trusts">Trusts</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subtopicFilter} onValueChange={setSubtopicFilter} disabled={topicFilter === "all"}>
              <SelectTrigger className="w-[200px] h-10">
                <SelectValue placeholder="Subtopic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subtopics</SelectItem>
                {availableSubtopics.map((subtopic) => (
                  <SelectItem key={subtopic} value={subtopic}>
                    {subtopic}
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
                <SelectItem value="last-reviewed">Last Reviewed</SelectItem>
                <SelectItem value="topic-az">Topic A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
            <span>
              Showing {filteredAndSortedEntries.length} {filteredAndSortedEntries.length === 1 ? "entry" : "entries"}
            </span>
            <span>•</span>
            <span>Last updated: Dec 18, 2025</span>
          </div>

          {/* Results Section */}
          {filteredAndSortedEntries.length === 0 ? (
            // Empty State
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
            // Card Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAndSortedEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left group"
                >
                  {/* Topic Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${getTopicBadgeColor(entry.topic)}`}
                    >
                      {entry.topic}
                    </span>
                  </div>

                  {/* Subtopic Title */}
                  <h3 className="text-lg font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                    {entry.subtopic}
                  </h3>

                  {/* Scenario Preview */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{truncateText(entry.scenario)}</p>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(entry.riskLevel)}`}
                    >
                      {entry.riskLevel.charAt(0).toUpperCase() + entry.riskLevel.slice(1)} Risk
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.lastReviewed).toLocaleDateString("en-US", {
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

      <div
        className={`fixed right-0 top-0 h-full w-80 bg-muted/30 border-l border-border shadow-lg transition-transform duration-300 z-40 ${
          activityLogOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Activity Log Header */}
          <div className="bg-card border-b border-border px-6 py-5">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-lg font-bold text-foreground">Activity Log</h2>
              <Button variant="ghost" size="sm" onClick={() => setActivityLogOpen(false)} className="h-8 w-8 p-0 -mr-2">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Recent changes to your knowledge base</p>

            {/* Activity Filter */}
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

          {/* Activity List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {filteredActivities.length === 0 ? (
              // Empty state
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
              // Timeline
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                {/* Activity items */}
                <div className="space-y-4">
                  {filteredActivities.map((activity, index) => (
                    <div key={activity.id} className="relative pl-10">
                      {/* Icon */}
                      <div
                        className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityIconColor(activity.type)} border-2 border-background`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>

                      {/* Content */}
                      <button
                        onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                        className="w-full text-left bg-card border border-border rounded-lg p-3 hover:border-primary/50 hover:shadow-sm transition-all duration-200"
                      >
                        <p className="text-sm font-medium text-foreground mb-1 leading-snug">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mb-1">by {activity.user}</p>
                        <p className="text-xs text-muted-foreground">{formatActivityTimestamp(activity.timestamp)}</p>

                        {/* Expanded details */}
                        {expandedActivity === activity.id && activity.details && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground leading-relaxed">{activity.details}</p>
                          </div>
                        )}
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
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border px-8 py-6 flex items-start justify-between z-10">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${getTopicBadgeColor(selectedEntry.topic)}`}
                  >
                    {selectedEntry.topic}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(selectedEntry.riskLevel)}`}
                  >
                    {selectedEntry.riskLevel.charAt(0).toUpperCase() + selectedEntry.riskLevel.slice(1)} Risk
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground leading-tight">{selectedEntry.subtopic}</h2>
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

            {/* Modal Content */}
            <div className="px-8 py-8 space-y-8">
              {/* Scenario */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Scenario</h3>
                <p className="text-base text-foreground leading-relaxed">{selectedEntry.scenario}</p>
              </div>

              {/* Required Documents */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  Required Documents
                </h3>
                <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
                  {selectedEntry.requiredDocuments}
                </p>
              </div>

              {/* Decision Steps */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Decision Steps</h3>
                <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
                  {selectedEntry.decisionSteps}
                </p>
              </div>

              {/* Exception Language */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  Exception Language
                </h3>
                <p className="text-base text-foreground leading-relaxed">{selectedEntry.exceptionLanguage}</p>
              </div>

              {/* Source Reference */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Source Reference</h3>
                <p className="text-sm text-muted-foreground font-mono bg-muted px-4 py-3 rounded-md">
                  {selectedEntry.sourceReference}
                </p>
              </div>

              {/* Metadata */}
              <div className="pt-6 border-t border-border grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">Owner</h3>
                  <p className="text-base text-muted-foreground">{selectedEntry.owner}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">Last Reviewed</h3>
                  <p className="text-base text-muted-foreground">
                    {new Date(selectedEntry.lastReviewed).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border px-8 py-5 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedEntry(null)} className="h-10 px-5">
                Close
              </Button>
              <Button className="h-10 px-5 font-semibold">Edit Entry</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
