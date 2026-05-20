import type { Character } from './types'

const template = document.createElement('template')
template.innerHTML = `
  <div class="flex flex-col items-center p-6">
    <img class="w-40 h-40 rounded-full object-cover border-4 border-gray-200 shadow-md" alt="character image">
    <h2 class="text-2xl font-bold text-gray-800 mt-4"></h2>
    <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2"></span>
    <div class="w-full mt-6 space-y-3 text-gray-700">
      <p class="flex justify-between border-b pb-1"><span class="font-medium">Species:</span> <span id="species"></span></p>
      <p class="flex justify-between border-b pb-1"><span class="font-medium">Gender:</span> <span id="gender"></span></p>
      <p class="flex justify-between border-b pb-1"><span class="font-medium">Origin:</span> <span id="origin"></span></p>
      <p class="flex justify-between border-b pb-1"><span class="font-medium">Location:</span> <span id="location"></span></p>
      <p class="flex justify-between border-b pb-1"><span class="font-medium">Episodes:</span> <span id="episodes"></span></p>
    </div>
  </div>
`

export class RickDetail extends HTMLElement {
  private characterData: Character | null = null

  constructor() {
    super()
    this.appendChild(template.content.cloneNode(true))
  }

  set character(data: Character | null) {
    this.characterData = data
    this.render()
  }

  private render() {
    if (!this.characterData) {
      this.querySelector('h2')!.textContent = 'No character selected'
      this.querySelector('img')!.style.display = 'none'
      return
    }

    const data = this.characterData
    const img = this.querySelector('img')!
    img.style.display = 'block'
    img.src = data.image
    img.alt = data.name

    this.querySelector('h2')!.textContent = data.name

    const span = this.querySelector('span')!
    span.textContent = data.status
    if (data.status === 'Alive') {
      span.className = 'inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 bg-green-100 text-green-700'
    } else if (data.status === 'Dead') {
      span.className = 'inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 bg-red-100 text-red-700'
    } else {
      span.className = 'inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 bg-gray-100 text-gray-600'
    }

    this.querySelector('#species')!.textContent = data.species
    this.querySelector('#gender')!.textContent = data.gender
    this.querySelector('#origin')!.textContent = data.origin.name
    this.querySelector('#location')!.textContent = data.location.name
    this.querySelector('#episodes')!.textContent = String(data.episode.length)
  }
}

customElements.define('rick-detail', RickDetail)
