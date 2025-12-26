"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { ChevronLeft, Shield } from "lucide-react"

const sections = [
  { id: "overview", title: "Admin Overview" },
  { id: "users", title: "Managing Users" },
  { id: "departments", title: "Managing Departments" },
  { id: "approving", title: "Approving Content" },
  { id: "activity", title: "Activity Monitoring" },
  { id: "best-practices", title: "Best Practices" },
]

export default function AdminGuidePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState("overview")

  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "This guide is only available to administrators.",
        variant: "destructive"
      })
      router.push('/help')
    }
  }, [isLoading, user, router, toast])

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
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
            <Shield className="w-10 h-10 text-amber-500" />
            <h1 className="text-3xl font-bold text-foreground">Admin Guide</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Managing users, departments, and approvals
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
              
              {/* Admin Overview */}
              <section id="overview">
                <h2 className="text-2xl font-bold mt-0">Admin Overview</h2>
                
                <p>
                  This guide is for administrators (COO, CFO, and designated admins) who manage the Tessa Knowledge Tool.
                </p>

                <p>As an admin, you can:</p>
                
                <ul>
                  <li><strong>Manage Users</strong> — Create, edit, and delete user accounts</li>
                  <li><strong>Manage Departments</strong> — Add and remove departments</li>
                  <li><strong>Approve Content</strong> — Review and approve SOPs</li>
                  <li><strong>Edit Approved Content</strong> — Modify locked entries and SOPs</li>
                  <li><strong>View All Activity</strong> — See all actions across the system</li>
                </ul>
                
                <p>Access admin features via the <strong>Admin</strong> link in the header.</p>
              </section>

              <hr className="my-8 border-border" />

              {/* Managing Users */}
              <section id="users">
                <h2 className="text-2xl font-bold">Managing Users</h2>

                <h3>Accessing User Management</h3>
                
                <ol>
                  <li>Click <strong>Admin</strong> in the header</li>
                  <li>Click <strong>Manage Users</strong></li>
                </ol>

                <h3>User Roles</h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Role</th>
                        <th className="text-left">Permissions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="inline-flex items-center px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded font-medium">Admin</span></td>
                        <td>Full access — manage users, departments, approve content, edit anything</td>
                      </tr>
                      <tr>
                        <td><span className="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded font-medium">Department Head</span></td>
                        <td>Create and edit own content, view everything, submit for approval</td>
                      </tr>
                      <tr>
                        <td><span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded font-medium">Viewer</span></td>
                        <td>View only — cannot create or edit</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3>Adding a New User</h3>
                
                <ol>
                  <li>Click <strong>&quot;Add User&quot;</strong></li>
                  <li>Fill in:
                    <ul>
                      <li>Name</li>
                      <li>Email (used for login)</li>
                      <li>Password (temporary — they should change it)</li>
                      <li>Role</li>
                      <li>Department (optional)</li>
                    </ul>
                  </li>
                  <li>Click <strong>&quot;Create User&quot;</strong></li>
                  <li>Share credentials with the user and ask them to change their password</li>
                </ol>

                <h3>Editing a User</h3>
                
                <ol>
                  <li>Click <strong>Edit</strong> next to the user</li>
                  <li>Modify name, role, or department</li>
                  <li>Optionally set a new password</li>
                  <li>Click <strong>&quot;Save Changes&quot;</strong></li>
                </ol>

                <h3>Deleting a User</h3>
                
                <ol>
                  <li>Click <strong>Delete</strong> next to the user</li>
                  <li>Confirm the deletion</li>
                </ol>
                
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 not-prose">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>Note:</strong> You cannot delete yourself or users who own SOPs.
                  </p>
                </div>
              </section>

              <hr className="my-8 border-border" />

              {/* Managing Departments */}
              <section id="departments">
                <h2 className="text-2xl font-bold">Managing Departments</h2>

                <h3>Accessing Department Management</h3>
                
                <ol>
                  <li>Click <strong>Admin</strong> in the header</li>
                  <li>Click <strong>Manage Departments</strong></li>
                </ol>

                <h3>Adding a Department</h3>
                
                <ol>
                  <li>Select the workspace (Operations)</li>
                  <li>Enter the department name</li>
                  <li>Click <strong>&quot;Add Department&quot;</strong></li>
                </ol>
                
                <p>The new department will be available in the SOP creation flow.</p>

                <h3>Deleting a Department</h3>
                
                <ol>
                  <li>Click <strong>Delete</strong> next to the department</li>
                  <li>Confirm the deletion</li>
                </ol>
                
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 not-prose">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>Note:</strong> You cannot delete departments that have SOPs assigned.
                  </p>
                </div>
              </section>

              <hr className="my-8 border-border" />

              {/* Approving Content */}
              <section id="approving">
                <h2 className="text-2xl font-bold">Approving Content</h2>

                <h3>Finding Content to Approve</h3>
                
                <p>SOPs with <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm rounded">Pending</span> status need your review.</p>
                
                <p>To find them:</p>
                <ol>
                  <li>Go to <strong>Operations</strong> workspace</li>
                  <li>Filter by Status: <strong>Pending</strong></li>
                  <li>Or check the Activity Log for recent submissions</li>
                </ol>

                <h3>Reviewing an SOP</h3>
                
                <ol>
                  <li>Click the SOP card to open it</li>
                  <li>Read through all sections</li>
                  <li>Check for:
                    <ul>
                      <li>Accuracy of steps</li>
                      <li>Completeness</li>
                      <li>Clarity of language</li>
                      <li>Correct department assignment</li>
                    </ul>
                  </li>
                </ol>

                <h3>Approving an SOP</h3>
                
                <ol>
                  <li>Click <strong>&quot;Approve&quot;</strong> button</li>
                  <li>Status changes to <span className="inline-flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded">Approved</span></li>
                  <li>The SOP is now locked — only admins can edit it</li>
                </ol>

                <h3>Requesting Changes</h3>
                
                <p>If an SOP needs work:</p>
                <ol>
                  <li>Note what needs to change</li>
                  <li>Contact the owner directly</li>
                  <li>They can edit and resubmit</li>
                  <li>Or you can edit it yourself as admin</li>
                </ol>
              </section>

              <hr className="my-8 border-border" />

              {/* Activity Monitoring */}
              <section id="activity">
                <h2 className="text-2xl font-bold">Activity Monitoring</h2>

                <h3>Activity Log</h3>
                
                <p>The Activity Log (right sidebar) shows recent actions:</p>
                <ul>
                  <li>Document uploads</li>
                  <li>Entry/SOP creation</li>
                  <li>Edits and updates</li>
                  <li>Submissions and approvals</li>
                  <li>User and department changes</li>
                </ul>

                <h3>Filtering Activity</h3>
                
                <p>Use the dropdown to filter:</p>
                <ul>
                  <li>All Activity</li>
                  <li>Uploads</li>
                  <li>Edits</li>
                  <li>Deletions</li>
                  <li>Created</li>
                </ul>
              </section>

              <hr className="my-8 border-border" />

              {/* Best Practices */}
              <section id="best-practices">
                <h2 className="text-2xl font-bold">Best Practices</h2>

                <h3>User Management</h3>
                
                <ul>
                  <li><strong>Use descriptive names</strong> — helps identify users in activity logs</li>
                  <li><strong>Assign correct roles</strong> — don&apos;t give admin access unless necessary</li>
                  <li><strong>Set department for department heads</strong> — helps track ownership</li>
                  <li><strong>Require password changes</strong> — initial passwords should be temporary</li>
                </ul>

                <h3>Content Quality</h3>
                
                <ul>
                  <li><strong>Review before approving</strong> — you&apos;re the quality gate</li>
                  <li><strong>Don&apos;t approve incomplete SOPs</strong> — send back for revision</li>
                  <li><strong>Check for duplicates</strong> — search before approving similar content</li>
                  <li><strong>Keep entries focused</strong> — one topic/scenario per entry</li>
                </ul>

                <h3>Ongoing Maintenance</h3>
                
                <ul>
                  <li><strong>Review activity weekly</strong> — catch issues early</li>
                  <li><strong>Audit approved content quarterly</strong> — things change</li>
                  <li><strong>Remove unused departments</strong> — keep the system clean</li>
                  <li><strong>Offboard users promptly</strong> — delete accounts when people leave</li>
                </ul>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

