import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useConfirmationCooldown } from './use-confirmation-cooldown'

afterEach(() => {
  vi.useRealTimers()
})
describe('confirmation cooldown', () => {
  it('limits repeated attempts, survives remount and releases the button after a minute', () => {
    vi.useFakeTimers()
    const first = renderHook(useConfirmationCooldown)
    act(() => first.result.current.start())
    expect(first.result.current.remaining).toBe(60)
    first.unmount()
    const next = renderHook(useConfirmationCooldown)
    expect(next.result.current.remaining).toBe(60)
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(next.result.current.remaining).toBe(0)
  })
  it('treats corrupt or far-future storage as untrusted', () => {
    sessionStorage.setItem('devflow.auth.confirmation-cooldown', String(Date.now() + 86_400_000))
    const { result } = renderHook(useConfirmationCooldown)
    expect(result.current.remaining).toBe(0)
  })
})
