import type { Character } from '../src/types'

export const makeCharacter = (overrides: Partial<Character> = {}): Character => ({
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth (C-137)', url: 'https://example.com/origin' },
  location: { name: 'Citadel of Ricks', url: 'https://example.com/location' },
  image: 'https://example.com/rick.png',
  episode: ['https://example.com/episode/1', 'https://example.com/episode/2'],
  url: 'https://example.com/character/1',
  created: '2017-11-04T18:48:46.250Z',
  ...overrides
})
