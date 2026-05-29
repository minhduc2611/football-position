import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppView,
  Player,
  Position,
  Step,
  Tactic,
  TacticConfig,
} from '../types'
import { DEFAULT_BALL, STORAGE_KEY } from '../types'
import { clampTacticConfig } from '../utils/roster'
import {
  buildPlayersFromConfig,
  clonePlayers,
  createDefaultTactic,
  createStep,
  stepsEqual,
} from '../utils/formations'
import { uid } from '../utils/id'
import { loadAppStorage, normalizeTactic } from '../utils/storage'

function stepFromLive(
  players: Player[],
  ball: Position,
  base: { id: string; name: string },
): Step {
  const step = createStep(players, ball, base.name)
  return { ...step, id: base.id, name: base.name }
}

const boot = loadAppStorage()

type TacticsState = {
  tactics: Tactic[]
  activeTacticId: string | null
  view: AppView
  currentStepIndex: number
  setupInitial: boolean
  isPlaying: boolean
  playStepIndex: number
  livePlayers: Player[]
  liveBall: Position

  syncLiveCanvas: () => void
  openTactic: (tacticId: string) => void
  goToTacticsList: () => void
  createTactic: (name?: string) => string
  deleteTactic: (tacticId: string) => void
  renameTactic: (tacticId: string, name: string) => void
  duplicateTactic: (tacticId: string) => void
  setConfig: (config: TacticConfig) => void
  saveInitialPositions: (players: Player[]) => void
  setSetupInitial: (enabled: boolean) => void
  setLivePlayers: (players: Player[]) => void
  setLiveBall: (ball: Position) => void
  setLiveScene: (players: Player[], ball: Position) => void
  selectStep: (index: number) => void
  updateStepMeta: (stepId: string, patch: { name?: string }) => void
  commitCurrentStep: () => boolean
  saveCurrentAsStep: () => void
  deleteStep: (stepId: string) => void
  addEmptyStep: () => void
  play: () => Promise<void>
}

function getActiveTactic(state: TacticsState): Tactic | null {
  return state.tactics.find((t) => t.id === state.activeTacticId) ?? null
}

function getActiveStep(state: TacticsState): Step | null {
  const tactic = getActiveTactic(state)
  if (!tactic) return null
  return tactic.steps[state.currentStepIndex] ?? null
}

function updateTacticInState(
  state: TacticsState,
  tacticId: string,
  updater: (t: Tactic) => Tactic,
): Pick<TacticsState, 'tactics'> {
  return {
    tactics: state.tactics.map((t) =>
      t.id === tacticId
        ? normalizeTactic(updater({ ...t, updatedAt: Date.now() }))
        : t,
    ),
  }
}

