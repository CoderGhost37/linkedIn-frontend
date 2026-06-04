'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, apiFetch } from '@/lib/api'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!getToken()) {
        router.push('/auth/login')
        return
      }
      try {
        const response = await apiFetch('/api/user/profile')
        router.push(response.ok ? '/feed' : '/auth/login')
      } catch {
        router.push('/auth/login')
      }
    }
    checkAuth()
  }, [router])

  return null
}
