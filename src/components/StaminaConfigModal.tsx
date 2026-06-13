import { useEffect, useState } from 'react'
import type { StaminaStateDef } from '../types/stamina'
import { getCycleStates, useStaminaStore } from '../store/staminaStore'

type StaminaConfigModalProps = {
  open: boolean
  onClose: () => void
}

export function StaminaConfigModal({ open, onClose }: StaminaConfigModalProps) {
  const rawStates = useStaminaStore((s) => s.states)
  const states = getCycleStates(rawStates)
  const addState = useStaminaStore((s) => s.addState)
  const updateState = useStaminaStore((s) => s.updateState)
  const removeState = useStaminaStore((s) => s.removeState)
  const moveState = useStaminaStore((s) => s.moveState)
  const resetStatesToDefault = useStaminaStore((s) => s.resetStatesToDefault)
  const countdownEnabled = useStaminaStore((s) => s.countdownEnabled)
  const setCountdownEnabled = useStaminaStore((s) => s.setCountdownEnabled)

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const btn =
    'touch-target rounded-xl text-sm font-medium transition active:scale-[0.98] disabled:opacity-40'

  const startEdit = (state: StaminaStateDef) => {
    setEditingId(state.id)
    setEditName(state.name)
  }

  const commitEdit = (id: string) => {
    updateState(id, { name: editName })
    setEditingId(null)
  }

  const customCount = states.length

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Đóng"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stamina-config-title"
        className="relative z-10 flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-2xl border border-slate-800 bg-slate-900 shadow-2xl sm:rounded-2xl"
      >
        <div className="shrink-0 border-b border-slate-800 px-4 py-3">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-600 sm:hidden" />
          <div className="flex items-center justify-between gap-2">
            <h2 id="stamina-config-title" className="text-base font-semibold text-white">
              Cấu hình giai đoạn
            </h2>
            <button
              type="button"
              onClick={onClose}
              className={`${btn} min-h-0 px-2 py-1 text-slate-400 hover:text-white`}
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Thứ tự từ trên xuống là luồng chuyển trạng thái khi chạm nút tròn.
          </p>
        </div>

        <div className="shrink-0 border-b border-slate-800 px-4 py-3">
          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">
                Đếm 3-2-1 trước khi bắt đầu
              </p>
              <p className="text-xs text-slate-500">
                Hiển thị đếm ngược trước khi chạy phiên mới
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={countdownEnabled}
              onClick={() => setCountdownEnabled(!countdownEnabled)}
              className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                countdownEnabled ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition ${
                  countdownEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
        </div>

        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-4 [-webkit-overflow-scrolling:touch]">
          {states.map((state, i) => (
            <li
              key={state.id}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-800/50 p-2"
            >
              <span
                className="h-8 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: state.color }}
                aria-hidden
              />

              <div className="min-w-0 flex-1">
                {editingId === state.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => commitEdit(state.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(state.id)
                    }}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-2 py-2 text-sm text-white"
                    autoFocus
                  />
                ) : (
                  <p className="truncate text-sm font-medium text-white">{state.name}</p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => moveState(state.id, 'up')}
                  className={`${btn} min-h-0 px-2 py-1 text-xs text-slate-400`}
                  aria-label="Lên"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={i >= states.length - 1}
                  onClick={() => moveState(state.id, 'down')}
                  className={`${btn} min-h-0 px-2 py-1 text-xs text-slate-400`}
                  aria-label="Xuống"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(state)}
                  className={`${btn} min-h-0 px-2 py-1 text-xs text-slate-300`}
                >
                  Sửa
                </button>
                <button
                  type="button"
                  disabled={customCount <= 1}
                  onClick={() => removeState(state.id)}
                  className={`${btn} min-h-0 px-2 py-1 text-xs text-rose-400`}
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="safe-pb shrink-0 space-y-3 border-t border-slate-800 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="VD: Chạy loạn (chaos running)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newName.trim()) {
                  addState(newName.trim())
                  setNewName('')
                }
              }}
              className="min-h-11 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-base text-white placeholder:text-slate-500 sm:text-sm"
            />
            <button
              type="button"
              disabled={!newName.trim()}
              onClick={() => {
                addState(newName.trim())
                setNewName('')
              }}
              className={`${btn} shrink-0 bg-emerald-600 px-4 py-2 text-white`}
            >
              + Thêm
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Khôi phục giai đoạn mặc định?')) resetStatesToDefault()
            }}
            className={`${btn} w-full border border-slate-700 py-2.5 text-slate-400`}
          >
            Khôi phục mặc định
          </button>
        </div>
      </div>
    </div>
  )
}
