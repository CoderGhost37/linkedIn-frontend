'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import LinkedInLogo from '@/public/og.png'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/auth/login'

  return (
    <div className="flex min-h-screen">
      {/* Left — photo panel */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/auth-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-lg font-light italic">
            "The best way to predict the future is to create it."
          </p>
          <p className="mt-3 text-sm text-white/70">— Peter Drucker</p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex w-full flex-col lg:w-1/2 bg-background">
        {/* Top nav */}
        <header className="flex items-center justify-between px-8 py-5">
          <Image src={LinkedInLogo} alt="LinkedIn Logo" width={96} height={96} />
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {isLogin ? (
              <>
                <span>New to LinkedIn?</span>
                <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
                  Join now
                </Link>
              </>
            ) : (
              <>
                <span>Already a member?</span>
                <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex flex-1 flex-col items-center justify-center px-8 pb-16">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
