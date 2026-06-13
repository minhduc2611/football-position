import { useState } from 'react'
import { NavMenuButton } from './NavMenuButton'
import { useTacticsStore } from '../store/tacticsStore'
import { rosterTotal } from '../utils/roster'

export function TacticsListView() {
  const tactics = useTacticsStore((s) => s.tactics)
  const activeTacticId = useTacticsStore((s) => s.activeTacticId)
  const openTactic = useTacticsStore((s) => s.openTactic)
  const createTactic = useTacticsStore((s) => s.createTactic)
  const renameTactic = useTacticsStore((s) => s.renameTactic)
  const deleteTactic = useTacticsStore((s) => s.deleteTactic)
  const duplicateTactic = useTacticsStore((s) => s.duplicateTactic)

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const btn =
    'touch-target rounded-xl text-sm font-medium transition active:scale-[0.98] disabled:opacity-40'

  return (
    <div className="safe-pt safe-pb safe-px mx-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8">
      <header className="mb-6 md:mb-8">
        <div className="flex items-start gap-2">
          <NavMenuButton className="mt-0.5" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-white sm:text-2xl">Chiến thuật</h1>
            <p className="mt-1 text-sm text-slate-400">
              Mỗi chiến thuật có các bước. Chọn để chỉnh sân và animation.
            </p>
          </div>
        </div>
      </header>

      <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row">
        <input
          type="text"
          placeholder="Tên chiến thuật mới…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newName.trim()) {
              createTactic(newName.trim())
              setNewName('')
            }
          }}
          className="min-h-11 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-base text-white placeholder:text-slate-500 sm:text-sm"
        />
        <button
          type="button"
          onClick={() => {
            createTactic(newName.trim() || 'Chiến thuật mới')
            setNewName('')
          }}
          className={`${btn} bg-emerald-600 px-6 py-3 font-semibold text-white sm:shrink-0`}
        >
          + Tạo
        </button>
      </div>

      <ul className="space-y-3 pb-4">
        {tactics.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
            Chưa có chiến thuật. Tạo chiến thuật đầu tiên ở trên.
          </li>
        )}
        {tactics.map((t) => (
          <li
            key={t.id}
            className={`rounded-xl border bg-slate-900/80 ${
              t.id === activeTacticId
                ? 'border-emerald-500/50'
                : 'border-slate-800'
            }`}
          >
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                {editingId === t.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => {
                      renameTactic(t.id, editName)
                      setEditingId(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        renameTactic(t.id, editName)
                        setEditingId(null)
                      }
                    }}
                    className="w-full min-h-11 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-base text-white sm:text-sm"
                    autoFocus
                  />
                ) : (
                  <h2 className="truncate text-base font-semibold text-white sm:text-lg">
                    {t.name}
                  </h2>
                )}
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {rosterTotal(t.config.home)} nhà · {rosterTotal(t.config.away)} khách ·{' '}
                  {t.steps.length} bước
                </p>
                <p className="mt-0.5 text-[10px] text-slate-600 sm:text-xs">
                  {new Date(t.updatedAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-col sm:gap-1">
                <button
                  type="button"
                  onClick={() => openTactic(t.id)}
                  className={`${btn} col-span-2 bg-emerald-600 py-3 text-white sm:col-span-1 sm:py-2`}
                >
                  Mở
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(t.id)
                    setEditName(t.name)
                  }}
                  className={`${btn} border border-slate-700 py-3 text-slate-300 sm:py-2`}
                >
                  Sửa tên
                </button>
                <button
                  type="button"
                  onClick={() => duplicateTactic(t.id)}
                  className={`${btn} border border-slate-700 py-3 text-slate-300 sm:py-2`}
                >
                  Nhân bản
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Xóa "${t.name}"?`)) deleteTactic(t.id)
                  }}
                  className={`${btn} border border-rose-900/50 py-3 text-rose-400 sm:py-2`}
                >
                  Xóa
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
