'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getPosterUrl, TMDB_GENRES } from '@/lib/tmdb/types'
import { formatRuntime, getYear } from '@/lib/utils/helpers'
import type { StreamingProvider } from '@/types/movie'

interface MovieCardProps {
  tmdbId: number
  title: string
  posterPath: string | null
  releaseDate?: string | null
  runtime?: number | null
  genreIds?: number[]
  matchScore?: number
  streaming?: StreamingProvider[]
  className?: string
}

export function MovieCard({
  tmdbId,
  title,
  posterPath,
  releaseDate,
  runtime,
  genreIds,
  matchScore,
  streaming,
  className,
}: MovieCardProps) {
  const router = useRouter()
  const posterUrl = getPosterUrl(posterPath, 'medium')
  const year = getYear(releaseDate ?? null)
  const genres = (genreIds ?? []).map((id) => TMDB_GENRES[id]).filter(Boolean).slice(0, 2)

  return (
    <div
      onClick={() => router.push(`/movie/${tmdbId}`)}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-xl bg-zinc-900 transition-transform duration-200 hover:scale-[1.03] hover:shadow-xl',
        className
      )}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-opacity duration-200 group-hover:opacity-80"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500">
            <span className="text-sm">No Poster</span>
          </div>
        )}

        {/* Match score badge */}
        {matchScore !== undefined && (
          <div
            className={cn(
              'absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold',
              matchScore >= 80
                ? 'bg-green-500/90 text-white'
                : matchScore >= 50
                  ? 'bg-yellow-500/90 text-black'
                  : 'bg-zinc-600/90 text-white'
            )}
          >
            {matchScore}%
          </div>
        )}

        {/* Streaming provider icons */}
        {streaming && streaming.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {streaming.slice(0, 4).map((provider) => (
              <div
                key={provider.provider_id}
                className="h-6 w-6 overflow-hidden rounded-md bg-black/50 backdrop-blur-sm"
              >
                <Image
                  src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                  alt={provider.provider_name}
                  width={24}
                  height={24}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="space-y-1">
            {year && (
              <span className="text-xs text-zinc-300">{year}</span>
            )}
            {runtime && (
              <span className="ml-2 text-xs text-zinc-300">{formatRuntime(runtime)}</span>
            )}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-zinc-300"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title overlay at bottom */}
      <div className="bg-gradient-to-t from-black to-zinc-900 p-3">
        <h3 className="truncate text-sm font-medium text-white">{title}</h3>
      </div>
    </div>
  )
}
