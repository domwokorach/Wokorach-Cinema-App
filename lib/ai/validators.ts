// ---------------------------------------------------------------------------
// Anti-hallucination validation for AI-generated recommendations
// ---------------------------------------------------------------------------

export interface RecommendationItem {
  tmdb_id: number
  title: string
  year: number
  explanation: string
  confidence: number
  match_reasons: string[]
}

export interface CandidateMovie {
  tmdb_id: number
  title: string
  year: number
  similarity: number
}

/**
 * Validate that every recommended tmdb_id exists in the set of valid candidate IDs.
 * Returns an object with valid and invalid recommendations.
 */
export function validateRecommendations(
  recs: RecommendationItem[],
  validIds: Set<number>
): { valid: RecommendationItem[]; invalid: RecommendationItem[] } {
  const valid: RecommendationItem[] = []
  const invalid: RecommendationItem[] = []

  for (const rec of recs) {
    if (validIds.has(rec.tmdb_id)) {
      valid.push(rec)
    } else {
      invalid.push(rec)
    }
  }

  return { valid, invalid }
}

/**
 * Replace invalid recommendations with the next-best candidates from the
 * candidate pool that weren't already selected.
 */
export function backfillRecommendations(
  recs: RecommendationItem[],
  candidates: CandidateMovie[],
  count: number
): RecommendationItem[] {
  const validIds = new Set(recs.map((r) => r.tmdb_id))

  // Sort candidates by similarity (highest first) and filter out already-selected
  const available = candidates
    .filter((c) => !validIds.has(c.tmdb_id))
    .sort((a, b) => b.similarity - a.similarity)

  const result = [...recs]

  let availIdx = 0
  while (result.length < count && availIdx < available.length) {
    const candidate = available[availIdx]
    result.push({
      tmdb_id: candidate.tmdb_id,
      title: candidate.title,
      year: candidate.year,
      explanation:
        'This film closely matches your search based on its themes and style.',
      confidence: Math.max(0.3, candidate.similarity * 0.8),
      match_reasons: ['semantic-match'],
    })
    availIdx++
  }

  return result.slice(0, count)
}

/**
 * Clean up AI-generated explanation text.
 * - Remove any spoiler markers or warnings the AI might have added
 * - Trim to reasonable length
 * - Clean up formatting artifacts
 */
export function sanitizeExplanation(text: string): string {
  let cleaned = text.trim()

  // Remove spoiler markers
  cleaned = cleaned.replace(
    /\[?\s*spoiler\s*(?:warning|alert)?\s*\]?\s*:?\s*/gi,
    ''
  )

  // Remove markdown bold/italic that might have slipped in
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1')
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1')

  // Remove any leading dash or bullet
  cleaned = cleaned.replace(/^[-•]\s*/, '')

  // Remove surrounding quotes if the AI wrapped the explanation in them
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1)
  }

  // Trim to ~500 characters max (roughly 3 sentences)
  if (cleaned.length > 500) {
    // Find the last sentence boundary before 500 chars
    const truncated = cleaned.slice(0, 500)
    const lastPeriod = truncated.lastIndexOf('.')
    const lastExcl = truncated.lastIndexOf('!')
    const lastQ = truncated.lastIndexOf('?')
    const lastBoundary = Math.max(lastPeriod, lastExcl, lastQ)

    if (lastBoundary > 200) {
      cleaned = cleaned.slice(0, lastBoundary + 1)
    } else {
      cleaned = truncated + '...'
    }
  }

  return cleaned
}
