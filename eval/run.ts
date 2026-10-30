import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractFreightDocument } from '../src/lib/extract-document'
import { LoadDocument, type LoadDocumentT } from '../src/lib/schema'
import { validate, type ValidationIssue } from '../src/lib/validate'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pdfDirectory = path.join(projectRoot, 'samples', 'pdfs')
const truthDirectory = path.join(projectRoot, 'samples', 'truth')
const resultsDirectory = path.join(projectRoot, 'eval', 'results')
const excludedEvaluationFields = new Set(['uncertain_fields'])

type FieldComparison = {
  field: string
  correct: boolean
  flagged: boolean
  expected: unknown
  extracted: unknown
}

function normalize(value: unknown, fieldPath: string): unknown {
  if (value === null || value === undefined) return null

  if (Array.isArray(value)) {
    return value.map((entry, index) => normalize(entry, `${fieldPath}.${index}`))
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, normalize(entry, `${fieldPath}.${key}`)]),
    )
  }

  const isMoney = /(^|\.)(total_rate|amount)$/.test(fieldPath)
  if (isMoney) {
    const numeric = typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value.trim().replace(/[$,\s]/g, ''))
        : Number.NaN
    return Number.isFinite(numeric) ? Math.round(numeric * 100) / 100 : String(value).trim().toUpperCase()
  }

  if (typeof value === 'string') {
    const trimmed = value.trim().toUpperCase()
    const isIdentifier = /(^|\.)(load_number|carrier_mc|carrier_dot|reference_numbers)(\.|$)/.test(fieldPath)
    return isIdentifier ? trimmed.replace(/[^A-Z0-9]/g, '') : trimmed
  }

  return value
}

function normalizePathRoot(value: string) {
  return value.replace(/\[(\d+)\]/g, '.$1').split('.')[0]
}

function isFieldFlagged(field: string, issues: ValidationIssue[]) {
  const root = normalizePathRoot(field)
  return issues.some((issue) => normalizePathRoot(issue.field) === root)
}

function compareFields(expected: LoadDocumentT, extracted: LoadDocumentT, issues: ValidationIssue[]): FieldComparison[] {
  return Object.keys(expected)
    .filter((field) => !excludedEvaluationFields.has(field))
    .map((field) => {
      const expectedValue = expected[field as keyof LoadDocumentT]
      const extractedValue = extracted[field as keyof LoadDocumentT]
      const normalizedExpected = normalize(expectedValue, field)
      const normalizedExtracted = normalize(extractedValue, field)
      return {
        field,
        correct: JSON.stringify(normalizedExpected) === JSON.stringify(normalizedExtracted),
        flagged: isFieldFlagged(field, issues),
        expected: normalizedExpected,
        extracted: normalizedExtracted,
      }
    })
}

function accuracy(correct: number, total: number) {
  return total === 0 ? null : correct / total
}

function formatPercent(value: number | null) {
  return value === null ? 'n/a' : `${(value * 100).toFixed(1)}%`
}

