type StaminaMenuProps = {
  open: boolean
  onClose: () => void
  onConfig: () => void
  onHistory: () => void
  onReport: () => void
}

const items = [
  { id: 'config' as const, label: 'Cấu hình', icon: '⚙' },
  { id: 'history' as const, label: 'Lịch sử', icon: '📋' },
  { id: 'report' as const, label: 'Report', icon: '📊' },
]

export function StaminaMenu({
  open,
  onClose,
  onConfig,
  onHistory,
  onReport,
}: StaminaMenuProps) {
  if (!open) return null

  const handlers = {
    config: onConfig,
    history: onHistory,
    report: onReport,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Đóng menu"
        onClick={onClose}
      />

      <nav
        role="menu"
        aria-label="Stamina Tracker menu"
        className="safe-pb relative z-10 w-full max-w-md rounded-t-2xl border border-slate-800 bg-slate-900 p-3 shadow-2xl"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-600" />
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="menuitem"
                onClick={handlers[item.id]}
                className="touch-target flex w-full items-center gap-4 rounded-xl bg-slate-800/80 px-4 py-4 text-left text-base font-medium text-white transition active:scale-[0.98] active:bg-slate-700"
              >
                <span className="text-xl" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
