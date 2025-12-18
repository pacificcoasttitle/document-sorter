"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GuidanceEntry {
  id: string
  topic: string
  subtopic: string
  scenario: string
  riskLevel: string
}

export default function ConfirmPage() {
  const [entries] = useState<GuidanceEntry[]>([
    {
      id: "1",
      topic: "Bankruptcy",
      subtopic: "Chapter 7 Filing",
      scenario:
        "Client has unsecured debt exceeding $50,000 and limited income. All attempts at debt negotiation have failed.",
      riskLevel: "medium",
    },
    {
      id: "2",
      topic: "Probate",
      subtopic: "Estate Administration",
      scenario:
        "Deceased left a valid will with multiple beneficiaries. Estate value exceeds $150,000 requiring formal probate process.",
      riskLevel: "low",
    },
  ])

  const today = new Date().toISOString().split("T")[0]

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

  const truncateText = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Confirm & Save</h1>
          <p className="text-base text-muted-foreground">Review your entries before saving</p>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4 mb-8">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{entry.topic}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(entry.riskLevel)}`}
                    >
                      {entry.riskLevel.charAt(0).toUpperCase() + entry.riskLevel.slice(1)} Risk
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{entry.subtopic}</p>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{truncateText(entry.scenario)}</p>
            </div>
          ))}
        </div>

        {/* Owner and Last Reviewed Fields */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owner */}
            <div>
              <Label htmlFor="owner" className="text-sm font-medium mb-2 block">
                Owner
              </Label>
              <Input id="owner" defaultValue="Current User" className="bg-background" />
            </div>

            {/* Last Reviewed */}
            <div>
              <Label htmlFor="lastReviewed" className="text-sm font-medium mb-2 block">
                Last Reviewed
              </Label>
              <Input id="lastReviewed" type="date" defaultValue={today} className="bg-background" />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4 flex gap-4 justify-between">
          <Button variant="outline" className="h-11 px-8 text-base bg-transparent">
            Back
          </Button>
          <Button className="h-11 px-8 text-base font-semibold bg-green-600 hover:bg-green-700 text-white">
            Approve & Save
          </Button>
        </div>
      </div>
    </div>
  )
}
