'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PostList from '@/components/feed/PostList'
import UserProfile from '@/components/feed/UserProfile'

interface UserProfile {
  id: number
  email: string
  name: string
  profilePictureUrl: string | null
  headline: string | null
  location: string | null
  bio: string | null
}

interface Post {
  id: number
  authorId: number
  authorName: string
  authorProfilePictureUrl: string | null
  content: string
  mediaUrl: string | null
  likeCount: number
  commentCount: number
  likedByCurrentUser: boolean
  createdAt: string
}

export default function FeedPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

        // Fetch user profile
        const profileResponse = await fetch(
          `${backendUrl}/api/user/profile`,
          {
            method: 'GET',
            credentials: 'include',
          }
        )

        if (!profileResponse.ok) {
          if (profileResponse.status === 401) {
            router.push('/auth/login')
            return
          }
          throw new Error('Failed to fetch profile')
        }

        const profile = await profileResponse.json()
        setUserProfile(profile)

        // Fetch feed posts
        const postsResponse = await fetch(
          `${backendUrl}/api/posts/feed`,
          {
            method: 'GET',
            credentials: 'include',
          }
        )

        if (postsResponse.ok) {
          const feedPosts = await postsResponse.json()
          setPosts(feedPosts)
        } else {
          throw new Error('Failed to fetch feed')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading feed...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center">
          <h1 className="mb-2 text-xl font-bold text-foreground">Backend Connection Error</h1>
          <p className="mb-4 text-sm text-muted-foreground">
            Make sure your backend server is running at <code className="rounded bg-muted px-2 py-1">http://localhost:8080</code>
          </p>
          <p className="mb-6 text-xs text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Posts */}
          <div className="lg:col-span-2">
            <PostList posts={posts} />
          </div>

          {/* Right Column - User Profile */}
          <div className="lg:col-span-1">
            {userProfile && <UserProfile user={userProfile} />}
          </div>
        </div>
      </div>
    </div>
  )
}
