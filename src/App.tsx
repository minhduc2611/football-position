import { useEffect, useState } from 'react'
import { EditorView } from './components/EditorView'
import { LeftNavBar } from './components/LeftNavBar'
import { StaminaTrackerView } from './components/StaminaTrackerView'
import { TacticsListView } from './components/TacticsListView'
import { MobileNavProvider } from './contexts/MobileNavContext'
import { useAppStore } from './store/appStore'
import { useTacticsStore } from './store/tacticsStore'

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const page = useAppStore((s) => s.activePage)
  const setActivePage = useAppStore((s) => s.setActivePage)
  const view = useTacticsStore((s) => s.view)

  const handleNavigate = (nextPage: typeof page) => {
    if (nextPage !== 'tactics' && view === 'editor') {
      useTacticsStore.getState().goToTacticsList()
    }
    setActivePage(nextPage)
    setMobileNavOpen(false)
  }

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileNavOpen])

  return (
    <MobileNavProvider
      openNav={() => setMobileNavOpen(true)}
      closeNav={() => setMobileNavOpen(false)}
    >
      <div className="flex h-dvh max-h-dvh w-full overflow-hidden">
        <LeftNavBar activePage={page} onNavigate={handleNavigate} />

        <div className="min-w-0 flex-1 overflow-hidden">
          {page === 'stamina-tracker' ? (
            <StaminaTrackerView />
          ) : view === 'tactics' ? (
            <TacticsListView />
          ) : (
            <EditorView />
          )}
        </div>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 flex sm:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
              aria-label="Đóng menu"
              onClick={() => setMobileNavOpen(false)}
            />
            <LeftNavBar
              mode="drawer"
              activePage={page}
              onNavigate={handleNavigate}
              className="relative z-10 shadow-2xl"
            />
          </div>
        )}
      </div>
    </MobileNavProvider>
  )
}

export default App
