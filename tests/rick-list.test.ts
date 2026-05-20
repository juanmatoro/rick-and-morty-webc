import { beforeEach, describe, expect, test, vi } from 'vitest'
import { makeCharacter } from './fixtures'
import type { ApiResponse, Character } from '../src/types'
import '../src/rick-card'
import '../src/rick-list'

const flush = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

const makeResponse = (results: Character[], page: number, pages: number): ApiResponse => ({
  info: {
    count: pages * 20,
    pages,
    next: page < pages ? `https://rickandmortyapi.com/api/character?page=${page + 1}` : null,
    prev: page > 1 ? `https://rickandmortyapi.com/api/character?page=${page - 1}` : null
  },
  results
})

const makeCharacters = (count: number, startId: number, prefix: string) =>
  Array.from({ length: count }, (_, index) =>
    makeCharacter({ id: startId + index, name: `${prefix} ${startId + index}` })
  )

describe('Given RickList component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  test('Then carga la primera página y renderiza tarjetas', async () => {
    // Tipo de test: unitario async con mock de API.
    // Objetivo didáctico: validar lógica de carga inicial sin tocar red real.
    //
    // Por qué mockear `fetch`:
    // - evita inestabilidad por internet/API externa,
    // - permite controlar exactamente la respuesta esperada,
    // - hace el test rápido y determinista.
    //
    // Qué comprobamos:
    // 1) URL de fetch con page=1.
    // 2) Número de tarjetas renderizadas según resultados mock.
    // 3) Texto de paginación "Página X de Y".
    const page1 = makeCharacters(20, 1, 'Rick')
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(page1, 1, 1)
    } as Response)

    const element = document.createElement('rick-list')
    document.body.appendChild(element)
    await flush()

    expect(fetch).toHaveBeenCalledWith('https://rickandmortyapi.com/api/character?page=1')
    expect(element.querySelectorAll('rick-card')).toHaveLength(20)
    expect(element.querySelector('#page-info')?.textContent).toBe('Página 1 de 1')
  })

  test('Then avanza y retrocede páginas sobre resultados filtrados', async () => {
    const page1 = makeCharacters(20, 1, 'Rick')
    const page2 = makeCharacters(20, 21, 'Rick')
    const page3 = makeCharacters(5, 41, 'Rick')

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeResponse(page1, 1, 3)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeResponse(page2, 2, 3)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeResponse(page3, 3, 3)
      } as Response)

    const element = document.createElement('rick-list')
    document.body.appendChild(element)
    await flush()
    await flush()

    ;(element.querySelector('#next-page') as HTMLButtonElement).click()
    await flush()
    ;(element.querySelector('#prev-page') as HTMLButtonElement).click()
    await flush()

    expect(fetch).toHaveBeenCalledWith('https://rickandmortyapi.com/api/character?page=2')
    expect(fetch).toHaveBeenCalledWith('https://rickandmortyapi.com/api/character?page=3')
    expect(element.querySelector('#page-info')?.textContent).toBe('Página 1 de 3')
    expect(element.querySelectorAll('rick-card')).toHaveLength(20)
  })

  test('Then busca globalmente por nombre y pagina resultados filtrados', async () => {
    const page1 = makeCharacters(20, 1, 'Rick')
    const page2 = [makeCharacter({ id: 21, name: 'Morty Prime' }), ...makeCharacters(19, 22, 'Rick')]
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeResponse(page1, 1, 2)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeResponse(page2, 2, 2)
      } as Response)

    const element = document.createElement('rick-list')
    document.body.appendChild(element)
    await flush()
    await flush()

    const search = element.querySelector('#search') as HTMLInputElement
    search.value = 'morty'
    search.dispatchEvent(new Event('input'))

    expect(element.querySelectorAll('rick-card')).toHaveLength(1)
    expect(element.querySelector('#page-info')?.textContent).toBe('Página 1 de 1')

    search.value = 'no-existe'
    search.dispatchEvent(new Event('input'))

    expect(element.querySelector('#empty')?.classList.contains('hidden')).toBe(false)
    expect(element.querySelector('#grid')?.classList.contains('hidden')).toBe(true)
  })

  test('Then aplica filtros combinados con combos (estado, especie, género)', async () => {
    const page1 = [
      makeCharacter({ id: 1, name: 'Rick 1', status: 'Alive', species: 'Human', gender: 'Male' }),
      makeCharacter({ id: 2, name: 'Morty 2', status: 'Alive', species: 'Human', gender: 'Male' }),
      makeCharacter({ id: 3, name: 'Bird 3', status: 'Dead', species: 'Bird-Person', gender: 'Male' }),
      makeCharacter({ id: 4, name: 'Summer 4', status: 'Alive', species: 'Human', gender: 'Female' })
    ]
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(page1, 1, 1)
    } as Response)

    const element = document.createElement('rick-list')
    document.body.appendChild(element)
    await flush()

    const status = element.querySelector('#filter-status') as HTMLSelectElement
    const species = element.querySelector('#filter-species') as HTMLSelectElement
    const gender = element.querySelector('#filter-gender') as HTMLSelectElement

    status.value = 'Alive'
    status.dispatchEvent(new Event('change'))
    species.value = 'Human'
    species.dispatchEvent(new Event('change'))
    gender.value = 'Female'
    gender.dispatchEvent(new Event('change'))

    const cards = element.querySelectorAll('rick-card')
    expect(cards).toHaveLength(1)
    expect(element.querySelector('#page-info')?.textContent).toBe('Página 1 de 1')
  })
})
