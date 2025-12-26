"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import { Spinner } from "@/components/ui/spinner"
import { ChevronLeft, Building2, Users, Shield } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      router.push('/')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-20">
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
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-500" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your organization&apos;s settings</p>
        </div>

        {/* Admin Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Manage Departments */}
          <button
            onClick={() => router.push('/admin/departments')}
            className="bg-card border border-border rounded-lg p-6 text-left hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Manage Departments</h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or remove departments for organizing SOPs in the Operations workspace.
                </p>
              </div>
            </div>
          </button>

          {/* Manage Users */}
          <button
            onClick={() => router.push('/admin/users')}
            className="bg-card border border-border rounded-lg p-6 text-left hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Manage Users</h2>
                <p className="text-sm text-muted-foreground">
                  Add new users, edit roles and permissions, or remove users from the system.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

