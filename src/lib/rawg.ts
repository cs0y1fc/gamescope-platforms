const RAWG_BASE = 'https://api.rawg.io/api'
const API_KEY = process.env.RAWG_API_KEY

export type RawgPlatform = {
  id: number
  name: string
  slug: string
  games_count: number
  image_background: string
  year_start: number | null
  year_end: number | null
}

export type RawgPlatformsResponse = {
  count: number
  next: string | null
  previous: string | null
  results: RawgPlatform[]
}

export type RawgGenre = {
  id: number
  name: string
  slug: string
  games_count: number
}

export type RawgGame = {
  id: number
  slug: string
  name: string
  released: string | null
  background_image: string | null
  rating: number
  metacritic: number | null
  genres: RawgGenre[]
  platforms: Array<{ platform: { id: number; name: string; slug: string } }>
}

export type RawgGamesResponse = {
  count: number
  next: string | null
  previous: string | null
  results: RawgGame[]
}

export async function fetchPlatforms(page = 1, pageSize = 20): Promise<RawgPlatformsResponse> {
  const url = `${RAWG_BASE}/platforms?key=${API_KEY}&page=${page}&page_size=${pageSize}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`RAWG error: ${res.status}`)
  return res.json()
}

// Fetches every page from RAWG — use only during sync, not on each request
export async function fetchAllPlatforms(): Promise<RawgPlatform[]> {
  const all: RawgPlatform[] = []
  let page = 1

  while (true) {
    const res = await fetch(
      `${RAWG_BASE}/platforms?key=${API_KEY}&page=${page}&page_size=40`,
      { cache: 'no-store' }
    )
    if (!res.ok) throw new Error(`RAWG error ${res.status} on page ${page}`)
    const data: RawgPlatformsResponse = await res.json()
    all.push(...data.results)
    if (!data.next) break
    page++
  }

  return all
}

export async function fetchGames(params: {
  platforms?: string
  genres?: string
  dates?: string
  page?: number
  page_size?: number
  ordering?: string
}): Promise<RawgGamesResponse> {
  const qs = new URLSearchParams({ key: API_KEY!, page_size: '20' })
  if (params.platforms) qs.set('platforms', params.platforms)
  if (params.genres) qs.set('genres', params.genres)
  if (params.dates) qs.set('dates', params.dates)
  if (params.page) qs.set('page', String(params.page))
  if (params.page_size) qs.set('page_size', String(params.page_size))
  if (params.ordering) qs.set('ordering', params.ordering)

  const res = await fetch(`${RAWG_BASE}/games?${qs}`, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`RAWG error: ${res.status}`)
  return res.json()
}

export async function fetchGenres(): Promise<RawgGenre[]> {
  const res = await fetch(`${RAWG_BASE}/genres?key=${API_KEY}&page_size=40`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`RAWG genres error: ${res.status}`)
  const data = await res.json()
  return data.results as RawgGenre[]
}
