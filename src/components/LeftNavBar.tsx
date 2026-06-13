import { APP_VERSION } from '../constants/version'
import type { AppPage } from '../types/app'

type LeftNavBarProps = {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  mode?: 'sidebar' | 'drawer'
  className?: string
}

const navItems: { id: AppPage; label: string; icon: string }[] = [
  { id: 'tactics', label: 'Chiến thuật', icon: '⚽' },
  { id: 'stamina-tracker', label: 'Stamina Tracker', icon: '💪' },
]

export function LeftNavBar({
  activePage,
  onNavigate,
  mode = 'sidebar',
  className = '',
}: LeftNavBarProps) {
  const isDrawer = mode === 'drawer'

  return (
    <nav
      className={[
        'safe-pt safe-pb flex h-full flex-col border-r border-slate-800 bg-slate-900/95',
        isDrawer ? 'w-52 safe-px' : 'hidden w-[4.25rem] shrink-0 sm:flex sm:w-52 sm:safe-px',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Main navigation"
    >
      <div
        className={
          isDrawer
            ? 'flex shrink-0 items-center justify-start border-b border-slate-800 px-4 py-4'
            : 'flex shrink-0 items-center justify-center border-b border-slate-800 py-4 sm:justify-start sm:px-4'
        }
      >
        <span
          className="text-lg font-bold text-emerald-400 sm:text-xl"
          title="Football Position"
        >
          FP
        </span>
      </div>

      <ul
        className={
          isDrawer
            ? 'flex flex-1 flex-col gap-1 p-2'
            : 'flex flex-1 flex-col items-center gap-2 px-1.5 pt-2 sm:items-stretch sm:gap-1 sm:p-2'
        }
      >
        {navItems.map((item) => {
          const active = activePage === item.id
          return (
            <li key={item.id} className="w-full">
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                className={[
                  'touch-target flex items-center rounded-xl text-sm font-medium transition active:scale-[0.98]',
                  isDrawer
                    ? 'w-full gap-3 px-3 py-2.5'
                    : 'mx-auto h-12 w-12 justify-center sm:mx-0 sm:h-auto sm:w-full sm:justify-start sm:gap-3 sm:px-3 sm:py-2.5',
                  active
                    ? 'bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/40'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
              >
                <span className="shrink-0 text-lg leading-none sm:text-base" aria-hidden>
                  {item.icon}
                </span>
                <span className={isDrawer ? 'truncate' : 'hidden truncate sm:inline'}>
                  {item.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="shrink-0 border-t border-slate-800 py-3 text-center sm:px-4">
        <span className="font-mono text-[10px] tracking-wide text-slate-600 sm:text-xs">
          v{APP_VERSION}
        </span>
      </div>
    </nav>
  )
}

export type { AppPage }
