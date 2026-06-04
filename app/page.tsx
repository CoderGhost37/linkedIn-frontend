'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          router.push('/feed')
        } else {
          router.push('/auth/login')
        }
      } catch {
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [router])

  return null
}
