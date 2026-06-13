export type AppPage = 'tactics' | 'stamina-tracker'

type LeftNavBarProps = {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
}

const navItems: { id: AppPage; label: string; icon: string }[] = [
  { id: 'tactics', label: 'Chiến thuật', icon: '⚽' },
  { id: 'stamina-tracker', label: 'Stamina Tracker', icon: '💪' },
]

export function LeftNavBar({ activePage, onNavigate }: LeftNavBarProps) {
  const btnBase =
    'touch-target flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition active:scale-[0.98]'

  return (
    <nav
      className="safe-pt safe-pb safe-px flex h-full w-16 shrink-0 flex-col border-r border-slate-800 bg-slate-900/95 sm:w-52"
      aria-label="Main navigation"
    >
      <div className="flex shrink-0 items-center justify-center border-b border-slate-800 px-2 py-4 sm:justify-start sm:px-4">
        <span className="text-lg font-bold text-emerald-400 sm:text-xl" title="Football Position">
          FP
        </span>
      </div>

      <ul className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map((item) => {
          const active = activePage === item.id
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                className={[
                  btnBase,
                  active
                    ? 'bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/40'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                <span className="shrink-0 text-base" aria-hidden>
                  {item.icon}
                </span>
                <span className="hidden truncate sm:inline">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
