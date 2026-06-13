import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppPage } from '../types/app'
import { APP_PAGE_STORAGE_KEY } from '../types/app'

type AppState = {
  activePage: AppPage
  setActivePage: (page: AppPage) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activePage: 'tactics',
      setActivePage: (page) => set({ activePage: page }),
    }),
    { name: APP_PAGE_STORAGE_KEY },
  ),
)
