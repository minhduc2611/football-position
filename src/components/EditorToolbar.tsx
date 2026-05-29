import {
  selectActiveStep,
  selectActiveTactic,
  selectIsStepDirty,
  useTacticsStore,
} from '../store/tacticsStore'

type MobileSheet = 'steps' | 'roster' | null

type EditorToolbarProps = {
  sheet: MobileSheet
  onSheetChange: (sheet: MobileSheet) => void
}

export function EditorToolbar({ sheet, onSheetChange }: EditorToolbarProps) {
  const tactic = useTacticsStore(selectActiveTactic)
  const activeStep = useTacticsStore(selectActiveStep)
  const isStepDirty = useTacticsStore(selectIsStepDirty)
  const setupInitial = useTacticsStore((s) => s.setupInitial)
  const isPlaying = useTacticsStore((s) => s.isPlaying)

  const commitCurrentStep = useTacticsStore((s) => s.commitCurrentStep)
  const play = useTacticsStore((s) => s.play)

  if (!tactic) return null

  const toggle = (panel: Exclude<MobileSheet, null>) => {
    onSheetChange(sheet === panel ? null : panel)
  }

  return (
    <nav
      className="safe-pb safe-px shrink-0 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md lg:hidden"
      aria-label="Điều khiển nhanh"
    >
      <div className="grid grid-cols-4 gap-1 py-2">
        <button
          type="button"
          onClick={() => toggle('steps')}
          className={`touch-target flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium ${
            sheet === 'steps'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 active:bg-slate-800'
          }`}
        >
          <span className="text-base leading-none">📋</span>
          Bước
        </button>
        <button
          type="button"
          onClick={() => toggle('roster')}
          className={`touch-target flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium ${
            sheet === 'roster'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 active:bg-slate-800'
          }`}
        >
          <span className="text-base leading-none">👥</span>
          Đội hình
        </button>
        <button
          type="button"
          disabled={isPlaying || setupInitial || !isStepDirty}
          onClick={commitCurrentStep}
          className="touch-target flex flex-col items-center justify-center gap-0.5 rounded-xl bg-emerald-600/90 px-1 py-2 text-[10px] font-semibold text-white active:bg-emerald-500 disabled:opacity-40"
        >
          <span className="text-base leading-none">💾</span>
          Lưu
        </button>
        <button
          type="button"
          disabled={isPlaying || setupInitial || tactic.steps.length < 2}
          onClick={() => void play()}
          className="touch-target flex flex-col items-center justify-center gap-0.5 rounded-xl border border-emerald-500/40 bg-emerald-950/50 px-1 py-2 text-[10px] font-semibold text-emerald-300 active:bg-emerald-900/50 disabled:opacity-40"
        >
          <span className="text-base leading-none">▶</span>
          {isPlaying ? '…' : 'Phát'}
        </button>
      </div>
      {activeStep && !setupInitial && isStepDirty && (
        <p className="pb-2 text-center text-[10px] text-amber-400/90">
          {activeStep.name} · chưa lưu
        </p>
      )}
    </nav>
  )
}
