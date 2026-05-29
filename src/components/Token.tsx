import type { PointerEvent } from 'react'
import type { TeamId } from '../types'

type TokenProps = {
  id: string
  x: number
  y: number
  kind: 'player' | 'ball'
  team?: TeamId
  label?: string
  disabled?: boolean
  isPlaying?: boolean
  isDragging?: boolean
  isActiveStep?: boolean
  onPointerDown: (id: string, e: PointerEvent<HTMLDivElement>) => void
}

const teamStyles: Record<TeamId, string> = {
  home: 'bg-emerald-500 text-emerald-950 ring-emerald-300/80',
  away: 'bg-rose-500 text-rose-950 ring-rose-300/80',
}

export function Token({
  id,
  x,
  y,
  kind,
  team = 'home',
  label,
  disabled,
  isPlaying,
  isDragging,
  isActiveStep,
  onPointerDown,
}: TokenProps) {
  const left = `${x * 100}%`
  const top = `${y * 100}%`
  const labelLen = label?.length ?? 0

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={kind === 'ball' ? 'Bóng' : `Cầu thủ ${label ?? id}`}
      className={[
        'token touch-none absolute -translate-x-1/2 -translate-y-1/2 select-none',
        disabled ? 'cursor-default opacity-90' : 'cursor-grab active:cursor-grabbing',
        isDragging ? 'token--dragging z-30' : 'z-10',
        isPlaying ? 'token--playing' : '',
        isActiveStep && kind === 'player' ? 'token--active-step' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ left, top }}
      onPointerDown={(e) => {
        if (disabled) return
        onPointerDown(id, e)
      }}
    >
      {/* Larger invisible touch target for mobile */}
      <div
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center p-3 sm:p-2"
        style={{ minWidth: 44, minHeight: 44 }}
      >
        {kind === 'ball' ? (
          <span className="pointer-events-none block text-xl leading-none drop-shadow-md sm:text-2xl">
            ⚽️
          </span>
        ) : (
          <div
            className={`player-dot pointer-events-none flex h-9 w-9 items-center justify-center rounded-full font-bold shadow-lg ring-2 sm:h-8 sm:w-8 ${teamStyles[team]} ${
              labelLen > 2 ? 'text-[9px]' : 'text-[10px] sm:text-xs'
            }`}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  )
}
