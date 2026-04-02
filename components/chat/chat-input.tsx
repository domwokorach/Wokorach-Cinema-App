'use client'

import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOODS } from '@/lib/utils/constants'

interface ChatInputProps {
  onSubmit: (message: string, mood?: string) => void
  loading?: boolean
  placeholder?: string
  className?: string
}

export function ChatInput({
  onSubmit,
  loading = false,
  placeholder = 'Describe what you\'re in the mood for...',
  className,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || loading) return

    onSubmit(trimmed, selectedMood ?? undefined)
    setValue('')
    setSelectedMood(null)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, selectedMood, loading, onSubmit])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Auto-grow
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
  }, [])

  const toggleMood = useCallback((moodId: string) => {
    setSelectedMood((prev) => (prev === moodId ? null : moodId))
  }, [])

  return (
    <div className={cn('space-y-3', className)}>
      {/* Mood quick-chips */}
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => toggleMood(mood.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              selectedMood === mood.id
                ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
            )}
          >
            <span className="mr-1">{mood.emoji}</span>
            {mood.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="relative flex items-end gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 p-2 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/20">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={loading}
          rows={1}
          className="min-h-[40px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder-zinc-500 outline-none disabled:opacity-50"
        />

        <button
          onClick={handleSubmit}
          disabled={!value.trim() || loading}
          className={cn(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
            value.trim() && !loading
              ? 'bg-violet-600 text-white hover:bg-violet-500'
              : 'bg-zinc-700 text-zinc-500'
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}
