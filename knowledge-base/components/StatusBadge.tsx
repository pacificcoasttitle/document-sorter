"use client"

interface StatusBadgeProps {
  status: 'draft' | 'pending' | 'approved' | string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'draft':
        return 'Draft'
      case 'pending':
        return 'Pending Approval'
      case 'approved':
        return 'Approved'
      default:
        return status
    }
  }

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${sizeClasses} ${getStatusStyles()}`}
    >
      {getStatusLabel()}
    </span>
  )
}

