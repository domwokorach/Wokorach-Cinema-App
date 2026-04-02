'use client'

import { useState, useCallback, useRef, type DragEvent } from 'react'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (file: File) => void
  loading?: boolean
  accept?: string
  maxSizeMB?: number
  className?: string
}

export function FileUpload({
  onUpload,
  loading = false,
  accept = '.csv,.zip',
  maxSizeMB = 10,
  className,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (f: File): boolean => {
      setError(null)

      const validExtensions = accept.split(',').map((e) => e.trim())
      const ext = f.name.toLowerCase().substring(f.name.lastIndexOf('.'))

      if (!validExtensions.includes(ext)) {
        setError(`Invalid file type. Accepted: ${validExtensions.join(', ')}`)
        return false
      }

      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large. Maximum size: ${maxSizeMB}MB`)
        return false
      }

      return true
    },
    [accept, maxSizeMB]
  )

  const handleFile = useCallback(
    (f: File) => {
      if (validateFile(f)) {
        setFile(f)
      }
    },
    [validateFile]
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const droppedFile = e.dataTransfer.files?.[0]
      if (droppedFile) {
        handleFile(droppedFile)
      }
    },
    [handleFile]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        handleFile(selectedFile)
      }
    },
    [handleFile]
  )

  const handleRemove = useCallback(() => {
    setFile(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [])

  const handleUploadClick = useCallback(() => {
    if (file && !loading) {
      onUpload(file)
    }
  }, [file, loading, onUpload])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
          dragOver
            ? 'border-violet-500 bg-violet-500/10'
            : file
              ? 'border-zinc-600 bg-zinc-800/50'
              : 'cursor-pointer border-zinc-700 bg-zinc-800/30 hover:border-zinc-500',
          error && 'border-red-500/50'
        )}
      >
        {file ? (
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-violet-400" />
            <div>
              <p className="text-sm font-medium text-white">{file.name}</p>
              <p className="text-xs text-zinc-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="ml-2 rounded-full p-1 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="mb-3 h-10 w-10 text-zinc-500" />
            <p className="text-sm font-medium text-zinc-300">
              Drag and drop your file here
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              or click to browse ({accept})
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Upload button */}
      {file && (
        <button
          onClick={handleUploadClick}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload and Match
            </>
          )}
        </button>
      )}
    </div>
  )
}
