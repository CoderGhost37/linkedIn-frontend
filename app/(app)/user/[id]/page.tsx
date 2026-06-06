'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Mail, UserPlus, Check, User, Pencil, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { type Post } from '@/components/post-card'
import { PostsCarousel } from '@/components/posts-carousel'
import { AvatarUpload } from '@/components/avatar-upload'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'
import { type FileWithPreview } from '@/hooks/use-file-upload'

interface UserProfile {
  id: number
  name: string
  email: string
  profilePictureUrl: string | null
  headline: string | null
  location: string | null
  bio: string | null
}

type ConnectStatus = 'none' | 'pending' | 'connected'

function ProfileSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-32 animate-pulse bg-muted" />
      <CardContent className="px-6 pb-6 pt-0">
        <div className="-mt-12 mb-4 flex items-end justify-between">
          <div className="h-24 w-24 rounded-full bg-muted animate-pulse border-4 border-card" />
          <div className="h-9 w-28 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
          <div className="h-3 w-32 rounded bg-muted animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function UserPage() {
  const { id } = useParams<{ id: string }>()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>('none')

  // Edit profile modal
  const [editOpen, setEditOpen] = useState(false)
  const [editData, setEditData] = useState({ headline: '', location: '', bio: '' })
  const [saving, setSaving] = useState(false)

  // Connections dialog
  const [connDialogOpen, setConnDialogOpen] = useState(false)
  const [connections, setConnections] = useState<UserProfile[]>([])
  const [connLoading, setConnLoading] = useState(false)
  const [connPendingIds, setConnPendingIds] = useState<Set<number>>(new Set())

  // Avatar upload modal
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    apiFetch('/api/user/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setCurrentUserId(data.id))
      .catch(() => {})

    apiFetch(`/api/user/profile/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setProfile(data))
      .catch(() => {})
      .finally(() => setLoading(false))

    // Fetch connections eagerly so count is visible on page load
    setConnLoading(true)
    apiFetch(`/api/connections/${id}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setConnections(data))
      .catch(() => {})
      .finally(() => setConnLoading(false))
  }, [id])

  // Derive connect status from the connections list once both are ready
  useEffect(() => {
    if (currentUserId === null || connections.length === 0) return
    if (connections.some(c => c.id === currentUserId)) setConnectStatus('connected')
  }, [currentUserId, connections])

  useEffect(() => {
    if (currentUserId !== null && profile !== null && currentUserId === profile.id) {
      apiFetch('/api/posts/user/allPosts')
        .then(r => r.ok ? r.json() : [])
        .then(data => setPosts(data))
        .catch(() => { })
    }
  }, [currentUserId, profile])

  const openEdit = () => {
    setEditData({
      headline: profile?.headline ?? '',
      location: profile?.location ?? '',
      bio: profile?.bio ?? '',
    })
    setEditOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await apiFetch('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(editData),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setProfile(updated)
      setEditOpen(false)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarSave = async () => {
    if (!selectedFile) return
    setUploadingAvatar(true)
    try {
      const form = new FormData()
      form.append('file', selectedFile.file)
      const res = await apiFetch('/api/user/profile-picture', { method: 'PATCH', body: form })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setProfile(updated)
      setAvatarOpen(false)
      setSelectedFile(null)
      toast.success('Profile picture updated')
    } catch {
      toast.error('Failed to update profile picture')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const openConnections = () => setConnDialogOpen(true)

  const handleConnectFromDialog = async (userId: number) => {
    setConnPendingIds(prev => new Set(prev).add(userId))
    try {
      const res = await apiFetch(`/api/connections/request/${userId}`, { method: 'POST' })
      if (!res.ok) throw new Error()
    } catch {
      setConnPendingIds(prev => { const s = new Set(prev); s.delete(userId); return s })
    }
  }

  const handleConnect = async () => {
    setConnectStatus('pending')
    try {
      const res = await apiFetch(`/api/connections/request/${id}`, { method: 'POST' })
      if (!res.ok) throw new Error()
    } catch {
      setConnectStatus('none')
    }
  }

  const isOwnProfile = currentUserId !== null && profile !== null && currentUserId === profile.id

  if (loading) return <div><ProfileSkeleton /></div>

  if (!profile) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">User not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Profile card */}
      <Card className="overflow-hidden p-0">
        <div className="h-32 bg-linear-to-r from-[#0A66C2] to-[#004182]" />

        <CardContent className="px-6 pb-6 pt-0">
          {/* Avatar + action row */}
          <div className="flex items-start justify-between">
            {/* Avatar — pulled up by half its height so it straddles the banner */}
            <div
              className={cn('-mt-20', isOwnProfile && 'cursor-pointer')}
              onClick={() => isOwnProfile && setAvatarOpen(true)}
            >
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt={profile.name}
                  className="h-32 w-32 rounded-full border-4 border-card object-cover"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-card bg-muted">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Action button — sits just below the banner */}
            <div className="mt-2">
              {isOwnProfile ? (
                <Button variant="outline" className="rounded-full gap-1.5" onClick={openEdit}>
                  <Pencil className="h-4 w-4" />
                  Edit profile
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={connectStatus !== 'none'}
                  variant={connectStatus === 'none' ? 'default' : 'outline'}
                  className="rounded-full gap-1.5"
                >
                  {connectStatus === 'none' && <><UserPlus className="h-4 w-4" /> Connect</>}
                  {connectStatus === 'pending' && <><Check className="h-4 w-4" /> Pending</>}
                  {connectStatus === 'connected' && 'Connected'}
                </Button>
              )}
            </div>
          </div>

          {/* Info */}
          <p className="mt-3 text-2xl font-bold text-foreground">{profile.name}</p>

          {profile.headline && (
            <p className="mt-1 text-base text-muted-foreground">{profile.headline}</p>
          )}

          <div className="flex items-center gap-4">
            {profile.location && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {profile.location}
              </p>
            )}

            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              {profile.email}
            </p>
          </div>

          {/* Connections count */}
          <button
            onClick={openConnections}
            className="mt-2 flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Users className="h-4 w-4" />
            <span className="font-semibold">
              {connLoading ? '…' : connections.length}
            </span>
            <span className="text-muted-foreground">connections</span>
          </button>

          {profile.bio && (
            <>
              <div className="my-4 border-t border-border" />
              <p className="mb-2 text-sm font-semibold text-foreground">About</p>
              <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Posts carousel — own profile only */}
      {isOwnProfile && <PostsCarousel posts={posts} userId={profile.id} />}

      {/* Connections dialog */}
      <Dialog open={connDialogOpen} onOpenChange={setConnDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connections</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-1 pr-1">
            {connLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-1 py-2">
                  <div className="h-11 w-11 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-48 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))
            ) : connections.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No connections yet.</p>
            ) : (
              connections.map(conn => (
                <div key={conn.id} className="flex items-center gap-3 rounded-lg px-1 py-2 hover:bg-muted/50 transition-colors">
                  <Link href={`/user/${conn.id}`} onClick={() => setConnDialogOpen(false)}>
                    {conn.profilePictureUrl ? (
                      <img src={conn.profilePictureUrl} alt={conn.name} className="h-11 w-11 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/user/${conn.id}`} onClick={() => setConnDialogOpen(false)} className="text-sm font-semibold text-foreground hover:underline truncate block">
                      {conn.name}
                    </Link>
                    {conn.headline && <p className="text-xs text-muted-foreground truncate">{conn.headline}</p>}
                  </div>
                  {!isOwnProfile && (
                    <Button
                      size="xs"
                      variant="outline"
                      className="shrink-0 rounded-full gap-1"
                      disabled={connPendingIds.has(conn.id)}
                      onClick={() => handleConnectFromDialog(conn.id)}
                    >
                      {connPendingIds.has(conn.id) ? 'Sent' : <><UserPlus className="h-3 w-3" />Connect</>}
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar upload modal */}
      <Dialog open={avatarOpen} onOpenChange={open => { setAvatarOpen(open); if (!open) setSelectedFile(null) }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Change profile photo</DialogTitle>
          </DialogHeader>

          <AvatarUpload
            defaultAvatar={profile.profilePictureUrl ?? undefined}
            onFileChange={setSelectedFile}
            className="py-2"
          />

          <DialogFooter>
            <Button
              loading={uploadingAvatar}
              disabled={!selectedFile}
              onClick={handleAvatarSave}
            >
              Save photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit profile modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                placeholder="e.g. Software Engineer at Acme"
                value={editData.headline}
                onChange={e => setEditData(d => ({ ...d, headline: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Delhi, India"
                value={editData.location}
                onChange={e => setEditData(d => ({ ...d, location: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                rows={4}
                placeholder="Tell people about yourself…"
                value={editData.bio}
                onChange={e => setEditData(d => ({ ...d, bio: e.target.value }))}
                className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm resize-none outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button loading={saving} onClick={handleSave}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
