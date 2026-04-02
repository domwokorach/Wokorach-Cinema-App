import type { ImportEntry, ImportSource } from './types'

/**
 * Parse a Letterboxd export ZIP or ratings CSV.
 * Letterboxd CSV format: Date,Name,Year,Letterboxd URI,Rating
 */
export function parseLetterboxd(text: string): ImportEntry[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const header = parseCSVLine(lines[0])
  const nameIdx = findColumnIndex(header, ['name', 'film', 'title'])
  const yearIdx = findColumnIndex(header, ['year'])
  const ratingIdx = findColumnIndex(header, ['rating'])

  if (nameIdx === -1) return []

  const entries: ImportEntry[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i])
    if (!cols[nameIdx]?.trim()) continue

    const rawRating = ratingIdx !== -1 ? parseFloat(cols[ratingIdx]) : null
    const normalizedRating = rawRating != null && !isNaN(rawRating)
      ? normalizeRating(rawRating, 'letterboxd')
      : null

    entries.push({
      title: cols[nameIdx].trim(),
      year: yearIdx !== -1 ? parseInt(cols[yearIdx], 10) || null : null,
      rating: normalizedRating,
      imdb_id: null,
      source: 'letterboxd',
    })
  }

  return entries
}

/**
 * Parse an IMDb CSV export.
 * IMDb CSV format: Const,Your Rating,Date Rated,Title,URL,Title Type,IMDb Rating,...,Year,...
 */
export function parseIMDb(text: string): ImportEntry[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const header = parseCSVLine(lines[0])
  const constIdx = findColumnIndex(header, ['const', 'imdb id', 'imdbid'])
  const titleIdx = findColumnIndex(header, ['title', 'name'])
  const ratingIdx = findColumnIndex(header, ['your rating', 'rating'])
  const yearIdx = findColumnIndex(header, ['year', 'release year'])
  const typeIdx = findColumnIndex(header, ['title type', 'type'])

  if (titleIdx === -1) return []

  const entries: ImportEntry[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i])
    if (!cols[titleIdx]?.trim()) continue

    // Skip non-movie entries if type column exists
    if (typeIdx !== -1 && cols[typeIdx]) {
      const type = cols[typeIdx].toLowerCase()
      if (type && !type.includes('movie') && !type.includes('film')) continue
    }

    const rawRating = ratingIdx !== -1 ? parseFloat(cols[ratingIdx]) : null
    const normalizedRating = rawRating != null && !isNaN(rawRating)
      ? normalizeRating(rawRating, 'imdb')
      : null

    const imdbId = constIdx !== -1 ? cols[constIdx]?.trim() || null : null

    entries.push({
      title: cols[titleIdx].trim(),
      year: yearIdx !== -1 ? parseInt(cols[yearIdx], 10) || null : null,
      rating: normalizedRating,
      imdb_id: imdbId && imdbId.startsWith('tt') ? imdbId : null,
      source: 'imdb',
    })
  }

  return entries
}

/**
 * Parse a generic CSV with auto-detected columns.
 */
export function parseGenericCSV(text: string): ImportEntry[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const header = parseCSVLine(lines[0])
  const titleIdx = findColumnIndex(header, ['title', 'name', 'film', 'movie'])
  const yearIdx = findColumnIndex(header, ['year', 'release_year', 'release year'])
  const ratingIdx = findColumnIndex(header, ['rating', 'score', 'stars', 'my rating', 'your rating'])
  const imdbIdx = findColumnIndex(header, ['imdb_id', 'imdb id', 'imdbid', 'const'])

  if (titleIdx === -1) {
    throw new Error('Could not detect a title column in CSV. Expected a column named "title", "name", "film", or "movie".')
  }

  // Detect rating scale from first few entries
  const sampleRatings: number[] = []
  for (let i = 1; i < Math.min(lines.length, 20); i++) {
    const cols = parseCSVLine(lines[i])
    if (ratingIdx !== -1 && cols[ratingIdx]) {
      const val = parseFloat(cols[ratingIdx])
      if (!isNaN(val)) sampleRatings.push(val)
    }
  }
  const scale = detectRatingScale(sampleRatings)

  const entries: ImportEntry[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i])
    if (!cols[titleIdx]?.trim()) continue

    let rating: number | null = null
    if (ratingIdx !== -1 && cols[ratingIdx]) {
      const rawVal = parseFloat(cols[ratingIdx])
      if (!isNaN(rawVal)) {
        rating = normalizeToFiveScale(rawVal, scale)
      }
    }

    const imdbId = imdbIdx !== -1 ? cols[imdbIdx]?.trim() || null : null

    entries.push({
      title: cols[titleIdx].trim(),
      year: yearIdx !== -1 ? parseInt(cols[yearIdx], 10) || null : null,
      rating,
      imdb_id: imdbId && imdbId.startsWith('tt') ? imdbId : null,
      source: 'csv',
    })
  }

  return entries
}

/**
 * Normalize a rating from a specific source to 0-5 scale.
 */
export function normalizeRating(value: number, source: ImportSource): number {
  switch (source) {
    case 'letterboxd':
      // Letterboxd uses 0.5-5.0 scale (already 5-point)
      return Math.round(value * 2) / 2
    case 'imdb':
      // IMDb uses 1-10 scale, divide by 2
      return Math.round((value / 2) * 2) / 2
    case 'csv':
      return value
    default:
      return value
  }
}

/**
 * Map a 0-5 rating to a reaction string.
 */
export function ratingToReaction(rating: number): 'loved' | 'liked' | 'meh' | 'disliked' | 'skip' {
  if (rating >= 4.5) return 'loved'
  if (rating >= 3.5) return 'liked'
  if (rating >= 2.5) return 'meh'
  if (rating >= 1.5) return 'disliked'
  return 'disliked'
}

/**
 * Detect what scale ratings are on based on sample values.
 */
function detectRatingScale(samples: number[]): number {
  if (samples.length === 0) return 5
  const max = Math.max(...samples)
  if (max <= 5) return 5
  if (max <= 10) return 10
  return 100
}

/**
 * Normalize any rating to a 5-point scale.
 */
function normalizeToFiveScale(value: number, scale: number): number {
  const normalized = (value / scale) * 5
  return Math.round(normalized * 2) / 2
}

/**
 * Parse a single CSV line, handling quoted fields.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
  }

  result.push(current)
  return result
}

/**
 * Find a column index by checking multiple possible names.
 */
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const normalized = headers[i].toLowerCase().trim()
    if (possibleNames.includes(normalized)) return i
  }
  return -1
}

/**
 * Detect the source of a file based on content.
 */
export function detectSource(text: string, fileName: string): ImportSource {
  const lowerName = fileName.toLowerCase()

  if (lowerName.includes('letterboxd') || text.includes('Letterboxd URI')) {
    return 'letterboxd'
  }

  if (lowerName.includes('imdb') || text.includes('Const,Your Rating')) {
    return 'imdb'
  }

  return 'csv'
}
