import { RickCard } from './rick-card.js'
import type { Character, ApiResponse } from './types'
import { t } from './locale.js'

const template = document.createElement('template')
template.innerHTML = `
  <div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
    <div class="max-w-7xl mx-auto">
      <header class="text-center mb-12">
        <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
          Rick &amp; Morty
        </h1>

        <p class="text-gray-400 mt-2 text-lg"><span id="char-subtitle"></span></p>
      </header>

      <div class="mb-8">
        <label for="search" class="sr-only"><span id="char-search-label"></span></label>
        <input
          id="search"
          type="search"
          placeholder=""
          class="w-full md:w-96 mx-auto block rounded-xl border border-gray-600 bg-gray-800 text-gray-100 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      </div>

      <div class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <label class="text-sm text-gray-300">
          <span id="char-filter-status"></span>
          <select id="filter-status" class="mt-1 w-full rounded-xl border border-gray-600 bg-gray-800 text-gray-100 px-3 py-2">
            <option value=""></option>
          </select>
        </label>
        <label class="text-sm text-gray-300">
          <span id="char-filter-species"></span>
          <select id="filter-species" class="mt-1 w-full rounded-xl border border-gray-600 bg-gray-800 text-gray-100 px-3 py-2">
            <option value=""></option>
          </select>
        </label>
        <label class="text-sm text-gray-300">
          <span id="char-filter-gender"></span>
          <select id="filter-gender" class="mt-1 w-full rounded-xl border border-gray-600 bg-gray-800 text-gray-100 px-3 py-2">
            <option value=""></option>
          </select>
        </label>
      </div>

      <div id="search-progress" class="hidden text-center mb-6">
        <p class="text-cyan-300 text-sm"><span id="char-search-progress-text"></span></p>
      </div>

      <div id="loading" class="text-center py-20">
        <div class="inline-block w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-400 mt-4"><span id="char-loading-text"></span></p>
      </div>

      <div id="error" class="hidden text-center py-20">
        <p class="text-red-400 text-xl"></p>
      </div>

      <div id="empty" class="hidden text-center py-10">
        <p class="text-gray-300 text-lg"><span id="char-empty-text"></span></p>
      </div>

      <div id="grid" class="hidden grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>

      <div id="pagination" class="hidden mt-8 flex items-center justify-center gap-4">
        <button
          id="prev-page"
          class="px-4 py-2 rounded-lg border border-gray-500 text-gray-200 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span id="char-prev-text"></span>
        </button>
        <span id="page-info" class="text-gray-300 font-medium"></span>
        <button
          id="next-page"
          class="px-4 py-2 rounded-lg border border-gray-500 text-gray-200 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span id="char-next-text"></span>
        </button>
      </div>
    </div>
  </div>
`

export class RickList extends HTMLElement {
  private allCharacters: Character[] = []
  private filteredCharacters: Character[] = []
  private searchTerm = ''
  private currentPage = 1
  private totalPages = 1
  private readonly pageSize = 20
  private nextPageToFetch = 1
  private hasMorePages = true
  private loadingAllPages = false
  private selectedStatus = ''
  private selectedSpecies = ''
  private selectedGender = ''
  private relationCharacterUrls: string[] = []
  private relationLocationUrls: string[] = []
  private relationEpisodeUrls: string[] = []

  constructor() {
    super()
    this.appendChild(template.content.cloneNode(true))
  }

  set filterCharacterUrls(urls: string[]) {
    this.relationCharacterUrls = urls
    this.currentPage = 1
    this.applySearchFilter()
    this.render()
  }

  set filterLocationUrls(urls: string[]) {
    this.relationLocationUrls = urls
    this.currentPage = 1
    this.applySearchFilter()
    this.render()
  }

  set filterEpisodeUrls(urls: string[]) {
    this.relationEpisodeUrls = urls
    this.currentPage = 1
    this.applySearchFilter()
    this.render()
  }

  connectedCallback() {
    this.querySelector('#search')?.addEventListener('input', this.onSearch)
    this.querySelector('#filter-status')?.addEventListener('change', this.onFilterChange)
    this.querySelector('#filter-species')?.addEventListener('change', this.onFilterChange)
    this.querySelector('#filter-gender')?.addEventListener('change', this.onFilterChange)
    this.querySelector('#prev-page')?.addEventListener('click', this.onPrevPage)
    this.querySelector('#next-page')?.addEventListener('click', this.onNextPage)
    this.updateLocaleStrings()
    this.loadInitialAndStartBackgroundFetch()
    window.addEventListener('language-changed', this.onLanguageChanged)
  }

