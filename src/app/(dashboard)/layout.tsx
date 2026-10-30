import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardSessionGuard } from '@/components/dashboard/DashboardSessionGuard'
import { TopBar } from '@/components/dashboard/TopBar'
import { CommandPalette } from '@/components/command-palette'
import { OrgProvider } from '@/components/providers/OrgProvider'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardSessionGuard>
      <OrgProvider>
        <LanguageProvider>
          <CommandPalette />
          <div className="flex h-screen bg-muted/30">
            <TopBar />
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 mt-16 overflow-y-auto bg-muted/30">
              {children}
            </main>
          </div>
        </LanguageProvider>
      </OrgProvider>
    </DashboardSessionGuard>
  )
}
