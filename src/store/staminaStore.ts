import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  StaminaActiveSession,
  StaminaSegment,
  StaminaSession,
  StaminaStateDef,
} from '../types/stamina'
import {
  CUSTOM_STATE_COLORS,
  DEFAULT_COUNTDOWN_ENABLED,
  DEFAULT_STAMINA_STATES,
  STAMINA_STORAGE_KEY,
} from '../types/stamina'
import { uid } from '../utils/id'

export function getCycleStates(states: StaminaStateDef[]): StaminaStateDef[] {
  return states.filter((s) => !s.isTerminal)
}

type StaminaState = {
  states: StaminaStateDef[]
  sessions: StaminaSession[]
  activeSession: StaminaActiveSession | null
  countdownEnabled: boolean

  addState: (name: string) => void
  updateState: (id: string, patch: { name?: string }) => void
  removeState: (id: string) => void
  moveState: (id: string, direction: 'up' | 'down') => void
  resetStatesToDefault: () => void
  setCountdownEnabled: (enabled: boolean) => void

  startSession: () => void
  tapButton: () => void
  endSession: () => void
  clearHistory: () => void
  deleteSession: (sessionId: string) => void
}

export const useStaminaStore = create<StaminaState>()(
  persist(
    (set, get) => ({
      states: DEFAULT_STAMINA_STATES,
      sessions: [],
      activeSession: null,
      countdownEnabled: DEFAULT_COUNTDOWN_ENABLED,

      addState: (name) => {
        const trimmed = name.trim()
        if (!trimmed) return

        set((s) => {
          const cycleStates = getCycleStates(s.states)
          const color =
            CUSTOM_STATE_COLORS[cycleStates.length % CUSTOM_STATE_COLORS.length]!

          return {
            states: [
              ...cycleStates,
              { id: uid('state-'), name: trimmed, color },
            ],
          }
        })
      },

      updateState: (id, patch) => {
        set((s) => ({
          states: s.states.map((st) =>
            st.id === id
              ? { ...st, name: patch.name?.trim() || st.name }
              : st,
          ),
        }))
      },

      removeState: (id) => {
        set((s) => {
          const cycleStates = getCycleStates(s.states)
          const target = cycleStates.find((st) => st.id === id)
          if (!target || cycleStates.length <= 1) return s

          const nextStates = cycleStates.filter((st) => st.id !== id)

          let activeSession = s.activeSession
          if (activeSession) {
            const removedIdx = cycleStates.findIndex((st) => st.id === id)
            if (removedIdx >= 0) {
              const nextIndex =
                activeSession.currentStateIndex >= removedIdx
                  ? Math.max(0, activeSession.currentStateIndex - 1)
                  : activeSession.currentStateIndex
              activeSession = {
                ...activeSession,
                currentStateIndex: Math.min(nextIndex, nextStates.length - 1),
              }
            }
          }

          return { states: nextStates, activeSession }
        })
      },

      moveState: (id, direction) => {
        set((s) => {
          const states = getCycleStates(s.states)
          const idx = states.findIndex((st) => st.id === id)
          if (idx < 0) return s

          const nextIdx = direction === 'up' ? idx - 1 : idx + 1
          if (nextIdx < 0 || nextIdx >= states.length) return s

          const updated = [...states]
          ;[updated[idx], updated[nextIdx]] = [updated[nextIdx]!, updated[idx]!]
          return { states: updated }
        })
      },

      resetStatesToDefault: () => {
        set({ states: DEFAULT_STAMINA_STATES })
      },

      setCountdownEnabled: (enabled) => {
        set({ countdownEnabled: enabled })
      },

      startSession: () => {
        const { states, activeSession } = get()
        if (activeSession) return

        const cycleStates = getCycleStates(states)
        if (cycleStates.length === 0) return

        const now = Date.now()
        set({
          activeSession: {
            startedAt: now,
            currentStateIndex: 0,
            stateStartedAt: now,
            segments: [],
          },
        })
      },

      tapButton: () => {
        const { states, activeSession } = get()
        const cycleStates = getCycleStates(states)
        if (cycleStates.length === 0) return

        if (!activeSession) return

        const now = Date.now()
        const current = cycleStates[activeSession.currentStateIndex]
        if (!current) return

        const elapsed = now - activeSession.stateStartedAt
        const segments: StaminaSegment[] = [
          ...activeSession.segments,
          {
            stateId: current.id,
            stateName: current.name,
            durationMs: elapsed,
          },
        ]

        const nextIndex = (activeSession.currentStateIndex + 1) % cycleStates.length

        set({
          activeSession: {
            ...activeSession,
            currentStateIndex: nextIndex,
            stateStartedAt: now,
            segments,
          },
        })
      },

      endSession: () => {
        const { states, activeSession, sessions } = get()
        if (!activeSession) return

        const cycleStates = getCycleStates(states)
        const current = cycleStates[activeSession.currentStateIndex]
        const now = Date.now()

        let segments = [...activeSession.segments]
        if (current) {
          segments = [
            ...segments,
            {
              stateId: current.id,
              stateName: current.name,
              durationMs: now - activeSession.stateStartedAt,
            },
          ]
        }

        const session: StaminaSession = {
          id: uid('session-'),
          startedAt: activeSession.startedAt,
          endedAt: now,
          segments,
          totalDurationMs: segments.reduce((sum, seg) => sum + seg.durationMs, 0),
        }

        set({
          activeSession: null,
          sessions: [session, ...sessions].slice(0, 50),
        })
      },

      clearHistory: () => set({ sessions: [] }),

      deleteSession: (sessionId) => {
        set((s) => ({
          sessions: s.sessions.filter((session) => session.id !== sessionId),
        }))
      },
    }),
    {
      name: STAMINA_STORAGE_KEY,
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as object) } as StaminaState
        merged.states = getCycleStates(merged.states)
        merged.countdownEnabled = merged.countdownEnabled ?? DEFAULT_COUNTDOWN_ENABLED
        if (merged.activeSession) {
          const maxIdx = Math.max(0, merged.states.length - 1)
          merged.activeSession = {
            ...merged.activeSession,
            currentStateIndex: Math.min(
              merged.activeSession.currentStateIndex,
              maxIdx,
            ),
          }
        }
        return merged
      },
    },
  ),
)

export function selectCurrentStateDef(state: StaminaState): StaminaStateDef | null {
  const cycleStates = getCycleStates(state.states)
  if (!state.activeSession) {
    return cycleStates[0] ?? null
  }
  return cycleStates[state.activeSession.currentStateIndex] ?? null
}

export function selectElapsedMs(state: StaminaState, now: number): number {
  if (!state.activeSession) return 0
  return Math.max(0, now - state.activeSession.stateStartedAt)
}

export function selectSessionTotalMs(state: StaminaState, now: number): number {
  if (!state.activeSession) return 0
  const recorded = state.activeSession.segments.reduce(
    (sum, seg) => sum + seg.durationMs,
    0,
  )
  return recorded + selectElapsedMs(state, now)
}

export function selectCycleStateCount(state: StaminaState): number {
  return getCycleStates(state.states).length
}
