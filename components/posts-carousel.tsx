'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ThumbsUp, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { type Post } from '@/components/post-card'
import { cn } from '@/lib/utils'

const SCROLL_BY = 236 // card width (224) + gap (12)

interface PostsCarouselProps {
  posts: Post[]
  userId: number
}

export function PostsCarousel({ posts, userId }: PostsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    updateArrows()
    const el = scrollRef.current
    el?.addEventListener('scroll', updateArrows)
    return () => el?.removeEventListener('scroll', updateArrows)
  }, [posts])

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -SCROLL_BY : SCROLL_BY, behavior: 'smooth' })
  }

  const sorted = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (sorted.length === 0) return null

  return (
    <Card>
      <CardHeader className="px-5 pt-4 pb-0 flex flex-row items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Activity</p>

        {/* Arrow buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full border border-border transition-colors',
              canScrollLeft
                ? 'hover:bg-muted text-foreground'
                : 'text-muted-foreground/40 cursor-not-allowed',
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full border border-border transition-colors',
              canScrollRight
                ? 'hover:bg-muted text-foreground'
                : 'text-muted-foreground/40 cursor-not-allowed',
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="px-5 pt-3 pb-0">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 scrollbar-none"
        >
          {sorted.map(post => (
            <div
              key={post.id}
              className="w-56 shrink-0 rounded-lg border border-border bg-muted/40 p-3 flex flex-col gap-2"
            >
              {post.mediaUrl && (
                <img
                  src={post.mediaUrl}
                  alt=""
                  className="h-28 w-full rounded-md object-cover"
                />
              )}
              <p className="flex-1 text-xs leading-relaxed text-foreground line-clamp-4">
                {post.content}
              </p>
              <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-2">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {post.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {post.commentCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="border-t border-border px-5 py-3">
        <Link
          href={`/user/${userId}/posts`}
          className="w-full text-center text-sm font-medium text-primary hover:underline"
        >
          Show all posts →
        </Link>
      </CardFooter>
    </Card>
  )
}
