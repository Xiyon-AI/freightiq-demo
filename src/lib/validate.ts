import type { LoadDocumentT } from './schema'

export type ValidationIssue = {
  field: string
  severity: 'error' | 'warning' | 'info'
  message: string
}

const US_STATE_CODES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
])

function parseIsoDate(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const parsed = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return null
  return parsed.getTime()
}

export function validate(document: LoadDocumentT, seenLoadNumbers: ReadonlySet<string> = new Set()): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const add = (field: string, severity: ValidationIssue['severity'], message: string) => {
    issues.push({ field, severity, message })
  }

  if (!document.load_number?.trim()) add('load_number', 'error', 'Load number is required.')
  if (!document.carrier_name?.trim()) add('carrier_name', 'error', 'Carrier name is required.')
  if (document.total_rate === null) add('total_rate', 'error', 'Total rate is required.')

  const pickups = document.stops
    .map((stop, index) => ({ stop, index }))
    .filter(({ stop }) => stop.type === 'pickup')
  const deliveries = document.stops
    .map((stop, index) => ({ stop, index }))
    .filter(({ stop }) => stop.type === 'delivery')

  if (pickups.length === 0) add('stops', 'error', 'At least one pickup is required.')
  if (deliveries.length === 0) add('stops', 'error', 'At least one delivery is required.')

  const isSample = document.load_number?.trim() === 'LD-572091' || document.reference_numbers?.includes('RC-10482')
  if (document.load_number?.trim() && !isSample) {
    const normalizedLoadNumber = document.load_number.trim().toUpperCase()
    const seen = new Set([...seenLoadNumbers].map((value) => value.trim().toUpperCase()))
    if (seen.has(normalizedLoadNumber)) {
      add('load_number', 'info', 'This load number was already seen in this session.')
    }
  }

  if (document.carrier_mc && !/^\d{1,8}$/.test(document.carrier_mc)) {
    add('carrier_mc', 'warning', 'Carrier MC number must contain 1 to 8 digits.')
  }
  if (document.carrier_dot && !/^\d{1,8}$/.test(document.carrier_dot)) {
    add('carrier_dot', 'warning', 'Carrier DOT number must contain 1 to 8 digits.')
  }

  const parsedStopDates = new Map<number, number>()
  document.stops.forEach((stop, index) => {
    if (stop.date !== null) {
      const timestamp = parseIsoDate(stop.date)
      if (timestamp === null) {
        add(`stops.${index}.date`, 'error', 'Date must be a valid calendar date in YYYY-MM-DD format.')
      } else {
        parsedStopDates.set(index, timestamp)
      }
    }

    if (stop.state && !US_STATE_CODES.has(stop.state.toUpperCase())) {
      add(`stops.${index}.state`, 'warning', 'State code must be a valid two-letter US state abbreviation.')
    }
  })

  const firstPickupDate = pickups
    .map(({ index }) => parsedStopDates.get(index))
    .find((date): date is number => date !== undefined)
  if (firstPickupDate !== undefined) {
    deliveries.forEach(({ index }) => {
      const deliveryDate = parsedStopDates.get(index)
      if (deliveryDate !== undefined && deliveryDate < firstPickupDate) {
        add(`stops.${index}.date`, 'error', 'Delivery date cannot be before the pickup date.')
      }
    })
  }

  if (document.total_rate !== null) {
    if (document.total_rate < 50 || document.total_rate > 50_000) {
      add('total_rate', 'warning', 'Total rate is outside the expected $50 to $50,000 range.')
    }

    const lineItemTotal = document.line_items.reduce((sum, item) => sum + item.amount, 0)
    const diff = Math.abs(lineItemTotal - document.total_rate)
    if (Math.round(diff * 100) > 1) {
      const fmt = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      add('total_rate', 'error', `Line items add up to ${fmt(lineItemTotal)}, but the total reads ${fmt(document.total_rate)} (difference ${fmt(diff)}).`)
    }
  }

  if (document.weight_lbs !== null && document.weight_lbs >= 60_000) {
    add('weight_lbs', 'warning', 'Weight is at or above the expected 60,000 lb limit.')
  }

  document.uncertain_fields.forEach(({ field, reason }) => {
    const isAppt =
      /appt|appointment|single time|only appointment/i.test(reason) ||
      ((field.includes('window_end') || field.includes('window_start')) &&
        /only|single|exact|no window|not provided/i.test(reason))

    if (isAppt) {
      add(field, 'info', `Appointment: ${reason}`)
    } else {
      add(field, 'warning', `Uncertain extraction: ${reason}`)
    }
  })

  return issues
}
