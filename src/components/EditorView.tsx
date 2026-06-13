import { useEffect, useState } from 'react'
import {
  selectActiveStep,
  selectActiveTactic,
  selectIsStepDirty,
  useTacticsStore,
} from '../store/tacticsStore'
import { EditorToolbar } from './EditorToolbar'
import { FootballField } from './FootballField'
import { LeftPanel } from './LeftPanel'

type MobileSheet = 'steps' | 'roster' | null

export function EditorView() {
  const activeTactic = useTacticsStore(selectActiveTactic)
  const activeStep = useTacticsStore(selectActiveStep)
  const setupInitial = useTacticsStore((s) => s.setupInitial)
  const isPlaying = useTacticsStore((s) => s.isPlaying)
  const isStepDirty = useTacticsStore(selectIsStepDirty)
  const playStepIndex = useTacticsStore((s) => s.playStepIndex)
  const livePlayers = useTacticsStore((s) => s.livePlayers)
  const liveBall = useTacticsStore((s) => s.liveBall)
  const setLiveScene = useTacticsStore((s) => s.setLiveScene)
  const goToTacticsList = useTacticsStore((s) => s.goToTacticsList)

  const [sheet, setSheet] = useState<MobileSheet>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        const state = useTacticsStore.getState()
        if (!state.setupInitial && selectIsStepDirty(state)) {
          state.commitCurrentStep()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!activeTactic) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-slate-400">
        Không tìm thấy chiến thuật.
      </div>
    )
  }

  return (
    <div className="flex h-full max-h-full w-full flex-col overflow-hidden lg:flex-row">
      <LeftPanel className="hidden lg:flex" variant="sidebar" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="safe-pt safe-px shrink-0 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
          <div className="flex items-center gap-2 px-2 py-2 md:gap-3 md:px-4 md:py-3">
            <button
              type="button"
              onClick={goToTacticsList}
              className="touch-target flex shrink-0 items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-slate-300 transition active:bg-slate-800 active:text-white lg:hidden"
              aria-label="Quay lại danh sách chiến thuật"
            >
              <span className="text-base leading-none" aria-hidden>
                ←
              </span>
              <span className="hidden sm:inline">Chiến thuật</span>
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white md:text-base">
                {activeTactic.name}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 md:text-xs">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Nhà
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Khách
                </span>
                <span>⚽️</span>
                {setupInitial && (
                  <span className="text-amber-400">Vị trí ban đầu</span>
                )}
                {!setupInitial && activeStep && (
                  <span className="truncate">
                    <span className="text-slate-400">{activeStep.name}</span>
                    {isStepDirty && (
                      <span className="text-amber-400"> · chưa lưu</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden p-2 sm:p-3 md:p-4">
          <div className="h-full w-full max-w-lg">
            <FootballField
              players={livePlayers}
              ball={liveBall}
              disabled={isPlaying}
              isPlaying={isPlaying}
              playStepIndex={playStepIndex}
              onMove={setLiveScene}
              onDragEnd={setLiveScene}
            />
          </div>
        </main>

        <EditorToolbar sheet={sheet} onSheetChange={setSheet} />
      </div>

      {sheet && (
        <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          <div className="pointer-events-auto relative z-10 w-full">
            <LeftPanel
              variant="sheet"
              sheetFocus={sheet}
              onCloseSheet={() => setSheet(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
