import { useStaminaStore } from '../../store/staminaStore'
import { formatDurationShort } from '../../utils/formatTime'
import { computeStaminaReport } from '../../utils/staminaReport'
import { StaminaPageHeader } from './StaminaPageHeader'

type StaminaReportPageProps = {
  onBack: () => void
}

export function StaminaReportPage({ onBack }: StaminaReportPageProps) {
  const sessions = useStaminaStore((s) => s.sessions)
  const report = computeStaminaReport(sessions)

  return (
    <div className="safe-pb flex h-full flex-col overflow-hidden">
      <StaminaPageHeader title="Report" onBack={onBack} />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [-webkit-overflow-scrolling:touch]">
        {report.sessionCount === 0 ? (
          <div className="flex h-full min-h-48 items-center justify-center">
            <p className="text-center text-sm text-slate-500">
              Chưa có dữ liệu. Hoàn thành vài phiên tập để xem báo cáo.
            </p>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-sm space-y-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Số phiên" value={String(report.sessionCount)} />
              <StatCard
                label="Tổng thời gian"
                value={formatDurationShort(report.totalMs)}
                mono
              />
              <StatCard
                label="TB / phiên"
                value={formatDurationShort(report.avgSessionMs)}
                mono
                className="col-span-2"
              />
            </div>

            {report.byState.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Thời gian theo giai đoạn
                </h2>
                <ul className="space-y-3">
                  {report.byState.map((row) => {
                    const pct =
                      report.totalMs > 0
                        ? Math.round((row.totalMs / report.totalMs) * 100)
                        : 0
                    return (
                      <li key={row.stateId} className="rounded-xl bg-slate-900/80 p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-white">
                            {row.stateName}
                          </span>
                          <span className="shrink-0 font-mono text-sm text-slate-300">
                            {formatDurationShort(row.totalMs)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-emerald-500/80"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-1 text-right text-[10px] text-slate-500">{pct}%</p>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  mono,
  className = '',
}: {
  label: string
  value: string
  mono?: boolean
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/80 p-4 ${className}`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold text-white ${mono ? 'font-mono tabular-nums' : ''}`}
      >
        {value}
      </p>
    </div>
  )
}
