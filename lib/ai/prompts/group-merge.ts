export interface GroupMember {
  name: string
  taste_summary: string
  genre_scores: Record<string, number>
  theme_tags: string[]
}

export interface GroupMergePromptParams {
  members: GroupMember[]
  query: string
  mood: string | null
  count: number
  candidate_list_json: string
}

export function buildGroupMergePrompt(params: GroupMergePromptParams): string {
  const { members, query, mood, count, candidate_list_json } = params

  const memberProfiles = members
    .map((member, i) => {
      const topGenres = Object.entries(member.genre_scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([genre, score]) => `${genre}: ${score.toFixed(2)}`)
        .join(', ')

      return `### Member ${i + 1}: ${member.name}
**Taste Summary**: ${member.taste_summary}
**Top Genres**: ${topGenres}
**Theme Tags**: ${member.theme_tags.length > 0 ? member.theme_tags.join(', ') : 'None'}`
    })
    .join('\n\n')

  return `You are CineMatch's group recommendation engine. Your goal is to find films that a group of people will all enjoy watching together. This requires balancing different taste profiles to find common ground.

## GROUP MEMBERS

${memberProfiles}

## GROUP REQUEST

### Query
"${query}"

${mood ? `### Group Mood\n${mood}` : ''}

### Number of Recommendations
${count}

## CANDIDATE FILMS
You MUST only select from this list. Do NOT invent or hallucinate films.

${candidate_list_json}

## STRATEGY

1. **Find overlap**: Identify genres, themes, and styles that multiple members enjoy.
2. **Avoid dealbreakers**: If a member strongly dislikes a genre, avoid recommending films dominated by that genre unless other members' enthusiasm outweighs the risk.
3. **Maximize group enjoyment**: Prefer films with broad appeal across the group over films that one person will love but others will be bored by.
4. **Consider the social context**: Group movie-watching is a shared experience. Films that spark discussion or shared emotional responses are preferable to highly niche picks.
5. **Variety**: Ensure the ${count} recommendations aren't all the same type.

## RESPONSE FORMAT
Respond with a JSON array of exactly ${count} objects:
- "tmdb_id": number
- "title": string
- "year": number
- "explanation": string (2-3 sentences explaining why this works for the GROUP — reference specific members' preferences)
- "confidence": number (0.0-1.0)
- "group_fit": object with member names as keys and 0.0-1.0 scores as values (estimated enjoyment per member)
- "match_reasons": string[] (2-4 tags)

CRITICAL: Only recommend films from the candidate list. Every tmdb_id MUST appear in the candidates above.`
}
