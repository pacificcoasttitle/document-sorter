"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { InterviewChat } from "@/components/InterviewChat"
import { SOPForm } from "@/components/SOPForm"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, Check, FileText } from "lucide-react"

interface Department {
  id: number
  name: string
  workspace_id: number
}

type Step = 'basics' | 'interview' | 'preview'

interface SOPFormData {
  title: string
  department_id: string
  purpose: string
  scope: string
  responsible_party: string
  trigger_event: string
  steps: string
  exceptions: string
  related_policies: string
  effective_date: string
  review_date: string
}

export default function NewSOPPage() {
  const router = useRouter()
  const { currentWorkspace } = useWorkspace()
  const { user } = useAuth()
  const { toast } = useToast()

  const [step, setStep] = useState<Step>('basics')
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<SOPFormData>({
    title: '',
    department_id: '',
    purpose: '',
    scope: '',
    responsible_party: '',
    trigger_event: '',
    steps: '',
    exceptions: '',
    related_policies: '',
    effective_date: new Date().toISOString().split('T')[0],
    review_date: ''
  })

  const fetchDepartments = useCallback(async () => {
    if (!currentWorkspace) return
    try {
      const response = await fetch(`/api/departments?workspace_id=${currentWorkspace.id}`)
      const data = await response.json()
      setDepartments(data.departments || [])
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentWorkspace])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  const handleBasicsNext = () => {
    if (!title.trim() || !departmentId) {
      toast({
        title: "Required fields",
        description: "Please enter a title and select a department",
        variant: "destructive"
      })
      return
    }
    setStep('interview')
  }

  const handleInterviewComplete = async () => {
    setIsGenerating(true)
    try {
      const department = departments.find(d => d.id === parseInt(departmentId))
      
      const response = await fetch('/api/sops/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          department: department?.name || '',
          answers: interviewAnswers
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate SOP')
      }

      const data = await response.json()
      
      // Populate form with generated data
      setFormData({
        title,
        department_id: departmentId,
        purpose: data.sop.purpose || '',
        scope: data.sop.scope || '',
        responsible_party: data.sop.responsible_party || interviewAnswers.responsible_party || '',
        trigger_event: data.sop.trigger_event || interviewAnswers.trigger_event || '',
        steps: data.sop.steps || '',
        exceptions: data.sop.exceptions || '',
        related_policies: data.sop.related_policies || '',
        effective_date: new Date().toISOString().split('T')[0],
        review_date: data.sop.review_date || ''
      })

      setStep('preview')
    } catch (error) {
      console.error('Generation error:', error)
      toast({
        title: "Generation failed",
        description: "Failed to generate SOP. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFormChange = (field: keyof SOPFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (submitForApproval: boolean = false) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/sops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          workspace_id: currentWorkspace?.id,
          owner_id: user?.id,
          status: submitForApproval ? 'pending' : 'draft',
          user_name: user?.name
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save SOP')
      }

      const data = await response.json()

      toast({
        title: submitForApproval ? "SOP submitted for approval" : "SOP saved as draft",
        description: `"${formData.title}" has been ${submitForApproval ? 'submitted' : 'saved'}.`
      })

      router.push(`/sop/${data.sop.id}`)
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: "Save failed",
        description: "Failed to save SOP. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  // Redirect if not in Operations workspace
  if (currentWorkspace?.slug !== 'operations') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">SOPs are for Operations</h2>
          <p className="text-muted-foreground mb-4">Switch to the Operations workspace to create SOPs.</p>
          <Button onClick={() => router.push('/')}>Go to Library</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Library
          </button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New SOP</h1>
          <p className="text-muted-foreground">
            {step === 'basics' && 'Start by giving your procedure a title'}
            {step === 'interview' && 'Answer a few questions to help generate your SOP'}
            {step === 'preview' && 'Review and edit the generated SOP'}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-4 mb-8">
          {['basics', 'interview', 'preview'].map((s, index) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step === s ? 'bg-emerald-600 text-white' : 
                    ['basics', 'interview', 'preview'].indexOf(step) > index 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-muted text-muted-foreground'}`}
              >
                {['basics', 'interview', 'preview'].indexOf(step) > index ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-sm ${step === s ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {s === 'basics' ? 'Basic Info' : s === 'interview' ? 'AI Interview' : 'Preview & Edit'}
              </span>
              {index < 2 && <div className="w-12 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-card border border-border rounded-lg p-8">
          {step === 'basics' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">What process are you documenting?</h2>
              </div>

              <div>
                <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                  Procedure Title *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Client Onboarding Process, Invoice Processing, etc."
                  className="text-lg h-12"
                />
              </div>

              <div>
                <Label htmlFor="department" className="text-sm font-medium mb-2 block">
                  Department *
                </Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger id="department" className="h-12">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={String(dept.id)}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-6 flex justify-end">
                <Button
                  onClick={handleBasicsNext}
                  disabled={!title.trim() || !departmentId}
                  className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 'interview' && (
            <InterviewChat
              answers={interviewAnswers}
              onAnswerChange={(id, value) => setInterviewAnswers(prev => ({ ...prev, [id]: value }))}
              onComplete={handleInterviewComplete}
              onBack={() => setStep('basics')}
              isGenerating={isGenerating}
            />
          )}

          {step === 'preview' && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">Review & Edit</h2>
              
              <SOPForm
                data={formData}
                onChange={handleFormChange}
                departments={departments}
              />

              <div className="pt-8 mt-8 border-t border-border flex gap-4 justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep('interview')}
                  disabled={isSaving}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Interview
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                  >
                    {isSaving ? <Spinner className="w-4 h-4 mr-2" /> : null}
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => handleSave(true)}
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isSaving ? <Spinner className="w-4 h-4 mr-2" /> : null}
                    Submit for Approval
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

