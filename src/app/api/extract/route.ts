import Anthropic from '@anthropic-ai/sdk'
import { LoadDocument, loadDocumentJsonSchema } from '@/lib/schema'
import { SYSTEM_PROMPT } from '@/lib/prompt'
import { validate } from '@/lib/validate'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_FILE_SIZE = 4 * 1024 * 1024
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

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

  const apiKey = process.env.ANTHROPIC_API_KEY
  const model = process.env.EXTRACTION_MODEL
  if (!apiKey || !model) {
    return Response.json({ error: 'Document extraction is not configured' }, { status: 503 })
  }

  try {
    const data = Buffer.from(await file.arrayBuffer()).toString('base64')
    const client = new Anthropic({ apiKey })
    const res = await client.messages.create({
      model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      tools: [{
        name: 'record_document',
        description: 'Record the data extracted from a freight document',
        input_schema: loadDocumentJsonSchema as any,
      }],
      tool_choice: { type: 'tool', name: 'record_document' },
      messages: [{
        role: 'user',
        content: [
          isPdf
            ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } }
            : { type: 'image', source: { type: 'base64', media_type: file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data } },
          { type: 'text', text: 'Extract this document.' },
        ],
      }],
    })

    const tool = res.content.find((block) => block.type === 'tool_use')
    if (!tool || tool.type !== 'tool_use') {
      return Response.json({ error: 'No result' }, { status: 502 })
    }

    const parsed = LoadDocument.safeParse(tool.input)
    if (!parsed.success) {
      return Response.json({ error: 'Schema mismatch', details: parsed.error.issues }, { status: 502 })
    }

    return Response.json({
      fields: parsed.data,
      issues: validate(parsed.data),
      usage: res.usage,
    })
  } catch (error) {
    console.error('Document extraction request failed', error)
    return Response.json({ error: 'Document extraction failed' }, { status: 502 })
  }
}
