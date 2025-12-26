"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, Users, Plus, Pencil, Trash2 } from "lucide-react"

interface User {
  id: number
  email: string
  name: string
  role: string
  department: string | null
  created_at: string
}

export default function ManageUsersPage() {
  const router = useRouter()
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
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
      fetchUsers()
    }
  }, [authLoading, currentUser, router, toast, fetchUsers])

  const handleDelete = async (id: number) => {
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Cannot Delete",
          description: data.error || "Failed to delete user",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "User Deleted",
        description: "The user has been removed."
      })

      fetchUsers()
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

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'department_head':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
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
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <button
              onClick={() => router.push('/admin')}
              className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Admin
            </button>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Users className="w-8 h-8" />
              Manage Users
            </h1>
            <p className="text-muted-foreground">Add, edit, or remove users from the system</p>
          </div>

          <Button onClick={() => router.push('/admin/users/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Department</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 text-foreground font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(user.role)}`}>
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.department || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        {user.id !== currentUser.id && (
                          deleteConfirm === user.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Delete?</span>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(user.id)}
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
                              onClick={() => setDeleteConfirm(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="px-4 py-12 text-center text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

