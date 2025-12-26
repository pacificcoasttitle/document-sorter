"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { SOPForm } from "@/components/SOPForm"
import { StatusBadge } from "@/components/StatusBadge"
import { useAuth } from "@/components/AuthProvider"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft } from "lucide-react"

interface Department {
  id: number
  name: string
  workspace_id: number
}

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

export default function EditSOPPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const { toast } = useToast()

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
    effective_date: '',
    review_date: ''
  })
  const [status, setStatus] = useState<string>('draft')
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      // Fetch SOP
      const sopResponse = await fetch(`/api/sops/${id}`)
      if (!sopResponse.ok) throw new Error('SOP not found')
      const sopData = await sopResponse.json()
      const sop = sopData.sop

      setFormData({
        title: sop.title || '',
        department_id: String(sop.department_id) || '',
        purpose: sop.purpose || '',
        scope: sop.scope || '',
        responsible_party: sop.responsible_party || '',
        trigger_event: sop.trigger_event || '',
        steps: sop.steps || '',
        exceptions: sop.exceptions || '',
        related_policies: sop.related_policies || '',
        effective_date: sop.effective_date?.split('T')[0] || '',
        review_date: sop.review_date?.split('T')[0] || ''
      })
      setStatus(sop.status)

      // Fetch departments
      if (currentWorkspace) {
        const deptResponse = await fetch(`/api/departments?workspace_id=${currentWorkspace.id}`)
        const deptData = await deptResponse.json()
        setDepartments(deptData.departments || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast({
        title: "Error",
        description: "Failed to load SOP",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [id, currentWorkspace, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFormChange = (field: keyof SOPFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.department_id) {
      toast({
        title: "Required fields",
        description: "Please enter a title and select a department",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/sops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: user?.id,
          user_name: user?.name,
          user_role: user?.role
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      toast({
        title: "Changes saved",
        description: "Your changes have been saved successfully."
      })

      router.push(`/sop/${id}`)
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save changes.",
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

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/sop/${id}`)}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to SOP
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Edit SOP</h1>
              <p className="text-muted-foreground">Make changes to your procedure</p>
            </div>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-8">
          <SOPForm
            data={formData}
            onChange={handleFormChange}
            departments={departments}
          />
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="max-w-3xl mx-auto px-6 py-4 flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(`/sop/${id}`)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSaving ? <Spinner className="w-4 h-4 mr-2" /> : null}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

