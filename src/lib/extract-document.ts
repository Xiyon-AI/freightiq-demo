import { GoogleGenAI } from '@google/genai'
import { LoadDocument, loadDocumentJsonSchema, type LoadDocumentT } from './schema'
import { SYSTEM_PROMPT } from './prompt'

export type ExtractionUsage = {
  input_tokens: number
  output_tokens: number
}

export type ExtractedFreightDocument = {
  fields: LoadDocumentT
  usage: ExtractionUsage
}

export class ExtractionResultMissingError extends Error {}

export class ExtractionSchemaMismatchError extends Error {
  constructor(readonly issues: unknown[]) {
    super('The extraction result did not match the schema.')
  }
}

function getGeminiResponseSchema() {
  const schema = structuredClone(loadDocumentJsonSchema) as Record<string, unknown>
  delete schema.$schema
  return schema
}

export async function extractFreightDocument({
  data,
  mediaType,
  model,
}: {
  data: Uint8Array
  mediaType: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  model: string
}): Promise<ExtractedFreightDocument> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.')

  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model,
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { data: Buffer.from(data).toString('base64'), mimeType: mediaType } },
        { text: 'Extract this freight document.' },
      ],
    }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseJsonSchema: getGeminiResponseSchema(),
      maxOutputTokens: 2000,
      temperature: 0,
    },
  })

  const responseText = response.text
  if (!responseText) {
    throw new ExtractionResultMissingError('Gemini returned no structured result.')
  }

  let output: unknown
  try {
    output = JSON.parse(responseText)
  } catch {
    throw new ExtractionSchemaMismatchError([{ message: 'Gemini returned invalid JSON.' }])
  }

  const parsed = LoadDocument.safeParse(output)
  if (!parsed.success) {
    throw new ExtractionSchemaMismatchError(parsed.error.issues)
  }

  return {
    fields: parsed.data,
    usage: {
      input_tokens: response.usageMetadata?.promptTokenCount ?? 0,
      output_tokens: response.usageMetadata?.candidatesTokenCount ?? 0,
    },
  }
}
