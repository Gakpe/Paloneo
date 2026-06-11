import Link from "next/link";
import { Pineapple } from "./Pineapple";

export function Header({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-night/80 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-2xl items-center gap-2.5 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Pineapple className="h-6 w-6 shrink-0" />
          <span className="font-serif text-lg leading-none text-cream">
            Africa Circle
          </span>
        </Link>
        {title && (
          <>
            <span className="text-cream/25">/</span>
            <span className="truncate text-sm text-cream/60">{title}</span>
          </>
        )}
      </div>
    </header>
  );
}
