import { useEffect, useState } from 'react'
import { readConfirmationDeadline, saveConfirmationDeadline } from '../lib/confirmation-cooldown'

export function useConfirmationCooldown() {
  const [deadline, setDeadline] = useState(readConfirmationDeadline)
  const [now, setNow] = useState(Date.now)
  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000))
  const running = remaining > 0
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [running])
  function start() {
    setNow(Date.now())
    setDeadline(saveConfirmationDeadline())
  }
  return { remaining, start }
}
