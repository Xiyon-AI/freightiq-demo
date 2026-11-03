import { LoadDocument, loadDocumentJsonSchema, type LoadDocumentT } from './schema'
import { SYSTEM_PROMPT } from './prompt'

export type ExtractionUsage = {
  pages_processed: number
  prompt_tokens?: number
  completion_tokens?: number
}

export type ExtractedFreightDocument = {
  fields: LoadDocumentT
  fieldConfidence: Partial<Record<keyof LoadDocumentT, number>>
  usage: ExtractionUsage
}

export class ExtractionResultMissingError extends Error {}

export class ExtractionSchemaMismatchError extends Error {
  constructor(readonly issues: unknown[]) {
    super('The extraction result did not match the schema.')
  }
}

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      tool_calls?: Array<{ function?: { name?: string; arguments?: string } }>
      content?: string | null
    }
  }>
  usage?: { prompt_tokens?: number; completion_tokens?: number }
  error?: { message?: string }
}

function getResponseSchema() {
  const schema = structuredClone(loadDocumentJsonSchema) as Record<string, unknown>
  delete schema.$schema
  const properties = schema.properties as Record<string, unknown>
  const fields = Object.keys(properties)
  return {
    type: 'object',
    properties: {
      fields: schema,
      field_confidence: {
        type: 'object',
        properties: Object.fromEntries(fields.map((field) => [field, {
          type: 'number',
          description: 'Model-estimated confidence from 0 to 100 based on how clearly this value is supported by the document. This is not a calibrated probability.',
        }])),
        required: fields,
        additionalProperties: false,
      },
    },
    required: ['fields', 'field_confidence'],
    additionalProperties: false,
  }
}

export async function extractFreightDocument({
  data,
  mediaType,
  model,
  filename = 'freight-document',
}: {
  data: Uint8Array
  mediaType: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  model: string
  filename?: string
}): Promise<ExtractedFreightDocument> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured.')

  const base64 = Buffer.from(data).toString('base64')
  const content = mediaType === 'application/pdf'
    ? [
        { type: 'file', file: { filename, file_data: `data:application/pdf;base64,${base64}` } },
        { type: 'text', text: 'Extract this freight document.' },
      ]
    : [
        { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}` } },
        { type: 'text', text: 'Extract this freight document.' },
      ]

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'FreightIQ',
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 4000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'record_document',
          description: 'Record the data extracted from a US freight document.',
          parameters: getResponseSchema(),
          strict: true,
        },
      }],
      tool_choice: { type: 'function', function: { name: 'record_document' } },
    }),
  })

  const result = await response.json().catch(() => null) as OpenRouterResponse | null
  if (!response.ok) {
    throw new Error(result?.error?.message || `Extraction request failed (${response.status}).`)
  }

  const toolCall = result?.choices?.[0]?.message?.tool_calls?.find(
    (call) => call.function?.name === 'record_document',
  )
  const rawOutput = toolCall?.function?.arguments
  if (!rawOutput) {
    throw new ExtractionResultMissingError('Extraction service returned no structured data.')
  }

  let output: unknown
  try {
    output = JSON.parse(rawOutput)
  } catch {
    throw new ExtractionSchemaMismatchError([{ message: 'Extraction service returned invalid format.' }])
  }

  const extracted = output && typeof output === 'object' ? output as {
    fields?: unknown
    field_confidence?: Record<string, unknown>
  } : {}
  const parsed = LoadDocument.safeParse(extracted.fields)
  if (!parsed.success) {
    throw new ExtractionSchemaMismatchError(parsed.error.issues)
  }

  const fieldConfidence = Object.fromEntries(
    Object.entries(extracted.field_confidence || {})
      .filter(([key, value]) => key in parsed.data && typeof value === 'number' && Number.isFinite(value))
      .map(([key, value]) => [key, Math.max(0, Math.min(100, Math.round(value as number)))])
  ) as Partial<Record<keyof LoadDocumentT, number>>

  return {
    fields: parsed.data,
    fieldConfidence,
    usage: {
      pages_processed: mediaType === 'application/pdf' ? 1 : 0,
      prompt_tokens: result?.usage?.prompt_tokens,
      completion_tokens: result?.usage?.completion_tokens,
    },
  }
}