  disconnectedCallback() {
    this.querySelector('#search')?.removeEventListener('input', this.onSearch)
    this.querySelector('#filter-status')?.removeEventListener('change', this.onFilterChange)
    this.querySelector('#filter-species')?.removeEventListener('change', this.onFilterChange)
    this.querySelector('#filter-gender')?.removeEventListener('change', this.onFilterChange)
    this.querySelector('#prev-page')?.removeEventListener('click', this.onPrevPage)
    this.querySelector('#next-page')?.removeEventListener('click', this.onNextPage)
    window.removeEventListener('language-changed', this.onLanguageChanged)
  }

  private onLanguageChanged = () => {
    this.updateLocaleStrings()
    this.renderFilterOptions()
    this.applySearchFilter()
    this.render()
  }

  private updateLocaleStrings() {
    const el = (id: string) => this.querySelector(`#${id}`)
    el('char-subtitle')!.textContent = t('char.subtitle')
    el('char-search-label')!.textContent = t('char.search.label')
    const searchInput = this.querySelector('#search') as HTMLInputElement
    if (searchInput) searchInput.placeholder = t('char.search.placeholder')
    el('char-filter-status')!.textContent = t('char.filter.status')
    el('char-filter-species')!.textContent = t('char.filter.species')
    el('char-filter-gender')!.textContent = t('char.filter.gender')
    el('char-search-progress-text')!.textContent = t('char.search.progress')
    el('char-loading-text')!.textContent = t('char.loading')
    el('char-empty-text')!.textContent = t('char.empty')
    el('char-prev-text')!.textContent = t('char.prev')
    el('char-next-text')!.textContent = t('char.next')
  }

  private onSearch = (e: Event) => {
    this.searchTerm = (e.target as HTMLInputElement).value.trim().toLowerCase()
    this.currentPage = 1
    this.applySearchFilter()
    this.render()
  }

  private onFilterChange = () => {
    this.selectedStatus = (this.querySelector('#filter-status') as HTMLSelectElement).value
    this.selectedSpecies = (this.querySelector('#filter-species') as HTMLSelectElement).value
    this.selectedGender = (this.querySelector('#filter-gender') as HTMLSelectElement).value
    this.currentPage = 1
    this.applySearchFilter()
    this.render()
  }

  private onPrevPage = () => {
    if (this.currentPage > 1) {
      this.currentPage -= 1
      this.render()
    }
  }

