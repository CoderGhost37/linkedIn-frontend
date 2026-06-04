'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThumbsUp, MessageSquare, User } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

export interface Post {
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

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return `${Math.floor(seconds / 604800)}w ago`
}

const CONTENT_LIMIT = 300

export function PostCard({ post: initialPost }: { post: Post }) {
  const [post, setPost] = useState(initialPost)
  const [expanded, setExpanded] = useState(false)

  const isLong = post.content.length > CONTENT_LIMIT
  const displayContent = isLong && !expanded
    ? post.content.slice(0, CONTENT_LIMIT).trimEnd() + '…'
    : post.content

  const toggleLike = async () => {
    const wasLiked = post.likedByCurrentUser
    setPost(p => ({
      ...p,
      likedByCurrentUser: !wasLiked,
      likeCount: wasLiked ? p.likeCount - 1 : p.likeCount + 1,
    }))
    try {
      const res = await apiFetch(`/api/likes/${post.id}`, { method: wasLiked ? 'DELETE' : 'POST' })
      if (!res.ok) throw new Error()
    } catch {
      setPost(p => ({
        ...p,
        likedByCurrentUser: wasLiked,
        likeCount: wasLiked ? p.likeCount + 1 : p.likeCount - 1,
      }))
    }
  }

  return (
    <Card>
      <CardContent className="">

        {/* Author row */}
        <Link href={`/user/${post.authorId}`} className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity">
          {post.authorProfilePictureUrl ? (
            <img
              src={post.authorProfilePictureUrl}
              alt={post.authorName}
              className="h-10 w-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">{post.authorName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(post.createdAt)}</p>
          </div>
        </Link>

        {/* Content */}
        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
          {displayContent}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            {expanded ? 'show less' : 'show more'}
          </button>
        )}

        {/* Media */}
        {post.mediaUrl && (
          <img
            src={post.mediaUrl}
            alt="Post media"
            className="mt-3 w-full rounded-lg object-cover max-h-96"
          />
        )}

        {/* Counts */}
        {(post.likeCount > 0 || post.commentCount > 0) && (
          <div className="mt-3 flex items-center text-xs text-muted-foreground">
            {post.likeCount > 0 && (
              <span>{post.likeCount} like{post.likeCount !== 1 ? 's' : ''}</span>
            )}
            {post.commentCount > 0 && (
              <span className="ml-auto">
                {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="mt-2 border-t border-border" />

        {/* Actions */}
        <div className="mt-1 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLike}
            className={cn('flex-1 gap-1.5', post.likedByCurrentUser && 'text-primary')}
          >
            <ThumbsUp
              className={cn('h-4 w-4', post.likedByCurrentUser && 'fill-primary stroke-primary')}
            />
            Like
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 gap-1.5">
            <MessageSquare className="h-4 w-4" />
            Comment
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
