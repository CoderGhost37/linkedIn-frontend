import { Navbar } from '@/components/navbar'
import { RightSidebar } from '@/components/right-sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0">
            {children}
          </div>
          <aside className="w-72 shrink-0 sticky top-20">
            <RightSidebar />
          </aside>
        </div>
      </div>
    </>
  )
}
