"use client"

import { useState, useRef, useEffect } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { ChevronDown, Check, Building2, FileText } from 'lucide-react'

export function WorkspaceSelector() {
  const { currentWorkspace, setWorkspace, workspaces, isLoading } = useWorkspace()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (isLoading || !currentWorkspace) {
    return (
      <div className="h-8 w-32 bg-muted animate-pulse rounded-lg" />
    )
  }

  const getWorkspaceColor = (slug: string) => {
    switch (slug) {
      case 'underwriting':
        return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800'
      case 'operations':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800'
    }
  }

  const getWorkspaceIcon = (slug: string) => {
    switch (slug) {
      case 'underwriting':
        return <FileText className="w-4 h-4" />
      case 'operations':
        return <Building2 className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors hover:bg-accent ${getWorkspaceColor(currentWorkspace.slug)}`}
      >
        {getWorkspaceIcon(currentWorkspace.slug)}
        <span>{currentWorkspace.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2">
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Switch Workspace
            </p>
          </div>
          <div className="border-t border-border">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => {
                  setWorkspace(workspace)
                  setIsOpen(false)
                }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
              >
                <div className={`mt-0.5 p-1.5 rounded ${getWorkspaceColor(workspace.slug)}`}>
                  {getWorkspaceIcon(workspace.slug)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{workspace.name}</span>
                    {workspace.id === currentWorkspace.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  {workspace.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {workspace.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

