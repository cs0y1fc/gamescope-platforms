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
