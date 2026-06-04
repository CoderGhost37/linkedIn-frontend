'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Mail, Lock } from 'lucide-react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }

      const { token } = await response.json()
      localStorage.setItem('authToken', token)
      router.push('/feed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Background Image */}
      <div className="hidden w-1/2 lg:flex lg:flex-col lg:justify-between bg-gradient-to-b from-[#1a3a52] to-[#0f2a3d] p-12">
        <div className="flex items-center gap-2">
          <svg
            className="h-8 w-8 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
          </svg>
          <span className="text-xl font-bold text-white">LinkedIn</span>
        </div>
        <div className="space-y-8">
          <img
            src="/auth-bg.png"
            alt="LinkedIn Background"
            className="rounded-lg w-full object-cover h-64"
          />
          <div>
            <p className="text-lg font-light text-white italic">
              "The best way to predict the future is to create it."
            </p>
            <p className="mt-4 text-sm text-gray-300">— Peter Drucker</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-8 lg:w-1/2 lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="mb-8 flex lg:hidden items-center gap-2">
            <svg
              className="h-6 w-6 text-[#0A66C2]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
            </svg>
            <span className="text-lg font-bold text-[#0A66C2]">LinkedIn</span>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-foreground">Sign in</h1>
          <p className="mb-6 text-muted-foreground">Stay updated on your professional world</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-border rounded-lg bg-card pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-border rounded-lg bg-card pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A66C2] py-2 text-white hover:bg-[#004182] mt-6"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
              Join now
            </Link>
          </p>

          {/* Footer Links */}
          <div className="mt-8 space-y-2 border-t border-border pt-8 text-center text-xs text-muted-foreground">
            <p>
              By signing in, you agree to our{' '}
              <Link href="#" className="text-primary hover:underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
