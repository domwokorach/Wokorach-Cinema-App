'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

interface TasteRadarProps {
  genreScores: Record<string, number>
  maxGenres?: number
  accentColor?: string
  className?: string
}

export function TasteRadar({
  genreScores,
  maxGenres = 8,
  accentColor = '#8b5cf6',
  className,
}: TasteRadarProps) {
  // Sort genres by score and take top N
  const sortedGenres = Object.entries(genreScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxGenres)

  if (sortedGenres.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-zinc-900 p-8 text-zinc-500',
          className
        )}
      >
        <p className="text-sm">Not enough data to generate taste radar</p>
      </div>
    )
  }

  // Normalize scores to 0-100 range for display
  const maxScore = Math.max(...sortedGenres.map(([, score]) => Math.abs(score)), 1)
  const data = sortedGenres.map(([genre, score]) => ({
    genre,
    score: Math.round(((score + maxScore) / (2 * maxScore)) * 100),
    rawScore: score,
  }))

  return (
    <div className={cn('rounded-xl bg-zinc-900 p-4', className)}>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid
            stroke="#3f3f46"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="genre"
            tick={{
              fill: '#a1a1aa',
              fontSize: 12,
              fontWeight: 500,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Taste"
            dataKey="score"
            stroke={accentColor}
            fill={accentColor}
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
