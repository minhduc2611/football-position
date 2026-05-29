import { EditorView } from './components/EditorView'
import { TacticsListView } from './components/TacticsListView'
import { useTacticsStore } from './store/tacticsStore'

function App() {
  const view = useTacticsStore((s) => s.view)

  if (view === 'tactics') {
    return <TacticsListView />
  }

  return <EditorView />
}

export default App
