'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }
      toast.success('Welcome back!', { description: 'You have signed in successfully.' })
      router.push('/feed')
    } catch (err) {
      toast.error('Sign in failed', {
        description: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="mb-1.5 text-3xl font-bold tracking-tight text-foreground">Sign in</h1>
      <p className="mb-8 text-muted-foreground">Stay updated on your professional world</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" loading={loading} size="lg" className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
          Join now
        </Link>
      </p>

      <p className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        By signing in, you agree to our{' '}
        <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
        {' '}and{' '}
        <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
      </p>
    </>
  )
}
