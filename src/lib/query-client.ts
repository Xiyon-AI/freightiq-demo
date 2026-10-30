import { QueryClient } from "@tanstack/react-query";

/**
 * Shared QueryClient factory with sensible defaults for dashboard performance.
 *
 * - gcTime (5 min): keeps inactive query data in memory so navigating back
 *   to a page shows cached data instantly instead of re-fetching.
 * - staleTime (2 min): prevents redundant refetches within a short window.
 * - refetchOnWindowFocus: revalidates stale data when user returns to tab.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
        staleTime: 2 * 60 * 1000, // 2 minutes before data is considered stale
        refetchOnWindowFocus: true,
        retry: 1,
      },
    },
  });
}
