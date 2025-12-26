"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, UserPlus } from "lucide-react"

interface Department {
  id: number
  name: string
  workspace_id: number
}

export default function NewUserPage() {
  const router = useRouter()
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("viewer")
  const [department, setDepartment] = useState("")

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/departments')
      if (res.ok) {
        const data = await res.json()
        setDepartments(data.departments)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && currentUser) {
      if (currentUser.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access this page.",
          variant: "destructive"
        })
        router.push('/')
        return
      }
      fetchDepartments()
    }
  }, [authLoading, currentUser, router, toast, fetchDepartments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password) {
      setError("Name, email, and password are required")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsCreating(true)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          department: department || null
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create user')
        setIsCreating(false)
        return
      }

      toast({
        title: "User Created",
        description: `${name} has been added to the system.`
      })

      router.push('/admin/users')
    } catch {
      setError('An error occurred. Please try again.')
      setIsCreating(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/users')}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Users
          </button>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <UserPlus className="w-8 h-8" />
            Add New User
          </h1>
          <p className="text-muted-foreground">Create a new user account</p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                disabled={isCreating}
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@pacificcoasttitle.com"
                disabled={isCreating}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium mb-2 block">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                disabled={isCreating}
              />
            </div>

            <div>
              <Label htmlFor="role" className="text-sm font-medium mb-2 block">
                Role
              </Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                disabled={isCreating}
              >
                <option value="viewer">Viewer</option>
                <option value="department_head">Department Head</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Admins have full access. Department Heads can create/edit content. Viewers can only read.
              </p>
            </div>

            <div>
              <Label htmlFor="department" className="text-sm font-medium mb-2 block">
                Department
              </Label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                disabled={isCreating}
              >
                <option value="">None</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Optional. Assigns user to a specific department for SOP management.
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isCreating} className="flex-1">
                {isCreating ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/users')}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

