import { z } from 'zod'

export const Stop = z.object({
  type: z.enum(['pickup', 'delivery']),
  name: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().length(2).nullable(),
  date: z.string().nullable(), // ISO yyyy-mm-dd
  window_start: z.string().nullable(), // HH:mm, 24h
  window_end: z.string().nullable(),
})

export const LoadDocument = z.object({
  doc_type: z.enum(['rate_confirmation', 'bol', 'pod', 'invoice', 'other']),
  load_number: z.string().nullable(),
  broker_name: z.string().nullable(),
  carrier_name: z.string().nullable(),
  carrier_mc: z.string().nullable(),
  carrier_dot: z.string().nullable(),
  equipment: z.string().nullable(),
  commodity: z.string().nullable(),
  weight_lbs: z.number().nullable(),
  reference_numbers: z.array(z.string()),
  stops: z.array(Stop),
  line_items: z.array(z.object({
    description: z.string(),
    amount: z.number(),
  })),
  total_rate: z.number().nonnegative().nullable(),
  currency: z.string().nullable(),
  uncertain_fields: z.array(z.object({
    field: z.string(),
    reason: z.string(),
  })),
})

export type LoadDocumentT = z.infer<typeof LoadDocument>

export const loadDocumentJsonSchema = z.toJSONSchema(LoadDocument)
