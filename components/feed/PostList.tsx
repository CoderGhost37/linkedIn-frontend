'use client'

import { useState } from 'react'
import PostCard from './PostCard'
import CreatePost from './CreatePost'

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

interface PostListProps {
  posts: Post[]
}

export default function PostList({ posts }: PostListProps) {
  const [allPosts, setAllPosts] = useState<Post[]>(posts)

  const handlePostCreated = (newPost: Post) => {
    setAllPosts([newPost, ...allPosts])
  }

  return (
    <div className="space-y-6">
      <CreatePost onPostCreated={handlePostCreated} />
      {allPosts.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No posts yet. Start following people to see posts!</p>
        </div>
      ) : (
        allPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  )
}
