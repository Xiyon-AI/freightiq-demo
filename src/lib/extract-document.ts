import Anthropic from '@anthropic-ai/sdk'
import { LoadDocument, loadDocumentJsonSchema, type LoadDocumentT } from './schema'
import { SYSTEM_PROMPT } from './prompt'

export type ExtractedFreightDocument = {
  fields: LoadDocumentT
  usage: Anthropic.Messages.Usage
}

export class ExtractionResultMissingError extends Error {}

export class ExtractionSchemaMismatchError extends Error {
  constructor(readonly issues: unknown[]) {
    super('The extraction result did not match the schema.')
  }
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
  const client = new Anthropic()
  const encodedDocument = Buffer.from(data).toString('base64')
  const isPdf = mediaType === 'application/pdf'
  const response = await client.messages.create({
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
          ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: encodedDocument } }
          : { type: 'image', source: { type: 'base64', media_type: mediaType, data: encodedDocument } },
        { type: 'text', text: 'Extract this document.' },
      ],
    }],
  })

  const toolResult = response.content.find((block) => block.type === 'tool_use')
  if (!toolResult || toolResult.type !== 'tool_use') {
    throw new ExtractionResultMissingError('The extraction model returned no structured result.')
  }

  const parsed = LoadDocument.safeParse(toolResult.input)
  if (!parsed.success) {
    throw new ExtractionSchemaMismatchError(parsed.error.issues)
  }

  return { fields: parsed.data, usage: response.usage }
}
