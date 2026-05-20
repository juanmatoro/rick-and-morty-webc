import { describe, expect, test, vi } from 'vitest'
import { makeCharacter } from './fixtures'
import '../src/rick-detail'

const flush = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

describe('Given RickDetail component', () => {
  test('Then muestra estado vacío cuando no hay personaje', () => {
    const element = document.createElement('rick-detail') as HTMLElement & { character: unknown }
    document.body.appendChild(element)

    element.character = null

    expect(element.querySelector('h2')?.textContent).toBe('No character selected')
    expect((element.querySelector('img') as HTMLImageElement).style.display).toBe('none')
  })

  test('Then renderiza datos completos del personaje y episodios concretos', async () => {
    const element = document.createElement('rick-detail') as HTMLElement & { character: unknown }
    const character = makeCharacter({ status: 'Dead', episode: ['https://example.com/episode/1'] })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'Pilot', episode: 'S01E01' })
    } as Response))
    document.body.appendChild(element)

    element.character = character
    await flush()

    expect(element.querySelector('h2')?.textContent).toBe(character.name)
    expect(element.querySelector('#species')?.textContent).toBe(character.species)
    expect((element.querySelector('#episodes-list') as HTMLElement).textContent).toContain('Pilot')
    expect(element.querySelector('span')?.textContent).toBe(character.status)
  })

  test('Then emite navegación a location y episode desde enlaces del modal', async () => {
    const element = document.createElement('rick-detail') as HTMLElement & { character: unknown }
    const character = makeCharacter({ episode: ['https://example.com/episode/1'] })
    const locationHandler = vi.fn()
    const episodeHandler = vi.fn()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'Pilot', episode: 'S01E01' })
    } as Response))
    element.addEventListener('location-seleccionada-desde-modal', locationHandler)
    element.addEventListener('episode-seleccionado-desde-modal', episodeHandler)
    document.body.appendChild(element)

    element.character = character
    await flush()
    ;(element.querySelector('#origin-link') as HTMLButtonElement).click()
    ;(element.querySelector('#episodes-list button') as HTMLButtonElement).click()

    expect(locationHandler).toHaveBeenCalledTimes(1)
    expect(episodeHandler).toHaveBeenCalledTimes(1)
  })
})
