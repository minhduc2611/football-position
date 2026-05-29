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

  useEffect(() => {
    if (!sheet) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sheet])

  if (!activeTactic) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-slate-400">
        Không tìm thấy chiến thuật.
      </div>
    )
  }

  return (
    <div className="flex h-dvh max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <LeftPanel className="hidden lg:flex" variant="sidebar" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="safe-pt safe-px shrink-0 border-b border-slate-800 bg-slate-950/90 px-3 py-2 backdrop-blur-sm md:px-4 md:py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] md:text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 md:h-3 md:w-3" />
              Nhà
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 md:h-3 md:w-3" />
              Khách
            </span>
            <span className="text-slate-500">⚽️</span>
            {setupInitial && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-300">
                Vị trí ban đầu
              </span>
            )}
            {!setupInitial && activeStep && (
              <span className="truncate text-slate-500">
                <strong className="text-slate-300">{activeStep.name}</strong>
                {isStepDirty && (
                  <span className="ml-1 text-amber-400">· chưa lưu</span>
                )}
              </span>
            )}
          </div>
        </header>

        <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2 sm:p-3 md:p-4">
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
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-label="Đóng panel"
            onClick={() => setSheet(null)}
          />
          <div className="relative z-10 w-full">
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
