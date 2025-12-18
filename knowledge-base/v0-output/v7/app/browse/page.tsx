"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Search, Eye, Pencil, X } from "lucide-react"

interface KnowledgeEntry {
  id: string
  topic: string
  subtopic: string
  scenario: string
  requiredDocuments: string
  decisionSteps: string
  riskLevel: string
  exceptionLanguage: string
  sourceReference: string
  lastReviewed: string
}

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [topicFilter, setTopicFilter] = useState("all")
  const [riskFilter, setRiskFilter] = useState("all")
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null)

  // Sample data
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
      lastReviewed: "2024-01-15",
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
      lastReviewed: "2024-01-20",
    },
    {
      id: "3",
      topic: "Trusts",
      subtopic: "Revocable Living Trust Creation",
      scenario:
        "Client wishes to avoid probate and maintain control of assets during lifetime. Estate includes real property and investment accounts totaling $500,000.",
      requiredDocuments: "Property deeds, Account statements, Beneficiary designations, Trust agreement template",
      decisionSteps:
        "1. Draft trust agreement\n2. Execute and notarize document\n3. Transfer property titles to trust\n4. Update beneficiary designations\n5. Fund trust accounts",
      riskLevel: "low",
      exceptionLanguage:
        "Irrevocable trusts offer different tax benefits but cannot be modified. Complex estates may require professional trustee.",
      sourceReference: "Probate Code § 15000-15004",
      lastReviewed: "2024-01-18",
    },
  ])

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
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

  const truncateText = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  // Filter entries based on search and filters
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === "" ||
      entry.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.subtopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.scenario.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTopic = topicFilter === "all" || entry.topic === topicFilter
    const matchesRisk = riskFilter === "all" || entry.riskLevel === riskFilter

    return matchesSearch && matchesTopic && matchesRisk
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Knowledge Base</h1>
            <p className="text-base text-muted-foreground">Browse and manage your guidance entries</p>
          </div>
          <Button className="h-11 px-6 font-semibold flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload New Document
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 text-base"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex gap-4">
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="w-[200px] h-11">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                <SelectItem value="Bankruptcy">Bankruptcy</SelectItem>
                <SelectItem value="Probate">Probate</SelectItem>
                <SelectItem value="Trusts">Trusts</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[200px] h-11">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {filteredEntries.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No entries found</h3>
            <p className="text-muted-foreground mb-6">Upload a document to get started building your knowledge base.</p>
            <Button className="h-11 px-6 font-semibold flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload New Document
            </Button>
          </div>
        ) : (
          // Results Table
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Topic</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Subtopic</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Scenario</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Risk Level</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Last Reviewed</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/10"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{entry.topic}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{entry.subtopic}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-md">
                        {truncateText(entry.scenario)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(entry.riskLevel)}`}
                        >
                          {entry.riskLevel.charAt(0).toUpperCase() + entry.riskLevel.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(entry.lastReviewed).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedEntry(entry)}
                            className="h-8 px-3 flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 flex items-center gap-1.5 bg-transparent"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="bg-card border border-border rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Entry Details</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedEntry.topic} • {selectedEntry.subtopic}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(null)} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Topic and Risk */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  {selectedEntry.topic} - {selectedEntry.subtopic}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(selectedEntry.riskLevel)}`}
                >
                  {selectedEntry.riskLevel.charAt(0).toUpperCase() + selectedEntry.riskLevel.slice(1)} Risk
                </span>
              </div>

              {/* Scenario */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Scenario</h3>
                <p className="text-sm text-foreground leading-relaxed">{selectedEntry.scenario}</p>
              </div>

              {/* Required Documents */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Required Documents</h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {selectedEntry.requiredDocuments}
                </p>
              </div>

              {/* Decision Steps */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Decision Steps</h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {selectedEntry.decisionSteps}
                </p>
              </div>

              {/* Exception Language */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Exception Language</h3>
                <p className="text-sm text-foreground leading-relaxed">{selectedEntry.exceptionLanguage}</p>
              </div>

              {/* Source Reference */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Source Reference</h3>
                <p className="text-sm text-muted-foreground font-mono bg-muted px-3 py-2 rounded">
                  {selectedEntry.sourceReference}
                </p>
              </div>

              {/* Last Reviewed */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Last Reviewed</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedEntry.lastReviewed).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedEntry(null)} className="h-10 px-6">
                Close
              </Button>
              <Button className="h-10 px-6 font-semibold flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Edit Entry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
