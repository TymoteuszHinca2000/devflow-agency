import { describe, expect, it } from 'vitest'
import { getSafeReturnTo } from './return-to'

describe('post-login destination', () => {
  it.each(['/app', '/app/projects?view=list#task-1', '/app/tasks/123'])(
    'preserves an application location: %s',
    (value) => {
      expect(getSafeReturnTo(value)).toBe(value)
    },
  )
  it.each([
    null,
    '',
    'https://attacker.example/app',
    '//attacker.example/app',
    '/app/../../outside',
    '/application',
    '/login',
    'javascript:alert(1)',
    '/app\\attacker.example',
    '/app\n/unsafe',
  ])('rejects an external or unsafe destination: %s', (value) => {
    expect(getSafeReturnTo(value)).toBe('/app')
  })
})
