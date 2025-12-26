"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Department {
  id: number
  name: string
  workspace_id: number
}

interface SOPFormData {
  title: string
  department_id: string
  purpose: string
  scope: string
  responsible_party: string
  trigger_event: string
  steps: string
  exceptions: string
  related_policies: string
  effective_date: string
  review_date: string
}

interface SOPFormProps {
  data: SOPFormData
  onChange: (field: keyof SOPFormData, value: string) => void
  departments: Department[]
  readOnly?: boolean
}

export function SOPForm({ data, onChange, departments, readOnly = false }: SOPFormProps) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-sm font-medium mb-2 block">
          Title *
        </Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="e.g., Client Onboarding Process"
          disabled={readOnly}
        />
      </div>

      {/* Department */}
      <div>
        <Label htmlFor="department" className="text-sm font-medium mb-2 block">
          Department *
        </Label>
        <Select
          value={data.department_id}
          onValueChange={(value) => onChange('department_id', value)}
          disabled={readOnly}
        >
          <SelectTrigger id="department">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={String(dept.id)}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Purpose */}
      <div>
        <Label htmlFor="purpose" className="text-sm font-medium mb-2 block">
          Purpose
        </Label>
        <Textarea
          id="purpose"
          value={data.purpose}
          onChange={(e) => onChange('purpose', e.target.value)}
          placeholder="Why does this procedure exist?"
          className="min-h-[80px]"
          disabled={readOnly}
        />
      </div>

      {/* Scope */}
      <div>
        <Label htmlFor="scope" className="text-sm font-medium mb-2 block">
          Scope
        </Label>
        <Textarea
          id="scope"
          value={data.scope}
          onChange={(e) => onChange('scope', e.target.value)}
          placeholder="Who does this apply to? When does it apply?"
          className="min-h-[80px]"
          disabled={readOnly}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Responsible Party */}
        <div>
          <Label htmlFor="responsible_party" className="text-sm font-medium mb-2 block">
            Responsible Party
          </Label>
          <Input
            id="responsible_party"
            value={data.responsible_party}
            onChange={(e) => onChange('responsible_party', e.target.value)}
            placeholder="Who performs this task?"
            disabled={readOnly}
          />
        </div>

        {/* Trigger Event */}
        <div>
          <Label htmlFor="trigger_event" className="text-sm font-medium mb-2 block">
            Trigger Event
          </Label>
          <Input
            id="trigger_event"
            value={data.trigger_event}
            onChange={(e) => onChange('trigger_event', e.target.value)}
            placeholder="What initiates this process?"
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Steps */}
      <div>
        <Label htmlFor="steps" className="text-sm font-medium mb-2 block">
          Steps
        </Label>
        <Textarea
          id="steps"
          value={data.steps}
          onChange={(e) => onChange('steps', e.target.value)}
          placeholder="Step-by-step instructions..."
          className="min-h-[200px] font-mono text-sm"
          disabled={readOnly}
        />
      </div>

      {/* Exceptions */}
      <div>
        <Label htmlFor="exceptions" className="text-sm font-medium mb-2 block">
          Exceptions
        </Label>
        <Textarea
          id="exceptions"
          value={data.exceptions}
          onChange={(e) => onChange('exceptions', e.target.value)}
          placeholder="When does this process NOT apply?"
          className="min-h-[80px]"
          disabled={readOnly}
        />
      </div>

      {/* Related Policies */}
      <div>
        <Label htmlFor="related_policies" className="text-sm font-medium mb-2 block">
          Related Policies
        </Label>
        <Textarea
          id="related_policies"
          value={data.related_policies}
          onChange={(e) => onChange('related_policies', e.target.value)}
          placeholder="Any related procedures or policies..."
          className="min-h-[60px]"
          disabled={readOnly}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Effective Date */}
        <div>
          <Label htmlFor="effective_date" className="text-sm font-medium mb-2 block">
            Effective Date
          </Label>
          <Input
            id="effective_date"
            type="date"
            value={data.effective_date}
            onChange={(e) => onChange('effective_date', e.target.value)}
            disabled={readOnly}
          />
        </div>

        {/* Review Date */}
        <div>
          <Label htmlFor="review_date" className="text-sm font-medium mb-2 block">
            Review Date
          </Label>
          <Input
            id="review_date"
            type="date"
            value={data.review_date}
            onChange={(e) => onChange('review_date', e.target.value)}
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  )
}

