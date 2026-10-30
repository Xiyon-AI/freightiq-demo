import { Loader2 } from 'lucide-react'

export default function SettingsLoading() {
  return (
    <div className="flex-1 w-full p-4 lg:p-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <div className="w-full md:w-64 flex-shrink-0 flex md:flex-col gap-2 md:space-y-1 overflow-x-auto pb-4 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-10 w-32 md:w-full bg-gray-200 dark:bg-gray-800 rounded-xl flex-shrink-0 animate-pulse" />
            ))}
            <div className="h-10 w-32 flex-shrink-0 md:w-full bg-gray-200 dark:bg-gray-800 rounded-xl md:mt-4 animate-pulse" />
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 min-w-0 pb-20 space-y-6">
            <div className="h-7 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            
            <div className="bg-card rounded-3xl border border-border/50 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border/50 p-6 md:p-8 space-y-6">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-4 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            
             <div className="flex items-center justify-center py-8">
               <Loader2 className="w-6 h-6 animate-spin text-primary" />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
