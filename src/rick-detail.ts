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
      <p class="flex justify-between border-b pb-1"><span class="font-medium">Origin:</span> <button id="origin-link" class="text-cyan-700 hover:underline text-right"></button></p>
      <p class="flex justify-between border-b pb-1"><span class="font-medium">Location:</span> <button id="location-link" class="text-cyan-700 hover:underline text-right"></button></p>
      <div class="border-b pb-2">
        <span class="font-medium">Episodes:</span>
        <ul id="episodes-list" class="mt-2 space-y-1"></ul>
      </div>
    </div>
  </div>
`

export class RickDetail extends HTMLElement {
  private characterData: Character | null = null
  private episodeRequestToken = 0

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
      ;(this.querySelector('#episodes-list') as HTMLElement).innerHTML = ''
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
    const originLink = this.querySelector('#origin-link') as HTMLButtonElement
    originLink.textContent = data.origin.name
    originLink.onclick = () => this.emitLocationSelection(data.origin.url)

    const locationLink = this.querySelector('#location-link') as HTMLButtonElement
    locationLink.textContent = data.location.name
    locationLink.onclick = () => this.emitLocationSelection(data.location.url)

    this.renderEpisodes(data.episode)
  }

  private async renderEpisodes(episodeUrls: string[]) {
    const episodesList = this.querySelector('#episodes-list') as HTMLElement
    episodesList.innerHTML = '<li class="text-gray-500 text-sm">Loading episodes...</li>'
    const token = ++this.episodeRequestToken

    try {
      const episodes = await Promise.all(
        episodeUrls.map(async (url) => {
          const response = await fetch(url)
          if (!response.ok) return { url, name: url, code: '' }
          const data = await response.json() as { name?: string; episode?: string }
          return { url, name: data.name ?? url, code: data.episode ?? '' }
        })
      )

      if (token !== this.episodeRequestToken) return
      episodesList.innerHTML = ''

      const seasonMap = new Map<number, typeof episodes>()
      for (const ep of episodes) {
        const match = ep.code.match(/S(\d+)/i)
        const season = match ? parseInt(match[1], 10) : 0
        if (!seasonMap.has(season)) seasonMap.set(season, [])
        seasonMap.get(season)!.push(ep)
      }

      const sortedSeasons = Array.from(seasonMap.keys()).sort((a, b) => a - b)

      for (const [i, season] of sortedSeasons.entries()) {
        const seasonEpisodes = seasonMap.get(season)!
        const seasonLi = document.createElement('li')
        seasonLi.className = `text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 0 ? '' : 'mt-3'}`
        seasonLi.textContent = `Temporada ${season}`
        episodesList.appendChild(seasonLi)

        for (const episode of seasonEpisodes) {
          const li = document.createElement('li')
          li.className = 'ml-2 flex items-center gap-2'
          const button = document.createElement('button')
          button.type = 'button'
          button.className = 'text-cyan-700 hover:underline text-left text-sm'
          button.textContent = episode.code ? `${episode.code} · ${episode.name}` : episode.name
          button.addEventListener('click', () => this.emitEpisodeSelection(episode.url))
          li.appendChild(button)
          const link = document.createElement('a')
          link.href = `https://www.justwatch.com/es/serie/rick-and-morty/temporada-${season}`
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
          link.className = 'text-xs text-cyan-400 hover:text-cyan-300 underline ml-auto'
          link.textContent = 'JW'
          li.appendChild(link)
          episodesList.appendChild(li)
        }
      }
    } catch {
      if (token !== this.episodeRequestToken) return
      episodesList.innerHTML = '<li class="text-red-600 text-sm">Could not load episodes.</li>'
    }
  }

  private emitLocationSelection(locationUrl: string) {
    if (!locationUrl) return
    this.dispatchEvent(new CustomEvent('location-seleccionada-desde-modal', {
      detail: { url: locationUrl },
      bubbles: true,
      composed: true
    }))
  }

  private emitEpisodeSelection(episodeUrl: string) {
    this.dispatchEvent(new CustomEvent('episode-seleccionado-desde-modal', {
      detail: { url: episodeUrl },
      bubbles: true,
      composed: true
    }))
  }
}

customElements.define('rick-detail', RickDetail)
