'use client'

import { useState } from 'react'
import { MapPin, BriefcaseIcon, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserProfileProps {
  user: {
    id: number
    email: string
    name: string
    profilePictureUrl: string | null
    headline: string | null
    location: string | null
    bio: string | null
  }
}

export default function UserProfile({ user }: UserProfileProps) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      // Clear cookies by making a logout request if available
      // For now, we'll just redirect to login
      router.push('/auth/login')
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="sticky top-8 space-y-4">
      {/* Profile Card */}
      <div className="rounded-lg border border-border bg-card p-6">
        {/* Background */}
        <div className="mb-4 h-20 rounded-lg bg-gradient-to-r from-[#0A66C2] to-[#0854a0]" />

        {/* Avatar */}
        <div className="mb-4 -mt-10 flex justify-center">
          {user.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={user.name}
              className="h-20 w-20 rounded-full border-4 border-card object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-card bg-primary/10">
              <span className="text-2xl font-bold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
          {user.headline && (
            <p className="mt-1 text-sm text-muted-foreground">{user.headline}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">{user.email}</p>

          {user.location && (
            <div className="mt-3 flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MapPin size={14} />
              <span>{user.location}</span>
            </div>
          )}
        </div>

        {user.bio && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm text-foreground">{user.bio}</p>
          </div>
        )}

        {/* Edit Profile Button */}
        <button className="mt-4 w-full rounded-lg border border-primary px-4 py-2 font-medium text-primary hover:bg-primary/5 transition-colors">
          Edit Profile
        </button>
      </div>

      {/* Analytics Card */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">Analytics</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Profile views</p>
            <p className="font-semibold text-foreground">0</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Post impressions</p>
            <p className="font-semibold text-foreground">0</p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  )
}
