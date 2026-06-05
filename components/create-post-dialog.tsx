'use client'

import { useRef, useState } from 'react'
import { Image as ImageIcon, User, X } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { type Post } from '@/components/post-card'

interface Profile {
  id: number
  name: string
  profilePictureUrl: string | null
}

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile | null
  onPostCreated: (post: Post) => void
}

export function CreatePostDialog({ open, onOpenChange, profile, onPostCreated }: CreatePostDialogProps) {
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImage(null)
    setImagePreview(null)
  }

  const reset = () => {
    setContent('')
    removeImage()
  }

  const handlePost = async () => {
    if (!content.trim() || !profile) return
    setPosting(true)
    try {
      const form = new FormData()
      form.append('content', content.trim())
      if (image) form.append('file', image)

      const res = await apiFetch('/api/posts', { method: 'POST', body: form })
      if (!res.ok) throw new Error()
      const data = await res.json()

      onPostCreated({
        id: data.id,
        authorId: profile.id,
        authorName: profile.name,
        authorProfilePictureUrl: profile.profilePictureUrl,
        content: data.content,
        mediaUrl: data.imageUrl ?? null,
        likeCount: 0,
        commentCount: 0,
        likedByCurrentUser: false,
        createdAt: data.createdAt,
      })

      reset()
      onOpenChange(false)
      toast.success('Post created')
    } catch {
      toast.error('Failed to create post')
    } finally {
      setPosting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
        </DialogHeader>

        {/* Author */}
        <div className="flex items-center gap-3">
          {profile?.profilePictureUrl ? (
            <img src={profile.profilePictureUrl} alt={profile.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <span className="text-sm font-semibold text-foreground">{profile?.name}</span>
        </div>

        {/* Borderless textarea */}
        <textarea
          placeholder="What do you want to talk about?"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={10}
          autoFocus
          className="w-full resize-none border-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-0"
        />

        {/* Image preview */}
        {imagePreview && (
          <div className="relative">
            <img src={imagePreview} alt="Selected" className="w-full rounded-lg object-cover max-h-52" />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Add image"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

          <Button onClick={handlePost} loading={posting} disabled={!content.trim()}>
            Post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
