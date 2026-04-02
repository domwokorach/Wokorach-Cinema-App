'use client'

import Image from 'next/image'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface StreamingBadgeProps {
  providerId: number
  providerName: string
  logoPath: string
  monetizationType: 'flatrate' | 'rent' | 'buy' | 'free' | 'ads'
  size?: 'sm' | 'md' | 'lg'
}

const monetizationLabels: Record<string, string> = {
  flatrate: 'Stream',
  rent: 'Rent',
  buy: 'Buy',
  free: 'Free',
  ads: 'Free with Ads',
}

const monetizationColors: Record<string, string> = {
  flatrate: 'ring-green-500/50',
  rent: 'ring-yellow-500/50',
  buy: 'ring-zinc-500/50',
  free: 'ring-green-500/50',
  ads: 'ring-blue-500/50',
}

const sizeMap = {
  sm: { container: 'h-6 w-6', image: 24 },
  md: { container: 'h-8 w-8', image: 32 },
  lg: { container: 'h-10 w-10', image: 40 },
}

export function StreamingBadge({
  providerName,
  logoPath,
  monetizationType,
  size = 'sm',
}: StreamingBadgeProps) {
  const label = monetizationLabels[monetizationType] ?? monetizationType
  const ringColor = monetizationColors[monetizationType] ?? 'ring-zinc-500/50'
  const dimensions = sizeMap[size]

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'overflow-hidden rounded-md ring-2',
              ringColor,
              dimensions.container
            )}
          >
            <Image
              src={`https://image.tmdb.org/t/p/w45${logoPath}`}
              alt={providerName}
              width={dimensions.image}
              height={dimensions.image}
              className="h-full w-full object-cover"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-zinc-800 text-zinc-100">
          <p className="text-xs font-medium">{providerName}</p>
          <p className="text-[10px] text-zinc-400">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
