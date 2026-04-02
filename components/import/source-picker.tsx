'use client'

import { Film, Database, FileSpreadsheet } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ImportSource } from '@/lib/import/types'

interface SourcePickerProps {
  onSelect: (source: ImportSource) => void
  selected?: ImportSource | null
  className?: string
}

const sources: {
  id: ImportSource
  name: string
  description: string
  instructions: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
}[] = [
  {
    id: 'letterboxd',
    name: 'Letterboxd',
    description: 'Import your ratings and watch history from Letterboxd',
    instructions: 'Go to Settings > Import & Export > Export Your Data. Upload the ZIP file.',
    icon: Film,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30 hover:border-green-500/60',
  },
  {
    id: 'imdb',
    name: 'IMDb',
    description: 'Import your ratings from your IMDb account',
    instructions: 'Go to Your Ratings > three dots menu > Export. Upload the CSV file.',
    icon: Database,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30 hover:border-yellow-500/60',
  },
  {
    id: 'csv',
    name: 'Generic CSV',
    description: 'Import from any CSV file with title and rating columns',
    instructions: 'CSV must have a "title" column. Optional: "year", "rating", "imdb_id".',
    icon: FileSpreadsheet,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30 hover:border-blue-500/60',
  },
]

export function SourcePicker({ onSelect, selected, className }: SourcePickerProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-3', className)}>
      {sources.map((source) => {
        const Icon = source.icon
        const isSelected = selected === source.id

        return (
          <button
            key={source.id}
            onClick={() => onSelect(source.id)}
            className={cn(
              'flex flex-col items-start gap-3 rounded-xl border p-5 text-left transition-all',
              isSelected
                ? `${source.borderColor.split(' ')[0].replace('/30', '/80')} ${source.bgColor.replace('/10', '/20')} ring-1 ring-offset-0`
                : `${source.borderColor} ${source.bgColor}`,
              'hover:shadow-lg'
            )}
          >
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-lg',
                source.bgColor
              )}
            >
              <Icon className={cn('h-6 w-6', source.color)} />
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-white">{source.name}</h3>
              <p className="text-sm text-zinc-400">{source.description}</p>
            </div>

            <p className="text-xs leading-relaxed text-zinc-500">
              {source.instructions}
            </p>
          </button>
        )
      })}
    </div>
  )
}
