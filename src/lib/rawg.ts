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
