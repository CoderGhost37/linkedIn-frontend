'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

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

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(post.likedByCurrentUser)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [liking, setLiking] = useState(false)

  const handleLike = async () => {
    if (liking) return

    setLiking(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      const endpoint = `${backendUrl}/api/likes/${post.id}`

      if (liked) {
        const response = await fetch(endpoint, {
          method: 'DELETE',
          credentials: 'include',
        })
        if (response.ok) {
          setLiked(false)
          setLikeCount(Math.max(0, likeCount - 1))
        }
      } else {
        const response = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include',
        })
        if (response.ok) {
          setLiked(true)
          setLikeCount(likeCount + 1)
        }
      }
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setLiking(false)
    }
  }

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  })

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* Author Info */}
      <div className="mb-4 flex items-start gap-4">
        <div className="flex-shrink-0">
          {post.authorProfilePictureUrl ? (
            <img
              src={post.authorProfilePictureUrl}
              alt={post.authorName}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-bold text-primary">
                {post.authorName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{post.authorName}</h3>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
      </div>

      {/* Content */}
      <p className="mb-4 whitespace-pre-wrap break-words text-foreground">
        {post.content}
      </p>

      {/* Image */}
      {post.mediaUrl && (
        <img
          src={post.mediaUrl}
          alt="Post media"
          className="mb-4 w-full rounded-lg object-cover"
        />
      )}

      {/* Stats */}
      <div className="mb-4 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          {likeCount > 0 && `${likeCount} like${likeCount !== 1 ? 's' : ''}`}
          {likeCount > 0 && post.commentCount > 0 && ' • '}
          {post.commentCount > 0 &&
            `${post.commentCount} comment${post.commentCount !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 border-t border-border pt-4">
        <button
          onClick={handleLike}
          disabled={liking}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-muted disabled:opacity-50"
        >
          <Heart
            size={18}
            className={`transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
          />
          <span className="text-sm font-medium text-muted-foreground">Like</span>
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-muted">
          <MessageCircle size={18} className="text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Comment</span>
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-muted">
          <Share2 size={18} className="text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Share</span>
        </button>
      </div>
    </div>
  )
}
