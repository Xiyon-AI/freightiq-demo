import type { LoadDocumentT } from '@/lib/schema'

export type ValidationIssue = {
  field: string
  message: string
  severity: 'error' | 'warning'
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function isTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  return Boolean(match && Number(match[1]) < 24 && Number(match[2]) < 60)
}

export function validate(document: LoadDocumentT): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const add = (field: string, message: string, severity: ValidationIssue['severity'] = 'warning') => {
    issues.push({ field, message, severity })
  }

  if (!document.load_number) add('load_number', 'Load number is missing.')
  if (!document.carrier_name) add('carrier_name', 'Carrier name is missing.')
  if (document.stops.length === 0) add('stops', 'No shipment stops were found.')

  document.stops.forEach((stop, index) => {
    const prefix = `stops.${index}`
    if (!stop.city && !stop.address) add(`${prefix}.address`, 'Stop location is missing.')
    if (stop.date && !isIsoDate(stop.date)) add(`${prefix}.date`, 'Date must use YYYY-MM-DD.')
    if (stop.window_start && !isTime(stop.window_start)) add(`${prefix}.window_start`, 'Time must use 24-hour HH:mm.')
    if (stop.window_end && !isTime(stop.window_end)) add(`${prefix}.window_end`, 'Time must use 24-hour HH:mm.')
  })

  const pickupDates = document.stops.filter((stop) => stop.type === 'pickup' && stop.date).map((stop) => stop.date!)
  const deliveryDates = document.stops.filter((stop) => stop.type === 'delivery' && stop.date).map((stop) => stop.date!)
  if (pickupDates.some((date) => !isIsoDate(date))) add('stops', 'A pickup date is invalid.')
  if (deliveryDates.some((date) => !isIsoDate(date))) add('stops', 'A delivery date is invalid.')
  const firstPickup = pickupDates.find(isIsoDate)
  const lastDelivery = [...deliveryDates].reverse().find(isIsoDate)
  if (firstPickup && lastDelivery && firstPickup > lastDelivery) {
    add('stops', 'Pickup date is after delivery date.', 'error')
  }

  if (document.total_rate !== null && document.line_items.length > 0) {
    const lineItemTotal = document.line_items.reduce((sum, item) => sum + item.amount, 0)
    if (Math.round(lineItemTotal * 100) !== Math.round(document.total_rate * 100)) {
      add('total_rate', 'Line item amounts do not match the total rate.')
    }
  }
  if (document.total_rate === null) add('total_rate', 'Total rate is missing.')
  if (document.currency && !/^[A-Z]{3}$/.test(document.currency)) {
    add('currency', 'Currency should be a three-letter uppercase code.')
  }
  if (document.uncertain_fields.length > 0) {
    document.uncertain_fields.forEach(({ field, reason }) => add(field, reason))
  }

  return issues
}
