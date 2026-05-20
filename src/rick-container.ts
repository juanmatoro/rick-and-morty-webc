import './rick-list.js'
import './rick-modal.js'
import './rick-location-list.js'
import './rick-episode-list.js'
import type { Character, Episode, Location } from './types'
import type { RickModal } from './rick-modal.js'
import type { RickList } from './rick-list.js'

const template = document.createElement('template')
template.innerHTML = `
  <div class="bg-gray-950 border-b border-gray-800 px-4 py-3 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto flex flex-wrap gap-2 items-center justify-between">
      <div class="flex flex-wrap gap-2">
        <button data-page-btn="characters" class="page-btn text-sm bg-cyan-700 text-white px-3 py-2 rounded-lg border border-cyan-500">Personajes</button>
        <button data-page-btn="locations" class="page-btn text-sm bg-gray-800 hover:bg-gray-700 text-gray-100 px-3 py-2 rounded-lg border border-gray-600">Locations</button>
        <button data-page-btn="episodes" class="page-btn text-sm bg-gray-800 hover:bg-gray-700 text-gray-100 px-3 py-2 rounded-lg border border-gray-600">Episodes</button>
      </div>
      <button id="clear-relations" class="text-sm bg-gray-800 hover:bg-gray-700 text-gray-100 px-3 py-2 rounded-lg border border-gray-600">
        Limpiar navegación entre listas
      </button>
    </div>
  </div>
  <section data-page="characters"><rick-list></rick-list></section>
  <section data-page="locations" class="hidden"><rick-location-list></rick-location-list></section>
  <section data-page="episodes" class="hidden"><rick-episode-list></rick-episode-list></section>
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
    this.addEventListener('location-seleccionada', this.onLocationSelected)
    this.addEventListener('episode-seleccionado', this.onEpisodeSelected)
    this.addEventListener('location-seleccionada-desde-modal', this.onLocationSelectedFromModal)
    this.addEventListener('episode-seleccionado-desde-modal', this.onEpisodeSelectedFromModal)
    this.addEventListener('modal-cerrar', this.onModalClose)
    this.querySelector('#clear-relations')?.addEventListener('click', this.clearRelations)
    this.querySelectorAll('.page-btn').forEach((button) =>
      button.addEventListener('click', this.onPageChange)
    )
  }

  disconnectedCallback() {
    this.removeEventListener('personaje-seleccionado', this.onCharacterSelected)
    this.removeEventListener('location-seleccionada', this.onLocationSelected)
    this.removeEventListener('episode-seleccionado', this.onEpisodeSelected)
    this.removeEventListener('location-seleccionada-desde-modal', this.onLocationSelectedFromModal)
    this.removeEventListener('episode-seleccionado-desde-modal', this.onEpisodeSelectedFromModal)
    this.removeEventListener('modal-cerrar', this.onModalClose)
    this.querySelector('#clear-relations')?.removeEventListener('click', this.clearRelations)
    this.querySelectorAll('.page-btn').forEach((button) =>
      button.removeEventListener('click', this.onPageChange)
    )
  }

  private onCharacterSelected = (e: Event) => {
    const customEvent = e as CustomEvent
    this.selectedCharacter = customEvent.detail as Character

    const modal = this.querySelector('rick-modal') as RickModal
    modal.character = this.selectedCharacter
    modal.open = true
  }

  private onLocationSelected = (e: Event) => {
    const customEvent = e as CustomEvent
    const location = customEvent.detail as Location
    this.setCrossFilters({
      characterUrls: location.residents,
      locationUrls: [location.url],
      episodeUrls: []
    })
  }

  private onEpisodeSelected = (e: Event) => {
    const customEvent = e as CustomEvent
    const episode = customEvent.detail as Episode
    this.setCrossFilters({
      characterUrls: episode.characters,
      locationUrls: [],
      episodeUrls: [episode.url]
    })
  }

  private onLocationSelectedFromModal = (e: Event) => {
    const customEvent = e as CustomEvent<{ url: string }>
    this.showPage('locations')
    this.setCrossFilters({
      characterUrls: [],
      locationUrls: customEvent.detail?.url ? [customEvent.detail.url] : [],
      episodeUrls: []
    })
  }

  private onEpisodeSelectedFromModal = (e: Event) => {
    const customEvent = e as CustomEvent<{ url: string }>
    this.showPage('episodes')
    this.setCrossFilters({
      characterUrls: [],
      locationUrls: [],
      episodeUrls: customEvent.detail?.url ? [customEvent.detail.url] : []
    })
  }

  private onModalClose = () => {
    this.selectedCharacter = null
    const modal = this.querySelector('rick-modal') as RickModal
    modal.open = false
  }

  private clearRelations = () => {
    this.setCrossFilters({ characterUrls: [], locationUrls: [], episodeUrls: [] })
  }

  private onPageChange = (event: Event) => {
    const button = event.currentTarget as HTMLButtonElement
    const page = button.dataset.pageBtn as 'characters' | 'locations' | 'episodes'
    this.showPage(page)
  }

  private showPage(page: 'characters' | 'locations' | 'episodes') {
    this.querySelectorAll('section[data-page]').forEach((section) => {
      const sectionEl = section as HTMLElement
      sectionEl.classList.toggle('hidden', sectionEl.dataset.page !== page)
    })
    this.querySelectorAll('.page-btn').forEach((button) => {
      const btn = button as HTMLButtonElement
      const active = btn.dataset.pageBtn === page
      btn.classList.toggle('bg-cyan-700', active)
      btn.classList.toggle('border-cyan-500', active)
      btn.classList.toggle('text-white', active)
      btn.classList.toggle('bg-gray-800', !active)
      btn.classList.toggle('border-gray-600', !active)
      btn.classList.toggle('text-gray-100', !active)
    })
  }

  private setCrossFilters(filters: { characterUrls: string[]; locationUrls: string[]; episodeUrls: string[] }) {
    const characterList = this.querySelector('rick-list') as RickList
    const locationList = this.querySelector('rick-location-list') as HTMLElement & {
      filterCharacterUrls: string[]
      filterLocationUrls: string[]
    }
    const episodeList = this.querySelector('rick-episode-list') as HTMLElement & {
      filterCharacterUrls: string[]
      filterEpisodeUrls: string[]
    }

    characterList.filterCharacterUrls = filters.characterUrls
    characterList.filterLocationUrls = filters.locationUrls
    characterList.filterEpisodeUrls = filters.episodeUrls

    locationList.filterCharacterUrls = filters.characterUrls
    locationList.filterLocationUrls = filters.locationUrls

    episodeList.filterCharacterUrls = filters.characterUrls
    episodeList.filterEpisodeUrls = filters.episodeUrls
  }
}

customElements.define('rick-container', RickContainer)
