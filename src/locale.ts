import { getLang } from './lang.js'
import { SEASONS, SEASONS_EN } from './justwatch-data.js'
import type { SeasonMeta } from './justwatch-data.js'

export function getSeasons(): SeasonMeta[] {
  return getLang() === 'es' ? SEASONS : SEASONS_EN
}

const STRINGS: Record<string, { es: string; en: string }> = {
  // nav
  'nav.characters': { es: 'Personajes', en: 'Characters' },
  'nav.locations': { es: 'Localizaciones', en: 'Locations' },
  'nav.episodes': { es: 'Episodios', en: 'Episodes' },
  'nav.clear': { es: 'Limpiar navegación entre listas', en: 'Clear list navigation' },

  // character list
  'char.subtitle': { es: 'Haz clic en un personaje para ver sus detalles', en: 'Click a character to see details' },
  'char.search.label': { es: 'Buscar personaje', en: 'Search character' },
  'char.search.placeholder': { es: 'Buscar personaje por nombre...', en: 'Search character by name...' },
  'char.filter.status': { es: 'Estado', en: 'Status' },
  'char.filter.species': { es: 'Especie', en: 'Species' },
  'char.filter.gender': { es: 'Género', en: 'Gender' },
  'char.filter.all': { es: 'Todos', en: 'All' },
  'char.filter.all.female': { es: 'Todas', en: 'All' },
  'char.search.progress': { es: 'Cargando más personajes para completar la búsqueda global...', en: 'Loading more characters to complete global search...' },
  'char.loading': { es: 'Cargando personajes...', en: 'Loading characters...' },
  'char.empty': { es: 'No se encontraron personajes para esa búsqueda.', en: 'No characters found for that search.' },
  'char.prev': { es: 'Anterior', en: 'Previous' },
  'char.next': { es: 'Siguiente', en: 'Next' },
  'char.page': { es: 'Página', en: 'Page' },
  'char.of': { es: 'de', en: 'of' },

  // location list
  'loc.title': { es: 'Localizaciones', en: 'Locations' },
  'loc.subtitle': { es: 'Haz clic en una localización para filtrar personajes y episodios relacionados.', en: 'Click a location to filter related characters and episodes.' },
  'loc.loading': { es: 'Cargando localizaciones...', en: 'Loading locations...' },
  'loc.empty': { es: 'No hay localizaciones para los filtros actuales.', en: 'No locations for current filters.' },

  // episode list
  'ep.title': { es: 'Episodios', en: 'Episodes' },
  'ep.subtitle': { es: 'Haz clic en un episodio para ver sus detalles.', en: 'Click an episode to see its details.' },
  'ep.loading': { es: 'Cargando episodios...', en: 'Loading episodes...' },
  'ep.empty': { es: 'No hay episodios para los filtros actuales.', en: 'No episodes for current filters.' },
  'ep.season': { es: 'Temporada', en: 'Season' },
  'ep.episodes': { es: 'episodios', en: 'episodes' },
  'ep.trailer': { es: 'Ver tráiler', en: 'Watch trailer' },
  'ep.justwatch': { es: 'Ver en JustWatch →', en: 'Watch on JustWatch →' },
  'ep.country': { es: 'Estados Unidos', en: 'United States' },
  'ep.loaderror': { es: 'No se pudieron cargar episodios.', en: 'Could not load episodes.' },

  // character detail modal
  'detail.species': { es: 'Especie:', en: 'Species:' },
  'detail.gender': { es: 'Género:', en: 'Gender:' },
  'detail.origin': { es: 'Origen:', en: 'Origin:' },
  'detail.location': { es: 'Localización:', en: 'Location:' },
  'detail.episodes': { es: 'Episodios:', en: 'Episodes:' },
  'detail.none': { es: 'Ningún personaje seleccionado', en: 'No character selected' },
  'detail.episodes.loading': { es: 'Cargando episodios...', en: 'Loading episodes...' },
  'detail.episodes.error': { es: 'No se pudieron cargar episodios.', en: 'Could not load episodes.' },

  // episode detail modal
  'epdetail.season': { es: 'Temporada:', en: 'Season:' },
  'epdetail.year': { es: 'Año:', en: 'Year:' },
  'epdetail.duration': { es: 'Duración:', en: 'Duration:' },
  'epdetail.genre': { es: 'Género:', en: 'Genre:' },
  'epdetail.synopsis': { es: 'Sinopsis', en: 'Synopsis' },
  'epdetail.characters': { es: 'Personajes:', en: 'Characters:' },
  'epdetail.none': { es: 'Ningún episodio seleccionado', en: 'No episode selected' },
  'epdetail.characters.loading': { es: 'Cargando personajes...', en: 'Loading characters...' },
  'epdetail.characters.empty': { es: 'No hay datos de personajes.', en: 'No character data available.' },
  'epdetail.characters.error': { es: 'No se pudieron cargar personajes.', en: 'Could not load characters.' },
  'epdetail.justwatch': { es: 'Ver en JustWatch →', en: 'Watch on JustWatch →' },
}

export function t(key: string): string {
  const lang = getLang()
  const entry = STRINGS[key]
  if (!entry) return key
  return entry[lang]
}
