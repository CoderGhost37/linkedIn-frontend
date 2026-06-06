'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  Home,
  Users,
  Bell,
  ChevronDown,
  Search,
  User,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { apiFetch, removeToken } from '@/lib/api'
import LinkedInLogo from '@/public/logo.png'
import { useTheme } from 'next-themes'

interface SearchResult {
  id: number
  name: string
  headline: string | null
  profilePictureUrl: string | null
  location: string | null
}

const NAV_ITEMS = [
  { href: '/feed', icon: Home, label: 'Home' },
  { href: '/mynetwork', icon: Users, label: 'My Network' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
] as const

interface UserProfile {
  id: number
  name: string
  headline: string | null
  profilePictureUrl: string | null
}

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
}

function NavItem({ href, icon: Icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'relative flex flex-col items-center justify-center gap-0.5 px-4 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground',
        'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-t after:transition-colors',
        active ? 'text-foreground after:bg-foreground' : 'after:bg-transparent',
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.8} />
      <span>{label}</span>
    </Link>
  )
}

function Avatar({ src, name, size = 'sm' }: { src: string | null; name?: string; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'h-12 w-12' : 'h-6 w-6'
  const iconSize = size === 'md' ? 'h-6 w-6' : 'h-3.5 w-3.5'

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'Profile'}
        className={cn('rounded-full object-cover border border-border', dim)}
      />
    )
  }
  return (
    <span className={cn('flex items-center justify-center rounded-full bg-muted border border-border', dim)}>
      <User className={iconSize} />
    </span>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    apiFetch('/api/user/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setProfile(data))
      .catch(() => { })
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = query.trim()
    if (!q) { setResults([]); setShowDropdown(false); return }
    debounceRef.current = setTimeout(() => {
      setSearchLoading(true)
      apiFetch(`/api/user/search?query=${encodeURIComponent(q)}`)
        .then(r => r.ok ? r.json() : [])
        .then(data => { setResults(data.slice(0, 6)); setShowDropdown(true) })
        .catch(() => {})
        .finally(() => setSearchLoading(false))
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      setShowDropdown(false)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
    if (e.key === 'Escape') setShowDropdown(false)
  }

  const handleResultClick = (id: number) => {
    setShowDropdown(false)
    setQuery('')
    router.push(`/user/${id}`)
  }

  const handleSignOut = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => { })
    removeToken()
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 gap-4">

        {/* Left — logo + search */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/feed">
            <Image src={LinkedInLogo} alt="LinkedIn Logo" width={32} height={32} />
          </Link>
          <div ref={searchRef} className="relative hidden sm:block ml-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              placeholder="Search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => { if (results.length > 0) setShowDropdown(true) }}
              className="w-56 rounded-full bg-muted pl-9 border-0 focus-visible:ring-1 focus-visible:ring-ring"
            />
            {showDropdown && (
              <div className="absolute top-full mt-1.5 left-0 w-72 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden">
                {searchLoading ? (
                  <div className="space-y-1 p-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-2 py-2">
                        <div className="h-9 w-9 rounded-full bg-muted animate-pulse shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-28 rounded bg-muted animate-pulse" />
                          <div className="h-2.5 w-36 rounded bg-muted animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : results.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">No results found.</p>
                ) : (
                  <div className="py-1">
                    {results.map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleResultClick(r.id)}
                        className="flex w-full items-center gap-3 px-3 py-2 hover:bg-muted/60 transition-colors text-left"
                      >
                        {r.profilePictureUrl ? (
                          <img src={r.profilePictureUrl} alt={r.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                          {r.headline && <p className="text-xs text-muted-foreground truncate">{r.headline}</p>}
                        </div>
                      </button>
                    ))}
                    <div className="border-t border-border mt-1 pt-1 pb-0.5">
                      <button
                        onClick={() => { setShowDropdown(false); router.push(`/search?q=${encodeURIComponent(query.trim())}`) }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-muted/60 transition-colors font-semibold"
                      >
                        <Search className="h-3.5 w-3.5" />
                        See all results for "{query.trim()}"
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right — nav items + Me */}
        <nav className="flex items-stretch h-14">
          {NAV_ITEMS.map(item => (
            <NavItem key={item.href} {...item} active={pathname === item.href} />
          ))}

          {/* Me dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex flex-col items-center justify-center gap-0.5 px-4 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground outline-none">
              <Avatar src={profile?.profilePictureUrl ?? null} name={profile?.name} />
              <span className="flex items-center gap-0.5">
                Me <ChevronDown className="h-3 w-3" />
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-0">
              {/* Profile header */}
              <div className="flex flex-col items-center gap-2 px-4 pt-4 pb-3">
                <Avatar src={profile?.profilePictureUrl ?? null} name={profile?.name} size="md" />
                <span className="font-semibold text-sm text-foreground truncate max-w-full">
                  {profile?.name ?? '—'}
                </span>
                {profile?.headline && (
                  <span className="text-xs text-muted-foreground text-center leading-tight line-clamp-2">
                    {profile.headline}
                  </span>
                )}
                <Link
                  href={`/user/${profile?.id}`}
                  className="w-full mt-1 inline-flex items-center justify-center rounded-full border border-primary px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  View Profile
                </Link>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer"
              >
                {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

      </div>
    </header>
  )
}
