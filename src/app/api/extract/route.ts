import { extractFreightDocument, ExtractionResultMissingError, ExtractionSchemaMismatchError } from '@/lib/extract-document'
import { validate } from '@/lib/validate'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_FILE_SIZE = 4 * 1024 * 1024
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

function getSeenLoadNumbers(formData: FormData): Set<string> {
  const value = formData.get('seen_load_numbers')
  if (typeof value !== 'string') return new Set()

  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(
      parsed
        .filter((loadNumber): loadNumber is string => typeof loadNumber === 'string')
        .slice(0, 1000),
    )
  } catch {
    return new Set()
  }
}

export async function POST(req: Request) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return Response.json({ error: 'Invalid multipart form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return Response.json({ error: 'No file' }, { status: 400 })
  }
  if (file.size === 0) {
    return Response.json({ error: 'File is empty' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: 'Max 4 MB' }, { status: 413 })
  }

  const isPdf = file.type === 'application/pdf'
  if (!isPdf && !SUPPORTED_IMAGE_TYPES.has(file.type)) {
    return Response.json({ error: 'Upload a PDF, JPEG, PNG, GIF, or WebP file' }, { status: 415 })
  }

  const model = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3.5-super-vl:free'
  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json({ error: 'OpenRouter extraction is not configured. Set OPENROUTER_API_KEY.' }, { status: 503 })
  }

  try {
    const extracted = await extractFreightDocument({
      data: new Uint8Array(await file.arrayBuffer()),
      mediaType: isPdf ? 'application/pdf' : file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
      model,
      filename: file.name,
    })

    return Response.json({
      fields: extracted.fields,
      issues: validate(extracted.fields, getSeenLoadNumbers(formData)),
      usage: extracted.usage,
    })
  } catch (error) {
    if (error instanceof ExtractionResultMissingError) {
      return Response.json({ error: 'No result' }, { status: 502 })
    }
    if (error instanceof ExtractionSchemaMismatchError) {
      return Response.json({ error: 'Schema mismatch', details: error.issues }, { status: 502 })
    }
    console.error('Document extraction request failed', error)
    const developmentMessage = error instanceof Error ? error.message : 'Unknown OpenRouter API error'
    return Response.json({
      error: process.env.NODE_ENV === 'development' ? developmentMessage : 'Document extraction failed',
    }, { status: 502 })
  }
}
