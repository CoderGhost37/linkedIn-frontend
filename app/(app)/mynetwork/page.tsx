'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, Check, X, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'

interface PendingRequest {
  id: number
  name: string
  profilePictureUrl: string | null
  headline: string | null
}

interface Suggestion {
  id: number
  name: string
  profilePictureUrl: string | null
  headline: string | null
}

interface SecondDegree {
  userId: number
  name: string
}

function PersonAvatar({ src, name, size = 'md' }: { src: string | null; name: string; size?: 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-14 w-14 text-base' : 'h-12 w-12 text-sm'
  if (src) return <img src={src} alt={name} className={`${size === 'lg' ? 'h-14 w-14' : 'h-12 w-12'} rounded-full object-cover shrink-0`} />
  return (
    <div className={`${size === 'lg' ? 'h-14 w-14' : 'h-12 w-12'} shrink-0 rounded-full bg-muted flex items-center justify-center`}>
      <span className={`${dim.includes('text-base') ? 'text-base' : 'text-sm'} font-semibold text-muted-foreground`}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

export default function MyNetworkPage() {
  const [pending, setPending] = useState<PendingRequest[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [secondDegree, setSecondDegree] = useState<SecondDegree[]>([])

  const [pendingLoading, setPendingLoading] = useState(true)
  const [suggestionsLoading, setSuggestionsLoading] = useState(true)
  const [secondLoading, setSecondLoading] = useState(true)

  const [actioning, setActioning] = useState<Set<number>>(new Set())
  const [connectingIds, setConnectingIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    apiFetch('/api/connections/pending')
      .then(r => r.ok ? r.json() : [])
      .then(data => setPending(data))
      .catch(() => {})
      .finally(() => setPendingLoading(false))

    apiFetch('/api/connections/suggestions')
      .then(r => r.ok ? r.json() : [])
      .then(data => setSuggestions(data))
      .catch(() => {})
      .finally(() => setSuggestionsLoading(false))

    apiFetch('/api/connections/second-degree')
      .then(r => r.ok ? r.json() : [])
      .then(data => setSecondDegree(data))
      .catch(() => {})
      .finally(() => setSecondLoading(false))
  }, [])

  const handleAccept = async (userId: number, name: string) => {
    setActioning(prev => new Set(prev).add(userId))
    try {
      const res = await apiFetch(`/api/connections/accept/${userId}`, { method: 'POST' })
      if (!res.ok) throw new Error()
      setPending(prev => prev.filter(r => r.id !== userId))
      toast.success(`You are now connected with ${name}`)
    } catch {
      toast.error('Failed to accept request')
    } finally {
      setActioning(prev => { const s = new Set(prev); s.delete(userId); return s })
    }
  }

  const handleReject = async (userId: number) => {
    setActioning(prev => new Set(prev).add(userId))
    try {
      const res = await apiFetch(`/api/connections/reject/${userId}`, { method: 'POST' })
      if (!res.ok) throw new Error()
      setPending(prev => prev.filter(r => r.id !== userId))
      toast.success('Request declined')
    } catch {
      toast.error('Failed to decline request')
    } finally {
      setActioning(prev => { const s = new Set(prev); s.delete(userId); return s })
    }
  }

  const handleConnect = async (userId: number) => {
    setConnectingIds(prev => new Set(prev).add(userId))
    try {
      const res = await apiFetch(`/api/connections/request/${userId}`, { method: 'POST' })
      if (!res.ok) throw new Error()
      toast.success('Connection request sent')
    } catch {
      setConnectingIds(prev => { const s = new Set(prev); s.delete(userId); return s })
      toast.error('Failed to send request')
    }
  }

  return (
    <div className="space-y-6">

      {/* Pending Requests */}
      <Card>
        <CardHeader className="px-5 border-b border-border">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-foreground">Pending Requests</p>
            {!pendingLoading && pending.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                {pending.length}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-5 py-4">
          {pendingLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-36 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-48 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-16 rounded-full bg-muted animate-pulse" />
                    <div className="h-8 w-16 rounded-full bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : pending.length === 0 ? (
            <div className="flex items-center gap-3 py-6 justify-center">
              <User className="h-6 w-6 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No pending requests</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pending.map(req => (
                <div key={req.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Link href={`/user/${req.id}`}>
                    <PersonAvatar src={req.profilePictureUrl} name={req.name} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/user/${req.id}`} className="text-sm font-semibold text-foreground hover:underline truncate block">
                      {req.name}
                    </Link>
                    {req.headline && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{req.headline}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="rounded-full gap-1" disabled={actioning.has(req.id)} onClick={() => handleReject(req.id)}>
                      <X className="h-3.5 w-3.5" /> Ignore
                    </Button>
                    <Button size="sm" className="rounded-full gap-1" disabled={actioning.has(req.id)} onClick={() => handleAccept(req.id, req.name)}>
                      <Check className="h-3.5 w-3.5" /> Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested for you */}
      <Card>
        <CardHeader className="px-5 border-b border-border">
          <p className="text-base font-semibold text-foreground">Suggested for you</p>
        </CardHeader>
        <CardContent className="px-5 py-4">
          {suggestionsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 rounded-xl border border-border p-4">
                  <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
                  <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                  <div className="h-7 w-full rounded-full bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="flex justify-center py-8">
              <p className="text-sm text-muted-foreground">No suggestions right now</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {suggestions.map(person => (
                <div key={person.id} className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center">
                  <Link href={`/user/${person.id}`}>
                    <PersonAvatar src={person.profilePictureUrl} name={person.name} size="lg" />
                  </Link>
                  <Link href={`/user/${person.id}`} className="text-sm font-semibold text-foreground hover:underline line-clamp-1 w-full">
                    {person.name}
                  </Link>
                  {person.headline && <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">{person.headline}</p>}
                  <Button size="sm" variant="outline" className="rounded-full gap-1 w-full mt-auto" disabled={connectingIds.has(person.id)} onClick={() => handleConnect(person.id)}>
                    {connectingIds.has(person.id) ? 'Sent' : <><UserPlus className="h-3.5 w-3.5" />Connect</>}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* People you may know */}
      <Card>
        <CardHeader className="px-5 border-b border-border">
          <p className="text-base font-semibold text-foreground">People you may know</p>
        </CardHeader>
        <CardContent className="px-5 py-4">
          {secondLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 rounded-xl border border-border p-4">
                  <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                  <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-7 w-full rounded-full bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : secondDegree.length === 0 ? (
            <div className="flex justify-center py-8">
              <p className="text-sm text-muted-foreground">No suggestions right now</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {secondDegree.map(person => (
                <div key={person.userId} className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center">
                  <Link href={`/user/${person.userId}`}>
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-semibold text-muted-foreground">
                        {person.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Link>
                  <Link href={`/user/${person.userId}`} className="text-sm font-semibold text-foreground hover:underline line-clamp-1 w-full">
                    {person.name}
                  </Link>
                  <Button size="sm" variant="outline" className="rounded-full gap-1 w-full" disabled={connectingIds.has(person.userId)} onClick={() => handleConnect(person.userId)}>
                    {connectingIds.has(person.userId) ? 'Sent' : <><UserPlus className="h-3.5 w-3.5" />Connect</>}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
