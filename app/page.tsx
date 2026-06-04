'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      router.push('/feed')
    } else {
      router.push('/auth/login')
    }
  }, [router])

  return null
}
