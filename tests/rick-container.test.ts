import { describe, expect, test } from 'vitest'
import { makeCharacter } from './fixtures'
import '../src/rick-card'
import '../src/rick-detail'
import '../src/rick-list'
import '../src/rick-location-list'
import '../src/rick-episode-list'
import '../src/rick-modal'
import '../src/rick-container'

describe('Given RickContainer component', () => {
  test('Then abre el modal al recibir personaje-seleccionado', () => {
    // Tipo de test: unitario de orquestación (integración local entre componentes).
    // Objetivo didáctico: validar que el padre (`rick-container`) reacciona
    // al evento del hijo y propaga estado al modal/detalle.
    //
    // Patrón comprobado:
    // evento hijo -> listener en padre -> setter del modal -> UI visible.
    //
    // Este test cubre la parte más importante del flujo de datos de la app.
    const element = document.createElement('rick-container')
    const character = makeCharacter()
    document.body.appendChild(element)

    element.dispatchEvent(new CustomEvent('personaje-seleccionado', { detail: character, bubbles: true }))

    const modal = element.querySelector('rick-modal') as HTMLElement
    expect(modal.classList.contains('opacity-0')).toBe(false)
    expect(modal.querySelector('rick-detail h2')?.textContent).toBe(character.name)
  })

  test('Then cierra el modal al recibir modal-cerrar', () => {
    const element = document.createElement('rick-container')
    document.body.appendChild(element)
    element.dispatchEvent(new CustomEvent('modal-cerrar', { bubbles: true }))

    const modal = element.querySelector('rick-modal') as HTMLElement
    expect(modal.classList.contains('opacity-0')).toBe(true)
  })

  test('Then permite cambiar entre páginas separadas', () => {
    const element = document.createElement('rick-container')
    document.body.appendChild(element)

    ;(element.querySelector('[data-page-btn="locations"]') as HTMLButtonElement).click()
    expect((element.querySelector('[data-page="locations"]') as HTMLElement).classList.contains('hidden')).toBe(false)
    expect((element.querySelector('[data-page="characters"]') as HTMLElement).classList.contains('hidden')).toBe(true)

    ;(element.querySelector('[data-page-btn="episodes"]') as HTMLButtonElement).click()
    expect((element.querySelector('[data-page="episodes"]') as HTMLElement).classList.contains('hidden')).toBe(false)
  })
})
