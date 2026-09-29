"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/AuthProvider"
import { WorkspaceSelector } from "@/components/WorkspaceSelector"
import { LogOut, User, Settings, ChevronDown, Shield, HelpCircle } from "lucide-react"

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

  const isAdmin = user.role === 'admin'

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-3" aria-label="Tessa home">
          <span className="text-xl font-bold tracking-tight text-foreground">Tessa<span className="text-orange-600">.</span></span>
          <span className="text-sm text-muted-foreground hidden lg:inline">Knowledge & standards</span>
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-3">
          <WorkspaceSelector />

          {/* Help link */}
          <button
            onClick={() => router.push('/help')}
            aria-label="Help"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Help</span>
          </button>

          {/* Admin link - only for admins */}
          {isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              aria-label="Administration"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-amber-600 dark:text-amber-400"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Admin</span>
            </button>
          )}
          
          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Account menu"
              aria-expanded={dropdownOpen}
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
