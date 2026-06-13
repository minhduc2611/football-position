import { useEffect, useState } from 'react'
import {
  selectCurrentStateDef,
  selectCycleStateCount,
  selectElapsedMs,
  selectSessionTotalMs,
  useStaminaStore,
} from '../../store/staminaStore'
import { formatDurationShort, formatStopwatch } from '../../utils/formatTime'
import { StaminaPageHeader } from './StaminaPageHeader'

const MAIN_BUTTON_SIZE = 'min(72vw, 17rem)'
const END_BUTTON_SIZE = '4rem'

type StaminaTrackPageProps = {
  onMenuOpen: () => void
}

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(id)
  }, [active])

  return now
}

export function StaminaTrackPage({ onMenuOpen }: StaminaTrackPageProps) {
  const activeSession = useStaminaStore((s) => s.activeSession)
  const tapButton = useStaminaStore((s) => s.tapButton)
  const endSession = useStaminaStore((s) => s.endSession)

  const currentState = useStaminaStore(selectCurrentStateDef)
  const cycleStateCount = useStaminaStore(selectCycleStateCount)

  const timerActive = Boolean(activeSession)
  const now = useNow(timerActive)

  const elapsedMs = useStaminaStore((s) => selectElapsedMs(s, now))
  const sessionTotalMs = useStaminaStore((s) => selectSessionTotalMs(s, now))

  const btnHint = !activeSession ? 'Chạm để bắt đầu' : 'Chạm để chuyển giai đoạn'
  const accentColor = currentState?.color ?? '#10b981'

  const completedSegments = activeSession?.segments ?? []
  const hasCompletedSegments = completedSegments.length > 0

  const headerSubtitle = activeSession
    ? `Tổng phiên: ${formatDurationShort(sessionTotalMs)}`
    : undefined

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <StaminaPageHeader
        title="Stamina Tracker"
        subtitle={headerSubtitle}
        onMenu={onMenuOpen}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] overflow-hidden px-4">
          <div className="flex min-h-0 items-center justify-center py-2">
            <div
              className="stopwatch-panel w-full max-w-sm rounded-2xl border border-slate-700/60 px-3 py-5 sm:py-6"
              aria-live="polite"
              aria-label={`Thời gian giai đoạn: ${formatStopwatch(elapsedMs)}`}
            >
              <p
                className={`stopwatch-display stopwatch-glow text-center text-[clamp(2.75rem,13vw,4.25rem)] leading-none ${activeSession ? '' : 'opacity-40'
                  }`}
                style={{ color: activeSession ? accentColor : '#64748b' }}
              >
                {formatStopwatch(elapsedMs)}
              </p>
            </div>
          </div>


          <div className="h-36 overflow-y-auto overscroll-contain pb-2 [-webkit-overflow-scrolling:touch]">
            {hasCompletedSegments && (<>
              <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phiên hiện tại
              </p>
              <ul className="mx-auto max-w-sm space-y-2">
                {completedSegments.map((seg, i) => (
                  <li
                    key={`${seg.stateId}-${i}`}
                    className="flex min-h-11 items-center justify-between rounded-xl bg-slate-900/80 px-4 py-2.5 text-sm"
                  >
                    <span className="truncate text-slate-300">{seg.stateName}</span>
                    <span className="stopwatch-display shrink-0 text-base text-slate-400">
                      {formatDurationShort(seg.durationMs)}
                    </span>
                  </li>
                ))}
              </ul></>
            )}
          </div>
        </div>

        <div className="safe-pb shrink-0 px-4 pb-5 pt-2">
          <div className="mx-auto flex w-full max-w-md items-start justify-end gap-3">
            <div
              className="relative shrink-0"
              style={{ width: MAIN_BUTTON_SIZE, height: MAIN_BUTTON_SIZE }}
            >
              <button
                type="button"
                onClick={tapButton}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-full border-4 border-white/10 px-4 transition active:scale-[0.97]"
                style={{
                  background: `radial-gradient(circle at 30% 25%, ${accentColor}55, ${accentColor}22 45%, #0f172a 75%)`,
                  boxShadow: `0 0 0 1px ${accentColor}33, 0 12px 40px ${accentColor}22`,
                }}
                aria-label={btnHint}
              >
                <span className="max-w-full truncate text-center text-lg font-bold uppercase leading-tight tracking-wide text-white sm:text-xl">
                  {currentState?.name ?? '—'}
                </span>
                <span className="text-sm text-white/60">{btnHint}</span>

                {activeSession && cycleStateCount > 1 && (
                  <span className="absolute bottom-[12%] text-xs text-white/40">
                    {activeSession.currentStateIndex + 1} / {cycleStateCount}
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={endSession}
              disabled={!activeSession}
              aria-label="Kết thúc phiên"
              title="Kết thúc"
              style={{ width: END_BUTTON_SIZE, height: END_BUTTON_SIZE }}
              className={`touch-target flex shrink-0 items-center justify-center rounded-full border-2 text-xl transition active:scale-[0.95] disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900/50 disabled:text-slate-600 ${activeSession
                  ? 'border-rose-500/60 bg-rose-950/50 text-rose-400'
                  : 'border-slate-800 bg-slate-900/50 text-slate-600'
                }`}
            >
              ■
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
