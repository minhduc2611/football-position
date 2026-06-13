import type { StaminaSession } from '../types/stamina'

export type StateTotal = {
  stateId: string
  stateName: string
  totalMs: number
}

export type StaminaReport = {
  sessionCount: number
  totalMs: number
  avgSessionMs: number
  byState: StateTotal[]
}

export function computeStaminaReport(sessions: StaminaSession[]): StaminaReport {
  const stateMap = new Map<string, StateTotal>()
  let totalMs = 0

  for (const session of sessions) {
    totalMs += session.totalDurationMs
    for (const seg of session.segments) {
      const existing = stateMap.get(seg.stateId)
      if (existing) {
        existing.totalMs += seg.durationMs
      } else {
        stateMap.set(seg.stateId, {
          stateId: seg.stateId,
          stateName: seg.stateName,
          totalMs: seg.durationMs,
        })
      }
    }
  }

  const byState = [...stateMap.values()].sort((a, b) => b.totalMs - a.totalMs)

  return {
    sessionCount: sessions.length,
    totalMs,
    avgSessionMs: sessions.length > 0 ? totalMs / sessions.length : 0,
    byState,
  }
}
