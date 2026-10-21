import { describe, expect, it } from 'vitest'
import { readSupabaseConfiguration, SupabaseConfigurationError } from './config'

const valid = {
  VITE_SUPABASE_URL: 'https://project.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test-only-public-key',
}

describe('Supabase public configuration', () => {
  it('normalizes surrounding whitespace and a trailing slash', () => {
    expect(
      readSupabaseConfiguration({
        VITE_SUPABASE_URL: ` ${valid.VITE_SUPABASE_URL}/ `,
        VITE_SUPABASE_PUBLISHABLE_KEY: ` ${valid.VITE_SUPABASE_PUBLISHABLE_KEY} `,
      }),
    ).toEqual({ url: valid.VITE_SUPABASE_URL, publishableKey: valid.VITE_SUPABASE_PUBLISHABLE_KEY })
  })

  it.each([
    'http://localhost:54321',
    'http://127.0.0.1:54321',
    'http://[::1]:54321',
    'https://api.example.com',
  ])('accepts a supported endpoint: %s', (url) => {
    expect(readSupabaseConfiguration({ ...valid, VITE_SUPABASE_URL: url }).url).toBe(url)
  })

  it.each([
    'http://project.supabase.co',
    'https://name:private-password@project.supabase.co',
    'https://project.supabase.co/rest/v1',
    'https://project.supabase.co?key=private',
    'https://project.supabase.co#private',
    'not-a-url',
    'file:///tmp/project',
  ])('rejects an unsafe or malformed endpoint without reflecting it: %s', (url) => {
    expect(() => readSupabaseConfiguration({ ...valid, VITE_SUPABASE_URL: url })).toThrow(
      SupabaseConfigurationError,
    )
    try {
      readSupabaseConfiguration({ ...valid, VITE_SUPABASE_URL: url })
    } catch (error) {
      expect(String(error)).not.toContain(url)
      expect(String(error)).not.toContain('private-password')
    }
  })

  it.each([undefined, null, 42, '', '  '])(
    'reports both missing settings for invalid values',
    (value) => {
      try {
        readSupabaseConfiguration({
          VITE_SUPABASE_URL: value,
          VITE_SUPABASE_PUBLISHABLE_KEY: value,
        })
        expect.fail('Missing settings must fail validation')
      } catch (error) {
        expect(error).toBeInstanceOf(SupabaseConfigurationError)
        if (!(error instanceof SupabaseConfigurationError)) throw error
        expect(error.issues).toHaveLength(2)
        expect(error.message).toContain('VITE_SUPABASE_URL')
        expect(error.message).toContain('VITE_SUPABASE_PUBLISHABLE_KEY')
      }
    },
  )

  it.each([
    'sb_secret_private-test-value',
    'eyJhbGciOi.test-service-role.signature',
    'sb_publishable_value with spaces',
  ])('rejects a non-publishable key without exposing its value', (key) => {
    expect(() =>
      readSupabaseConfiguration({ ...valid, VITE_SUPABASE_PUBLISHABLE_KEY: key }),
    ).toThrow(SupabaseConfigurationError)
    try {
      readSupabaseConfiguration({ ...valid, VITE_SUPABASE_PUBLISHABLE_KEY: key })
    } catch (error) {
      expect(String(error)).not.toContain(key)
    }
  })

  it('rejects a prefix without a key', () => {
    expect(() =>
      readSupabaseConfiguration({ ...valid, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_' }),
    ).toThrow(SupabaseConfigurationError)
  })
})
