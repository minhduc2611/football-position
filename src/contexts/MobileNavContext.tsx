import { createContext, useContext, type ReactNode } from 'react'

type MobileNavContextValue = {
  openNav: () => void
  closeNav: () => void
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null)

export function MobileNavProvider({
  children,
  openNav,
  closeNav,
}: MobileNavContextValue & { children: ReactNode }) {
  return (
    <MobileNavContext.Provider value={{ openNav, closeNav }}>
      {children}
    </MobileNavContext.Provider>
  )
}

export function useMobileNav() {
  const ctx = useContext(MobileNavContext)
  if (!ctx) {
    throw new Error('useMobileNav must be used within MobileNavProvider')
  }
  return ctx
}

export function useMobileNavOptional() {
  return useContext(MobileNavContext)
}
