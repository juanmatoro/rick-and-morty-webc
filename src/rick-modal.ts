import './rick-detail.js'
import type { Character } from './types'
import type { RickDetail } from './rick-detail.js'

const template = document.createElement('template')
template.innerHTML = `
  <div id="overlay" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300">
    <div id="panel" class="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto transition-transform duration-300 scale-95">
      <div class="flex justify-end p-4">
        <button id="close-btn" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
      </div>
      <rick-detail></rick-detail>
    </div>
  </div>
`

export class RickModal extends HTMLElement {

  constructor() {
    super()
    this.appendChild(template.content.cloneNode(true))
  }

  set character(data: Character | null) {
    const detail = this.querySelector('rick-detail') as RickDetail
    if (detail) {
      detail.character = data
    }
  }

  set open(value: boolean) {
    this.classList.toggle('opacity-0', !value)
    this.classList.toggle('pointer-events-none', !value)

    const overlay = this.querySelector('#overlay') as HTMLElement
    const panel = this.querySelector('#panel') as HTMLElement
    if (value) {
      overlay.classList.remove('opacity-0', 'pointer-events-none')
      overlay.classList.add('opacity-100')
      panel.classList.remove('scale-95')
      panel.classList.add('scale-100')
    } else {
      overlay.classList.add('opacity-0', 'pointer-events-none')
      overlay.classList.remove('opacity-100')
      panel.classList.remove('scale-100')
      panel.classList.add('scale-95')
    }
  }

  connectedCallback() {
    this.querySelector('#close-btn')!.addEventListener('click', this.close)
    this.querySelector('#overlay')!.addEventListener('click', this.onOverlayClick)
    this.querySelector('#panel')!.addEventListener('click', this.stopProp)
  }

  disconnectedCallback() {
    this.querySelector('#close-btn')!.removeEventListener('click', this.close)
    this.querySelector('#overlay')!.removeEventListener('click', this.onOverlayClick)
    this.querySelector('#panel')!.removeEventListener('click', this.stopProp)
  }

  private close = () => {
    this.dispatchEvent(new CustomEvent('modal-cerrar', { bubbles: true, composed: true }))
  }

  private onOverlayClick = (e: Event) => {
    if (e.target === this.querySelector('#overlay')) {
      this.close()
    }
  }

  private stopProp = (e: Event) => {
    e.stopPropagation()
  }
}

customElements.define('rick-modal', RickModal)
