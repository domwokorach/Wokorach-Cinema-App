'use client'

import Image from 'next/image'
import { Check, X, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPosterUrl } from '@/lib/tmdb/types'
import type { ImportMatch } from '@/lib/import/types'

interface MatchPreviewProps {
  matched: (ImportMatch & { already_rated?: boolean })[]
  unmatched: ImportMatch[]
  alreadyRated: number
  total: number
  onConfirm: () => void
  loading?: boolean
  className?: string
}

export function MatchPreview({
  matched,
  unmatched,
  alreadyRated,
  total,
  onConfirm,
  loading = false,
  className,
}: MatchPreviewProps) {
  const newImports = matched.filter((m) => !m.already_rated).length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Entries"
          value={total}
          icon={<AlertCircle className="h-4 w-4 text-zinc-400" />}
        />
        <StatCard
          label="Matched"
          value={matched.length}
          icon={<Check className="h-4 w-4 text-green-400" />}
          color="text-green-400"
        />
        <StatCard
          label="Unmatched"
          value={unmatched.length}
          icon={<X className="h-4 w-4 text-red-400" />}
          color="text-red-400"
        />
        <StatCard
          label="Already Rated"
          value={alreadyRated}
          icon={<Check className="h-4 w-4 text-yellow-400" />}
          color="text-yellow-400"
        />
      </div>

      {/* Matched movies */}
      {matched.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">
            Matched Movies ({matched.length})
          </h3>
          <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-zinc-800 p-2">
            {matched.map((match, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3 rounded-lg p-2',
                  match.already_rated ? 'bg-zinc-800/30 opacity-60' : 'bg-zinc-800/50'
                )}
              >
                {/* Poster thumbnail */}
                <div className="relative h-12 w-8 flex-shrink-0 overflow-hidden rounded">
                  {match.movie?.poster_path ? (
                    <Image
                      src={getPosterUrl(match.movie.poster_path, 'small') ?? ''}
                      alt={match.movie.title}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-zinc-700" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {match.movie?.title ?? match.entry.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {match.movie?.year ?? match.entry.year}
                    {match.entry.rating !== null && (
                      <span className="ml-2 text-yellow-400">
                        {match.entry.rating.toFixed(1)} stars
                      </span>
                    )}
                  </p>
                </div>

                {/* Confidence badge */}
                <ConfidenceBadge confidence={match.confidence} />

                {/* Already rated indicator */}
                {match.already_rated && (
                  <span className="text-xs text-yellow-500">Exists</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unmatched section */}
      {unmatched.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-400">
            Unmatched ({unmatched.length})
          </h3>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-zinc-800/50 p-2">
            {unmatched.map((match, i) => (
              <div key={i} className="flex items-center gap-2 p-1.5 text-sm text-zinc-500">
                <X className="h-3 w-3 text-red-500" />
                <span>
                  {match.entry.title}
                  {match.entry.year && ` (${match.entry.year})`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        disabled={loading || newImports === 0}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            Import {newImports} Rating{newImports !== 1 ? 's' : ''}
            {alreadyRated > 0 && ` (skip ${alreadyRated} existing)`}
          </>
        )}
      </button>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color?: string
}) {
  return (
    <div className="rounded-lg bg-zinc-800/50 p-3">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <p className={cn('mt-1 text-xl font-bold', color ?? 'text-white')}>
        {value}
      </p>
    </div>
  )
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percent = Math.round(confidence * 100)
  let color = 'text-zinc-400 bg-zinc-700/50'
  if (confidence >= 0.9) color = 'text-green-400 bg-green-500/10'
  else if (confidence >= 0.7) color = 'text-yellow-400 bg-yellow-500/10'

  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', color)}>
      {percent}%
    </span>
  )
}