async function listPdfs(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))
    .map((entry) => path.join(directory, entry.name))
    .sort()
}

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3.5-super-vl:free'
  if (!apiKey) {
    throw new Error('Set OPENROUTER_API_KEY before running the evaluation. OPENROUTER_MODEL defaults to nvidia/nemotron-3.5-super-vl:free.')
  }

  const pdfs = await listPdfs(pdfDirectory)
  if (pdfs.length === 0) {
    throw new Error(`No PDF samples found in ${path.relative(projectRoot, pdfDirectory)}.`)
  }

  const seenLoadNumbers = new Set<string>()
  const sampleResults: Array<Record<string, unknown>> = []
  const perField = new Map<string, { correct: number; total: number }>()
  let correctFieldCount = 0
  let totalFieldCount = 0
  let correctDocumentCount = 0
  let flaggedDocumentCount = 0
  let wrongFieldCount = 0
  let silentErrorCount = 0
  let totalPagesProcessed = 0

  for (const pdfPath of pdfs) {
    const sampleName = path.basename(pdfPath, path.extname(pdfPath))
    const truthPath = path.join(truthDirectory, `${sampleName}.json`)
    let expected: LoadDocumentT

    try {
      const rawTruth: unknown = JSON.parse(await readFile(truthPath, 'utf8'))
      expected = LoadDocument.parse(rawTruth)
    } catch (error) {
      throw new Error(`Truth data is missing or invalid for ${sampleName}: ${error instanceof Error ? error.message : String(error)}`)
    }

    const extracted = await extractFreightDocument({
      data: new Uint8Array(await readFile(pdfPath)),
      mediaType: 'application/pdf',
      model,
      filename: path.basename(pdfPath),
    })
    totalPagesProcessed += extracted.usage.pages_processed
    const issues = validate(extracted.fields, seenLoadNumbers)
    const comparisons = compareFields(expected, extracted.fields, issues)
    const isDocumentCorrect = comparisons.every((comparison) => comparison.correct)
    const isFlagged = issues.length > 0

    for (const comparison of comparisons) {
      const metrics = perField.get(comparison.field) ?? { correct: 0, total: 0 }
      metrics.total += 1
      totalFieldCount += 1
      if (comparison.correct) {
        metrics.correct += 1
        correctFieldCount += 1
      } else {
        wrongFieldCount += 1
        if (!comparison.flagged) silentErrorCount += 1
      }
      perField.set(comparison.field, metrics)
    }

    if (isDocumentCorrect) correctDocumentCount += 1
    if (isFlagged) flaggedDocumentCount += 1
    if (extracted.fields.load_number) seenLoadNumbers.add(extracted.fields.load_number)

    sampleResults.push({
      sample: `${sampleName}.pdf`,
      document_correct: isDocumentCorrect,
      flagged: isFlagged,
      issues,
      field_comparisons: comparisons,
      usage: extracted.usage,
    })
  }

  const runDate = new Date().toISOString()
  const result = {
    run_date: runDate,
    model,
    sample_count: pdfs.length,
    metrics: {
      field_level_accuracy: {
        overall: accuracy(correctFieldCount, totalFieldCount),
        correct_fields: correctFieldCount,
        total_fields: totalFieldCount,
        per_field: Object.fromEntries(
          [...perField.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([field, metrics]) => [
            field,
            { ...metrics, accuracy: accuracy(metrics.correct, metrics.total) },
          ]),
        ),
      },
      document_level_accuracy: accuracy(correctDocumentCount, pdfs.length),
      correct_documents: correctDocumentCount,
      flagged_rate: accuracy(flaggedDocumentCount, pdfs.length),
      flagged_documents: flaggedDocumentCount,
      silent_error_rate: wrongFieldCount === 0 ? null : silentErrorCount / wrongFieldCount,
      silent_errors: silentErrorCount,
      wrong_fields: wrongFieldCount,
      usage: { pages_processed: totalPagesProcessed },
    },
    samples: sampleResults,
  }

  await mkdir(resultsDirectory, { recursive: true })
  const modelSlug = model.replace(/[^a-zA-Z0-9._-]+/g, '_')
  const dateSlug = runDate.replace(/[:.]/g, '-').replace(/Z$/, 'Z')
  const resultPath = path.join(resultsDirectory, `${dateSlug}-${modelSlug}.json`)
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8')

  console.log(`Evaluation model: ${model}`)
  console.log(`Documents: ${pdfs.length}`)
  console.log(`Field-level accuracy: ${formatPercent(result.metrics.field_level_accuracy.overall)}`)
  console.log(`Document-level accuracy: ${formatPercent(result.metrics.document_level_accuracy)}`)
  console.log(`Flagged rate: ${formatPercent(result.metrics.flagged_rate)}`)
  console.log(`Silent error rate: ${wrongFieldCount === 0 ? 'n/a (no wrong fields)' : formatPercent(result.metrics.silent_error_rate)}`)
  console.log('Per-field accuracy:')
  for (const [field, metrics] of Object.entries(result.metrics.field_level_accuracy.per_field)) {
    console.log(`  ${field}: ${formatPercent(metrics.accuracy)} (${metrics.correct}/${metrics.total})`)
  }
  console.log(`Saved results: ${path.relative(projectRoot, resultPath)}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
