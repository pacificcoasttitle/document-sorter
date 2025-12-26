"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, BookOpen } from "lucide-react"

const sections = [
  { id: "overview", title: "Overview" },
  { id: "workspaces", title: "Workspaces" },
  { id: "underwriting", title: "Underwriting Workflow" },
  { id: "operations", title: "Operations Workflow" },
  { id: "searching", title: "Searching & Filtering" },
  { id: "status", title: "Understanding Status" },
  { id: "tips", title: "Tips & Best Practices" },
]

export default function UserGuidePage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("overview")

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
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
            <BookOpen className="w-10 h-10 text-blue-500" />
            <h1 className="text-3xl font-bold text-foreground">User Guide</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Complete guide to using Tessa Knowledge Tool
          </p>
        </div>

        <div className="flex gap-8">
          {/* Table of Contents - Sticky Sidebar */}
          <nav className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Contents</h3>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`text-sm w-full text-left px-2 py-1 rounded transition-colors ${
                        activeSection === section.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-card border border-border rounded-lg p-8 prose prose-slate dark:prose-invert max-w-none">
              
              {/* Overview */}
              <section id="overview">
                <h2 className="text-2xl font-bold mt-0">Overview</h2>
                
                <p>
                  Tessa Knowledge Tool is a knowledge management system for Pacific Coast Title. It helps organize underwriting guidance and operational procedures in one searchable location.
                </p>

                <h3>Key Concepts</h3>
                
                <ul>
                  <li><strong>Workspaces</strong> — Separate areas for different types of knowledge (Underwriting vs Operations)</li>
                  <li><strong>Entries</strong> — Individual pieces of guidance in the Underwriting workspace</li>
                  <li><strong>SOPs</strong> — Standard Operating Procedures in the Operations workspace</li>
                  <li><strong>Status</strong> — Content moves through Draft → Pending → Approved</li>
                </ul>
              </section>

              <hr className="my-8 border-border" />

              {/* Workspaces */}
              <section id="workspaces">
                <h2 className="text-2xl font-bold">Workspaces</h2>

                <h3>Switching Workspaces</h3>
                
                <p>Click the workspace selector in the header to switch between:</p>
                
                <ul>
                  <li>
                    <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded">Underwriting</span> — Title insurance knowledge base powered by Tessa
                  </li>
                  <li>
                    <span className="inline-flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded">Operations</span> — Department standard operating procedures
                  </li>
                </ul>
                
                <p>Your workspace choice is remembered between sessions.</p>

                <h3>What&apos;s the Difference?</h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Underwriting</th>
                        <th className="text-left">Operations</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Upload existing documents</td>
                        <td>Create from scratch</td>
                      </tr>
                      <tr>
                        <td>AI extracts guidance</td>
                        <td>AI helps you write SOPs</td>
                      </tr>
                      <tr>
                        <td>Topics: Bankruptcy, Probate, Trusts</td>
                        <td>Departments: Marketing, Payoff, etc.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <hr className="my-8 border-border" />

              {/* Underwriting Workflow */}
              <section id="underwriting">
                <h2 className="text-2xl font-bold">Underwriting Workflow</h2>

                <h3>Uploading a Document</h3>
                
                <ol>
                  <li>Make sure you&apos;re in the <strong>Underwriting</strong> workspace</li>
                  <li>Click <strong>&quot;+ Upload New Document&quot;</strong> in the top right</li>
                  <li>Drag and drop your file or click to browse
                    <ul>
                      <li>Supported formats: PDF, DOCX, TXT</li>
                    </ul>
                  </li>
                  <li>Click <strong>&quot;Process Document&quot;</strong></li>
                </ol>

                <h3>AI Processing</h3>
                
                <p>The AI will:</p>
                <ul>
                  <li>Detect the document format (Q&amp;A, narrative, bulletin, etc.)</li>
                  <li>Extract each piece of guidance as a separate entry</li>
                  <li>Assign topics and subtopics</li>
                  <li>Identify required documents and decision steps</li>
                  <li>Rate confidence level (High/Medium/Low)</li>
                </ul>
                
                <p className="text-muted-foreground">This typically takes 10-30 seconds depending on document length.</p>

                <h3>Reviewing Entries</h3>
                
                <p>After processing, you&apos;ll see extracted entries. For each entry:</p>
                
                <ul>
                  <li><strong>Topic</strong> — Main category (Bankruptcy, Probate, Trusts)</li>
                  <li><strong>Subtopic</strong> — Specific area (e.g., Chapter 7, Limited Authority)</li>
                  <li><strong>Scenario</strong> — When this guidance applies</li>
                  <li><strong>Required Documents</strong> — What documents are needed</li>
                  <li><strong>Decision Steps</strong> — What the underwriter should do</li>
                  <li><strong>Risk Level</strong> — Low, Medium, or High</li>
                  <li><strong>Exception Language</strong> — Approved wording if needed</li>
                  <li><strong>Confidence</strong> — How confident the AI is in this extraction</li>
                </ul>

                <h3>What to Look For</h3>
                
                <ul>
                  <li><strong>Low confidence entries</strong> appear first and need the most attention</li>
                  <li><strong>&quot;NOT SPECIFIED&quot;</strong> fields mean the AI couldn&apos;t find this information — you should fill it in or confirm it&apos;s not applicable</li>
                  <li><strong>Check that topics are correct</strong> — the AI may occasionally miscategorize</li>
                </ul>

                <h3>Editing Entries</h3>
                
                <p>All fields are editable. Click any field to modify it. You can also:</p>
                <ul>
                  <li>Delete entries that aren&apos;t relevant</li>
                  <li>Add new entries manually with &quot;+ Add Another Entry&quot;</li>
                </ul>

                <h3>Saving to Knowledge Base</h3>
                
                <ol>
                  <li>Click <strong>&quot;Continue to Confirm&quot;</strong></li>
                  <li>Review the summary</li>
                  <li>Enter your name as the Owner</li>
                  <li>Click <strong>&quot;Approve &amp; Save&quot;</strong></li>
                </ol>
                
                <p>Entries are now in the knowledge base and searchable.</p>
              </section>

              <hr className="my-8 border-border" />

              {/* Operations Workflow */}
              <section id="operations">
                <h2 className="text-2xl font-bold">Operations Workflow</h2>

                <h3>Creating an SOP</h3>
                
                <ol>
                  <li>Switch to the <strong>Operations</strong> workspace</li>
                  <li>Click <strong>&quot;+ Create New SOP&quot;</strong></li>
                  <li>Enter a title for your procedure</li>
                  <li>Select your department</li>
                </ol>

                <h3>AI Interview</h3>
                
                <p>The AI will ask you questions about your process:</p>
                
                <ol>
                  <li><strong>Who is responsible?</strong> — Who performs this task</li>
                  <li><strong>What triggers this?</strong> — What starts this process</li>
                  <li><strong>Walk through the steps</strong> — Describe the procedure in your own words</li>
                  <li><strong>Any exceptions?</strong> — When does this NOT apply</li>
                  <li><strong>Related policies?</strong> — Other procedures this connects to</li>
                </ol>
                
                <p>Answer naturally — the AI will structure your answers into a formal SOP.</p>

                <h3>Reviewing the Generated SOP</h3>
                
                <p>The AI creates a formatted SOP with:</p>
                <ul>
                  <li>Purpose</li>
                  <li>Scope</li>
                  <li>Responsible Party</li>
                  <li>Trigger Event</li>
                  <li>Steps (numbered)</li>
                  <li>Exceptions</li>
                  <li>Related Policies</li>
                  <li>Suggested Review Date</li>
                </ul>
                
                <p>Edit any field before saving.</p>

                <h3>Saving Your SOP</h3>
                
                <ul>
                  <li><strong>Save as Draft</strong> — Keep working on it later</li>
                  <li><strong>Submit for Approval</strong> — Send to admin for review</li>
                </ul>

                <h3>Approval Process</h3>
                
                <ol>
                  <li>You submit your SOP</li>
                  <li>Status changes to <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm rounded">Pending</span></li>
                  <li>An admin reviews and approves</li>
                  <li>Status changes to <span className="inline-flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded">Approved</span></li>
                  <li>Approved SOPs can only be edited by admins</li>
                </ol>
              </section>

              <hr className="my-8 border-border" />

              {/* Searching & Filtering */}
              <section id="searching">
                <h2 className="text-2xl font-bold">Searching &amp; Filtering</h2>

                <h3>Search</h3>
                
                <p>Type in the search bar to find entries or SOPs by keyword. Search looks at:</p>
                <ul>
                  <li>Titles and scenarios</li>
                  <li>Subtopics and departments</li>
                  <li>Content within entries</li>
                </ul>

                <h3>Filters</h3>
                
                <p><strong>Underwriting filters:</strong></p>
                <ul>
                  <li>Topic (Bankruptcy, Probate, Trusts, All)</li>
                  <li>Risk Level (Low, Medium, High, All)</li>
                </ul>
                
                <p><strong>Operations filters:</strong></p>
                <ul>
                  <li>Department (Marketing, Payoff, etc., All)</li>
                  <li>Status (Draft, Pending, Approved, All)</li>
                </ul>

                <h3>Viewing Details</h3>
                
                <p>Click any card to see the full entry or SOP. From there you can:</p>
                <ul>
                  <li>Edit (if you have permission)</li>
                  <li>Submit for approval (for your drafts)</li>
                  <li>See who created it and when</li>
                </ul>
              </section>

              <hr className="my-8 border-border" />

              {/* Understanding Status */}
              <section id="status">
                <h2 className="text-2xl font-bold">Understanding Status</h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Status</th>
                        <th className="text-left">Badge</th>
                        <th className="text-left">Meaning</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Draft</td>
                        <td><span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded">Draft</span></td>
                        <td>Work in progress, only visible to you and admins</td>
                      </tr>
                      <tr>
                        <td>Pending</td>
                        <td><span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm rounded">Pending</span></td>
                        <td>Submitted, waiting for admin approval</td>
                      </tr>
                      <tr>
                        <td>Approved</td>
                        <td><span className="inline-flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded">Approved</span></td>
                        <td>Official, locked for editing (admin only can modify)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <hr className="my-8 border-border" />

              {/* Tips & Best Practices */}
              <section id="tips">
                <h2 className="text-2xl font-bold">Tips &amp; Best Practices</h2>

                <h3>For Uploading Documents</h3>
                
                <ul>
                  <li><strong>One topic per document works best</strong> — AI handles focused documents better</li>
                  <li><strong>Text-based PDFs work better than scans</strong> — OCR quality affects extraction</li>
                  <li><strong>Review low-confidence entries carefully</strong> — they need human attention</li>
                </ul>

                <h3>For Creating SOPs</h3>
                
                <ul>
                  <li><strong>Be specific in your answers</strong> — more detail = better SOP</li>
                  <li><strong>Describe actual current practice</strong> — not how it &quot;should&quot; work</li>
                  <li><strong>Include edge cases in exceptions</strong> — helps others handle unusual situations</li>
                </ul>

                <h3>General Tips</h3>
                
                <ul>
                  <li><strong>Search before creating</strong> — the knowledge may already exist</li>
                  <li><strong>Keep entries focused</strong> — one scenario per entry is better than many</li>
                  <li><strong>Update regularly</strong> — flag outdated content for review</li>
                </ul>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

