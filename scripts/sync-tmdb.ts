/**
 * Bulk TMDB Sync Script
 *
 * Fetches the top 5000 movies by popularity from TMDB's /discover/movie
 * endpoint and syncs them into the Supabase database.
 *
 * Usage:
 *   npx tsx scripts/sync-tmdb.ts
 *
 * Environment variables required:
 *   - TMDB_API_KEY
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { discoverMovies } from '@/lib/tmdb/client'
import { syncMovie } from '@/lib/tmdb/sync'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const TOTAL_MOVIES = 5000
const MOVIES_PER_PAGE = 20
const TOTAL_PAGES = Math.ceil(TOTAL_MOVIES / MOVIES_PER_PAGE) // 250

// ---------------------------------------------------------------------------
// Progress tracking
// ---------------------------------------------------------------------------

interface SyncStats {
  totalDiscovered: number
  synced: number
  failed: number
  skipped: number
  startTime: number
}

function printProgress(stats: SyncStats, currentPage: number): void {
  const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1)
  const rate = stats.synced > 0 ? (stats.synced / parseFloat(elapsed)).toFixed(1) : '0'
  const pct = ((currentPage / TOTAL_PAGES) * 100).toFixed(1)

  process.stdout.write(
    `\r[${pct}%] Page ${currentPage}/${TOTAL_PAGES} | ` +
    `Synced: ${stats.synced} | Failed: ${stats.failed} | ` +
    `Skipped: ${stats.skipped} | ` +
    `${rate} movies/s | ${elapsed}s elapsed`,
  )
}

// ---------------------------------------------------------------------------
// Main sync logic
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('=== CineMatch TMDB Bulk Sync ===')
  console.log(`Target: ${TOTAL_MOVIES} movies (${TOTAL_PAGES} pages)`)
  console.log()

  // Validate environment
  if (!process.env.TMDB_API_KEY) {
    console.error('Error: TMDB_API_KEY environment variable is not set.')
    process.exit(1)
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL environment variable is not set.')
    process.exit(1)
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set.')
    process.exit(1)
  }

  const stats: SyncStats = {
    totalDiscovered: 0,
    synced: 0,
    failed: 0,
    skipped: 0,
    startTime: Date.now(),
  }

  const failedMovies: { id: number; title: string; error: string }[] = []

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    // Fetch a page of movies from discover
    let discoverResult
    try {
      discoverResult = await discoverMovies({
        page,
        sort_by: 'popularity.desc',
        'vote_count.gte': 10,
      })
    } catch (error) {
      console.error(`\nFailed to fetch discover page ${page}:`, error)
      // Wait and retry once
      await sleep(2000)
      try {
        discoverResult = await discoverMovies({
          page,
          sort_by: 'popularity.desc',
          'vote_count.gte': 10,
        })
      } catch (retryError) {
        console.error(`\nRetry also failed for page ${page}, skipping.`)
        stats.skipped += MOVIES_PER_PAGE
        continue
      }
    }

    stats.totalDiscovered += discoverResult.results.length

    // Sync each movie on the page
    for (const movieSummary of discoverResult.results) {
      try {
        await syncMovie(movieSummary.id)
        stats.synced++
      } catch (error) {
        stats.failed++
        const errorMessage = error instanceof Error ? error.message : String(error)
        failedMovies.push({
          id: movieSummary.id,
          title: movieSummary.title,
          error: errorMessage,
        })

        // Log individual failures without disrupting progress line
        if (stats.failed <= 20) {
          // Only log first 20 failures inline
        }
      }

      // Print progress after each movie
      printProgress(stats, page)
    }
  }

  // Final summary
  const totalTime = ((Date.now() - stats.startTime) / 1000).toFixed(1)
  console.log('\n')
  console.log('=== Sync Complete ===')
  console.log(`Total discovered: ${stats.totalDiscovered}`)
  console.log(`Successfully synced: ${stats.synced}`)
  console.log(`Failed: ${stats.failed}`)
  console.log(`Skipped: ${stats.skipped}`)
  console.log(`Total time: ${totalTime}s`)

  if (failedMovies.length > 0) {
    console.log('\n--- Failed Movies ---')
    for (const movie of failedMovies.slice(0, 50)) {
      console.log(`  [${movie.id}] ${movie.title}: ${movie.error}`)
    }
    if (failedMovies.length > 50) {
      console.log(`  ... and ${failedMovies.length - 50} more`)
    }
  }

  // Exit with error code if too many failures
  if (stats.failed > stats.synced * 0.1) {
    console.error('\nWarning: More than 10% of movies failed to sync.')
    process.exit(1)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

main().catch((error) => {
  console.error('\nFatal error during sync:', error)
  process.exit(1)
})
