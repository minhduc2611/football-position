import {
  DEFAULT_BALL,
  DEFAULT_CONFIG,
  PLAYER_ROLES,
  type Player,
  type PlayerRole,
  type Position,
  type Step,
  type TacticConfig,
  type TeamId,
} from '../types'
import { clampTacticConfig } from './roster'
import { uid } from './id'

const ROLE_ANCHOR: Record<
  PlayerRole,
  { x: number; y: number; spread?: 'wide' | 'central' }
> = {
  GK: { x: 0.5, y: 0.92 },
  LB: { x: 0.16, y: 0.78, spread: 'wide' },
  CB: { x: 0.5, y: 0.8, spread: 'central' },
  RB: { x: 0.84, y: 0.78, spread: 'wide' },
  LM: { x: 0.2, y: 0.58, spread: 'wide' },
  CM: { x: 0.5, y: 0.55, spread: 'central' },
  RM: { x: 0.8, y: 0.58, spread: 'wide' },
  ST: { x: 0.5, y: 0.28, spread: 'central' },
}

function teamY(team: TeamId, y: number) {
  return team === 'home' ? y : 1 - y
}

function slotX(index: number, count: number, anchorX: number, spread?: 'wide' | 'central') {
  if (count <= 1) return anchorX
  const padding = spread === 'wide' ? 0.12 : 0.22
  const span = spread === 'wide' ? 0.76 : 0.56
  const left = anchorX - span / 2
  return left + padding + (index / (count - 1)) * (span - padding * 2)
}

function playerLabel(role: PlayerRole, index: number, total: number) {
  if (total <= 1) return role
  return `${role}${index + 1}`
}

function findExisting(
  existing: Player[] | undefined,
  team: TeamId,
  role: PlayerRole,
  index: number,
) {
  const id = `${team === 'home' ? 'h' : 'a'}-${role}-${index + 1}`
  return existing?.find((p) => p.id === id)
}

export function buildTeamPlayers(
  team: TeamId,
  counts: import('../types').PositionCounts,
  existing?: Player[],
): Player[] {
  const prefix = team === 'home' ? 'h' : 'a'
  const players: Player[] = []

  for (const role of PLAYER_ROLES) {
    const count = counts[role]
    const anchor = ROLE_ANCHOR[role]
    for (let i = 0; i < count; i++) {
      const id = `${prefix}-${role}-${i + 1}`
      const prev = findExisting(existing, team, role, i)
      players.push({
        id,
        team,
        role,
        label: playerLabel(role, i, count),
        x: prev?.x ?? slotX(i, count, anchor.x, anchor.spread),
        y: prev?.y ?? teamY(team, anchor.y),
      })
    }
  }
  return players
}

export function buildPlayersFromConfig(
  config: TacticConfig,
  existing?: Player[],
): Player[] {
  const clamped = clampTacticConfig(config)
  const home = buildTeamPlayers(
    'home',
    clamped.home,
    existing?.filter((p) => p.team === 'home'),
  )
  const away = buildTeamPlayers(
    'away',
    clamped.away,
    existing?.filter((p) => p.team === 'away'),
  )
  return [...home, ...away]
}

export function createStep(
  players: Player[],
  ball: Position,
  name?: string,
): Step {
  return {
    id: uid('step-'),
    name: name ?? `Bước ${Date.now() % 1000}`,
    players: players.map((p) => ({ ...p })),
    ball: { ...ball },
  }
}

export function clonePlayers(players: Player[]): Player[] {
  return players.map((p) => ({ ...p }))
}

export function createDefaultTactic(name = 'Chiến thuật mới'): import('../types').Tactic {
  const config = { ...DEFAULT_CONFIG, home: { ...DEFAULT_CONFIG.home }, away: { ...DEFAULT_CONFIG.away } }
  const initialPositions = buildPlayersFromConfig(config)
  const step = createStep(initialPositions, DEFAULT_BALL, 'Bước 1')
  const now = Date.now()
  return {
    id: uid('tactic-'),
    name,
    config,
    initialPositions: clonePlayers(initialPositions),
    steps: [step],
    createdAt: now,
    updatedAt: now,
  }
}

export function stepsEqual(a: Step, b: Step) {
  if (a.ball.x !== b.ball.x || a.ball.y !== b.ball.y) return false
  if (a.players.length !== b.players.length) return false
  return a.players.every(
    (p, i) =>
      p.id === b.players[i]?.id &&
      p.team === b.players[i]?.team &&
      p.role === b.players[i]?.role &&
      p.x === b.players[i]?.x &&
      p.y === b.players[i]?.y,
  )
}

/** Infer role from legacy player id/label */
export function inferRoleFromPlayer(p: {
  id: string
  label?: string
  role?: PlayerRole
}): PlayerRole {
  if (p.role && PLAYER_ROLES.includes(p.role)) return p.role
  const fromId = p.id.match(/-(GK|LB|CB|RB|LM|CM|RM|ST)-/i)?.[1]?.toUpperCase()
  if (fromId && PLAYER_ROLES.includes(fromId as PlayerRole)) return fromId as PlayerRole
  const label = (p.label ?? '').toUpperCase()
  if (PLAYER_ROLES.includes(label as PlayerRole)) return label as PlayerRole
  return 'CM'
}
