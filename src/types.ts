export type Position = { x: number; y: number }

export type TeamId = 'home' | 'away'

/** Football positions registered per team */
export type PlayerRole =
  | 'GK'
  | 'LB'
  | 'CB'
  | 'RB'
  | 'LM'
  | 'CM'
  | 'RM'
  | 'ST'

export const PLAYER_ROLES: PlayerRole[] = [
  'GK',
  'LB',
  'CB',
  'RB',
  'LM',
  'CM',
  'RM',
  'ST',
]

export type PositionCounts = Record<PlayerRole, number>

export type Player = {
  id: string
  team: TeamId
  role: PlayerRole
  label: string
  x: number
  y: number
}

export type Step = {
  id: string
  name: string
  players: Player[]
  ball: Position
}

export type TacticConfig = {
  home: PositionCounts
  away: PositionCounts
}

export type Tactic = {
  id: string
  name: string
  config: TacticConfig
  initialPositions: Player[]
  steps: Step[]
  createdAt: number
  updatedAt: number
}

export type AppStorage = {
  tactics: Tactic[]
  activeTacticId: string | null
}

export type AppView = 'tactics' | 'editor'

export const STORAGE_KEY = 'football-position-v2'
export const LEGACY_STORAGE_KEY = 'football-position'

export const DEFAULT_BALL: Position = { x: 0.5, y: 0.5 }

export const MAX_PER_ROLE = 4
export const MAX_TEAM_PLAYERS = 11
export const MIN_PER_ROLE = 0

export const DEFAULT_HOME_ROSTER: PositionCounts = {
  GK: 1,
  LB: 1,
  CB: 1,
  RB: 1,
  LM: 0,
  CM: 2,
  RM: 0,
  ST: 1,
}

export const DEFAULT_AWAY_ROSTER: PositionCounts = {
  GK: 1,
  LB: 1,
  CB: 1,
  RB: 1,
  LM: 0,
  CM: 2,
  RM: 0,
  ST: 1,
}

export const DEFAULT_CONFIG: TacticConfig = {
  home: { ...DEFAULT_HOME_ROSTER },
  away: { ...DEFAULT_AWAY_ROSTER },
}
