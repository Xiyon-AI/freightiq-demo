'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-6">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm text-muted-foreground text-center">
          <Link href="#" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <span className="text-border">|</span>
          <Link href="#" className="hover:text-foreground transition-colors">
            Terms & Conditions
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">Copyrights FreightIQ 2026</p>
      </div>
    </footer>
  );
}