  private onNextPage = () => {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1
      this.render()
    }
  }

  private async loadInitialAndStartBackgroundFetch() {
    try {
      this.showLoading(true)
      const data = await this.fetchPage(1)
      this.nextPageToFetch = 2
      this.hasMorePages = data.info.next !== null
      this.mergeCharacters(data.results)
      this.renderFilterOptions()
      this.applySearchFilter()
      this.render()
      this.fetchRemainingPagesInBackground()
    } catch (err) {
      this.handleError(err)
    }
  }

  private async fetchRemainingPagesInBackground() {
    if (this.loadingAllPages) return
    this.loadingAllPages = true
    this.toggleSearchProgress(true)

    try {
      while (this.hasMorePages) {
        const data = await this.fetchPage(this.nextPageToFetch)
        this.nextPageToFetch += 1
        this.hasMorePages = data.info.next !== null
        this.mergeCharacters(data.results)
        this.renderFilterOptions()
        this.applySearchFilter()
        this.render()
      }
    } catch (err) {
      this.handleError(err, false)
    } finally {
      this.loadingAllPages = false
      this.toggleSearchProgress(false)
    }
  }

  private async fetchPage(page: number): Promise<ApiResponse> {
    const res = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: ApiResponse = await res.json()
    return data
  }

  private mergeCharacters(characters: Character[]) {
    const knownIds = new Set(this.allCharacters.map((character) => character.id))
    for (const character of characters) {
      if (!knownIds.has(character.id)) {
        this.allCharacters.push(character)
      }
    }
  }

  private applySearchFilter() {
    this.filteredCharacters = this.allCharacters.filter((character) => {
      const matchesName = character.name.toLowerCase().includes(this.searchTerm)
      const matchesStatus = this.selectedStatus ? character.status === this.selectedStatus : true
      const matchesSpecies = this.selectedSpecies ? character.species === this.selectedSpecies : true
      const matchesGender = this.selectedGender ? character.gender === this.selectedGender : true
      const matchesRelationCharacter = this.relationCharacterUrls.length
        ? this.relationCharacterUrls.includes(character.url)
        : true
      const matchesRelationLocation = this.relationLocationUrls.length
        ? this.relationLocationUrls.includes(character.location.url) || this.relationLocationUrls.includes(character.origin.url)
        : true
      const matchesRelationEpisode = this.relationEpisodeUrls.length
        ? character.episode.some((episodeUrl) => this.relationEpisodeUrls.includes(episodeUrl))
        : true
      return matchesName
        && matchesStatus
        && matchesSpecies
        && matchesGender
        && matchesRelationCharacter
        && matchesRelationLocation
        && matchesRelationEpisode
    })
    this.totalPages = Math.max(1, Math.ceil(this.filteredCharacters.length / this.pageSize))
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages
    }
  }

  private renderFilterOptions() {
    const statusSelect = this.querySelector('#filter-status') as HTMLSelectElement
    const speciesSelect = this.querySelector('#filter-species') as HTMLSelectElement
    const genderSelect = this.querySelector('#filter-gender') as HTMLSelectElement

    this.setSelectOptions(statusSelect, [...new Set(this.allCharacters.map((character) => character.status))], t('char.filter.all'))
    this.setSelectOptions(speciesSelect, [...new Set(this.allCharacters.map((character) => character.species))], t('char.filter.all'))
    this.setSelectOptions(genderSelect, [...new Set(this.allCharacters.map((character) => character.gender))], t('char.filter.all'))

    statusSelect.value = this.selectedStatus
    speciesSelect.value = this.selectedSpecies
    genderSelect.value = this.selectedGender
  }

  private setSelectOptions(select: HTMLSelectElement, values: string[], allLabel: string) {
    const currentValue = select.value
    const uniqueSorted = values.filter(Boolean).sort((a, b) => a.localeCompare(b))

    select.innerHTML = ''
    const allOption = document.createElement('option')
    allOption.value = ''
    allOption.textContent = allLabel
    select.appendChild(allOption)

    for (const value of uniqueSorted) {
      const option = document.createElement('option')
      option.value = value
      option.textContent = value
      select.appendChild(option)
    }

    select.value = currentValue
  }

  private getVisibleCharacters() {
    const start = (this.currentPage - 1) * this.pageSize
    const end = start + this.pageSize
    return this.filteredCharacters.slice(start, end)
  }

  private showLoading(isLoading: boolean) {
    const loading = this.querySelector('#loading') as HTMLElement
    const grid = this.querySelector('#grid') as HTMLElement
    const empty = this.querySelector('#empty') as HTMLElement
    const error = this.querySelector('#error') as HTMLElement

    if (isLoading) {
      loading.classList.remove('hidden')
      grid.classList.add('hidden')
      empty.classList.add('hidden')
      error.classList.add('hidden')
    } else {
      loading.classList.add('hidden')
    }
  }

  private toggleSearchProgress(isVisible: boolean) {
    const progress = this.querySelector('#search-progress') as HTMLElement
    if (!this.searchTerm) {
      progress.classList.add('hidden')
      return
    }

    progress.classList.toggle('hidden', !isVisible)
  }

  private handleError(err: unknown, clearLoading = true) {
    const errorEl = this.querySelector('#error') as HTMLElement
    const msgEl = errorEl.querySelector('p')!
    msgEl.textContent = err instanceof Error ? err.message : 'Unknown error'
    if (clearLoading) {
      this.showLoading(false)
    }
    errorEl.classList.remove('hidden')
  }

  private render() {
    this.renderGrid()
    this.renderPagination()
  }

  private renderGrid() {
    this.showLoading(false)

    const grid = this.querySelector('#grid')!
    const empty = this.querySelector('#empty') as HTMLElement
    grid.innerHTML = ''

    if (this.filteredCharacters.length === 0) {
      grid.classList.add('hidden')
      empty.classList.remove('hidden')
      return
    }

    empty.classList.add('hidden')
    grid.classList.remove('hidden')

    for (const char of this.getVisibleCharacters()) {
      const card = new RickCard()
      card.character = char
      grid.appendChild(card)
    }
  }

  private renderPagination() {
    const pagination = this.querySelector('#pagination') as HTMLElement
    const pageInfo = this.querySelector('#page-info') as HTMLElement
    const prevButton = this.querySelector('#prev-page') as HTMLButtonElement
    const nextButton = this.querySelector('#next-page') as HTMLButtonElement

    pagination.classList.remove('hidden')
    pageInfo.textContent = `${t('char.page')} ${this.currentPage} ${t('char.of')} ${this.totalPages}`
    prevButton.disabled = this.currentPage === 1
    nextButton.disabled = this.currentPage === this.totalPages
  }
}

customElements.define('rick-list', RickList)
