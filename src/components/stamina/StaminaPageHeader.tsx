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
    <header className="safe-px flex shrink-0 items-center gap-2 border-b border-slate-800 px-3 py-3">
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
        <div className="w-12 shrink-0" aria-hidden />
      )}

      <div className="min-w-0 flex-1 text-center">
        <h1 className="truncate text-lg font-bold text-white">{title}</h1>
        {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
      </div>

      {onMenu ? (
        <button
          type="button"
          onClick={onMenu}
          className={`${btn} h-12 w-12 text-xl`}
          aria-label="Menu"
        >
          ☰
        </button>
      ) : (
        <div className="w-12 shrink-0" aria-hidden />
      )}
    </header>
  )
}
