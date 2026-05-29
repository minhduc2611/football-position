import { useState } from 'react'
import type { Step } from '../types'
import {
  selectActiveStep,
  selectActiveTactic,
  selectIsStepDirty,
  useTacticsStore,
} from '../store/tacticsStore'
import { rosterTotal } from '../utils/roster'
import { PositionRosterEditor } from './PositionRosterEditor'

type LeftPanelProps = {
  className?: string
  variant?: 'sidebar' | 'sheet'
  sheetFocus?: 'steps' | 'roster' | null
  onCloseSheet?: () => void
}

export function LeftPanel({
  className = '',
  variant = 'sidebar',
  sheetFocus = null,
  onCloseSheet,
}: LeftPanelProps) {
  const tactic = useTacticsStore(selectActiveTactic)
  const activeStep = useTacticsStore(selectActiveStep)
  const currentStepIndex = useTacticsStore((s) => s.currentStepIndex)
  const setupInitial = useTacticsStore((s) => s.setupInitial)
  const isPlaying = useTacticsStore((s) => s.isPlaying)
  const isStepDirty = useTacticsStore(selectIsStepDirty)

  const goToTacticsList = useTacticsStore((s) => s.goToTacticsList)
  const setConfig = useTacticsStore((s) => s.setConfig)
  const setSetupInitial = useTacticsStore((s) => s.setSetupInitial)
  const saveInitialPositions = useTacticsStore((s) => s.saveInitialPositions)
  const livePlayers = useTacticsStore((s) => s.livePlayers)
  const selectStep = useTacticsStore((s) => s.selectStep)
  const updateStepMeta = useTacticsStore((s) => s.updateStepMeta)
  const deleteStep = useTacticsStore((s) => s.deleteStep)
  const addEmptyStep = useTacticsStore((s) => s.addEmptyStep)
  const saveCurrentAsStep = useTacticsStore((s) => s.saveCurrentAsStep)
  const commitCurrentStep = useTacticsStore((s) => s.commitCurrentStep)
  const play = useTacticsStore((s) => s.play)

  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  if (!tactic) return null

  const isSheet = variant === 'sheet'
  const showRoster = !isSheet || sheetFocus === 'roster' || sheetFocus === null
  const showSteps = !isSheet || sheetFocus === 'steps' || sheetFocus === null

  const startEdit = (step: Step) => {
    setEditingStepId(step.id)
    setEditName(step.name)
  }

  const commitEdit = (stepId: string) => {
    updateStepMeta(stepId, { name: editName })
    setEditingStepId(null)
  }

  const btnBase =
    'touch-target rounded-lg text-sm font-medium transition active:scale-[0.98]'

  return (
    <aside
      className={[
        'flex flex-col bg-slate-900/95',
        variant === 'sidebar'
          ? 'h-full w-full shrink-0 border-r border-slate-800 lg:w-72'
          : 'max-h-[min(78dvh,640px)] w-full rounded-t-2xl',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="shrink-0 border-b border-slate-800 p-3 safe-pt">
        {isSheet && (
          <div className="mb-2 flex items-center justify-center">
            <div className="h-1 w-10 rounded-full bg-slate-600" aria-hidden />
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={goToTacticsList}
              className={`${btnBase} mb-2 min-h-0 py-1 text-xs text-slate-400 hover:text-white`}
            >
              ← Chiến thuật
            </button>
            <h2 className="truncate text-sm font-semibold text-white md:text-base">
              {tactic.name}
            </h2>
            <p className="text-xs text-slate-500">{tactic.steps.length} bước</p>
          </div>
          {isSheet && onCloseSheet && (
            <button
              type="button"
              onClick={onCloseSheet}
              className={`${btnBase} shrink-0 px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-white`}
              aria-label="Đóng"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-3">
        {showRoster && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Đội hình
            </h3>
            <div className="flex flex-col gap-3">
              <PositionRosterEditor
                team="home"
                counts={tactic.config.home}
                fullConfig={tactic.config}
                disabled={isPlaying}
                onChange={(_cfg, team, counts) =>
                  setConfig({ ...tactic.config, [team]: counts })
                }
              />
              <PositionRosterEditor
                team="away"
                counts={tactic.config.away}
                fullConfig={tactic.config}
                disabled={isPlaying}
                onChange={(_cfg, team, counts) =>
                  setConfig({ ...tactic.config, [team]: counts })
                }
              />
            </div>
            <p className="mt-2 text-[10px] text-slate-600 md:text-xs">
              Tổng: {rosterTotal(tactic.config.home)} nhà ·{' '}
              {rosterTotal(tactic.config.away)} khách (tối đa 11/đội)
            </p>
            <button
              type="button"
              disabled={isPlaying}
              onClick={() => setSetupInitial(!setupInitial)}
              className={`${btnBase} mt-2 w-full px-3 py-3 text-xs ${
                setupInitial
                  ? 'bg-amber-600 text-white'
                  : 'border border-slate-700 bg-slate-800 text-slate-200'
              }`}
            >
              {setupInitial ? 'Đang chỉnh vị trí ban đầu…' : 'Chỉnh vị trí ban đầu'}
            </button>
            {setupInitial && (
              <button
                type="button"
                onClick={() => {
                  saveInitialPositions(livePlayers)
                  onCloseSheet?.()
                }}
                className={`${btnBase} mt-2 w-full bg-emerald-600 px-3 py-3 text-xs font-semibold text-white`}
              >
                Lưu vị trí ban đầu
              </button>
            )}
          </section>
        )}

        {showSteps && (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Các bước
              </h3>
              <button
                type="button"
                disabled={isPlaying || setupInitial}
                onClick={addEmptyStep}
                className={`${btnBase} min-h-0 px-2 py-1 text-xs text-emerald-400 disabled:opacity-40`}
              >
                + Thêm
              </button>
            </div>

            <ul className="space-y-1.5">
              {tactic.steps.map((step, i) => {
                const selected = i === currentStepIndex && !setupInitial
                return (
                  <li
                    key={step.id}
                    className={`rounded-xl border transition ${
                      selected
                        ? 'border-emerald-500/60 bg-emerald-950/40'
                        : 'border-slate-800 bg-slate-800/50'
                    }`}
                  >
                    <button
                      type="button"
                      disabled={isPlaying || setupInitial}
                      onClick={() => {
                        selectStep(i)
                        if (isSheet) onCloseSheet?.()
                      }}
                      className="w-full px-3 py-3 text-left active:bg-slate-700/50"
                    >
                      {editingStepId === step.id ? (
                        <input
                          value={editName}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => commitEdit(step.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitEdit(step.id)
                          }}
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-2 py-2 text-sm text-white"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm font-medium text-slate-200">
                          {i + 1}. {step.name}
                        </span>
                      )}
                    </button>
                    {selected && !setupInitial && (
                      <div className="flex flex-wrap gap-2 border-t border-slate-700/80 px-2 py-2">
                        <button
                          type="button"
                          disabled={isPlaying || !isStepDirty}
                          onClick={commitCurrentStep}
                          className={`${btnBase} bg-emerald-600 px-3 py-2 text-xs text-white disabled:opacity-40`}
                        >
                          Lưu bước
                        </button>
                        <button
                          type="button"
                          disabled={isPlaying}
                          onClick={() => startEdit(step)}
                          className={`${btnBase} border border-slate-600 px-3 py-2 text-xs text-slate-300`}
                        >
                          Đổi tên
                        </button>
                        <button
                          type="button"
                          disabled={isPlaying}
                          onClick={saveCurrentAsStep}
                          className={`${btnBase} px-3 py-2 text-xs text-emerald-400`}
                        >
                          Bước mới
                        </button>
                        <button
                          type="button"
                          disabled={isPlaying || tactic.steps.length <= 1}
                          onClick={() => deleteStep(step.id)}
                          className={`${btnBase} px-3 py-2 text-xs text-rose-400`}
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>

            {activeStep && !setupInitial && !isSheet && (
              <p className="mt-2 text-xs text-slate-500">
                Kéo nhiều cầu thủ/bóng trong một bước, rồi bấm{' '}
                <strong className="text-emerald-400">Lưu bước</strong>.
              </p>
            )}
          </section>
        )}
      </div>

      {variant === 'sidebar' && (
        <div className="safe-pb shrink-0 border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={() => void play()}
            disabled={isPlaying || setupInitial || tactic.steps.length < 2}
            className={`${btnBase} flex w-full items-center justify-center gap-2 bg-emerald-600 py-3.5 font-semibold text-white disabled:opacity-40`}
          >
            {isPlaying ? 'Đang phát…' : '▶ Phát animation'}
          </button>
        </div>
      )}
    </aside>
  )
}
