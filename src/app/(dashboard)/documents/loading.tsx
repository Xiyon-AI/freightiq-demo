import { Loader2, FileText } from "lucide-react";

export default function DocumentsLoading() {
  return (
    <div className="w-full p-4 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2"><div className="h-8 w-48 animate-pulse rounded bg-muted"/><div className="h-4 w-64 animate-pulse rounded bg-muted"/></div>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border p-12"><FileText className="h-10 w-10 animate-pulse text-muted-foreground"/><div className="h-4 w-48 animate-pulse rounded bg-muted"/></div>
        <div className="space-y-3">{[1,2,3].map((item)=><div key={item} className="flex items-center gap-3 rounded-xl border border-border p-4"><div className="h-10 w-10 animate-pulse rounded bg-muted"/><div className="h-4 flex-1 animate-pulse rounded bg-muted"/></div>)}</div>
        <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div>
      </div>
    </div>
  );
}
