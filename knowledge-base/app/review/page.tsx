"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEntries } from "@/contexts/EntriesContext"
import { useToast } from "@/hooks/use-toast"
import { Topic, Subtopic } from "@/lib/types"

interface GuidanceEntry {
  id: string
  topic: string
  subtopic: string
  scenario: string
  required_documents: string
  decision_steps: string
  risk_level: string
  exception_language: string
  source_reference: string
}

export default function ReviewPage() {
  const router = useRouter()
  const { extractedEntries, sourceReference, setReviewedEntries } = useEntries()
  const { toast } = useToast()
  
  const [entries, setEntries] = useState<GuidanceEntry[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [subtopics, setSubtopics] = useState<Subtopic[]>([])

  const fetchTopics = useCallback(async () => {
    try {
      const response = await fetch('/api/topics')
      const data = await response.json()
      setTopics(data.topics || [])
      setSubtopics(data.subtopics || [])
    } catch (error) {
      console.error('Failed to fetch topics:', error)
    }
  }, [])

  useEffect(() => {
    // If no extracted entries, redirect to upload
    if (extractedEntries.length === 0) {
      router.push('/upload')
      return
    }

    // Map extracted entries to editable format
    const mapped = extractedEntries.map((entry, index) => ({
      id: String(index + 1),
      topic: entry.topic || '',
      subtopic: entry.subtopic || '',
      scenario: entry.scenario || '',
      required_documents: entry.required_documents || '',
      decision_steps: entry.decision_steps || '',
      risk_level: entry.risk_level?.toLowerCase() || 'medium',
      exception_language: entry.exception_language || '',
      source_reference: sourceReference || '',
    }))
    
    setEntries(mapped)
    fetchTopics()
  }, [extractedEntries, sourceReference, router, fetchTopics])

  const addEntry = () => {
    const newEntry: GuidanceEntry = {
      id: Date.now().toString(),
      topic: "",
      subtopic: "",
      scenario: "",
      required_documents: "",
      decision_steps: "",
      risk_level: "medium",
      exception_language: "",
      source_reference: sourceReference || "",
    }
    setEntries([...entries, newEntry])
  }

  const deleteEntry = (id: string) => {
    if (entries.length === 1) {
      toast({
        title: "Cannot delete",
        description: "You must have at least one entry",
        variant: "destructive",
      })
      return
    }
    setEntries(entries.filter((entry) => entry.id !== id))
  }

  const updateEntry = (id: string, field: keyof GuidanceEntry, value: string) => {
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  const handleContinue = () => {
    // Validate entries
    const invalidEntries = entries.filter(
      (entry) => !entry.topic || !entry.subtopic || !entry.scenario
    )

    if (invalidEntries.length > 0) {
      toast({
        title: "Incomplete entries",
        description: "Please fill in topic, subtopic, and scenario for all entries",
        variant: "destructive",
      })
      return
    }

    // Map to ExtractedEntry format and save to context
    const reviewed = entries.map((entry) => ({
      topic: entry.topic,
      subtopic: entry.subtopic,
      scenario: entry.scenario,
      required_documents: entry.required_documents,
      decision_steps: entry.decision_steps,
      risk_level: (entry.risk_level.charAt(0).toUpperCase() + entry.risk_level.slice(1)) as 'Low' | 'Medium' | 'High',
      exception_language: entry.exception_language,
    }))

    setReviewedEntries(reviewed)
    router.push('/confirm')
  }

  const getSubtopicsForTopic = (topicName: string) => {
    const topic = topics.find(t => t.name.toLowerCase() === topicName.toLowerCase())
    if (!topic) return []
    return subtopics.filter(s => s.topic_id === topic.id)
  }

  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Review Extracted Guidance</h1>
          <p className="text-base text-muted-foreground">
            Edit any fields before saving to your knowledge base • {entries.length} {entries.length === 1 ? 'entry' : 'entries'} from {sourceReference}
          </p>
        </div>

        {/* Entry Cards */}
        <div className="space-y-6 mb-6">
          {entries.map((entry, index) => (
            <div key={entry.id} className="relative bg-card border border-border rounded-lg p-6 shadow-sm">
              {/* Entry Number Badge */}
              <div className="absolute -top-3 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                Entry {index + 1}
              </div>

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteEntry(entry.id)}
                className="absolute top-4 right-4 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-12 mt-2">
                {/* Topic */}
                <div>
                  <Label htmlFor={`topic-${entry.id}`} className="text-sm font-medium mb-2 block">
                    Topic *
                  </Label>
                  <Select value={entry.topic.toLowerCase()} onValueChange={(value) => updateEntry(entry.id, "topic", value.charAt(0).toUpperCase() + value.slice(1))}>
                    <SelectTrigger id={`topic-${entry.id}`}>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((t) => (
                        <SelectItem key={t.id} value={t.name.toLowerCase()}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subtopic */}
                <div>
                  <Label htmlFor={`subtopic-${entry.id}`} className="text-sm font-medium mb-2 block">
                    Subtopic *
                  </Label>
                  <Input
                    id={`subtopic-${entry.id}`}
                    value={entry.subtopic}
                    onChange={(e) => updateEntry(entry.id, "subtopic", e.target.value)}
                    placeholder="Enter subtopic"
                    list={`subtopics-${entry.id}`}
                  />
                  <datalist id={`subtopics-${entry.id}`}>
                    {getSubtopicsForTopic(entry.topic).map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>

                {/* Scenario */}
                <div className="md:col-span-2">
                  <Label htmlFor={`scenario-${entry.id}`} className="text-sm font-medium mb-2 block">
                    Scenario *
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
                    value={entry.required_documents}
                    onChange={(e) => updateEntry(entry.id, "required_documents", e.target.value)}
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
                    value={entry.decision_steps}
                    onChange={(e) => updateEntry(entry.id, "decision_steps", e.target.value)}
                    placeholder="List decision steps"
                    className="min-h-[100px] resize-y"
                  />
                </div>

                {/* Risk Level */}
                <div>
                  <Label htmlFor={`risk-${entry.id}`} className="text-sm font-medium mb-2 block">
                    Risk Level
                  </Label>
                  <Select value={entry.risk_level} onValueChange={(value) => updateEntry(entry.id, "risk_level", value)}>
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

                {/* Source Reference */}
                <div>
                  <Label htmlFor={`source-${entry.id}`} className="text-sm font-medium mb-2 block">
                    Source Reference
                  </Label>
                  <Input
                    id={`source-${entry.id}`}
                    value={entry.source_reference}
                    onChange={(e) => updateEntry(entry.id, "source_reference", e.target.value)}
                    placeholder="Document source reference"
                    className="bg-muted"
                  />
                </div>

                {/* Exception Language */}
                <div className="md:col-span-2">
                  <Label htmlFor={`exception-${entry.id}`} className="text-sm font-medium mb-2 block">
                    Exception Language
                  </Label>
                  <Textarea
                    id={`exception-${entry.id}`}
                    value={entry.exception_language}
                    onChange={(e) => updateEntry(entry.id, "exception_language", e.target.value)}
                    placeholder="Describe any exceptions or special considerations"
                    className="min-h-[80px] resize-y"
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
          <Button variant="outline" onClick={() => router.push('/upload')} className="h-11 px-8 text-base bg-transparent">
            Back
          </Button>
          <Button onClick={handleContinue} className="h-11 px-8 text-base font-semibold">
            Continue to Review
          </Button>
        </div>
      </div>
    </div>
  )
}
