export type Platform = {
  id: number
  name: string
  slug: string
  games_count: number
  image_url: string | null
  year_start: number | null
  year_end: number | null
  source: 'database' | 'rawg'
}

export type Genre = {
  id: number
  name: string
  slug: string
  games_count: number
}

export type Game = {
  id: number
  slug: string
  name: string
  released: string | null
  background_image: string | null
  rating: number
  metacritic: number | null
  genres: Genre[]
  platforms: Array<{ id: number; name: string; slug: string }>
}
