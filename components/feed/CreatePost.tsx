'use client'

import { useState } from 'react'
import { Image, Send } from 'lucide-react'

interface CreatePostProps {
  onPostCreated: (post: any) => void
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setPosting(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      const formData = new FormData()
      formData.append('content', content)
      if (file) {
        formData.append('file', file)
      }

      const response = await fetch(`${backendUrl}/api/posts`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (response.ok) {
        const newPost = await response.json()
        onPostCreated(newPost)
        setContent('')
        setFile(null)
        setPreview(null)
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setPosting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start a post..."
          className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          rows={3}
        />
      </div>

      {preview && (
        <div className="mb-4 relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-lg object-cover max-h-96"
          />
          <button
            type="button"
            onClick={() => {
              setFile(null)
              setPreview(null)
            }}
            className="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <label className="flex items-center gap-2 rounded-lg px-4 py-2 cursor-pointer hover:bg-muted text-muted-foreground transition-colors">
          <Image size={18} />
          <span className="text-sm font-medium">Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </label>

        <button
          type="submit"
          disabled={!content.trim() || posting}
          className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
          Post
        </button>
      </div>
    </form>
  )
}
