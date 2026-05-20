import type { Character } from './types'

const template = document.createElement('template')
template.innerHTML = `
  <div class="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-xl border border-gray-100">
    <img class="w-full h-48 object-cover" alt="character image">
    <div class="p-4">
      <h3 class="text-lg font-bold text-gray-800 truncate"></h3>
      <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold mt-2"></span>
      <p class="text-sm text-gray-500 mt-1"></p>
    </div>
  </div>
`

export class RickCard extends HTMLElement {
  private characterData: Character | null = null

  constructor() {
    super()
    this.appendChild(template.content.cloneNode(true))
  }

  set character(data: Character) {
    this.characterData = data
    this.render()
  }

  get character(): Character | null {
    return this.characterData
  }

  connectedCallback() {
    this.addEventListener('click', this.handleClick)
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick)
  }

  private handleClick = () => {
    if (!this.characterData) return
    this.dispatchEvent(new CustomEvent('personaje-seleccionado', {
      detail: this.characterData,
      bubbles: true,
      composed: true
    }))
  }

  private render() {
    if (!this.characterData) return
    const data = this.characterData

    const img = this.querySelector('img')!
    img.src = data.image
    img.alt = data.name

    const nameEl = this.querySelector('h3')!
    nameEl.textContent = data.name

    const span = this.querySelector('span')!
    span.textContent = data.status
    if (data.status === 'Alive') {
      span.className = 'inline-block px-2 py-1 rounded-full text-xs font-semibold mt-2 bg-green-100 text-green-700'
    } else if (data.status === 'Dead') {
      span.className = 'inline-block px-2 py-1 rounded-full text-xs font-semibold mt-2 bg-red-100 text-red-700'
    } else {
      span.className = 'inline-block px-2 py-1 rounded-full text-xs font-semibold mt-2 bg-gray-100 text-gray-600'
    }

    const speciesEl = this.querySelector('p')!
    speciesEl.textContent = data.species
  }
}

customElements.define('rick-card', RickCard)
