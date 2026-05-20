import { RickCard } from './rick-card.js'
import type { Character, ApiResponse } from './types'

const template = document.createElement('template')
template.innerHTML = `
  <div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
    <div class="max-w-7xl mx-auto">
      <header class="text-center mb-12">
        <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
          Rick &amp; Morty
        </h1>

        <p class="text-gray-400 mt-2 text-lg">Haz clic en un personaje para ver sus detalles</p>
      </header>

      <div class="mb-8">
        <label for="search" class="sr-only">Buscar personaje</label>
        <input
          id="search"
          type="search"
          placeholder="Buscar personaje por nombre..."
          class="w-full md:w-96 mx-auto block rounded-xl border border-gray-600 bg-gray-800 text-gray-100 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      </div>

      <div id="loading" class="text-center py-20">
        <div class="inline-block w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-400 mt-4">Loading characters...</p>
      </div>

      <div id="error" class="hidden text-center py-20">
        <p class="text-red-400 text-xl"></p>
      </div>

      <div id="empty" class="hidden text-center py-10">
        <p class="text-gray-300 text-lg">No se encontraron personajes para esa búsqueda.</p>
      </div>

      <div id="grid" class="hidden grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>

      <div id="pagination" class="hidden mt-8 flex items-center justify-center gap-4">
        <button
          id="prev-page"
          class="px-4 py-2 rounded-lg border border-gray-500 text-gray-200 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span id="page-info" class="text-gray-300 font-medium"></span>
        <button
          id="next-page"
          class="px-4 py-2 rounded-lg border border-gray-500 text-gray-200 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
`

export class RickList extends HTMLElement {
  private characters: Character[] = []
  private filteredCharacters: Character[] = []
  private searchTerm = ''
  private currentPage = 1
  private totalPages = 1

  constructor() {
    super()
    this.appendChild(template.content.cloneNode(true))
  }

  connectedCallback() {
    this.querySelector('#search')?.addEventListener('input', this.onSearch)
    this.querySelector('#prev-page')?.addEventListener('click', this.onPrevPage)
    this.querySelector('#next-page')?.addEventListener('click', this.onNextPage)
    this.loadPage(1)
  }

  disconnectedCallback() {
    this.querySelector('#search')?.removeEventListener('input', this.onSearch)
    this.querySelector('#prev-page')?.removeEventListener('click', this.onPrevPage)
    this.querySelector('#next-page')?.removeEventListener('click', this.onNextPage)
  }

  private onSearch = (e: Event) => {
    this.searchTerm = (e.target as HTMLInputElement).value.trim().toLowerCase()
    this.applySearchFilter()
    this.renderGrid()
  }

  private onPrevPage = () => {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1)
    }
  }

  private onNextPage = () => {
    if (this.currentPage < this.totalPages) {
      this.loadPage(this.currentPage + 1)
    }
  }

  private async loadPage(page: number) {
    try {
      this.showLoading(true)
      const res = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: ApiResponse = await res.json()
      this.currentPage = page
      this.totalPages = data.info.pages
      this.characters = data.results
      this.applySearchFilter()
      this.renderGrid()
      this.renderPagination()
    } catch (err) {
      const errorEl = this.querySelector('#error') as HTMLElement
      const msgEl = errorEl.querySelector('p')!
      msgEl.textContent = err instanceof Error ? err.message : 'Unknown error'
      this.showLoading(false)
      errorEl.classList.remove('hidden')
    }
  }

  private applySearchFilter() {
    this.filteredCharacters = this.characters.filter((character) =>
      character.name.toLowerCase().includes(this.searchTerm)
    )
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

    for (const char of this.filteredCharacters) {
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
    pageInfo.textContent = `Página ${this.currentPage} de ${this.totalPages}`
    prevButton.disabled = this.currentPage === 1
    nextButton.disabled = this.currentPage === this.totalPages
  }
}

customElements.define('rick-list', RickList)
