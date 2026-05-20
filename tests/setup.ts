import '@testing-library/jest-dom'
import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      info: { count: 0, pages: 1, next: null, prev: null },
      results: []
    })
  }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})
