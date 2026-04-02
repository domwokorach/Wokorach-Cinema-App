import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseLetterboxd, parseIMDb, parseGenericCSV, detectSource } from '@/lib/import/parsers'
import { matchBatch } from '@/lib/import/matcher'
import type { ImportSource } from '@/lib/import/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['.csv', '.zip']
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    if (!validTypes.includes(ext)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: .csv, .zip' },
        { status: 400 }
      )
    }

    // Read file content
    const text = await file.text()

    // Detect source
    const source: ImportSource = detectSource(text, file.name)

    // Parse based on source
    let entries
    switch (source) {
      case 'letterboxd':
        entries = parseLetterboxd(text)
        break
      case 'imdb':
        entries = parseIMDb(text)
        break
      case 'csv':
      default:
        entries = parseGenericCSV(text)
        break
    }

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'No valid entries found in file' },
        { status: 400 }
      )
    }

    // Match against TMDB
    const matches = await matchBatch(entries)

    const matched = matches.filter((m) => m.tmdb_id !== null)
    const unmatched = matches.filter((m) => m.tmdb_id === null)

    // Create import job with preview data
    const admin = createAdminClient()
    const { data: job, error: jobError } = await admin
      .from('import_jobs')
      .insert({
        user_id: user.id,
        source,
        status: 'preview' as const,
        file_name: file.name,
        raw_count: entries.length,
        matched_count: matched.length,
        unmatched_count: unmatched.length,
        preview_data: JSON.parse(JSON.stringify(matches)),
      })
      .select()
      .single()

    if (jobError) {
      console.error('Import job create error:', jobError)
      return NextResponse.json(
        { error: 'Failed to create import job' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      job_id: job.id,
      source,
      total: entries.length,
      matched: matched.length,
      unmatched: unmatched.length,
      preview: {
        matched: matched.slice(0, 20),
        unmatched: unmatched.slice(0, 10),
      },
    })
  } catch (error) {
    console.error('Import upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process import file' },
      { status: 500 }
    )
  }
}
