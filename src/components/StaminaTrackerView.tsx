import { useState } from 'react'
import { StaminaConfigModal } from './StaminaConfigModal'
import { StaminaHistoryPage } from './stamina/StaminaHistoryPage'
import { StaminaMenu } from './stamina/StaminaMenu'
import { StaminaReportPage } from './stamina/StaminaReportPage'
import { StaminaTrackPage } from './stamina/StaminaTrackPage'

type StaminaSubPage = 'track' | 'history' | 'report'

export function StaminaTrackerView() {
  const [page, setPage] = useState<StaminaSubPage>('track')
  const [menuOpen, setMenuOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)

  const handleMenuSelect = (action: 'config' | 'history' | 'report') => {
    setMenuOpen(false)
    if (action === 'config') {
      setConfigOpen(true)
      return
    }
    setPage(action)
  }

  return (
    <>
      {page === 'track' && (
        <StaminaTrackPage onMenuOpen={() => setMenuOpen(true)} />
      )}
      {page === 'history' && (
        <StaminaHistoryPage onBack={() => setPage('track')} />
      )}
      {page === 'report' && (
        <StaminaReportPage onBack={() => setPage('track')} />
      )}

      <StaminaMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onConfig={() => handleMenuSelect('config')}
        onHistory={() => handleMenuSelect('history')}
        onReport={() => handleMenuSelect('report')}
      />

      <StaminaConfigModal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
      />
    </>
  )
}
