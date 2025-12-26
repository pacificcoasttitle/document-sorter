"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, Rocket } from "lucide-react"

export default function QuickStartPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => router.push('/help')}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Help Center
          </button>
          <div className="flex items-center gap-3 mb-3">
            <Rocket className="w-10 h-10 text-orange-500" />
            <h1 className="text-3xl font-bold text-foreground">Quick Start</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Get up and running in 5 minutes
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mt-0">Quick Start Guide</h2>
            
            <p className="text-lg text-muted-foreground">
              Welcome to Tessa Knowledge Tool! This guide will get you up and running in 5 minutes.
            </p>

            <hr className="my-8 border-border" />

            <h3 className="text-xl font-semibold">What is this tool?</h3>
            
            <p>
              Tessa Knowledge Tool helps Pacific Coast Title organize knowledge in two ways:
            </p>
            
            <ul className="space-y-2">
              <li>
                <strong className="text-blue-600 dark:text-blue-400">Underwriting</strong> — Upload existing documents (laws, guidelines, bulletins) and AI extracts structured guidance
              </li>
              <li>
                <strong className="text-green-600 dark:text-green-400">Operations</strong> — Create Standard Operating Procedures (SOPs) from scratch with AI assistance
              </li>
            </ul>

            <hr className="my-8 border-border" />

            <h3 className="text-xl font-semibold">Step 1: Choose Your Workspace</h3>
            
            <p>
              Use the workspace selector in the header to switch between:
            </p>
            
            <ul className="space-y-2">
              <li>
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded">Underwriting</span> — For title insurance knowledge
              </li>
              <li>
                <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded">Operations</span> — For department SOPs
              </li>
            </ul>

            <hr className="my-8 border-border" />

            <h3 className="text-xl font-semibold">Step 2: For Underwriting — Upload a Document</h3>
            
            <ol className="space-y-3">
              <li>Click <strong>&quot;+ Upload New Document&quot;</strong></li>
              <li>Drag and drop a PDF, Word doc, or text file</li>
              <li>Click <strong>&quot;Process Document&quot;</strong></li>
              <li>AI will extract guidance into structured entries</li>
              <li>Review and edit each entry</li>
              <li>Click <strong>&quot;Approve &amp; Save&quot;</strong></li>
            </ol>
            
            <p className="text-muted-foreground">
              Your entries are now searchable in the knowledge base!
            </p>

            <hr className="my-8 border-border" />

            <h3 className="text-xl font-semibold">Step 3: For Operations — Create an SOP</h3>
            
            <ol className="space-y-3">
              <li>Switch to <strong>Operations</strong> workspace</li>
              <li>Click <strong>&quot;+ Create New SOP&quot;</strong></li>
              <li>Enter a title and select your department</li>
              <li>Answer the AI&apos;s questions about your process</li>
              <li>Review the generated SOP</li>
              <li>Save as Draft or Submit for Approval</li>
            </ol>

            <hr className="my-8 border-border" />

            <h3 className="text-xl font-semibold">Step 4: Search and Browse</h3>
            
            <p>
              Use the Library to find existing knowledge:
            </p>
            
            <ul className="space-y-2">
              <li><strong>Search</strong> by keyword</li>
              <li><strong>Filter</strong> by topic, department, or status</li>
              <li><strong>Click</strong> any card to view full details</li>
            </ul>

            <hr className="my-8 border-border" />

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-blue-800 dark:text-blue-200 font-semibold mt-0 mb-2">Need Help?</h4>
              <p className="text-blue-700 dark:text-blue-300 mb-0">
                Contact your administrator or check the full <a href="/help/user-guide" className="underline hover:no-underline">User Guide</a> for more details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

