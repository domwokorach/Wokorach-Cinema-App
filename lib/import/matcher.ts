import type { ImportEntry, ImportMatch } from './types'
import { TMDB_API_BASE } from '@/lib/utils/constants'
import { delay } from '@/lib/utils/helpers'

const TMDB_KEY = process.env.TMDB_API_KEY!

/**
 * Match a single import entry to a TMDB movie.
 * Tries multiple strategies in order: IMDb ID, exact title+year, fuzzy title+year, title-only.
 */
export async function matchMovie(entry: ImportEntry): Promise<ImportMatch> {
  // Strategy 1: IMDb ID lookup
  if (entry.imdb_id) {
    try {
      const res = await fetch(
        `${TMDB_API_BASE}/find/${entry.imdb_id}?api_key=${TMDB_KEY}&external_source=imdb_id`
      )
      if (res.ok) {
        const data = await res.json()
        if (data.movie_results?.length > 0) {
          const movie = data.movie_results[0]
          return {
            entry,
            tmdb_id: movie.id,
            confidence: 1.0,
            method: 'imdb_id',
            movie: {
              title: movie.title,
              year: movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : null,
              poster_path: movie.poster_path,
            },
          }
        }
      }
    } catch {
      // Fall through to next strategy
    }
  }

  // Strategy 2: Exact title + year search
  if (entry.year) {
    const match = await searchTMDB(entry.title, entry.year)
    if (match) {
      const titleMatch = match.title.toLowerCase() === entry.title.toLowerCase()
      return {
        entry,
        tmdb_id: match.id,
        confidence: titleMatch ? 0.95 : 0.85,
        method: titleMatch ? 'exact' : 'fuzzy',
        movie: {
          title: match.title,
          year: match.release_date ? parseInt(match.release_date.substring(0, 4)) : null,
          poster_path: match.poster_path,
        },
      }
    }
  }

  // Strategy 3: Fuzzy title + year (try adjacent years)
  if (entry.year) {
    for (const offset of [-1, 1]) {
      const match = await searchTMDB(entry.title, entry.year + offset)
      if (match && stringSimilarity(entry.title, match.title) > 0.7) {
        return {
          entry,
          tmdb_id: match.id,
          confidence: 0.75,
          method: 'fuzzy',
          movie: {
            title: match.title,
            year: match.release_date ? parseInt(match.release_date.substring(0, 4)) : null,
            poster_path: match.poster_path,
          },
        }
      }
    }
  }

  // Strategy 4: Title-only search
  const match = await searchTMDB(entry.title)
  if (match && stringSimilarity(entry.title, match.title) > 0.6) {
    return {
      entry,
      tmdb_id: match.id,
      confidence: 0.6,
      method: 'title_only',
      movie: {
        title: match.title,
        year: match.release_date ? parseInt(match.release_date.substring(0, 4)) : null,
        poster_path: match.poster_path,
      },
    }
  }

  // No match found
  return {
    entry,
    tmdb_id: null,
    confidence: 0,
    method: 'unmatched',
  }
}

/**
 * Match a batch of entries with rate limiting.
 */
export async function matchBatch(entries: ImportEntry[]): Promise<ImportMatch[]> {
  const results: ImportMatch[] = []
  const BATCH_SIZE = 5
  const DELAY_MS = 250

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(batch.map(matchMovie))
    results.push(...batchResults)

    if (i + BATCH_SIZE < entries.length) {
      await delay(DELAY_MS)
    }
  }

  return results
}

/**
 * Search TMDB and return the best matching movie.
 */
async function searchTMDB(
  title: string,
  year?: number
): Promise<{ id: number; title: string; release_date: string; poster_path: string | null } | null> {
  const params = new URLSearchParams({
    api_key: TMDB_KEY,
    query: title,
    include_adult: 'false',
  })
  if (year) params.set('year', year.toString())

  try {
    const res = await fetch(`${TMDB_API_BASE}/search/movie?${params}`)
    if (!res.ok) return null

    const data = await res.json()
    if (!data.results?.length) return null

    // Return the first (most relevant) result
    const best = data.results[0]
    return {
      id: best.id,
      title: best.title,
      release_date: best.release_date || '',
      poster_path: best.poster_path,
    }
  } catch {
    return null
  }
}

/**
 * Simple string similarity using bigrams (Dice coefficient).
 */
export function stringSimilarity(a: string, b: string): number {
  const aNorm = a.toLowerCase().trim()
  const bNorm = b.toLowerCase().trim()

  if (aNorm === bNorm) return 1.0
  if (aNorm.length < 2 || bNorm.length < 2) return 0

  const aBigrams = new Map<string, number>()
  for (let i = 0; i < aNorm.length - 1; i++) {
    const bigram = aNorm.substring(i, i + 2)
    aBigrams.set(bigram, (aBigrams.get(bigram) || 0) + 1)
  }

  let intersectionSize = 0
  for (let i = 0; i < bNorm.length - 1; i++) {
    const bigram = bNorm.substring(i, i + 2)
    const count = aBigrams.get(bigram) || 0
    if (count > 0) {
      intersectionSize++
      aBigrams.set(bigram, count - 1)
    }
  }

  return (2.0 * intersectionSize) / (aNorm.length - 1 + (bNorm.length - 1))
}
