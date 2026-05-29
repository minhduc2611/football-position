import {
  DEFAULT_AWAY_ROSTER,
  DEFAULT_CONFIG,
  DEFAULT_HOME_ROSTER,
  MAX_PER_ROLE,
  MAX_TEAM_PLAYERS,
  MIN_PER_ROLE,
  PLAYER_ROLES,
  type PlayerRole,
  type PositionCounts,
  type TacticConfig,
} from '../types'

export function rosterTotal(counts: PositionCounts): number {
  return PLAYER_ROLES.reduce((sum, role) => sum + counts[role], 0)
}

export function clampRoleCount(n: number): number {
  return Math.min(MAX_PER_ROLE, Math.max(MIN_PER_ROLE, Math.floor(n) || 0))
}

export function clampTeamRoster(
  counts: Partial<PositionCounts> | PositionCounts,
): PositionCounts {
  const next = {} as PositionCounts
  for (const role of PLAYER_ROLES) {
    next[role] = clampRoleCount(counts[role] ?? 0)
  }
  let total = rosterTotal(next)
  if (total <= MAX_TEAM_PLAYERS) return next

  for (const role of [...PLAYER_ROLES].reverse()) {
    if (total <= MAX_TEAM_PLAYERS) break
    const drop = Math.min(next[role], total - MAX_TEAM_PLAYERS)
    next[role] -= drop
    total -= drop
  }
  return next
}

export function clampTacticConfig(config: Partial<TacticConfig> | TacticConfig): TacticConfig {
  return {
    home: clampTeamRoster(config.home ?? DEFAULT_HOME_ROSTER),
    away: clampTeamRoster(config.away ?? DEFAULT_AWAY_ROSTER),
  }
}

/** Migrate old { homeCount, awayCount } configs */
export function migrateTacticConfig(raw: unknown): TacticConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_CONFIG }

  const obj = raw as Record<string, unknown>

  if ('home' in obj && 'away' in obj) {
    return clampTacticConfig({
      home: obj.home as PositionCounts,
      away: obj.away as PositionCounts,
    })
  }

  if ('homeCount' in obj || 'awayCount' in obj) {
    const homeCount = Number(obj.homeCount) || rosterTotal(DEFAULT_HOME_ROSTER)
    const awayCount = Number(obj.awayCount) || rosterTotal(DEFAULT_AWAY_ROSTER)
    return {
      home: scaleRosterToCount(DEFAULT_HOME_ROSTER, homeCount),
      away: scaleRosterToCount(DEFAULT_AWAY_ROSTER, awayCount),
    }
  }

  return { ...DEFAULT_CONFIG }
}

function scaleRosterToCount(template: PositionCounts, target: number): PositionCounts {
  const capped = Math.min(MAX_TEAM_PLAYERS, Math.max(0, target))
  if (capped === 0) {
    return PLAYER_ROLES.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as PositionCounts)
  }

  const next = PLAYER_ROLES.reduce(
    (acc, r) => ({ ...acc, [r]: 0 }),
    {} as PositionCounts,
  )
  next.GK = 1
  let remaining = capped - 1

  const fillOrder: PlayerRole[] = ['CB', 'LB', 'RB', 'CM', 'LM', 'RM', 'ST']
  for (const role of fillOrder) {
    if (remaining <= 0) break
    const want = template[role]
    const add = Math.min(want, remaining, MAX_PER_ROLE)
    next[role] = add
    remaining -= add
  }
  for (const role of fillOrder) {
    if (remaining <= 0) break
    if (next[role] >= MAX_PER_ROLE) continue
    const add = Math.min(MAX_PER_ROLE - next[role], remaining)
    next[role] += add
    remaining -= add
  }
  return clampTeamRoster(next)
}

export function formatRosterSummary(counts: PositionCounts): string {
  return PLAYER_ROLES.filter((r) => counts[r] > 0)
    .map((r) => `${r}×${counts[r]}`)
    .join(' ')
}
