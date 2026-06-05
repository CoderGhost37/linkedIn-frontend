'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThumbsUp, MessageSquare, User, SendHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
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
  const router = useRouter()
  const [post, setPost] = useState(initialPost)
  const [expanded, setExpanded] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isLong = post.content.length > CONTENT_LIMIT
  const displayContent = isLong && !expanded
    ? post.content.slice(0, CONTENT_LIMIT).trimEnd() + '…'
    : post.content

  const toggleLike = async () => {
    const wasLiked = post.likedByCurrentUser
    setPost(p => ({ ...p, likedByCurrentUser: !wasLiked, likeCount: wasLiked ? p.likeCount - 1 : p.likeCount + 1 }))
    try {
      const res = await apiFetch(`/api/likes/${post.id}`, { method: wasLiked ? 'DELETE' : 'POST' })
      if (!res.ok) throw new Error()
    } catch {
      setPost(p => ({ ...p, likedByCurrentUser: wasLiked, likeCount: wasLiked ? p.likeCount + 1 : p.likeCount - 1 }))
    }
  }

  const submitComment = async () => {
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const res = await apiFetch(`/api/comments/${post.id}`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText.trim() }),
      })
      if (!res.ok) throw new Error()
      setPost(p => ({ ...p, commentCount: p.commentCount + 1 }))
      setCommentText('')
      setShowCommentForm(false)
      toast.success('Comment posted')
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardContent className="">

          {/* Author row → user profile */}
          <Link href={`/user/${post.authorId}`} className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity">
            {post.authorProfilePictureUrl ? (
              <img src={post.authorProfilePictureUrl} alt={post.authorName} className="h-10 w-10 rounded-full object-cover shrink-0" />
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

          {/* Content → post detail */}
          <div onClick={() => router.push(`/post/${post.id}`)} className="cursor-pointer">
            <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{displayContent}</p>
          </div>
          {isLong && (
            <button
              onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
              className="mt-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              {expanded ? 'show less' : 'show more'}
            </button>
          )}

          {/* Media → image dialog */}
          {post.mediaUrl && (
            <img
              src={post.mediaUrl}
              alt="Post media"
              onClick={() => setImageOpen(true)}
              className="mt-3 w-full rounded-lg object-cover max-h-96 cursor-zoom-in"
            />
          )}

          {/* Counts */}
          {(post.likeCount > 0 || post.commentCount > 0) && (
            <div className="mt-3 flex items-center text-xs text-muted-foreground">
              {post.likeCount > 0 && (
                <span>{post.likeCount} like{post.likeCount !== 1 ? 's' : ''}</span>
              )}
              {post.commentCount > 0 && (
                <span className="ml-auto">{post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}</span>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommentForm(v => !v)}
              className="flex-1 gap-1.5"
            >
              <MessageSquare className="h-4 w-4" />
              Comment
            </Button>
          </div>

          {/* Inline comment form */}
          {showCommentForm && (
            <div className="mt-2 flex items-center gap-2">
              <Input
                placeholder="Write a comment…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitComment()}
                className="flex-1 text-sm"
                autoFocus
              />
              <Button size="icon" variant="ghost" loading={submitting} onClick={submitComment} disabled={!commentText.trim()}>
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Image lightbox */}
      {post.mediaUrl && (
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent className="max-w-5xl w-[90vw] p-2">
            <img src={post.mediaUrl} alt="Post media" className="w-full rounded-lg object-contain max-h-[88vh]" />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
