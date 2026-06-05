'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { UserPlus } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import LinkedInLogo from '@/public/og.png'

interface Connection {
  userId: number
  name: string
}

const FOOTER_LINKS = [
  'About', 'Accessibility', 'Help Center',
  'Privacy & Terms', 'Ad Choices', 'Advertising',
  'Business Services', 'Get the LinkedIn app', 'More',
]

export function RightSidebar() {
  const [suggestions, setSuggestions] = useState<Connection[]>([])
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    apiFetch('/api/connections/second-degree')
      .then(r => r.ok ? r.json() : [])
      .then(data => setSuggestions(data.slice(0, 5)))
      .catch(() => { })
  }, [])

  const handleConnect = async (userId: number) => {
    setPendingIds(prev => new Set(prev).add(userId))
    try {
      const res = await apiFetch(`/api/connections/request/${userId}`, { method: 'POST' })
      if (!res.ok) throw new Error()
    } catch {
      setPendingIds(prev => { const s = new Set(prev); s.delete(userId); return s })
    }
  }

  return (
    <div className="space-y-3">
      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="px-4 pt-4 pb-2">
            <p className="text-sm font-semibold text-foreground">People you may know</p>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            {suggestions.map(person => (
              <div key={person.userId} className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="flex-1 min-w-0 text-xs font-medium text-foreground truncate">
                  {person.name}
                </p>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={pendingIds.has(person.userId)}
                  onClick={() => handleConnect(person.userId)}
                  className="shrink-0 rounded-full gap-1"
                >
                  {pendingIds.has(person.userId) ? 'Sent' : (
                    <><UserPlus className="h-3 w-3" />Connect</>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Footer links */}
      <div className="flex flex-wrap gap-x-2 gap-y-1">
        {FOOTER_LINKS.map(label => (
          <Link
            key={label}
            href="#"
            className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <Image src={LinkedInLogo} alt="LinkedIn" width={64} height={64} />
        <p className="text-[11px] text-muted-foreground">LinkedIn Corporation © 2026</p>
      </div>
    </div>
  )
}
