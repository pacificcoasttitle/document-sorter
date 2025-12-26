"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import { Spinner } from "@/components/ui/spinner"
import { ChevronLeft, Rocket, BookOpen, Shield, HelpCircle } from "lucide-react"

export default function HelpCenterPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Library
          </button>
          <div className="flex items-center gap-3 mb-3">
            <HelpCircle className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Tessa Knowledge Tool
          </p>
        </div>

        {/* Help Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Start */}
          <button
            onClick={() => router.push('/help/quick-start')}
            className="bg-card border border-border rounded-lg p-6 text-left hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg w-fit mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
              <Rocket className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Quick Start</h2>
            <p className="text-sm text-muted-foreground">
              Get up and running in 5 minutes
            </p>
          </button>

          {/* User Guide */}
          <button
            onClick={() => router.push('/help/user-guide')}
            className="bg-card border border-border rounded-lg p-6 text-left hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">User Guide</h2>
            <p className="text-sm text-muted-foreground">
              Complete guide to using the tool
            </p>
          </button>

          {/* Admin Guide - only for admins */}
          {isAdmin && (
            <button
              onClick={() => router.push('/help/admin-guide')}
              className="bg-card border border-border rounded-lg p-6 text-left hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg w-fit mb-4 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Admin Guide</h2>
              <p className="text-sm text-muted-foreground">
                Managing users, departments, and approvals
              </p>
            </button>
          )}
        </div>

        {/* Contact */}
        <div className="mt-12 bg-muted/30 border border-border rounded-lg p-6 text-center">
          <h3 className="font-semibold text-foreground mb-2">Still need help?</h3>
          <p className="text-sm text-muted-foreground">
            Contact your administrator for additional support
          </p>
        </div>
      </div>
    </div>
  )
}

