'use client'

import { useState, useCallback } from 'react'
import { Copy, Check, Share2, Link } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InviteCardProps {
  inviteCode: string
  shareUrl: string
  groupName?: string
  className?: string
}

export function InviteCard({
  inviteCode,
  shareUrl,
  groupName,
  className,
}: InviteCardProps) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  const copyToClipboard = useCallback(
    async (text: string, type: 'code' | 'link') => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(type)
        setTimeout(() => setCopied(null), 2000)
      } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea')
        textarea.value = text
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        setCopied(type)
        setTimeout(() => setCopied(null), 2000)
      }
    },
    []
  )

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName || 'our group'} on CineMatch`,
          text: `Use invite code ${inviteCode} to join our movie group!`,
          url: shareUrl,
        })
      } catch {
        // User cancelled share
      }
    } else {
      copyToClipboard(shareUrl, 'link')
    }
  }, [groupName, inviteCode, shareUrl, copyToClipboard])

  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-800 bg-zinc-900 p-5',
        className
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <Share2 className="h-5 w-5 text-violet-400" />
        <h3 className="font-semibold text-white">Invite Friends</h3>
      </div>

      {/* Invite code */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs text-zinc-500">
          Invite Code
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg bg-zinc-800 px-4 py-2.5 font-mono text-lg font-bold tracking-widest text-white">
            {inviteCode}
          </div>
          <button
            onClick={() => copyToClipboard(inviteCode, 'code')}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
              copied === 'code'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            )}
          >
            {copied === 'code' ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Share link */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs text-zinc-500">
          Share Link
        </label>
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2.5">
            <Link className="h-3.5 w-3.5 flex-shrink-0 text-zinc-500" />
            <span className="truncate text-sm text-zinc-400">{shareUrl}</span>
          </div>
          <button
            onClick={() => copyToClipboard(shareUrl, 'link')}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
              copied === 'link'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            )}
          >
            {copied === 'link' ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
      >
        <Share2 className="h-4 w-4" />
        Share Invite
      </button>
    </div>
  )
}
