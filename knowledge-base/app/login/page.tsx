"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setIsLoading(false)
        return
      }

      // Redirect to intended page or home
      router.push(redirect)
      router.refresh()
    } catch {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="email" className="text-foreground mb-2 block">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="bg-slate-100 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-foreground mb-2 block">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="bg-slate-100 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {error && (
        <div className="bg-red-50 rounded-lg px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-200"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Spinner className="w-5 h-5" />
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 -mt-16">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Tessa</h1>
          <p className="text-muted-foreground">Knowledge Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-primary mb-6 text-center">Sign In</h2>
          
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <Spinner className="w-8 h-8 text-primary" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Pacific Coast Title Company
        </p>
      </div>
    </div>
  )
}
