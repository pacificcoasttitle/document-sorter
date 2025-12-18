"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useEntries } from "@/contexts/EntriesContext"
import { useToast } from "@/hooks/use-toast"

export default function ConfirmPage() {
  const router = useRouter()
  const { reviewedEntries, sourceReference, userName, clearAll } = useEntries()
  const { toast } = useToast()
  
  const [owner, setOwner] = useState(userName || '')
  const [isSaving, setIsSaving] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    if (reviewedEntries.length === 0) {
      router.push('/upload')
    }
    if (userName) {
      setOwner(userName)
    }
  }, [reviewedEntries, userName, router])

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

  const truncateText = (text: string, maxLength = 150) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  const handleSave = async () => {
    if (!owner.trim()) {
      toast({
        title: "Owner required",
        description: "Please enter your name as the owner",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const entriesToSave = reviewedEntries.map(entry => ({
        ...entry,
        source_reference: sourceReference,
        owner: owner.trim(),
        last_reviewed: today,
      }))

      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          entries: entriesToSave,
          user_name: owner.trim()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save entries')
      }

      const data = await response.json()

      toast({
        title: "Entries saved!",
        description: `Successfully saved ${data.entries?.length || reviewedEntries.length} entries to the knowledge base`,
      })

      // Clear context and redirect to library
      clearAll()
      router.push('/')
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : 'An error occurred while saving',
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (reviewedEntries.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Confirm & Save</h1>
          <p className="text-base text-muted-foreground">
            Review your {reviewedEntries.length} {reviewedEntries.length === 1 ? 'entry' : 'entries'} before saving
          </p>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4 mb-8">
          {reviewedEntries.map((entry, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getTopicBadgeColor(entry.topic)}`}>
                      {entry.topic}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(entry.risk_level)}`}
                    >
                      {entry.risk_level} Risk
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{entry.subtopic}</h3>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{truncateText(entry.scenario)}</p>
              
              {entry.required_documents && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Required Documents:</p>
                  <p className="text-sm text-muted-foreground">{truncateText(entry.required_documents, 100)}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Owner and Last Reviewed Fields */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Entry Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owner */}
            <div>
              <Label htmlFor="owner" className="text-sm font-medium mb-2 block">
                Owner *
              </Label>
              <Input 
                id="owner" 
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Enter your name"
                className="bg-background" 
              />
            </div>

            {/* Last Reviewed */}
            <div>
              <Label htmlFor="lastReviewed" className="text-sm font-medium mb-2 block">
                Last Reviewed
              </Label>
              <Input 
                id="lastReviewed" 
                type="date" 
                defaultValue={today} 
                className="bg-background"
                disabled
              />
            </div>
          </div>
          
          {/* Source Reference */}
          <div className="mt-4">
            <Label className="text-sm font-medium mb-2 block">
              Source Reference
            </Label>
            <p className="text-sm text-muted-foreground font-mono bg-muted px-4 py-3 rounded-md">
              {sourceReference || 'No source reference'}
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4 flex gap-4 justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push('/review')} 
            className="h-11 px-8 text-base bg-transparent"
            disabled={isSaving}
          >
            Back
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || !owner.trim()}
            className="h-11 px-8 text-base font-semibold bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? (
              <>
                <Spinner className="mr-2" />
                Saving...
              </>
            ) : (
              `Approve & Save ${reviewedEntries.length} ${reviewedEntries.length === 1 ? 'Entry' : 'Entries'}`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
