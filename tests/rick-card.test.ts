import { describe, expect, test, vi } from 'vitest'
import { makeCharacter } from './fixtures'
import '../src/rick-card'

describe('Given RickCard component', () => {
  test('Then renderiza datos básicos del personaje', () => {
    // Tipo de test: unitario de render.
    // Objetivo didáctico: comprobar que, cuando el componente recibe un personaje
    // por setter (`character`), su DOM refleja ese estado de manera visible.
    //
    // Qué validamos exactamente:
    // 1) Nombre en <h3>.
    // 2) Especie en <p>.
    // 3) URL de imagen en <img src>.
    //
    // Este test no comprueba eventos ni integración con otros componentes:
    // solo contrato visual de este componente aislado.
    const element = document.createElement('rick-card') as HTMLElement & { character: unknown }
    const character = makeCharacter()
    document.body.appendChild(element)

    element.character = character

    expect(element.querySelector('h3')?.textContent).toBe(character.name)
    expect(element.querySelector('p')?.textContent).toBe(character.species)
    expect(element.querySelector('img')?.getAttribute('src')).toBe(character.image)
  })

  test('Then emite personaje-seleccionado al hacer click', () => {
    // Tipo de test: unitario de evento (hijo → padre).
    // Objetivo didáctico: validar el contrato de comunicación por CustomEvent.
    //
    // Pasos:
    // - Registramos un listener espía en el propio componente.
    // - Simulamos interacción de usuario (click).
    // - Verificamos número de emisiones y payload (`detail`).
    //
    // Si este test falla, el problema suele estar en:
    // - Falta de listener en connectedCallback.
    // - No asignar characterData antes del click.
    // - Error en el nombre del evento o en bubbles/composed.
    const element = document.createElement('rick-card') as HTMLElement & { character: unknown }
    const character = makeCharacter()
    const handler = vi.fn()
    document.body.appendChild(element)
    element.addEventListener('personaje-seleccionado', handler)
    element.character = character

    element.click()

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler.mock.calls[0][0].detail).toEqual(character)
  })
})
