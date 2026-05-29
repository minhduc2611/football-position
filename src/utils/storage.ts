import type { AppStorage, Player, Tactic } from '../types'
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from '../types'
import {
  buildPlayersFromConfig,
  createDefaultTactic,
  createStep,
  inferRoleFromPlayer,
} from './formations'
import { migrateTacticConfig } from './roster'

function enrichPlayer(p: Player): Player {
  const role = inferRoleFromPlayer(p)
  return {
    ...p,
    role,
    label: p.label || role,
  }
}

function migrateLegacy(): AppStorage | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      steps?: Array<{
        players: Array<{
          id: string
          label: string
          x: number
          y: number
          team?: string
          role?: string
        }>
        ball: { x: number; y: number }
      }>
    }
    if (!parsed.steps?.length) return null

    const tactic = createDefaultTactic('Chiến thuật (nhập)')
    tactic.steps = parsed.steps.map((s, i) =>
      createStep(
        s.players.map((p) =>
          enrichPlayer({
            ...p,
            team: 'home',
            id: p.id.startsWith('h-') || p.id.startsWith('a-') ? p.id : `h-${p.id}`,
          } as Player),
        ),
        s.ball,
        `Bước ${i + 1}`,
      ),
    )
    tactic.initialPositions = tactic.steps[0]!.players.map((p) => ({ ...p }))
    return { tactics: [tactic], activeTacticId: tactic.id }
  } catch {
    return null
  }
}

function normalizeTacticConfig(tactic: Tactic): Tactic {
  return {
    ...tactic,
    config: migrateTacticConfig(tactic.config),
  }
}

export function loadAppStorage(): AppStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppStorage
      if (parsed.tactics?.length) {
        return {
          tactics: parsed.tactics.map((t) => normalizeTacticConfig(t)),
          activeTacticId: parsed.activeTacticId ?? parsed.tactics[0]?.id ?? null,
        }
      }
    }
  } catch {
    /* fall through */
  }

  const migrated = migrateLegacy()
  if (migrated) {
    saveAppStorage(migrated)
    return migrated
  }

  const tactic = createDefaultTactic('Chiến thuật 1')
  return { tactics: [tactic], activeTacticId: tactic.id }
}

export function saveAppStorage(state: AppStorage) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function normalizeTactic(tactic: Tactic): Tactic {
  const config = migrateTacticConfig(tactic.config)
  const roster = buildPlayersFromConfig(config, tactic.initialPositions.map(enrichPlayer))
  const mergePlayers = (stepPlayers: Player[]) =>
    roster.map((p) => {
      const match = stepPlayers.map(enrichPlayer).find((sp) => sp.id === p.id)
      return match
        ? { ...match, team: p.team, role: p.role, label: p.label }
        : { ...p }
    })

  const initialPositions = mergePlayers(tactic.initialPositions)
  const steps = tactic.steps.map((step) => ({
    ...step,
    players: mergePlayers(step.players),
  }))

  return {
    ...tactic,
    config,
    initialPositions,
    steps: steps.length
      ? steps
      : [createStep(initialPositions, { x: 0.5, y: 0.5 }, 'Bước 1')],
    updatedAt: Date.now(),
  }
}
