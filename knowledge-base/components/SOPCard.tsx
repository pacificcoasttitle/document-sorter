"use client"

import Link from "next/link"
import { StatusBadge } from "./StatusBadge"
import { User, Clock } from "lucide-react"

export interface SOP {
  id: number
  workspace_id: number
  department_id: number
  title: string
  purpose: string | null
  scope: string | null
  responsible_party: string | null
  trigger_event: string | null
  steps: string | null
  exceptions: string | null
  related_policies: string | null
  effective_date: string | null
  review_date: string | null
  status: 'draft' | 'pending' | 'approved'
  owner_id: number | null
  approved_by: number | null
  approved_at: string | null
  created_at: string
  updated_at: string
  department_name: string
  owner_name: string | null
  approved_by_name: string | null
}

interface SOPCardProps {
  sop: SOP
}

export function SOPCard({ sop }: SOPCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Link href={`/sop/${sop.id}`}>
      <div className="bg-card border border-border rounded-lg p-5 hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 cursor-pointer group">
        {/* Department Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium border bg-emerald-100 text-emerald-700 border-emerald-200">
            {sop.department_name}
          </span>
          <StatusBadge status={sop.status} size="sm" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground mb-2 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
          {sop.title}
        </h3>

        {/* Purpose Preview */}
        {sop.purpose && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
            {sop.purpose}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {sop.responsible_party && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {sop.responsible_party}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(sop.updated_at)}
          </span>
        </div>
      </div>
    </Link>
  )
}

