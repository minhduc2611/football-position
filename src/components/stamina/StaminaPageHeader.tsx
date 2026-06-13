import { NavMenuButton } from '../NavMenuButton'

type StaminaPageHeaderProps = {
  title: string
  subtitle?: string
  onBack?: () => void
  onMenu?: () => void
}

export function StaminaPageHeader({
  title,
  subtitle,
  onBack,
  onMenu,
}: StaminaPageHeaderProps) {
  const btn =
    'touch-target flex shrink-0 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition active:scale-[0.98] active:bg-slate-800'

  return (
    <header className="safe-pt safe-px flex shrink-0 items-center gap-1 border-b border-slate-800 bg-slate-950/95 py-3 sm:gap-2">
      <div className="flex shrink-0 items-center gap-1">
        <NavMenuButton />
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className={`${btn} h-12 w-12 text-lg`}
            aria-label="Quay lại"
          >
            ←
          </button>
        ) : (
          <div className="hidden w-12 shrink-0 sm:block" aria-hidden />
        )}
      </div>

      <div className="min-w-0 flex-1 text-center">
        <h1 className="truncate text-lg font-bold text-white">{title}</h1>
        {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
      </div>

      {onMenu ? (
        <button
          type="button"
          onClick={onMenu}
          className={`${btn} h-12 w-12 text-xl`}
          aria-label="Menu Stamina Tracker"
        >
          ⋮
        </button>
      ) : (
        <div className="w-12 shrink-0" aria-hidden />
      )}
    </header>
  )
}
