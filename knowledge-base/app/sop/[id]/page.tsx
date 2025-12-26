"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { StatusBadge } from "@/components/StatusBadge"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, Edit, Send, Check, User, Calendar, Clock } from "lucide-react"
import { SOP } from "@/components/SOPCard"

export default function ViewSOPPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [sop, setSOP] = useState<SOP | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  const fetchSOP = useCallback(async () => {
    try {
      const response = await fetch(`/api/sops/${id}`)
      if (!response.ok) throw new Error('SOP not found')
      const data = await response.json()
      setSOP(data.sop)
    } catch (error) {
      console.error('Failed to fetch SOP:', error)
      toast({
        title: "Error",
        description: "Failed to load SOP",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    fetchSOP()
  }, [fetchSOP])

  const handleSubmitForApproval = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/sops/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: user?.name })
      })

      if (!response.ok) throw new Error('Failed to submit')

      const data = await response.json()
      setSOP(data.sop)

      toast({
        title: "Submitted for approval",
        description: "Your SOP is now pending review."
      })
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: "Submit failed",
        description: "Failed to submit SOP for approval.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const response = await fetch(`/api/sops/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          user_name: user?.name,
          user_role: user?.role
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to approve')
      }

      const data = await response.json()
      setSOP(data.sop)

      toast({
        title: "SOP approved",
        description: "The SOP has been approved and is now active."
      })
    } catch (error) {
      console.error('Approve error:', error)
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Failed to approve SOP.",
        variant: "destructive"
      })
    } finally {
      setIsApproving(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  }

  const canEdit = sop && (
    user?.role === 'admin' || 
    (sop.owner_id === user?.id && sop.status !== 'approved')
  )

  const canSubmit = sop && sop.status === 'draft' && sop.owner_id === user?.id
  const canApprove = sop && sop.status === 'pending' && user?.role === 'admin'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!sop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">SOP not found</h2>
          <Button onClick={() => router.push('/')}>Go to Library</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Library
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-medium border bg-emerald-100 text-emerald-700 border-emerald-200">
                  {sop.department_name}
                </span>
                <StatusBadge status={sop.status} />
              </div>
              <h1 className="text-3xl font-bold text-foreground">{sop.title}</h1>
            </div>

            <div className="flex gap-3">
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/sop/${id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              {canSubmit && (
                <Button
                  onClick={handleSubmitForApproval}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? <Spinner className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Submit for Approval
                </Button>
              )}
              {canApprove && (
                <Button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isApproving ? <Spinner className="w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Approve SOP
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-lg p-8 space-y-8">
          {/* Purpose */}
          {sop.purpose && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Purpose</h3>
              <p className="text-foreground leading-relaxed">{sop.purpose}</p>
            </div>
          )}

          {/* Scope */}
          {sop.scope && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Scope</h3>
              <p className="text-foreground leading-relaxed">{sop.scope}</p>
            </div>
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-y border-border">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Responsible Party</p>
                <p className="text-sm text-muted-foreground">{sop.responsible_party || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Trigger Event</p>
                <p className="text-sm text-muted-foreground">{sop.trigger_event || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Steps */}
          {sop.steps && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Procedure Steps</h3>
              <div className="bg-muted/50 rounded-lg p-6">
                <p className="text-foreground leading-relaxed whitespace-pre-line font-mono text-sm">
                  {sop.steps}
                </p>
              </div>
            </div>
          )}

          {/* Exceptions */}
          {sop.exceptions && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Exceptions</h3>
              <p className="text-foreground leading-relaxed">{sop.exceptions}</p>
            </div>
          )}

          {/* Related Policies */}
          {sop.related_policies && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Related Policies</h3>
              <p className="text-foreground leading-relaxed">{sop.related_policies}</p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Effective Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(sop.effective_date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Review Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(sop.review_date)}</p>
              </div>
            </div>
          </div>

          {/* Approval Info */}
          {sop.status === 'approved' && sop.approved_by_name && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Check className="w-5 h-5" />
                <span className="font-medium">Approved</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                by {sop.approved_by_name} on {formatDateTime(sop.approved_at)}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-6 border-t border-border text-sm text-muted-foreground">
            <p>Owner: {sop.owner_name || 'Unknown'}</p>
            <p>Last updated: {formatDateTime(sop.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

