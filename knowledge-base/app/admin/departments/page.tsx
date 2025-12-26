"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, Plus, Trash2, Building2, AlertCircle } from "lucide-react"

interface Department {
  id: number
  workspace_id: number
  name: string
}

interface Workspace {
  id: number
  name: string
  slug: string
}

export default function ManageDepartmentsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [departments, setDepartments] = useState<Department[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newDeptName, setNewDeptName] = useState("")
  const [selectedWorkspace, setSelectedWorkspace] = useState<number>(2) // Default to Operations
  const [isCreating, setIsCreating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [deptRes, wsRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/workspaces')
      ])

      if (deptRes.ok) {
        const deptData = await deptRes.json()
        setDepartments(deptData.departments)
      }

      if (wsRes.ok) {
        const wsData = await wsRes.json()
        setWorkspaces(wsData.workspaces)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access this page.",
          variant: "destructive"
        })
        router.push('/')
        return
      }
      fetchData()
    }
  }, [authLoading, user, router, toast, fetchData])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDeptName.trim()) return

    setIsCreating(true)

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: selectedWorkspace, name: newDeptName.trim() })
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to create department",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Department Created",
        description: `${newDeptName} has been added.`
      })

      setNewDeptName("")
      fetchData()
    } catch {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/departments?id=${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Cannot Delete",
          description: data.error || "Failed to delete department",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Department Deleted",
        description: "The department has been removed."
      })

      fetchData()
    } catch {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setDeleteConfirm(null)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  // Group departments by workspace
  const groupedDepartments = workspaces.map(ws => ({
    workspace: ws,
    departments: departments.filter(d => d.workspace_id === ws.id)
  })).filter(g => g.departments.length > 0 || g.workspace.slug === 'operations')

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Admin
          </button>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8" />
            Manage Departments
          </h1>
          <p className="text-muted-foreground">Add or remove departments for the Operations workspace</p>
        </div>

        {/* Department List */}
        <div className="space-y-6 mb-8">
          {groupedDepartments.map(group => (
            <div key={group.workspace.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h2 className="font-semibold text-foreground">{group.workspace.name}</h2>
              </div>
              <div className="divide-y divide-border">
                {group.departments.length === 0 ? (
                  <div className="px-4 py-6 text-center text-muted-foreground">
                    No departments yet
                  </div>
                ) : (
                  group.departments.map(dept => (
                    <div key={dept.id} className="px-4 py-3 flex items-center justify-between">
                      <span className="text-foreground">{dept.name}</span>
                      
                      {deleteConfirm === dept.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Delete?</span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(dept.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? <Spinner className="w-4 h-4" /> : "Yes"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteConfirm(null)}
                            disabled={isDeleting}
                          >
                            No
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => setDeleteConfirm(dept.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Department Form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Department
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Workspace
              </label>
              <select
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(parseInt(e.target.value))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              >
                {workspaces.filter(ws => ws.slug === 'operations').map(ws => (
                  <option key={ws.id} value={ws.id}>{ws.name}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Departments are only used in the Operations workspace
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Department Name
              </label>
              <Input
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="e.g., Human Resources"
                disabled={isCreating}
              />
            </div>

            <Button type="submit" disabled={isCreating || !newDeptName.trim()}>
              {isCreating ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Department
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Note</p>
              <p>Departments with SOPs assigned to them cannot be deleted. You&apos;ll need to reassign or delete those SOPs first.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

