import type { ApiResponse, Episode } from './types'
import { SEASONS, MISSING_EPISODES } from './justwatch-data.js'

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
      <div id="seasons-root" class="hidden space-y-4"></div>
    </div>
  </section>
`

export class RickEpisodeList extends HTMLElement {
  private allEpisodes: Episode[] = []
  private filteredEpisodes: Episode[] = []
  private relationCharacterUrls: string[] = []
  private relationEpisodeUrls: string[] = []
  private openSeasons = new Set<number>()

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
      this.allEpisodes = [...acc, ...MISSING_EPISODES]
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

  private getSeasonNumber(episode: Episode): number {
    const match = episode.episode.match(/S(\d+)/i)
    return match ? parseInt(match[1], 10) : 1
  }

  private render() {
    const loading = this.querySelector('#loading-episodes') as HTMLElement
    const empty = this.querySelector('#empty-episodes') as HTMLElement
    const root = this.querySelector('#seasons-root') as HTMLElement
    loading.classList.add('hidden')
    root.innerHTML = ''

    if (this.filteredEpisodes.length === 0) {
      root.classList.add('hidden')
      empty.classList.remove('hidden')
      return
    }

    empty.classList.add('hidden')
    root.classList.remove('hidden')

    const seasonMap = new Map<number, Episode[]>()
    for (const episode of this.filteredEpisodes) {
      const s = this.getSeasonNumber(episode)
      if (!seasonMap.has(s)) seasonMap.set(s, [])
      seasonMap.get(s)!.push(episode)
    }

    const sortedSeasons = Array.from(seasonMap.keys()).sort((a, b) => a - b)

    for (const seasonNum of sortedSeasons) {
      const episodes = seasonMap.get(seasonNum)!
      const meta = SEASONS.find(s => s.season === seasonNum)
      const isOpen = this.openSeasons.has(seasonNum)

      const section = document.createElement('div')
      section.className = 'bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden'

      const header = document.createElement('button')
      header.type = 'button'
      header.className = 'w-full flex items-center justify-between px-5 py-4 hover:bg-gray-700/50 transition text-left'
      header.innerHTML = `
        <div class="flex items-center gap-4">
          <span class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Temporada ${seasonNum}
          </span>
          <span class="text-sm text-gray-400">${episodes.length} episodios</span>
        </div>
        <svg class="w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      `
      header.addEventListener('click', () => {
        if (this.openSeasons.has(seasonNum)) {
          this.openSeasons.delete(seasonNum)
        } else {
          this.openSeasons.add(seasonNum)
        }
        this.render()
      })
      section.appendChild(header)

      const body = document.createElement('div')
      body.className = `${isOpen ? 'block' : 'hidden'} border-t border-gray-700`

      if (meta) {
        const infoRow = document.createElement('div')
        infoRow.className = 'flex flex-col md:flex-row gap-5 p-5 bg-gray-800/40'
        infoRow.innerHTML = `
          <img src="${meta.poster}" alt="Temporada ${seasonNum}"
               class="w-32 md:w-36 rounded-lg shadow-md object-cover flex-shrink-0"
               onerror="this.style.display='none'">
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-300 leading-relaxed">${meta.synopsis}</p>
            <div class="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-gray-400">
              <span>📅 ${meta.year}</span>
              <span>🎬 ${meta.genres}</span>
              <span>⏱ ${meta.duration}</span>
              <span>🌎 Estados Unidos</span>
            </div>
            <a href="${meta.trailerUrl}" target="_blank" rel="noopener noreferrer"
               class="inline-block mt-3 text-xs text-cyan-400 hover:text-cyan-300 underline">
              ▶ Ver tráiler
            </a>
          </div>
        `
        body.appendChild(infoRow)
      }

      const grid = document.createElement('div')
      grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5 pt-3'

      for (const episode of episodes) {
        const card = document.createElement('div')
        card.className = 'bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-pink-400 transition'
        card.innerHTML = `
          <button type="button" class="text-left w-full">
            <h3 class="text-base font-semibold text-gray-100">${episode.name}</h3>
            <p class="text-sm text-gray-300 mt-1">${episode.episode}</p>
            <p class="text-xs text-gray-400">${episode.air_date}</p>
          </button>
          <a href="https://www.justwatch.com/es/serie/rick-and-morty/temporada-${seasonNum}"
             target="_blank" rel="noopener noreferrer"
             class="inline-block mt-2 text-xs text-cyan-400 hover:text-cyan-300 underline">
            Ver en JustWatch →
          </a>
        `
        const btn = card.querySelector('button')!
        btn.addEventListener('click', () => {
          this.dispatchEvent(new CustomEvent('episode-detalle', {
            detail: { episode, seasonMeta: meta },
            bubbles: true,
            composed: true
          }))
        })
        grid.appendChild(card)
      }

      body.appendChild(grid)
      section.appendChild(body)
      root.appendChild(section)
    }
  }
}

customElements.define('rick-episode-list', RickEpisodeList)
