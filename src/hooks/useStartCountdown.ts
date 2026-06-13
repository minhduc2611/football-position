import { useCallback, useEffect, useState } from 'react'

export type CountdownStep = 3 | 2 | 1 | 'go'

const GO_DURATION_MS = 700
const STEP_DURATION_MS = 1000

export function useStartCountdown(onComplete: () => void) {
  const [step, setStep] = useState<CountdownStep | null>(null)

  const start = useCallback(() => {
    setStep(3)
  }, [])

  const cancel = useCallback(() => {
    setStep(null)
  }, [])

  useEffect(() => {
    if (step === null) return

    if (step === 'go') {
      const id = window.setTimeout(() => {
        setStep(null)
        onComplete()
      }, GO_DURATION_MS)
      return () => window.clearTimeout(id)
    }

    const id = window.setTimeout(() => {
      if (step === 3) setStep(2)
      else if (step === 2) setStep(1)
      else if (step === 1) setStep('go')
    }, STEP_DURATION_MS)

    return () => window.clearTimeout(id)
  }, [step, onComplete])

  return { countdownStep: step, startCountdown: start, cancelCountdown: cancel }
}

export function countdownLabel(step: CountdownStep): string {
  return step === 'go' ? 'GO!' : String(step)
}
