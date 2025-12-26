"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import { WorkspaceSelector } from "@/components/WorkspaceSelector"
import { LogOut, User, Settings, ChevronDown } from "lucide-react"

export function UserHeader() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
          
          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium hidden sm:inline">{user.name}</span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full capitalize hidden sm:inline">
                {user.role.replace('_', ' ')}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-border sm:hidden">
                  <p className="font-medium text-foreground text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
                </div>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    router.push('/settings')
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
