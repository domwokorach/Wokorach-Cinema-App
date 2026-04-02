'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPosterUrl, getBackdropUrl, TMDB_GENRES } from '@/lib/tmdb/types'
import { formatRuntime, getYear } from '@/lib/utils/helpers'
import { StarRating } from '@/components/movie/star-rating'
import { StreamingBadge } from '@/components/movie/streaming-badge'
import type { RecommendedMovie } from '@/types/recommendation'

interface RecommendationCardProps {
  movie: RecommendedMovie
  index: number
  onAddToWatchlist?: (tmdbId: number) => void
  onRate?: (tmdbId: number, rating: number) => void
  isInWatchlist?: boolean
  className?: string
}

export function RecommendationCard({
  movie,
  index,
  onAddToWatchlist,
  onRate,
  isInWatchlist = false,
  className,
}: RecommendationCardProps) {
  const posterUrl = getPosterUrl(movie.poster_path, 'medium')
  const backdropUrl = getBackdropUrl(movie.backdrop_path, 'medium')
  const year = movie.year
  const genres = (movie.genre_ids ?? [])
    .map((id) => TMDB_GENRES[id])
    .filter(Boolean)
    .slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        'overflow-hidden rounded-2xl bg-zinc-900 shadow-lg',
        className
      )}
    >
      {/* Backdrop */}
      {backdropUrl && (
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={backdropUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />

          {/* Match score */}
          <div
            className={cn(
              'absolute right-4 top-4 rounded-full px-3 py-1 text-sm font-bold',
              movie.match_score >= 80
                ? 'bg-green-500/90 text-white'
                : movie.match_score >= 50
                  ? 'bg-yellow-500/90 text-black'
                  : 'bg-zinc-600/90 text-white'
            )}
          >
            {movie.match_score}% Match
          </div>
        </div>
      )}

      <div className="flex gap-4 p-4">
        {/* Poster */}
        <div className="relative h-36 w-24 flex-shrink-0 overflow-hidden rounded-lg">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500">
              <span className="text-xs">No Poster</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div>
            <h3 className="truncate text-lg font-semibold text-white">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              {year && <span>{year}</span>}
              {movie.runtime && (
                <>
                  <span className="text-zinc-600">|</span>
                  <span>{formatRuntime(movie.runtime)}</span>
                </>
              )}
              {movie.vote_average > 0 && (
                <>
                  <span className="text-zinc-600">|</span>
                  <span className="text-yellow-400">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Explanation */}
          <p className="text-sm leading-relaxed text-zinc-300">
            {movie.explanation}
          </p>

          {/* Streaming badges */}
          {movie.streaming && movie.streaming.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {movie.streaming.map((provider) => (
                <StreamingBadge
                  key={provider.provider_id}
                  providerId={provider.provider_id}
                  providerName={provider.provider_name}
                  logoPath={provider.logo_path}
                  monetizationType={provider.monetization_type}
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto flex items-center gap-3 pt-2">
            {/* Add to Watchlist */}
            <button
              onClick={() => onAddToWatchlist?.(movie.tmdb_id)}
              disabled={isInWatchlist}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                isInWatchlist
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-zinc-800 text-white hover:bg-zinc-700'
              )}
            >
              {isInWatchlist ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  In Watchlist
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Add to Watchlist
                </>
              )}
            </button>

            {/* Star rating */}
            <StarRating
              size="sm"
              onRate={(rating) => onRate?.(movie.tmdb_id, rating)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
