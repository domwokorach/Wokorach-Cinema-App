/**
 * Batch embedding generation script for CineMatch.
 *
 * Reads movies with NULL embeddings from Supabase, generates embedding text,
 * creates embeddings via OpenAI, and updates the movies table in batches.
 *
 * Usage:
 *   npx tsx scripts/generate-embeddings.ts
 *
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   OPENAI_API_KEY
 */

import { createClient } from '@supabase/supabase-js'
import {
  buildEmbeddingText,
  generateBatchEmbeddings,
} from '../lib/ai/embeddings'
import type { Movie } from '../lib/ai/embeddings'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BATCH_SIZE = 100
const OPENAI_BATCH_SIZE = 50 // OpenAI embedding batch size per request
const RATE_LIMIT_DELAY_MS = 1000 // Delay between OpenAI API calls

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      'Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
    )
    process.exit(1)
  }

  if (!openaiKey) {
    console.error('Error: OPENAI_API_KEY must be set')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Count total movies needing embeddings
  const { count: totalCount, error: countError } = await supabase
    .from('movies')
    .select('tmdb_id', { count: 'exact', head: true })
    .is('embedding', null)

  if (countError) {
    console.error('Error counting movies:', countError.message)
    process.exit(1)
  }

  console.log(`Found ${totalCount ?? 0} movies without embeddings`)

  if (!totalCount || totalCount === 0) {
    console.log('Nothing to do. All movies have embeddings.')
    process.exit(0)
  }

  let processed = 0
  let failed = 0
  let offset = 0

  while (processed + failed < totalCount) {
    // Fetch a batch of movies without embeddings
    const { data: movies, error: fetchError } = await supabase
      .from('movies')
      .select(
        'tmdb_id, title, overview, genres, release_date, director, cast, keywords, tagline, vote_average, original_language'
      )
      .is('embedding', null)
      .order('tmdb_id', { ascending: true })
      .range(offset, offset + BATCH_SIZE - 1)

    if (fetchError) {
      console.error('Error fetching movies:', fetchError.message)
      break
    }

    if (!movies || movies.length === 0) {
      break
    }

    console.log(
      `\nProcessing batch: ${movies.length} movies (${processed}/${totalCount} done)`
    )

    // Build embedding texts
    const movieTexts: { tmdb_id: number; text: string }[] = movies.map(
      (movie) => ({
        tmdb_id: movie.tmdb_id,
        text: buildEmbeddingText(movie as Movie),
      })
    )

    // Generate embeddings in sub-batches to respect rate limits
    for (let i = 0; i < movieTexts.length; i += OPENAI_BATCH_SIZE) {
      const subBatch = movieTexts.slice(i, i + OPENAI_BATCH_SIZE)
      const texts = subBatch.map((m) => m.text)

      try {
        const embeddings = await generateBatchEmbeddings(texts)

        // Update each movie with its embedding
        const updates = subBatch.map((m, idx) => ({
          tmdb_id: m.tmdb_id,
          embedding: embeddings[idx],
        }))

        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('movies')
            .update({ embedding: update.embedding })
            .eq('tmdb_id', update.tmdb_id)

          if (updateError) {
            console.error(
              `  Failed to update movie ${update.tmdb_id}: ${updateError.message}`
            )
            failed++
          } else {
            processed++
          }
        }

        console.log(
          `  Sub-batch ${Math.floor(i / OPENAI_BATCH_SIZE) + 1}: ${subBatch.length} embeddings generated`
        )

        // Rate limit delay
        if (i + OPENAI_BATCH_SIZE < movieTexts.length) {
          await sleep(RATE_LIMIT_DELAY_MS)
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error)

        if (message.includes('429') || message.includes('rate')) {
          console.warn(
            '  Rate limited by OpenAI. Waiting 30 seconds...'
          )
          await sleep(30_000)
          // Retry this sub-batch
          i -= OPENAI_BATCH_SIZE
          continue
        }

        console.error(`  Error generating embeddings: ${message}`)
        failed += subBatch.length
      }
    }

    // Move offset forward. Since we query for NULL embeddings and update them,
    // we only advance offset if some in this batch failed (they still have NULL).
    offset = failed

    // Progress report
    const pct = ((processed / totalCount) * 100).toFixed(1)
    console.log(
      `Progress: ${processed} succeeded, ${failed} failed (${pct}%)`
    )
  }

  console.log('\n--- Complete ---')
  console.log(`Total processed: ${processed}`)
  console.log(`Total failed: ${failed}`)
  console.log(`Total skipped: ${totalCount - processed - failed}`)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
