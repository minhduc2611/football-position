import type { PositionCounts, TeamId, TacticConfig } from '../types'
import { MAX_PER_ROLE, MAX_TEAM_PLAYERS, PLAYER_ROLES } from '../types'
import { rosterTotal } from '../utils/roster'

type PositionRosterEditorProps = {
  team: TeamId
  counts: PositionCounts
  disabled?: boolean
  onChange: (config: TacticConfig, team: TeamId, counts: PositionCounts) => void
  fullConfig: TacticConfig
}

const teamLabel: Record<TeamId, string> = {
  home: 'Đội nhà (xanh)',
  away: 'Đội khách (đỏ)',
}

export function PositionRosterEditor({
  team,
  counts,
  disabled,
  onChange,
  fullConfig,
}: PositionRosterEditorProps) {
  const total = rosterTotal(counts)

  const updateRole = (role: (typeof PLAYER_ROLES)[number], value: number) => {
    onChange(fullConfig, team, { ...counts, [role]: value })
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300 sm:text-sm">
          {teamLabel[team]}
        </span>
        <span
          className={`text-xs ${total > MAX_TEAM_PLAYERS ? 'text-rose-400' : 'text-slate-500'}`}
        >
          {total}/{MAX_TEAM_PLAYERS}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {PLAYER_ROLES.map((role) => (
          <label key={role} className="flex flex-col text-[10px] text-slate-500 sm:text-xs">
            {role}
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_PER_ROLE}
              disabled={disabled}
              value={counts[role]}
              onChange={(e) => updateRole(role, Number(e.target.value))}
              className="mt-1 min-h-11 w-full rounded-lg border border-slate-700 bg-slate-900 px-1 py-2 text-center text-base text-white sm:min-h-9 sm:text-sm"
            />
          </label>
        ))}
      </div>
    </div>
  )
}
