import { beforeEach, describe, expect, test, vi } from 'vitest'
import { makeCharacter } from './fixtures'
import type { ApiResponse, Character } from '../src/types'
import '../src/rick-card'
import '../src/rick-list'

const flush = async () => {
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
    const page1 = [makeCharacter({ id: 1, name: 'Rick' }), makeCharacter({ id: 2, name: 'Morty' })]
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => makeResponse(page1, 1, 3)
    } as Response)

    const element = document.createElement('rick-list')
    document.body.appendChild(element)
    await flush()

    expect(fetch).toHaveBeenCalledWith('https://rickandmortyapi.com/api/character?page=1')
    expect(element.querySelectorAll('rick-card')).toHaveLength(2)
    expect(element.querySelector('#page-info')?.textContent).toBe('Página 1 de 3')
  })

  test('Then avanza a la siguiente página al pulsar Siguiente', async () => {
    const page1 = [makeCharacter({ id: 1, name: 'Rick' })]
    const page2 = [makeCharacter({ id: 3, name: 'Summer' })]

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

    ;(element.querySelector('#next-page') as HTMLButtonElement).click()
    await flush()

    expect(fetch).toHaveBeenLastCalledWith('https://rickandmortyapi.com/api/character?page=2')
    expect(element.querySelector('#page-info')?.textContent).toBe('Página 2 de 2')
    expect(element.querySelectorAll('rick-card')).toHaveLength(1)
  })

  test('Then filtra por búsqueda y muestra estado vacío cuando no hay coincidencias', async () => {
    const page1 = [makeCharacter({ id: 1, name: 'Rick' }), makeCharacter({ id: 2, name: 'Morty' })]
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => makeResponse(page1, 1, 1)
    } as Response)

    const element = document.createElement('rick-list')
    document.body.appendChild(element)
    await flush()

    const search = element.querySelector('#search') as HTMLInputElement
    search.value = 'morty'
    search.dispatchEvent(new Event('input'))

    expect(element.querySelectorAll('rick-card')).toHaveLength(1)

    search.value = 'no-existe'
    search.dispatchEvent(new Event('input'))

    expect(element.querySelector('#empty')?.classList.contains('hidden')).toBe(false)
    expect(element.querySelector('#grid')?.classList.contains('hidden')).toBe(true)
  })
})
