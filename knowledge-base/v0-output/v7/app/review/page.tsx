"use client"

import { useState } from "react"
import { Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GuidanceEntry {
  id: string
  topic: string
  subtopic: string
  scenario: string
  requiredDocuments: string
  decisionSteps: string
  riskLevel: string
  exceptionLanguage: string
  sourceReference: string
}

export default function ReviewPage() {
  const [entries, setEntries] = useState<GuidanceEntry[]>([
    {
      id: "1",
      topic: "bankruptcy",
      subtopic: "Chapter 7 Filing",
      scenario:
        "Client has unsecured debt exceeding $50,000 and limited income. All attempts at debt negotiation have failed.",
      requiredDocuments: "Pay stubs (6 months), Tax returns (2 years), List of all creditors, Asset inventory",
      decisionSteps:
        "1. Verify means test eligibility\n2. Complete credit counseling requirement\n3. Gather all financial documentation\n4. File petition with bankruptcy court",
      riskLevel: "medium",
      exceptionLanguage:
        "If client has received discharge in past 8 years, Chapter 7 may not be available. Consider Chapter 13 instead.",
      sourceReference: "Document: bankruptcy_guidelines_2024.pdf, Page 12-15",
    },
  ])

  const addEntry = () => {
    const newEntry: GuidanceEntry = {
      id: Date.now().toString(),
      topic: "",
      subtopic: "",
      scenario: "",
      requiredDocuments: "",
      decisionSteps: "",
      riskLevel: "",
      exceptionLanguage: "",
      sourceReference: "",
    }
    setEntries([...entries, newEntry])
  }

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id))
  }

  const updateEntry = (id: string, field: keyof GuidanceEntry, value: string) => {
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Review Extracted Guidance</h1>
          <p className="text-base text-muted-foreground">Edit any fields before saving to your knowledge base</p>
        </div>

        {/* Entry Cards */}
        <div className="space-y-6 mb-6">
          {entries.map((entry) => (
            <div key={entry.id} className="relative bg-card border border-border rounded-lg p-6 shadow-sm">
              {/* Delete Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteEntry(entry.id)}
                className="absolute top-4 right-4 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-12">
                {/* Topic */}
                <div>
                  <Label htmlFor={`topic-${entry.id}`} className="text-sm font-medium mb-2 block">
                    Topic
                  </Label>
                  <Select value={entry.topic} onValueChange={(value) => updateEntry(entry.id, "topic", value)}>
                    <SelectTrigger id={`topic-${entry.id}`}>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bankruptcy">Bankruptcy</SelectItem>
                      <SelectItem value="probate">Probate</SelectItem>
                      <SelectItem value="trusts">Trusts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subtopic */}
                <div>
                  <Label htmlFor={`subtopic-${entry.id}`} className="text-sm font-medium mb-2 block">
                    Subtopic
                  </Label>
                  <Input
                    id={`subtopic-${entry.id}`}
                    value={entry.subtopic}
                    onChange={(e) => updateEntry(entry.id, "subtopic", e.target.value)}
                    placeholder="Enter subtopic"
                  />
                </div>

                {/* Scenario */}
                <div className="md:col-span-2">
                  <Label htmlFor={`scenario-${entry.id}`} className="text-sm font-medium mb-2 block">
                    Scenario
                  </Label>
                  <Textarea
                    id={`scenario-${entry.id}`}
                    value={entry.scenario}
                    onChange={(e) => updateEntry(entry.id, "scenario", e.target.value)}
                    placeholder="Describe the scenario"
                    className="min-h-[80px] resize-y"
                  />
                </div>

                {/* Required Documents */}
                <div className="md:col-span-2">
                  <Label htmlFor={`documents-${entry.id}`} className="text-sm font-medium mb-2 block">
                    Required Documents
                  </Label>
                  <Textarea
                    id={`documents-${entry.id}`}
                    value={entry.requiredDocuments}
                    onChange={(e) => updateEntry(entry.id, "requiredDocuments", e.target.value)}
                    placeholder="List required documents"
                    className="min-h-[80px] resize-y"
                  />
                </div>

                {/* Decision Steps */}
                <div className="md:col-span-2">
                  <Label htmlFor={`steps-${entry.id}`} className="text-sm font-medium mb-2 block">
                    Decision Steps
                  </Label>
                  <Textarea
                    id={`steps-${entry.id}`}
                    value={entry.decisionSteps}
                    onChange={(e) => updateEntry(entry.id, "decisionSteps", e.target.value)}
                    placeholder="List decision steps"
                    className="min-h-[100px] resize-y"
                  />
                </div>

                {/* Risk Level */}
                <div>
                  <Label htmlFor={`risk-${entry.id}`} className="text-sm font-medium mb-2 block">
                    Risk Level
                  </Label>
                  <Select value={entry.riskLevel} onValueChange={(value) => updateEntry(entry.id, "riskLevel", value)}>
                    <SelectTrigger id={`risk-${entry.id}`}>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Exception Language */}
                <div className="md:col-span-2">
                  <Label htmlFor={`exception-${entry.id}`} className="text-sm font-medium mb-2 block">
                    Exception Language
                  </Label>
                  <Textarea
                    id={`exception-${entry.id}`}
                    value={entry.exceptionLanguage}
                    onChange={(e) => updateEntry(entry.id, "exceptionLanguage", e.target.value)}
                    placeholder="Describe any exceptions or special considerations"
                    className="min-h-[80px] resize-y"
                  />
                </div>

                {/* Source Reference */}
                <div className="md:col-span-2">
                  <Label htmlFor={`source-${entry.id}`} className="text-sm font-medium mb-2 block">
                    Source Reference
                  </Label>
                  <Input
                    id={`source-${entry.id}`}
                    value={entry.sourceReference}
                    onChange={(e) => updateEntry(entry.id, "sourceReference", e.target.value)}
                    placeholder="Document source reference"
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Another Entry Button */}
        <Button variant="outline" onClick={addEntry} className="w-full h-12 mb-6 text-base bg-transparent">
          <Plus className="w-5 h-5 mr-2" />
          Add Another Entry
        </Button>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex gap-4 justify-between">
          <Button variant="outline" className="h-11 px-8 text-base bg-transparent">
            Back
          </Button>
          <Button className="h-11 px-8 text-base font-semibold">Continue to Review</Button>
        </div>
      </div>
    </div>
  )
}
