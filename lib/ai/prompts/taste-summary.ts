export interface TasteSummaryPromptParams {
  genre_scores: Record<string, number>
  top_rated_movies: { title: string; year: number; rating: number }[]
  director_affinities: { name: string; avg_rating: number; count: number }[]
  theme_tags: string[]
  decade_scores: Record<string, number>
}

export function buildTasteSummaryPrompt(params: TasteSummaryPromptParams): string {
  const {
    genre_scores,
    top_rated_movies,
    director_affinities,
    theme_tags,
    decade_scores,
  } = params

  const topGenres = Object.entries(genre_scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([genre, score]) => `${genre} (${score.toFixed(2)})`)
    .join(', ')

  const bottomGenres = Object.entries(genre_scores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([genre, score]) => `${genre} (${score.toFixed(2)})`)
    .join(', ')

  const topMovies = top_rated_movies
    .slice(0, 10)
    .map((m) => `- ${m.title} (${m.year}) — rated ${m.rating}`)
    .join('\n')

  const directors = director_affinities
    .slice(0, 8)
    .map((d) => `- ${d.name}: avg ${d.avg_rating.toFixed(1)} across ${d.count} films`)
    .join('\n')

  const topDecades = Object.entries(decade_scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([decade, score]) => `${decade}: ${score.toFixed(2)}`)
    .join(', ')

  return `You are a film taste analyst. Based on the following data about a user's film ratings and preferences, write a concise natural language summary of their taste profile. This summary will be used by a recommendation engine to personalize suggestions.

## DATA

### Top Genre Affinities
${topGenres}

### Lowest Genre Affinities
${bottomGenres}

### Highest-Rated Films
${topMovies}

### Favorite Directors
${directors}

### Theme Tags
${theme_tags.length > 0 ? theme_tags.join(', ') : 'Not enough data'}

### Era Preferences
${topDecades}

## INSTRUCTIONS

1. Write 3-5 sentences summarizing this person's film taste.
2. Mention their strongest genre preferences and any notable patterns.
3. Note any director or era preferences if they are clear.
4. Mention themes or styles they gravitate toward.
5. If there are genres or styles they seem to avoid, mention that briefly.
6. Write in third person ("This viewer...").
7. Be specific and analytical, not generic.

Respond with ONLY the summary text. No labels, no preamble.`
}
