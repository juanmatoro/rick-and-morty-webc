import { beforeEach, describe, expect, test, vi } from 'vitest'
import { makeCharacter } from './fixtures'
import type { ApiResponse, Character, Episode, Location } from '../src/types'
import '../src/rick-card'
import '../src/rick-detail'
import '../src/rick-list'
import '../src/rick-location-list'
import '../src/rick-episode-list'
import '../src/rick-modal'
import '../src/rick-container'

const flush = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

const response = <T>(results: T[]): ApiResponse<T> => ({
  info: { count: results.length, pages: 1, next: null, prev: null },
  results
})

describe('Given cross navigation between lists', () => {
  beforeEach(() => {
    const characters: Character[] = [
      makeCharacter({
        id: 1,
        name: 'Rick Sanchez',
        url: 'https://rickandmortyapi.com/api/character/1',
        location: { name: 'Citadel', url: 'https://rickandmortyapi.com/api/location/1' },
        origin: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/2' },
        episode: ['https://rickandmortyapi.com/api/episode/10']
      })
    ]
    const locations: Location[] = [
      {
        id: 1,
        name: 'Citadel',
        type: 'Space station',
        dimension: 'Unknown',
        residents: ['https://rickandmortyapi.com/api/character/1'],
        url: 'https://rickandmortyapi.com/api/location/1',
        created: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Gazorpazorp',
        type: 'Planet',
        dimension: 'Unknown',
        residents: [],
        url: 'https://rickandmortyapi.com/api/location/99',
        created: new Date().toISOString()
      }
    ]
    const episodes: Episode[] = [
      {
        id: 10,
        name: 'Close Rick-counters of the Rick Kind',
        air_date: 'April 7, 2014',
        episode: 'S01E10',
        characters: ['https://rickandmortyapi.com/api/character/1'],
        url: 'https://rickandmortyapi.com/api/episode/10',
        created: new Date().toISOString()
      },
      {
        id: 11,
        name: 'Ricksy Business',
        air_date: 'April 14, 2014',
        episode: 'S01E11',
        characters: [],
        url: 'https://rickandmortyapi.com/api/episode/11',
        created: new Date().toISOString()
      }
    ]

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => response(characters) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => response(locations) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => response(episodes) } as Response))
  })

  test('Then selecting a character opens modal and does not apply cross filters', async () => {
    const element = document.createElement('rick-container')
    document.body.appendChild(element)
    await flush()
    await flush()

    ;(element.querySelector('rick-card') as HTMLElement).click()
    await flush()

    const modal = element.querySelector('rick-modal') as HTMLElement
    const locationText = (element.querySelector('#locations-grid') as HTMLElement).textContent ?? ''
    const episodeText = (element.querySelector('#episodes-grid') as HTMLElement).textContent ?? ''
    expect(modal.classList.contains('opacity-0')).toBe(false)
    expect(locationText).toContain('Citadel')
    expect(locationText).toContain('Gazorpazorp')
    expect(episodeText).toContain('Close Rick-counters')
    expect(episodeText).toContain('Ricksy Business')
  })
})
