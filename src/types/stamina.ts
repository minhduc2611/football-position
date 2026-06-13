export type StaminaStateDef = {
  id: string
  name: string
  color: string
  /** @deprecated legacy persisted configs only */
  isTerminal?: boolean
}

export type StaminaSegment = {
  stateId: string
  stateName: string
  durationMs: number
}

export type StaminaSession = {
  id: string
  startedAt: number
  endedAt: number
  segments: StaminaSegment[]
  totalDurationMs: number
}

export type StaminaActiveSession = {
  startedAt: number
  currentStateIndex: number
  stateStartedAt: number
  segments: StaminaSegment[]
}

export type StaminaStorage = {
  states: StaminaStateDef[]
  sessions: StaminaSession[]
  activeSession: StaminaActiveSession | null
}

export const STAMINA_STORAGE_KEY = 'football-position-stamina'

export const DEFAULT_STAMINA_STATES: StaminaStateDef[] = [
  { id: 'sprint', name: 'Chạy hết sức', color: '#f43f5e' },
  { id: 'steady', name: 'Chạy bền', color: '#f59e0b' },
  { id: 'rest', name: 'Nghỉ', color: '#3b82f6' },
]

export const CUSTOM_STATE_COLORS = [
  '#a855f7',
  '#14b8a6',
  '#ec4899',
  '#84cc16',
  '#06b6d4',
  '#eab308',
]