export const useTacticsStore = create<TacticsState>()(
  persist(
    (set, get) => ({
      tactics: boot.tactics,
      activeTacticId: boot.activeTacticId,
      view: 'tactics',
      currentStepIndex: 0,
      setupInitial: false,
      isPlaying: false,
      playStepIndex: 0,
      livePlayers: [],
      liveBall: DEFAULT_BALL,

      syncLiveCanvas: () => {
        const state = get()
        const tactic = getActiveTactic(state)
        if (!tactic) return

        const step = state.setupInitial
          ? null
          : tactic.steps[state.currentStepIndex] ?? tactic.steps[0]

        const players = state.setupInitial
          ? clonePlayers(tactic.initialPositions)
          : step
            ? clonePlayers(step.players)
            : clonePlayers(tactic.initialPositions)

        const ball = state.setupInitial
          ? { ...DEFAULT_BALL }
          : step
            ? { ...step.ball }
            : { ...DEFAULT_BALL }

        set({ livePlayers: players, liveBall: ball })
      },

      openTactic: (tacticId) => {
        set({
          activeTacticId: tacticId,
          currentStepIndex: 0,
          setupInitial: false,
          view: 'editor',
        })
        get().syncLiveCanvas()
      },

      goToTacticsList: () => {
        get().commitCurrentStep()
        set({ view: 'tactics', setupInitial: false, isPlaying: false })
      },

      createTactic: (name) => {
        const tactic = createDefaultTactic(name)
        set((s) => ({
          tactics: [...s.tactics, tactic],
          activeTacticId: tactic.id,
          currentStepIndex: 0,
          view: 'editor',
          setupInitial: false,
        }))
        get().syncLiveCanvas()
        return tactic.id
      },

      deleteTactic: (tacticId) => {
        set((s) => {
          const tactics = s.tactics.filter((t) => t.id !== tacticId)
          if (!tactics.length) {
            const fresh = createDefaultTactic()
            return {
              tactics: [fresh],
              activeTacticId: fresh.id,
            }
          }
          return {
            tactics,
            activeTacticId:
              s.activeTacticId === tacticId
                ? tactics[0]?.id ?? null
                : s.activeTacticId,
          }
        })
      },

      renameTactic: (tacticId, name) => {
        set((s) =>
          updateTacticInState(s, tacticId, (t) => ({
            ...t,
            name: name.trim() || t.name,
          })),
        )
      },

      duplicateTactic: (tacticId) => {
        const source = get().tactics.find((t) => t.id === tacticId)
        if (!source) return
        const copy = createDefaultTactic(`${source.name} (bản sao)`)
        copy.config = { ...source.config }
        copy.initialPositions = clonePlayers(source.initialPositions)
        copy.steps = source.steps.map((s) => ({
          ...s,
          id: uid('step-'),
          players: clonePlayers(s.players),
          ball: { ...s.ball },
        }))
        set((s) => ({
          tactics: [...s.tactics, copy],
          activeTacticId: copy.id,
          view: 'editor',
          currentStepIndex: 0,
          setupInitial: false,
        }))
        get().syncLiveCanvas()
      },

      setConfig: (config) => {
        const tactic = getActiveTactic(get())
        if (!tactic) return
        const clamped = clampTacticConfig(config)
        set((s) =>
          updateTacticInState(s, tactic.id, (t) => {
            const initialPositions = buildPlayersFromConfig(
              clamped,
              t.initialPositions,
            )
            return {
              ...t,
              config: clamped,
              initialPositions,
              steps: t.steps.map((step) => ({
                ...step,
                players: buildPlayersFromConfig(clamped, step.players),
              })),
            }
          }),
        )
        get().syncLiveCanvas()
      },

      saveInitialPositions: (players) => {
        const tactic = getActiveTactic(get())
        if (!tactic) return
        set((s) =>
          updateTacticInState(s, tactic.id, (t) => ({
            ...t,
            initialPositions: clonePlayers(players),
          })),
        )
        set({ setupInitial: false })
      },

      setSetupInitial: (enabled) => {
        set({ setupInitial: enabled })
        get().syncLiveCanvas()
      },

      setLivePlayers: (players) => set({ livePlayers: players }),
      setLiveBall: (ball) => set({ liveBall: ball }),
      setLiveScene: (players, ball) =>
        set({ livePlayers: players, liveBall: ball }),

      commitCurrentStep: () => {
        const state = get()
        const tactic = getActiveTactic(state)
        const activeStep = getActiveStep(state)
        if (!tactic || state.setupInitial || !activeStep) return false

        const updated = stepFromLive(
          state.livePlayers,
          state.liveBall,
          activeStep,
        )
        if (stepsEqual(activeStep, updated)) return false

        set((s) =>
          updateTacticInState(s, tactic.id, (t) => ({
            ...t,
            steps: t.steps.map((step, i) =>
              i === state.currentStepIndex ? updated : step,
            ),
          })),
        )
        return true
      },

      selectStep: (index) => {
        const state = get()
        if (state.isPlaying) return
        if (index !== state.currentStepIndex) {
          get().commitCurrentStep()
          set({ currentStepIndex: index, setupInitial: false })
          get().syncLiveCanvas()
        } else {
          set({ setupInitial: false })
        }
      },

      updateStepMeta: (stepId, patch) => {
        const tactic = getActiveTactic(get())
        if (!tactic) return
        set((s) =>
          updateTacticInState(s, tactic.id, (t) => ({
            ...t,
            steps: t.steps.map((step) =>
              step.id === stepId ? { ...step, ...patch } : step,
            ),
          })),
        )
      },

      saveCurrentAsStep: () => {
        const state = get()
        const tactic = getActiveTactic(state)
        if (!tactic || state.setupInitial) return

        get().commitCurrentStep()
        const step = createStep(
          state.livePlayers,
          state.liveBall,
          `Bước ${tactic.steps.length + 1}`,
        )

        set((s) => {
          const t = getActiveTactic(s)
          if (!t) return s
          return {
            ...updateTacticInState(s, t.id, (tac) => ({
              ...tac,
              steps: [...tac.steps.slice(0, s.currentStepIndex + 1), step],
            })),
            currentStepIndex: s.currentStepIndex + 1,
          }
        })
      },

      deleteStep: (stepId) => {
        const tactic = getActiveTactic(get())
        if (!tactic || tactic.steps.length <= 1) return
        set((s) => ({
          ...updateTacticInState(s, tactic.id, (t) => ({
            ...t,
            steps: t.steps.filter((step) => step.id !== stepId),
          })),
          currentStepIndex: Math.max(0, s.currentStepIndex - 1),
        }))
        get().syncLiveCanvas()
      },

      addEmptyStep: () => {
        const state = get()
        const tactic = getActiveTactic(state)
        if (!tactic) return

        get().commitCurrentStep()
        const step = createStep(
          state.livePlayers,
          state.liveBall,
          `Bước ${tactic.steps.length + 1}`,
        )
        const nextIndex = tactic.steps.length

        set((s) => ({
          ...updateTacticInState(s, tactic.id, (t) => ({
            ...t,
            steps: [...t.steps, step],
          })),
          currentStepIndex: nextIndex,
        }))
      },

      play: async () => {
        get().commitCurrentStep()
        const state = get()
        const tactic = getActiveTactic(state)
        if (!tactic || tactic.steps.length < 2 || state.isPlaying) return

        set({ isPlaying: true, setupInitial: false })

        for (let i = 0; i < tactic.steps.length; i++) {
          const step = tactic.steps[i]
          if (!step) continue
          set({
            playStepIndex: i,
            currentStepIndex: i,
            livePlayers: clonePlayers(step.players),
            liveBall: { ...step.ball },
          })
          if (i < tactic.steps.length - 1) {
            await new Promise((r) => setTimeout(r, 750))
          }
        }

        await new Promise((r) => setTimeout(r, 300))
        set({
          isPlaying: false,
          currentStepIndex: tactic.steps.length - 1,
        })
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        tactics: state.tactics,
        activeTacticId: state.activeTacticId,
      }),
    },
  ),
)

export function selectActiveTactic(state: TacticsState) {
  return getActiveTactic(state)
}

export function selectActiveStep(state: TacticsState) {
  return getActiveStep(state)
}

export function selectIsStepDirty(state: TacticsState) {
  const activeStep = getActiveStep(state)
  if (!activeStep || state.setupInitial) return false
  const draft = stepFromLive(state.livePlayers, state.liveBall, activeStep)
  return !stepsEqual(activeStep, draft)
}
