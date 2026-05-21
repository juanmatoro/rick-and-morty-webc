import type { Episode, Character } from './types'
import type { SeasonMeta } from './justwatch-data.js'
import { t } from './locale.js'

const template = document.createElement('template')
template.innerHTML = `
  <div class="flex flex-col items-center p-6 text-gray-100">
    <img class="w-48 rounded-xl shadow-md object-cover" alt="season poster">
    <h2 class="text-2xl font-bold text-gray-100 mt-4"></h2>
    <p id="episode-code" class="text-sm text-cyan-400 mt-1"></p>
    <p id="episode-air-date" class="text-xs text-gray-400 mt-1"></p>
    <div class="w-full mt-6 space-y-3">
      <p class="flex justify-between border-b border-gray-700 pb-1">
        <span class="font-medium text-gray-300" id="epdetail-season-label"></span>
        <span id="season-number" class="text-gray-100"></span>
      </p>
      <p class="flex justify-between border-b border-gray-700 pb-1">
        <span class="font-medium text-gray-300" id="epdetail-year-label"></span>
        <span id="episode-year" class="text-gray-100"></span>
      </p>
      <p class="flex justify-between border-b border-gray-700 pb-1">
        <span class="font-medium text-gray-300" id="epdetail-duration-label"></span>
        <span id="episode-duration" class="text-gray-100"></span>
      </p>
      <p class="flex justify-between border-b border-gray-700 pb-1">
        <span class="font-medium text-gray-300" id="epdetail-genre-label"></span>
        <span id="episode-genre" class="text-gray-100"></span>
      </p>
      <div class="border-b border-gray-700 pb-2">
        <p class="font-medium text-gray-300 mb-2" id="epdetail-synopsis-label"></p>
        <p id="episode-synopsis" class="text-sm text-gray-400 leading-relaxed"></p>
      </div>
      <div class="pb-2">
        <span class="font-medium text-gray-300" id="epdetail-characters-label"></span>
        <ul id="characters-list" class="mt-2 space-y-1"></ul>
      </div>
    </div>
    <a id="justwatch-link" target="_blank" rel="noopener noreferrer"
       class="mt-4 text-xs text-cyan-400 hover:text-cyan-300 underline">
    </a>
  </div>
`

export class RickEpisodeDetail extends HTMLElement {
  private episodeData: Episode | null = null
  private seasonMetaData: SeasonMeta | null = null
  private characterRequestToken = 0

  constructor() {
    super()
    this.appendChild(template.content.cloneNode(true))
  }

  set episode(data: Episode | null) {
    this.episodeData = data
    this.render()
  }

  set seasonMeta(data: SeasonMeta | null) {
    this.seasonMetaData = data
  }

  connectedCallback() {
    this.updateLocaleStrings()
    window.addEventListener('language-changed', this.onLanguageChanged)
  }

  disconnectedCallback() {
    window.removeEventListener('language-changed', this.onLanguageChanged)
  }

  private onLanguageChanged = () => {
    this.updateLocaleStrings()
    if (this.episodeData) this.renderCharacterLabels()
  }

  private updateLocaleStrings() {
    this.querySelector('#epdetail-season-label')!.textContent = t('epdetail.season')
    this.querySelector('#epdetail-year-label')!.textContent = t('epdetail.year')
    this.querySelector('#epdetail-duration-label')!.textContent = t('epdetail.duration')
    this.querySelector('#epdetail-genre-label')!.textContent = t('epdetail.genre')
    this.querySelector('#epdetail-synopsis-label')!.textContent = t('epdetail.synopsis')
    this.querySelector('#epdetail-characters-label')!.textContent = t('epdetail.characters')
    this.querySelector('#justwatch-link')!.textContent = t('epdetail.justwatch')
  }

  private renderCharacterLabels() {
    const list = this.querySelector('#characters-list') as HTMLElement
    if (this.episodeData && this.episodeData.characters.length === 0) {
      list.innerHTML = `<li class="text-gray-500 text-sm">${t('epdetail.characters.empty')}</li>`
    }
  }

  private render() {
    if (!this.episodeData) {
      this.querySelector('h2')!.textContent = t('epdetail.none')
      this.querySelector('img')!.style.display = 'none'
      return
    }

    const data = this.episodeData
    const meta = this.seasonMetaData
    const img = this.querySelector('img')!

    if (meta) {
      img.style.display = 'block'
      img.src = meta.poster
      img.alt = `${t('ep.season')} ${meta.season}`
      this.querySelector('#season-number')!.textContent = `${t('ep.season')} ${meta.season}`
      this.querySelector('#episode-year')!.textContent = meta.year
      this.querySelector('#episode-duration')!.textContent = meta.duration
      this.querySelector('#episode-genre')!.textContent = meta.genres
      this.querySelector('#episode-synopsis')!.textContent = meta.synopsis
    } else {
      img.style.display = 'none'
      this.querySelector('#season-number')!.textContent = ''
      this.querySelector('#episode-year')!.textContent = ''
      this.querySelector('#episode-duration')!.textContent = ''
      this.querySelector('#episode-genre')!.textContent = ''
      this.querySelector('#episode-synopsis')!.textContent = ''
    }

    this.querySelector('h2')!.textContent = data.name
    this.querySelector('#episode-code')!.textContent = data.episode
    this.querySelector('#episode-air-date')!.textContent = data.air_date

    const seasonNum = meta ? meta.season : 0
    const jwLink = this.querySelector('#justwatch-link') as HTMLAnchorElement
    jwLink.href = `https://www.justwatch.com/es/serie/rick-and-morty/temporada-${seasonNum}`

    this.renderCharacters(data.characters)
  }

  private async renderCharacters(characterUrls: string[]) {
    const list = this.querySelector('#characters-list') as HTMLElement
    list.innerHTML = `<li class="text-gray-500 text-sm">${t('epdetail.characters.loading')}</li>`

    if (characterUrls.length === 0) {
      list.innerHTML = `<li class="text-gray-500 text-sm">${t('epdetail.characters.empty')}</li>`
      return
    }

    const token = ++this.characterRequestToken

    try {
      const characters = await Promise.all(
        characterUrls.map(async (url) => {
          try {
            const response = await fetch(url)
            if (!response.ok) return null
            return await response.json() as Character
          } catch {
            return null
          }
        })
      )

      if (token !== this.characterRequestToken) return
      list.innerHTML = ''

      for (const character of characters) {
        if (!character) continue
        const li = document.createElement('li')
        li.className = 'flex items-center gap-2'
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'text-cyan-400 hover:text-cyan-300 hover:underline text-left text-sm'
        button.textContent = character.name
        button.addEventListener('click', () => this.emitCharacterSelection(character))
        li.appendChild(button)
        const status = document.createElement('span')
        status.className = `text-xs px-1.5 py-0.5 rounded-full ${
          character.status === 'Alive'
            ? 'bg-green-900 text-green-300'
            : character.status === 'Dead'
              ? 'bg-red-900 text-red-300'
              : 'bg-gray-700 text-gray-300'
        }`
        status.textContent = character.status
        li.appendChild(status)
        list.appendChild(li)
      }
    } catch {
      if (token !== this.characterRequestToken) return
      list.innerHTML = `<li class="text-red-600 text-sm">${t('epdetail.characters.error')}</li>`
    }
  }

  private emitCharacterSelection(character: Character) {
    this.dispatchEvent(new CustomEvent('personaje-seleccionado-desde-modal', {
      detail: character,
      bubbles: true,
      composed: true
    }))
  }
}

customElements.define('rick-episode-detail', RickEpisodeDetail)
