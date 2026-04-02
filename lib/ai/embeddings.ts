const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings'
const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536

export interface Movie {
  tmdb_id: number
  title: string
  overview: string | null
  genres: string[] | null
  release_date: string | null
  director: string | null
  cast: string[] | null
  keywords: string[] | null
  tagline: string | null
  vote_average: number | null
  original_language: string | null
}

/**
 * Build a rich text representation of a movie for embedding generation.
 * Combines title, overview, genres, director, cast, keywords, and other metadata
 * into a single text string optimized for semantic similarity search.
 */
export function buildEmbeddingText(movie: Movie): string {
  const parts: string[] = []

  parts.push(`Title: ${movie.title}`)

  if (movie.tagline) {
    parts.push(`Tagline: ${movie.tagline}`)
  }

  if (movie.overview) {
    parts.push(`Overview: ${movie.overview}`)
  }

  if (movie.genres && movie.genres.length > 0) {
    parts.push(`Genres: ${movie.genres.join(', ')}`)
  }

  if (movie.director) {
    parts.push(`Director: ${movie.director}`)
  }

  if (movie.cast && movie.cast.length > 0) {
    parts.push(`Cast: ${movie.cast.slice(0, 5).join(', ')}`)
  }

  if (movie.keywords && movie.keywords.length > 0) {
    parts.push(`Keywords: ${movie.keywords.slice(0, 10).join(', ')}`)
  }

  if (movie.release_date) {
    const year = movie.release_date.slice(0, 4)
    parts.push(`Year: ${year}`)
  }

  if (movie.original_language && movie.original_language !== 'en') {
    parts.push(`Language: ${movie.original_language}`)
  }

  if (movie.vote_average && movie.vote_average > 0) {
    parts.push(`Rating: ${movie.vote_average.toFixed(1)}/10`)
  }

  return parts.join('\n')
}

/**
 * Generate a single embedding vector using OpenAI's text-embedding-3-small model.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error (${response.status}): ${error}`)
  }

  const data = (await response.json()) as {
    data: { embedding: number[] }[]
    usage: { prompt_tokens: number; total_tokens: number }
  }

  return data.data[0].embedding
}

/**
 * Generate embeddings for multiple texts in a single API call.
 * OpenAI supports batching up to 2048 inputs per request.
 */
export async function generateBatchEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }

  if (texts.length === 0) {
    return []
  }

  // OpenAI allows up to 2048 inputs per request; chunk if needed
  const MAX_BATCH_SIZE = 2048
  const allEmbeddings: number[][] = []

  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const batch = texts.slice(i, i + MAX_BATCH_SIZE)

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: batch,
        dimensions: EMBEDDING_DIMENSIONS,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error (${response.status}): ${error}`)
    }

    const data = (await response.json()) as {
      data: { embedding: number[]; index: number }[]
      usage: { prompt_tokens: number; total_tokens: number }
    }

    // Sort by index to maintain order
    const sorted = data.data.sort((a, b) => a.index - b.index)
    allEmbeddings.push(...sorted.map((d) => d.embedding))
  }

  return allEmbeddings
}

/**
 * Generate an embedding for a user query, optionally combined with taste context.
 * The taste context helps bias the search toward the user's preferences.
 */
export async function generateQueryEmbedding(
  query: string,
  tasteContext?: string
): Promise<number[]> {
  let embeddingInput = query

  if (tasteContext) {
    embeddingInput = `User preferences: ${tasteContext}\n\nQuery: ${query}`
  }

  return generateEmbedding(embeddingInput)
}
