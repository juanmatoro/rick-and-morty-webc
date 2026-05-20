export interface Character {
  id: number
  name: string
  status: 'Alive' | 'Dead' | 'unknown'
  species: string
  type: string
  gender: string
  origin: { name: string; url: string }
  location: { name: string; url: string }
  image: string
  episode: string[]
  url: string
  created: string
}

export interface Location {
  id: number
  name: string
  type: string
  dimension: string
  residents: string[]
  url: string
  created: string
}

export interface Episode {
  id: number
  name: string
  air_date: string
  episode: string
  characters: string[]
  url: string
  created: string
}

export interface ApiResponse<T = Character> {
  info: {
    count: number
    pages: number
    next: string | null
    prev: string | null
  }
  results: T[]
}
