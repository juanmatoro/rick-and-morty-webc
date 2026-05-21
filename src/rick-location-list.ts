import type { ApiResponse, Location } from './types'
import { t } from './locale.js'

const template = document.createElement('template')
template.innerHTML = `
  <section class="min-h-[40vh] bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-10 px-4 border-t border-gray-800">
    <div class="max-w-7xl mx-auto">
      <header class="mb-6">
        <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-300"><span id="loc-title"></span></h2>
        <p class="text-gray-400 mt-1"><span id="loc-subtitle"></span></p>
      </header>
      <div id="loading-locations" class="text-gray-400 py-8"></div>
      <div id="empty-locations" class="hidden text-gray-300 py-8"></div>
      <div id="locations-grid" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    </div>
  </section>
`

export class RickLocationList extends HTMLElement {
  private allLocations: Location[] = []
  private filteredLocations: Location[] = []
  private relationCharacterUrls: string[] = []
  private relationLocationUrls: string[] = []

  constructor() {
    super()
    this.appendChild(template.content.cloneNode(true))
  }

  set filterCharacterUrls(urls: string[]) {
    this.relationCharacterUrls = urls
    this.applyFilters()
    this.render()
  }

  set filterLocationUrls(urls: string[]) {
    this.relationLocationUrls = urls
    this.applyFilters()
    this.render()
  }

  connectedCallback() {
    this.updateLocaleStrings()
    this.fetchAllLocations()
    window.addEventListener('language-changed', this.onLanguageChanged)
  }

  disconnectedCallback() {
    window.removeEventListener('language-changed', this.onLanguageChanged)
  }

  private onLanguageChanged = () => {
    this.updateLocaleStrings()
  }

  private updateLocaleStrings() {
    const el = (id: string) => this.querySelector(`#${id}`)
    el('loc-title')!.textContent = t('loc.title')
    el('loc-subtitle')!.textContent = t('loc.subtitle')
    const loading = this.querySelector('#loading-locations') as HTMLElement
    loading.textContent = t('loc.loading')
    const empty = this.querySelector('#empty-locations') as HTMLElement
    empty.textContent = t('loc.empty')
  }

  private async fetchAllLocations() {
    try {
      let page = 1
      let next: string | null = 'start'
      const acc: Location[] = []
      while (next) {
        const response = await fetch(`https://rickandmortyapi.com/api/location?page=${page}`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data: ApiResponse<Location> = await response.json()
        acc.push(...data.results)
        next = data.info.next
        page += 1
      }
      this.allLocations = acc
      this.applyFilters()
      this.render()
    } catch {
      const loading = this.querySelector('#loading-locations') as HTMLElement
      loading.textContent = 'No se pudieron cargar localizaciones.'
    }
  }

  private applyFilters() {
    this.filteredLocations = this.allLocations.filter((location) => {
      const matchesCharacter = this.relationCharacterUrls.length
        ? location.residents.some((resident) => this.relationCharacterUrls.includes(resident))
        : true
      const matchesLocation = this.relationLocationUrls.length
        ? this.relationLocationUrls.includes(location.url)
        : true
      return matchesCharacter && matchesLocation
    })
  }

  private render() {
    const loading = this.querySelector('#loading-locations') as HTMLElement
    const empty = this.querySelector('#empty-locations') as HTMLElement
    const grid = this.querySelector('#locations-grid') as HTMLElement
    loading.classList.add('hidden')
    grid.innerHTML = ''

    if (this.filteredLocations.length === 0) {
      grid.classList.add('hidden')
      empty.classList.remove('hidden')
      return
    }

    empty.classList.add('hidden')
    grid.classList.remove('hidden')

    for (const location of this.filteredLocations.slice(0, 60)) {
      const card = document.createElement('button')
      card.type = 'button'
      card.className = 'text-left bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-cyan-400 transition'
      card.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-100">${location.name}</h3>
        <p class="text-sm text-gray-300 mt-1">${location.type}</p>
        <p class="text-sm text-gray-400">${location.dimension}</p>
      `
      card.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('location-seleccionada', {
          detail: location,
          bubbles: true,
          composed: true
        }))
      })
      grid.appendChild(card)
    }
  }
}

customElements.define('rick-location-list', RickLocationList)
