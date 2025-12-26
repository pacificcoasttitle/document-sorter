"use client"

import { useAuth } from "@/components/AuthProvider"
import { WorkspaceSelector } from "@/components/WorkspaceSelector"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export function UserHeader() {
  const { user, logout, isLoading } = useAuth()

  if (isLoading || !user) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">Tessa</h1>
          <span className="text-sm text-muted-foreground hidden sm:inline">Knowledge Tool</span>
        </div>
        
        <div className="flex items-center gap-4">
          <WorkspaceSelector />
          
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{user.name}</span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full capitalize">
              {user.role.replace('_', ' ')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
