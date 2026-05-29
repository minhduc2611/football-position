import { useCallback, useRef, useState, type PointerEvent } from 'react'
import type { Player, Position } from '../types'
import { Token } from './Token'

type FootballFieldProps = {
  players: Player[]
  ball: Position
  disabled?: boolean
  isPlaying?: boolean
  playStepIndex?: number
  onMove: (players: Player[], ball: Position) => void
  onDragEnd: (players: Player[], ball: Position) => void
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

export function FootballField({
  players,
  ball,
  disabled,
  isPlaying,
  playStepIndex = 0,
  onMove,
  onDragEnd,
}: FootballFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragRef = useRef<{
    id: string
    players: Player[]
    ball: Position
  } | null>(null)

  const toFieldCoords = useCallback((clientX: number, clientY: number) => {
    const rect = fieldRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0.5, y: 0.5 }
    return {
      x: clamp01((clientX - rect.left) / rect.width),
      y: clamp01((clientY - rect.top) / rect.height),
    }
  }, [])

  const handlePointerDown = useCallback(
    (id: string, e: PointerEvent<HTMLDivElement>) => {
      if (disabled) return
      const target = e.currentTarget
      target.setPointerCapture(e.pointerId)
      setDraggingId(id)
      dragRef.current = {
        id,
        players: players.map((p) => ({ ...p })),
        ball: { ...ball },
      }
    },
    [disabled, players, ball],
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current || !fieldRef.current) return
      const { x, y } = toFieldCoords(e.clientX, e.clientY)
      const { id } = dragRef.current

      if (id === 'ball') {
        dragRef.current.ball = { x, y }
      } else {
        dragRef.current.players = dragRef.current.players.map((p) =>
          p.id === id ? { ...p, x, y } : p,
        )
      }
      onMove(dragRef.current.players, dragRef.current.ball)
    },
    [onMove, toFieldCoords],
  )

  const handlePointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return
      const { players: finalPlayers, ball: finalBall } = dragRef.current
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      setDraggingId(null)
      dragRef.current = null
      onDragEnd(finalPlayers, finalBall)
    },
    [onDragEnd],
  )

  return (
    <div
      ref={fieldRef}
      className="field-grass relative h-full max-h-full w-full overflow-hidden rounded-lg border-[3px] border-white/90 shadow-2xl shadow-black/50 sm:border-4 md:rounded-xl"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-2 rounded-sm border-2 border-white/70 sm:inset-3" />
        <div className="absolute left-2 right-2 top-1/2 h-0 border-t-2 border-white/70 sm:left-3 sm:right-3" />
        <div className="absolute left-1/2 top-1/2 h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70" />
        <div className="absolute left-1/2 top-[8%] h-2 w-2 -translate-x-1/2 rounded-full bg-white/80 sm:h-3 sm:w-3" />
        <div className="absolute bottom-[8%] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white/80 sm:h-3 sm:w-3" />
        <div className="absolute left-[22%] right-[22%] top-2 h-[16%] border-2 border-b-0 border-white/70 sm:top-3" />
        <div className="absolute bottom-2 left-[22%] right-[22%] h-[16%] border-2 border-t-0 border-white/70 sm:bottom-3" />
        <div className="absolute left-1/2 top-2 h-[6%] w-[28%] -translate-x-1/2 border-2 border-t-0 border-white/70 sm:top-3" />
        <div className="absolute bottom-2 left-1/2 h-[6%] w-[28%] -translate-x-1/2 border-2 border-b-0 border-white/70 sm:bottom-3" />
      </div>

      {players.map((p) => (
        <Token
          key={p.id}
          id={p.id}
          x={p.x}
          y={p.y}
          kind="player"
          team={p.team}
          label={p.label}
          disabled={disabled}
          isPlaying={isPlaying}
          isDragging={draggingId === p.id}
          isActiveStep={isPlaying && playStepIndex > 0}
          onPointerDown={handlePointerDown}
        />
      ))}

      <Token
        id="ball"
        x={ball.x}
        y={ball.y}
        kind="ball"
        disabled={disabled}
        isPlaying={isPlaying}
        isDragging={draggingId === 'ball'}
        onPointerDown={handlePointerDown}
      />
    </div>
  )
}
