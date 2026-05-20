import { describe, expect, test } from 'vitest'
import { makeCharacter } from './fixtures'
import '../src/rick-detail'

describe('Given RickDetail component', () => {
  test('Then muestra estado vacío cuando no hay personaje', () => {
    const element = document.createElement('rick-detail') as HTMLElement & { character: unknown }
    document.body.appendChild(element)

    element.character = null

    expect(element.querySelector('h2')?.textContent).toBe('No character selected')
    expect((element.querySelector('img') as HTMLImageElement).style.display).toBe('none')
  })

  test('Then renderiza datos completos del personaje', () => {
    const element = document.createElement('rick-detail') as HTMLElement & { character: unknown }
    const character = makeCharacter({ status: 'Dead' })
    document.body.appendChild(element)

    element.character = character

    expect(element.querySelector('h2')?.textContent).toBe(character.name)
    expect(element.querySelector('#species')?.textContent).toBe(character.species)
    expect(element.querySelector('#episodes')?.textContent).toBe(String(character.episode.length))
    expect(element.querySelector('span')?.textContent).toBe(character.status)
  })
})
