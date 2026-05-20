import type { ApiResponse, Episode } from './types'

const template = document.createElement('template')
template.innerHTML = `
  <section class="min-h-[40vh] bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-10 px-4 border-t border-gray-800">
    <div class="max-w-7xl mx-auto">
      <header class="mb-6">
        <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-400">Episodes</h2>
        <p class="text-gray-400 mt-1">Haz clic en un episodio para filtrar personajes y localizaciones relacionadas.</p>
      </header>
      <div id="loading-episodes" class="text-gray-400 py-8">Loading episodes...</div>
      <div id="empty-episodes" class="hidden text-gray-300 py-8">No hay episodios para los filtros actuales.</div>
      <div id="episodes-grid" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    </div>
  </section>
`

export class RickEpisodeList extends HTMLElement {
  private allEpisodes: Episode[] = []
  private filteredEpisodes: Episode[] = []
  private relationCharacterUrls: string[] = []
  private relationEpisodeUrls: string[] = []

  constructor() {
    super()
    this.appendChild(template.content.cloneNode(true))
  }

  set filterCharacterUrls(urls: string[]) {
    this.relationCharacterUrls = urls
    this.applyFilters()
    this.render()
  }

  set filterEpisodeUrls(urls: string[]) {
    this.relationEpisodeUrls = urls
    this.applyFilters()
    this.render()
  }

  connectedCallback() {
    this.fetchAllEpisodes()
  }

  private async fetchAllEpisodes() {
    try {
      let page = 1
      let next: string | null = 'start'
      const acc: Episode[] = []
      while (next) {
        const response = await fetch(`https://rickandmortyapi.com/api/episode?page=${page}`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data: ApiResponse<Episode> = await response.json()
        acc.push(...data.results)
        next = data.info.next
        page += 1
      }
      this.allEpisodes = acc
      this.applyFilters()
      this.render()
    } catch {
      const loading = this.querySelector('#loading-episodes') as HTMLElement
      loading.textContent = 'No se pudieron cargar episodios.'
    }
  }

  private applyFilters() {
    this.filteredEpisodes = this.allEpisodes.filter((episode) => {
      const matchesCharacter = this.relationCharacterUrls.length
        ? episode.characters.some((characterUrl) => this.relationCharacterUrls.includes(characterUrl))
        : true
      const matchesEpisode = this.relationEpisodeUrls.length
        ? this.relationEpisodeUrls.includes(episode.url)
        : true
      return matchesCharacter && matchesEpisode
    })
  }

  private render() {
    const loading = this.querySelector('#loading-episodes') as HTMLElement
    const empty = this.querySelector('#empty-episodes') as HTMLElement
    const grid = this.querySelector('#episodes-grid') as HTMLElement
    loading.classList.add('hidden')
    grid.innerHTML = ''

    if (this.filteredEpisodes.length === 0) {
      grid.classList.add('hidden')
      empty.classList.remove('hidden')
      return
    }

    empty.classList.add('hidden')
    grid.classList.remove('hidden')

    for (const episode of this.filteredEpisodes.slice(0, 60)) {
      const card = document.createElement('button')
      card.type = 'button'
      card.className = 'text-left bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-pink-400 transition'
      card.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-100">${episode.name}</h3>
        <p class="text-sm text-gray-300 mt-1">${episode.episode}</p>
        <p class="text-sm text-gray-400">${episode.air_date}</p>
      `
      card.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('episode-seleccionado', {
          detail: episode,
          bubbles: true,
          composed: true
        }))
      })
      grid.appendChild(card)
    }
  }
}

customElements.define('rick-episode-list', RickEpisodeList)
