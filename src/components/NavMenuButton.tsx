import { useMobileNavOptional } from '../contexts/MobileNavContext'

const btn =
  'touch-target flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-700 text-xl text-slate-300 transition active:scale-[0.98] active:bg-slate-800 sm:hidden'

type NavMenuButtonProps = {
  className?: string
}

export function NavMenuButton({ className = '' }: NavMenuButtonProps) {
  const mobileNav = useMobileNavOptional()
  if (!mobileNav) return null

  return (
    <button
      type="button"
      onClick={mobileNav.openNav}
      className={`${btn} ${className}`.trim()}
      aria-label="Menu điều hướng"
    >
      ☰
    </button>
  )
}
