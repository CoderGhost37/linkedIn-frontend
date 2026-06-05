'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'

interface Notification {
  id: number
  senderId: number
  senderName: string
  senderProfilePictureUrl: string | null
  message: string
  createdAt: string
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function SenderAvatar({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return <img src={src} alt={name} className="h-12 w-12 rounded-full object-cover shrink-0" />
  }
  return (
    <div className="h-12 w-12 shrink-0 rounded-full bg-muted flex items-center justify-center">
      <span className="text-sm font-semibold text-muted-foreground">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/notifications')
      .then(r => r.ok ? r.json() : [])
      .then(data => setNotifications(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card>
      <CardHeader className="px-5 border-b border-border">
        <p className="text-base font-semibold text-foreground">Notifications</p>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="divide-y divide-border">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <div className="h-12 w-12 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground">
              You'll see updates about your connections and posts here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map(n => (
              <div key={n.id} className="flex items-start gap-3 px-5 py-4 hover:bg-muted/40 transition-colors">
                <Link href={`/user/${n.senderId}`} className="shrink-0">
                  <SenderAvatar src={n.senderProfilePictureUrl} name={n.senderName} />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    <Link href={`/user/${n.senderId}`} className="font-semibold hover:underline">
                      {n.senderName}
                    </Link>
                    {' '}
                    <span className="text-muted-foreground">{n.message.replace(n.senderName, '').trim()}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
