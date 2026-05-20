import './rick-list.js'
import './rick-modal.js'
import type { Character } from './types'
import type { RickModal } from './rick-modal.js'

const template = document.createElement('template')
template.innerHTML = `
  <rick-list></rick-list>
  <rick-modal class="opacity-0 pointer-events-none transition-opacity duration-300"></rick-modal>
`

export class RickContainer extends HTMLElement {
  private selectedCharacter: Character | null = null

  constructor() {
    super()
    this.appendChild(template.content.cloneNode(true))
  }

  connectedCallback() {
    this.addEventListener('personaje-seleccionado', this.onCharacterSelected)
    this.addEventListener('modal-cerrar', this.onModalClose)
  }

  disconnectedCallback() {
    this.removeEventListener('personaje-seleccionado', this.onCharacterSelected)
    this.removeEventListener('modal-cerrar', this.onModalClose)
  }

  private onCharacterSelected = (e: Event) => {
    const customEvent = e as CustomEvent
    this.selectedCharacter = customEvent.detail as Character

    const modal = this.querySelector('rick-modal') as RickModal
    modal.character = this.selectedCharacter
    modal.open = true
  }

  private onModalClose = () => {
    this.selectedCharacter = null
    const modal = this.querySelector('rick-modal') as RickModal
    modal.open = false
  }
}

customElements.define('rick-container', RickContainer)
