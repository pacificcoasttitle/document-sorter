"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface Department {
  id: number
  workspace_id: number
  name: string
  created_at: string
}

export interface Workspace {
  id: number
  name: string
  slug: string
  description: string | null
  created_at: string
  departments: Department[]
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null
  setWorkspace: (workspace: Workspace) => void
  workspaces: Workspace[]
  isLoading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

const STORAGE_KEY = 'tessa-current-workspace'

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchWorkspaces = useCallback(async () => {
    try {
      const response = await fetch('/api/workspaces')
      if (response.ok) {
        const data = await response.json()
        setWorkspaces(data.workspaces || [])
        
        // Try to restore from localStorage
        const savedSlug = localStorage.getItem(STORAGE_KEY)
        const savedWorkspace = data.workspaces?.find((w: Workspace) => w.slug === savedSlug)
        
        if (savedWorkspace) {
          setCurrentWorkspace(savedWorkspace)
        } else if (data.workspaces?.length > 0) {
          // Default to Underwriting (first workspace alphabetically should be Operations, 
          // but we want Underwriting as default)
          const defaultWorkspace = data.workspaces.find((w: Workspace) => w.slug === 'underwriting') 
            || data.workspaces[0]
          setCurrentWorkspace(defaultWorkspace)
          localStorage.setItem(STORAGE_KEY, defaultWorkspace.slug)
        }
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  const setWorkspace = (workspace: Workspace) => {
    setCurrentWorkspace(workspace)
    localStorage.setItem(STORAGE_KEY, workspace.slug)
  }

  return (
    <WorkspaceContext.Provider value={{ currentWorkspace, setWorkspace, workspaces, isLoading }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}

