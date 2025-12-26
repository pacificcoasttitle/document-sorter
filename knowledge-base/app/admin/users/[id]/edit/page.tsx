"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, Save, User } from "lucide-react"

interface Department {
  id: number
  name: string
  workspace_id: number
}

interface UserData {
  id: number
  email: string
  name: string
  role: string
  department: string | null
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [userData, setUserData] = useState<UserData | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [role, setRole] = useState("viewer")
  const [department, setDepartment] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const [userRes, deptRes] = await Promise.all([
        fetch(`/api/admin/users/${userId}`),
        fetch('/api/departments')
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUserData(userData.user)
        setName(userData.user.name)
        setRole(userData.user.role)
        setDepartment(userData.user.department || "")
      } else {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive"
        })
        router.push('/admin/users')
        return
      }

      if (deptRes.ok) {
        const deptData = await deptRes.json()
        setDepartments(deptData.departments)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, router, toast])

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
      fetchData()
    }
  }, [authLoading, currentUser, router, toast, fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name) {
      setError("Name is required")
      return
    }

    if (newPassword && newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsSaving(true)

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          role,
          department: department || null,
          password: newPassword || undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update user')
        setIsSaving(false)
        return
      }

      toast({
        title: "User Updated",
        description: `${name}'s profile has been updated.`
      })

      router.push('/admin/users')
    } catch {
      setError('An error occurred. Please try again.')
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!currentUser || currentUser.role !== 'admin' || !userData) {
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
            <User className="w-8 h-8" />
            Edit User
          </h1>
          <p className="text-muted-foreground">Update {userData.name}&apos;s profile</p>
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
                disabled={isSaving}
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium mb-2 block">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Only fill this if you want to change the password (min. 8 characters)
              </p>
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
                disabled={isSaving}
              >
                <option value="viewer">Viewer</option>
                <option value="department_head">Department Head</option>
                <option value="admin">Admin</option>
              </select>
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
                disabled={isSaving}
              >
                <option value="">None</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/users')}
                disabled={isSaving}
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

