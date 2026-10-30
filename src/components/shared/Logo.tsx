export function Logo({ className }: { className?: string }) {
  return (
    <span className={`font-black tracking-tighter ${className || 'text-3xl'}`}>
      <span className="text-[#FDE047]">F</span>
      <span className="text-foreground">reightIQ</span>
    </span>
  );
}
