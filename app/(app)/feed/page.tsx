'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, User } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { PostCard, type Post } from '@/components/post-card'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

interface UserProfile {
  id: number
  name: string
  headline: string | null
  location: string | null
  profilePictureUrl: string | null
}

export default function FeedPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)

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
  }, [])

  return (
    <div className="flex gap-5 items-start">

      {/* Left — profile card */}
      <div className="w-64 shrink-0 sticky top-20">
        <Card className="overflow-hidden">
          <CardContent className="px-4 pb-5 pt-0 flex flex-col items-center text-center">
            <div className="mb-3">
              {profile?.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt={profile.name}
                  className="h-16 w-16 rounded-full border-[3px] border-card object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-card bg-muted">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <h2 className="font-bold text-sm text-foreground leading-snug">
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
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full rounded-full')}
              >
                View full profile
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center — feed posts */}
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

    </div>
  )
}
