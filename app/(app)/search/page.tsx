'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, UserPlus, Search } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'

interface SearchResult {
  id: number
  name: string
  headline: string | null
  location: string | null
  profilePictureUrl: string | null
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [committed, setCommitted] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [connectingIds, setConnectingIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!committed.trim()) { setResults([]); return }
    setLoading(true)
    apiFetch(`/api/user/search?query=${encodeURIComponent(committed.trim())}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setResults(data))
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [committed])

  const handleSearch = () => {
    const q = query.trim()
    if (!q) return
    setCommitted(q)
    router.replace(`/search?q=${encodeURIComponent(q)}`)
  }

  const handleConnect = async (userId: number) => {
    setConnectingIds(prev => new Set(prev).add(userId))
    try {
      const res = await apiFetch(`/api/connections/request/${userId}`, { method: 'POST' })
      if (!res.ok) throw new Error()
    } catch {
      setConnectingIds(prev => { const s = new Set(prev); s.delete(userId); return s })
    }
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search people by name, headline, or location…"
            className="pl-9"
            autoFocus
          />
        </div>
        <Button onClick={handleSearch} disabled={!query.trim()}>Search</Button>
      </div>

      {/* Results */}
      {committed.trim() && (
        <Card>
          <CardHeader className="px-5 border-b border-border">
            <p className="text-sm font-semibold text-foreground">
              {loading ? 'Searching…' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${committed}"`}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="divide-y divide-border">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="h-14 w-14 rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-40 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-56 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <User className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-foreground">No people found</p>
                <p className="text-xs text-muted-foreground">Try a different name, headline, or location.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {results.map(person => (
                  <div key={person.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors">
                    <Link href={`/user/${person.id}`} className="shrink-0">
                      {person.profilePictureUrl ? (
                        <img src={person.profilePictureUrl} alt={person.name} className="h-14 w-14 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                          <User className="h-7 w-7 text-muted-foreground" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/user/${person.id}`} className="text-sm font-semibold text-foreground hover:underline truncate block">
                        {person.name}
                      </Link>
                      {person.headline && <p className="text-xs text-muted-foreground mt-0.5 truncate">{person.headline}</p>}
                      {person.location && <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{person.location}</p>}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full gap-1.5 shrink-0"
                      disabled={connectingIds.has(person.id)}
                      onClick={() => handleConnect(person.id)}
                    >
                      {connectingIds.has(person.id) ? 'Sent' : <><UserPlus className="h-3.5 w-3.5" />Connect</>}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!committed.trim() && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Search className="h-12 w-12 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">Search for people by name, headline, or location.</p>
        </div>
      )}
    </div>
  )
}
