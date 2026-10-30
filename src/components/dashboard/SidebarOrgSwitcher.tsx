import { Building2 } from "lucide-react";

export function SidebarOrgSwitcher() {
  return <div className="px-3 py-3"><div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-yellow-300"><Building2 className="h-4 w-4" strokeWidth={2.5}/></span><span className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Broker workspace</span><span className="block truncate text-sm font-semibold text-foreground">Acme Freight Brokerage</span></span></div></div>;
}
