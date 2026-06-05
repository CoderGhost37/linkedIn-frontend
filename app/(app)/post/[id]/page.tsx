'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ThumbsUp, User } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'
import { SendHorizontal, MessageSquare } from 'lucide-react'

interface Like {
  id: number
  userId: number
  userName: string
  userProfilePictureUrl: string | null
  createdAt: string
}

interface Comment {
  id: number
  postId: number
  userId: number
  userName: string
  userProfilePictureUrl: string | null
  content: string
  createdAt: string
  updatedAt: string
}

interface PostDetail {
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
  likes: Like[]
  comments: Comment[]
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return `${Math.floor(seconds / 604800)}w ago`
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [likesOpen, setLikesOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    apiFetch(`/api/posts/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setPost(data))
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [id])

  const toggleLike = async () => {
    if (!post) return
    const wasLiked = post.likedByCurrentUser
    setPost(p => p && ({ ...p, likedByCurrentUser: !wasLiked, likeCount: wasLiked ? p.likeCount - 1 : p.likeCount + 1 }))
    try {
      const res = await apiFetch(`/api/likes/${post.id}`, { method: wasLiked ? 'DELETE' : 'POST' })
      if (!res.ok) throw new Error()
    } catch {
      setPost(p => p && ({ ...p, likedByCurrentUser: wasLiked, likeCount: wasLiked ? p.likeCount + 1 : p.likeCount - 1 }))
    }
  }

  const submitComment = async () => {
    if (!post || !commentText.trim()) return
    setSubmitting(true)
    try {
      const res = await apiFetch(`/api/comments/${post.id}`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText.trim() }),
      })
      if (!res.ok) throw new Error()
      const newComment: Comment = await res.json()
      setPost(p => p && ({ ...p, comments: [...p.comments, newComment], commentCount: p.commentCount + 1 }))
      setCommentText('')
      toast.success('Comment posted')
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
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
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">Post not found.</p>
      </div>
    )
  }

  const sortedLikes = [...post.likes].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return (
    <div className="space-y-4">

      <Link href="/feed" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      {/* Post card */}
      <Card>
        <CardContent className="">
          {/* Author */}
          <Link href={`/user/${post.authorId}`} className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
            {post.authorProfilePictureUrl ? (
              <img src={post.authorProfilePictureUrl} alt={post.authorName} className="h-11 w-11 rounded-full object-cover shrink-0" />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">{post.authorName}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
            </div>
          </Link>

          {/* Content */}
          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{post.content}</p>

          {/* Media */}
          {post.mediaUrl && (
            <img src={post.mediaUrl} alt="Post media" className="mt-4 w-full rounded-lg object-cover" />
          )}

          {/* Counts row */}
          {(post.likeCount > 0 || post.commentCount > 0) && (
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              {post.likeCount > 0 && (
                <button
                  onClick={() => setLikesOpen(true)}
                  className="flex items-center gap-1 hover:text-primary hover:underline transition-colors"
                >
                  <ThumbsUp className="h-3 w-3" />
                  {post.likeCount} like{post.likeCount !== 1 ? 's' : ''}
                </button>
              )}
              {post.commentCount > 0 && (
                <span className="ml-auto flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          <div className="mt-2 border-t border-border" />

          {/* Actions */}
          <div className="mt-1 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLike}
              className={cn('flex-1 gap-1.5', post.likedByCurrentUser && 'text-primary')}
            >
              <ThumbsUp className={cn('h-4 w-4', post.likedByCurrentUser && 'fill-primary stroke-primary')} />
              Like
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Comment
            </Button>
          </div>

          {/* Comment input */}
          <div className="mt-3 flex items-center gap-2">
            <Input
              placeholder="Write a comment…"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
              className="flex-1 text-sm"
            />
            <Button size="icon" variant="ghost" loading={submitting} onClick={submitComment} disabled={!commentText.trim()}>
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      {post.comments.length > 0 && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <p className="text-sm font-semibold text-foreground">Comments</p>
            {post.comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                {comment.userProfilePictureUrl ? (
                  <img src={comment.userProfilePictureUrl} alt={comment.userName} className="h-10 w-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 rounded-xl bg-muted px-3 py-2">
                  <div className="flex items-baseline gap-2">
                    <Link href={`/user/${comment.userId}`} className="text-xs font-semibold text-foreground hover:underline">
                      {comment.userName}
                    </Link>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-xs text-foreground mt-0.5 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Likes modal */}
      <Dialog open={likesOpen} onOpenChange={setLikesOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Liked by</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {sortedLikes.map(like => (
              <Link
                key={like.id}
                href={`/user/${like.userId}`}
                onClick={() => setLikesOpen(false)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {like.userProfilePictureUrl ? (
                  <img src={like.userProfilePictureUrl} alt={like.userName} className="h-9 w-9 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{like.userName}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(like.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
