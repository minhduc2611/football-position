import { useStaminaStore } from '../../store/staminaStore'
import { formatDurationShort } from '../../utils/formatTime'
import { StaminaPageHeader } from './StaminaPageHeader'

type StaminaHistoryPageProps = {
  onBack: () => void
}

export function StaminaHistoryPage({ onBack }: StaminaHistoryPageProps) {
  const sessions = useStaminaStore((s) => s.sessions)
  const clearHistory = useStaminaStore((s) => s.clearHistory)
  const deleteSession = useStaminaStore((s) => s.deleteSession)

  const btn =
    'touch-target rounded-xl text-sm font-medium transition active:scale-[0.98]'

  return (
    <div className="safe-pt safe-pb flex h-full flex-col overflow-hidden">
      <StaminaPageHeader title="Lịch sử" onBack={onBack} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4">
        {sessions.length > 0 && (
          <div className="mb-3 flex shrink-0 justify-end">
            <button
              type="button"
              onClick={() => {
                if (confirm('Xóa toàn bộ lịch sử?')) clearHistory()
              }}
              className={`${btn} min-h-11 px-4 py-2 text-rose-400`}
            >
              Xóa hết
            </button>
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-center text-sm text-slate-500">
              Chưa có phiên nào. Bắt đầu tập và bấm Kết thúc để lưu lịch sử.
            </p>
          </div>
        ) : (
          <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-4 [-webkit-overflow-scrolling:touch]">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">
                      {new Date(session.startedAt).toLocaleString('vi-VN')}
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold text-white">
                      {formatDurationShort(session.totalDurationMs)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteSession(session.id)}
                    className={`${btn} min-h-11 shrink-0 px-3 py-2 text-slate-500`}
                    aria-label="Xóa phiên"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {session.segments.map((seg, i) => (
                    <span
                      key={`${seg.stateId}-${i}`}
                      className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400"
                    >
                      {seg.stateName}{' '}
                      <span className="font-mono text-slate-300">
                        {formatDurationShort(seg.durationMs)}
                      </span>
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
