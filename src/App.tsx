import { useState } from 'react'
import { EditorView } from './components/EditorView'
import { LeftNavBar, type AppPage } from './components/LeftNavBar'
import { StaminaTrackerView } from './components/StaminaTrackerView'
import { TacticsListView } from './components/TacticsListView'
import { useTacticsStore } from './store/tacticsStore'

function App() {
  const [page, setPage] = useState<AppPage>('tactics')
  const view = useTacticsStore((s) => s.view)

  const handleNavigate = (nextPage: AppPage) => {
    if (nextPage !== 'tactics' && view === 'editor') {
      useTacticsStore.getState().goToTacticsList()
    }
    setPage(nextPage)
  }

  return (
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
    </div>
  )
}

export default App
