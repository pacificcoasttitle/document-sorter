"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const sections: {href:string;label:string;workspace?:string}[] = [
  { href: '/', label: 'Title guidance', workspace:'underwriting' },
  { href: '/', label: 'Procedures', workspace:'operations' },
  { href: '/prelim-standards', label: 'Prelim help' },
  { href: '/help', label: 'How to use Tessa' },
]

export function AppNavigation() {
  const pathname = usePathname()
  const { user } = useAuth()
  const {currentWorkspace,workspaces,setWorkspace}=useWorkspace()
  if (!user || pathname === '/login') return null
  const links: typeof sections = user.role === 'admin' ? [...sections, { href: '/admin', label: 'Admin' }] : sections
  const context = pathname.startsWith('/admin')
    ? ['TEAM ADMINISTRATION', 'Keep the right people connected to the right work.']
    : pathname.startsWith('/help')
    ? ['HELP & RESOURCES', 'Clear instructions, whenever you need a hand.']
    : pathname.startsWith('/sop')
    ? ['OPERATIONS / PROCEDURES', 'Turn team knowledge into a clear, repeatable process.']
    : ['/upload', '/review', '/confirm'].includes(pathname)
    ? ['UNDERWRITING / DOCUMENT REVIEW', 'Upload. Review. Confirm. Keep the source connected to the guidance.']
    : pathname === '/settings'
    ? ['YOUR ACCOUNT', 'Manage your profile and account security.'] : null
  return <>
    <nav aria-label="Main sections" className="bg-white shadow-sm">
      <div className="mx-auto max-w-[1500px] flex gap-2 overflow-x-auto px-4 sm:px-6 py-3">
        {links.map(link => {
          const inLibrary=pathname==='/'||pathname.startsWith('/sop')||['/upload','/review','/confirm'].includes(pathname)
          const active = link.workspace ? inLibrary && (pathname.startsWith('/sop')?'operations':currentWorkspace?.slug)===link.workspace : pathname.startsWith(link.href)
          return <Link key={link.label} href={link.href} onClick={()=>{if(link.workspace){const workspace=workspaces.find(w=>w.slug===link.workspace);if(workspace)setWorkspace(workspace);}}} aria-current={active ? 'page' : undefined}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${active ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{link.label}</Link>
        })}
      </div>
    </nav>
    {context && <div className="mx-auto max-w-[1500px] px-6 pt-7">
      <div className="rounded-xl bg-primary px-6 py-5 text-white">
        <p className="text-xs font-semibold tracking-widest text-orange-300">{context[0]}</p>
        <p className="mt-2 text-base font-medium">{context[1]}</p>
      </div>
    </div>}
  </>
}
