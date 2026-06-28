'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// App home → redirect to missions (mission-first design)
export default function AppHome() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/missions')
  }, [router])
  return null
}
