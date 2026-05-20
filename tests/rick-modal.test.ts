import { describe, expect, test, vi } from 'vitest'
import { makeCharacter } from './fixtures'
import '../src/rick-detail'
import '../src/rick-modal'

describe('Given RickModal component', () => {
  test('Then abre y cierra actualizando clases visuales', () => {
    // Tipo de test: unitario de estado visual.
    // Objetivo didáctico: el modal no se "abre" por magia,
    // se abre/cierra porque cambia clases CSS.
    //
    // Validamos dos transiciones:
    // - open=true  => host visible + panel escala de entrada.
    // - open=false => host oculto + panel escala de salida.
    //
    // Esta validación protege regresiones de UX:
    // si alguien cambia clases o nombres, el comportamiento visual se rompe.
    const element = document.createElement('rick-modal') as HTMLElement & { open: boolean }
    document.body.appendChild(element)

    element.open = true
    expect(element.classList.contains('opacity-0')).toBe(false)
    expect((element.querySelector('#panel') as HTMLElement).classList.contains('scale-100')).toBe(true)

    element.open = false
    expect(element.classList.contains('opacity-0')).toBe(true)
    expect((element.querySelector('#panel') as HTMLElement).classList.contains('scale-95')).toBe(true)
  })

  test('Then propaga character a rick-detail', () => {
    const element = document.createElement('rick-modal') as HTMLElement & { character: unknown }
    const character = makeCharacter()
    document.body.appendChild(element)

    element.character = character

    expect(element.querySelector('rick-detail h2')?.textContent).toBe(character.name)
  })

  test('Then emite modal-cerrar al pulsar cerrar', () => {
    const element = document.createElement('rick-modal')
    const handler = vi.fn()
    document.body.appendChild(element)
    element.addEventListener('modal-cerrar', handler)

    ;(element.querySelector('#close-btn') as HTMLButtonElement).click()

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
