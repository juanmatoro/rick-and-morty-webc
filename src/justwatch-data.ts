import type { Episode } from './types'

export interface SeasonMeta {
  season: number
  episodeCount: number
  year: string
  synopsis: string
  poster: string
  trailerUrl: string
  genres: string
  duration: string
}

const TRAILER = 'https://www.dailymotion.com/crawler/video/x8pzmh7'

export const SEASONS: SeasonMeta[] = [
  {
    season: 1,
    episodeCount: 11,
    year: '2013',
    synopsis: 'Aventuras caóticas y realidades alternativas en la primera entrega de la serie. Rick se sumerge en un mundo pseudo-real entre multiversos, mientras Summer se une a Beth Espacial en su lucha contra la malvada Federación Galáctica.',
    poster: 'https://images.justwatch.com/poster/309176070/s718/temporada-1.jpg',
    trailerUrl: TRAILER,
    genres: 'Comedia, Ciencia ficción, Animación',
    duration: '22 min'
  },
  {
    season: 2,
    episodeCount: 10,
    year: '2015',
    synopsis: 'Rick y Morty han decidido descongelar el tiempo y tienen que enfrentarse a parásitos alienígenas, Jerrys alternativos y una dimensión decadente, posiblemente inexistente.',
    poster: 'https://images.justwatch.com/poster/309176178/s718/temporada-2.jpg',
    trailerUrl: TRAILER,
    genres: 'Comedia, Ciencia ficción, Animación',
    duration: '23 min'
  },
  {
    season: 3,
    episodeCount: 10,
    year: '2017',
    synopsis: 'Rick y Morty viajan a Atlantis y se toman un tiempo para descansar, además Rick se convierte en un pepinillo y se enfrenta al presidente.',
    poster: 'https://images.justwatch.com/poster/309176032/s718/temporada-3.jpg',
    trailerUrl: TRAILER,
    genres: 'Comedia, Ciencia ficción, Animación',
    duration: '22 min'
  },
  {
    season: 4,
    episodeCount: 10,
    year: '2019',
    synopsis: 'El genio Rick y su nieto Morty continúan realizando viajes interdimensionales que desafían al tiempo y al espacio.',
    poster: 'https://images.justwatch.com/poster/309176182/s718/temporada-4.jpg',
    trailerUrl: TRAILER,
    genres: 'Animación, Comedia, Ciencia ficción',
    duration: '22 min'
  },
  {
    season: 5,
    episodeCount: 10,
    year: '2021',
    synopsis: 'Rick, Morty y la fam están de vuelta con diez episodios totalmente nuevos. Sexo, romance, monstruos testiculares... un tipo llamado Sr. Nimbus...',
    poster: 'https://images.justwatch.com/poster/247615255/s718/temporada-5.jpg',
    trailerUrl: TRAILER,
    genres: 'Comedia, Ciencia ficción, Animación',
    duration: '22 min'
  },
  {
    season: 6,
    episodeCount: 10,
    year: '2022',
    synopsis: '¡Es la sexta temporada y Rick y Morty están de vuelta! ¿Lograrán recuperarse para más aventuras o serán arrastrados por un océano de orina?',
    poster: 'https://images.justwatch.com/poster/309176033/s718/temporada-6.jpg',
    trailerUrl: TRAILER,
    genres: 'Animación, Comedia, Ciencia ficción',
    duration: '22 min'
  },
  {
    season: 7,
    episodeCount: 10,
    year: '2023',
    synopsis: 'Rick y Morty han vuelto y suenan más que nunca. Es la séptima temporada, y las posibilidades son infinitas. Probablemente haya menos cabreo que en la temporada pasada.',
    poster: 'https://images.justwatch.com/poster/309176189/s718/temporada-7.jpg',
    trailerUrl: TRAILER,
    genres: 'Animación, Comedia, Ciencia ficción',
    duration: '22 min'
  },
  {
    season: 8,
    episodeCount: 10,
    year: '2025',
    synopsis: 'Más caos y la característica mirada mordaz a la condición humana. El científico alcohólico más brillante del multiverso regresa con Morty a bordo para una nueva tanda de 10 aventuras.',
    poster: 'https://images.justwatch.com/poster/333290761/s718/temporada-8.jpg',
    trailerUrl: TRAILER,
    genres: 'Comedia, Ciencia ficción, Animación',
    duration: '23 min'
  },
  {
    season: 9,
    episodeCount: 10,
    year: '2026',
    synopsis: 'Season 9 is all certified bangers. No AI slop! Just Grade A organic slop, made by real humans with real human traits like back hair and cysts.',
    poster: 'https://images.justwatch.com/poster/343264500/s718/temporada-9.jpg',
    trailerUrl: TRAILER,
    genres: 'Animación, Comedia, Ciencia ficción',
    duration: '22 min'
  }
]

