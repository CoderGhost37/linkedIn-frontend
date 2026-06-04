'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, User, UserPlus } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { PostCard, type Post } from '@/components/post-card'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'
import LinkedInLogo from '@/public/og.png'

interface UserProfile {
  id: number
  name: string
  headline: string | null
  location: string | null
  profilePictureUrl: string | null
}

interface Connection {
  userId: number
  name: string
}

export default function FeedPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<Connection[]>([])
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    apiFetch('/api/user/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setProfile(data))
      .catch(() => { })

    apiFetch('/api/posts/feed')
      .then(r => r.ok ? r.json() : [])
      .then(data => setPosts(data))
      .catch(() => { })
      .finally(() => setPostsLoading(false))

    apiFetch('/api/connections/second-degree')
      .then(r => r.ok ? r.json() : [])
      .then(data => setSuggestions(data.slice(0, 5)))
      .catch(() => { })
  }, [])

  const handleConnect = async (userId: number) => {
    setPendingIds(prev => new Set(prev).add(userId))
    try {
      await apiFetch(`/api/connections/request/${userId}`, { method: 'POST' })
    } catch {
      setPendingIds(prev => { const s = new Set(prev); s.delete(userId); return s })
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex gap-5 items-start">

        {/* Left — profile (1/4) */}
        <div className="w-1/4 sticky top-20 shrink-0">
          <Card className="">
            <CardContent className="px-4 flex flex-col items-center text-center">
              <div className="mb-3">
                {profile?.profilePictureUrl ? (
                  <img
                    src={profile.profilePictureUrl}
                    alt={profile.name}
                    className="h-24 w-24 rounded-full border-[3px] border-card object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-card bg-muted">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <h2 className="font-bold text-lg text-foreground leading-snug">
                {profile?.name ?? '—'}
              </h2>

              {profile?.headline && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {profile.headline}
                </p>
              )}

              {profile?.location && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {profile.location}
                </p>
              )}

              <div className="mt-4 w-full border-t border-border pt-3">
                <Link
                  href={`/user/${profile?.id}`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'w-full rounded-full',
                  )}
                >
                  View full profile
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center — feed posts (1/2) */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {postsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                        <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded bg-muted animate-pulse" />
                      <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-3/5 rounded bg-muted animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-border bg-card py-16 text-center">
              <p className="text-sm font-medium text-foreground">No posts yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Connect with people to see their posts here.
              </p>
            </div>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>

        {/* Right — people you may know (1/4) */}
        <div className="w-1/4 sticky top-20 shrink-0 space-y-3">
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
                      {pendingIds.has(person.userId) ? (
                        'Sent'
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Footer links */}
          <div className="flex flex-wrap gap-x-2 gap-y-1 mt-2">
            {[
              'About', 'Accessibility', 'Help Center',
              'Privacy & Terms', 'Ad Choices', 'Advertising',
              'Business Services', 'Get the LinkedIn app', 'More',
            ].map(label => (
              <Link
                key={label}
                href="#"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Image src={LinkedInLogo} alt="LinkedIn Logo" width={64} height={64} />
            <span className="text-xs text-muted-foreground">LinkedIn Corporation © 2026</span>
          </p>
        </div>

      </div>
    </div>
  )
}
