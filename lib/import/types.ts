export type ImportSource = 'letterboxd' | 'imdb' | 'csv'

export interface ImportEntry {
  title: string
  year: number | null
  rating: number | null
  imdb_id: string | null
  source: ImportSource
}

export interface ImportMatch {
  entry: ImportEntry
  tmdb_id: number | null
  confidence: number
  method: 'imdb_id' | 'exact' | 'fuzzy' | 'title_only' | 'unmatched'
  movie?: {
    title: string
    year: number | null
    poster_path: string | null
  }
}

export interface ImportJob {
  id: string
  user_id: string
  source: ImportSource
  status: 'pending' | 'processing' | 'preview' | 'confirmed' | 'failed'
  file_name: string
  total_entries: number
  matched_count: number
  unmatched_count: number
  already_rated_count: number
  imported_count: number
  matches: ImportMatch[]
  error: string | null
  created_at: string
  updated_at: string
}

export interface ImportPreview {
  job_id: string
  source: ImportSource
  total: number
  matched: ImportMatch[]
  unmatched: ImportMatch[]
  already_rated: number
}

export interface ImportConfirmResult {
  imported: number
  skipped: number
  errors: number
}