const S6_EPISODES: [string, string][] = [
  ['Solaricks', '2022-09-04'],
  ['Rick: una Mort plena', '2022-09-11'],
  ['Gemelinstinto Béthico', '2022-09-18'],
  ['La familia nocturna', '2022-09-25'],
  ['DeSmithno final', '2022-10-02'],
  ['Morque JuRícksico', '2022-10-09'],
  ['La Chaqueta MetáRicka', '2022-10-16'],
  ['Una mierdapia peligrosa', '2022-11-20'],
  ['Un Rick en la Morty del rey Morturo', '2022-11-27'],
  ['¡SocorRick! Ya es Mortidad', '2022-12-11'],
]

const S7_EPISODES: [string, string][] = [
  ['Cómo Ojetesucio recuperó el ojete', '2023-10-15'],
  ['Tú a Jerron y yo a Rickifornia', '2023-10-22'],
  ['Air Force Wong', '2023-10-29'],
  ["That's Amorty", '2023-11-05'],
  ['Sin Rickmort', '2023-11-12'],
  ['El Rickielo... mórtimamente', '2023-11-19'],
  ['Wet Kuat Amortican Summer', '2023-11-26'],
  ['El origen de los Numericons: la película', '2023-12-03'],
  ['Mort: Ragnarick', '2023-12-10'],
  ['Mortifer', '2023-12-17'],
]

const S8_EPISODES: [string, string][] = [
  ['El verano de todos los miedos', '2025-05-25'],
  ['Valkyrick', '2025-06-01'],
  ['El Rick, el Mort y el Feo', '2025-06-08'],
  ['La Última Tentación de Jerry', '2025-06-15'],
  ['Criomuerte a Rickver', '2025-06-22'],
  ['El Rick-curioso caso de Bethjamin Button', '2025-06-29'],
  ['Más Rick que la ficción', '2025-07-06'],
  ['Nomortland', '2025-07-13'],
  ['Morty Papi', '2025-07-20'],
  ['Rick el caliente', '2025-07-27'],
]

const S9_EPISODES: [string, string][] = [
  ['Episodio 1', '2026-05-24'],
  ['Episodio 2', '2026-05-31'],
  ['Episodio 3', '2026-06-07'],
  ['Episodio 4', '2026-06-14'],
  ['Episodio 5', '2026-06-21'],
  ['Episodio 6', '2026-06-28'],
  ['Episodio 7', '2026-07-05'],
  ['Episodio 8', '2026-07-12'],
  ['Episodio 9', '2026-07-19'],
  ['Episodio 10', '2026-07-26'],
]

function makeEpisode(
  id: number,
  name: string,
  airDate: string,
  season: number,
  ep: number,
): Episode {
  const epStr = `S${String(season).padStart(2, '0')}E${String(ep).padStart(2, '0')}`
  return {
    id,
    name,
    air_date: airDate,
    episode: epStr,
    characters: [],
    url: `https://rickandmortyapi.com/api/episode/missing-${id}`,
    created: `${airDate}T00:00:00.000Z`,
  }
}

function buildSeason(episodes: [string, string][], season: number, startId: number): Episode[] {
  return episodes.map(([name, date], i) => makeEpisode(startId + i, name, date, season, i + 1))
}

export const MISSING_EPISODES: Episode[] = [
  ...buildSeason(S6_EPISODES, 6, 52),
  ...buildSeason(S7_EPISODES, 7, 62),
  ...buildSeason(S8_EPISODES, 8, 72),
  ...buildSeason(S9_EPISODES, 9, 82),
]
