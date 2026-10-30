'use client'

import { useState } from 'react'
import { ArrowRight, Lock, Loader2, Plus, Save, Trash2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { MANDATORY_FIELDS } from '@/lib/types/customer-db'
import type { ColumnInfo } from '@/lib/types/customer-db'

interface MappingRow {
  source_column: string
  target_field: string
  is_mandatory: boolean
  display_order: number
}

interface FieldMappingEditorProps {
  organizationId: string
  connectionId: string
  onMappingsSaved: () => void
}

export function FieldMappingEditor({
  organizationId,
  connectionId,
  onMappingsSaved,
}: FieldMappingEditorProps) {
  const { t } = useLanguage()
  const [columns, setColumns] = useState<ColumnInfo[]>([
    { name: 'customer_name', type: 'varchar' },
    { name: 'email_address', type: 'varchar' },
    { name: 'phone_number', type: 'varchar' },
  ])
  const [mappings, setMappings] = useState<MappingRow[]>([
    { source_column: 'customer_name', target_field: 'name', is_mandatory: true, display_order: 0 },
    { source_column: 'email_address', target_field: 'email', is_mandatory: true, display_order: 1 },
    { source_column: 'phone_number', target_field: 'phone', is_mandatory: true, display_order: 2 },
  ])
  const isLoadingSchema = false
  const isLoadingMappings = false
  const [isSaving, setIsSaving] = useState(false)
  const [schemaError, setSchemaError] = useState<string | null>(null)
  const fetchSchema = () => {}

  void onMappingsSaved
  void connectionId
  void organizationId
  void setColumns
  void setSchemaError

  const addCustomMapping = () => {
    setMappings((prev) => [
      ...prev,
      {
        source_column: '',
        target_field: '',
        is_mandatory: false,
        display_order: prev.length,
      },
    ])
  }

  const removeMapping = (index: number) => {
    setMappings((prev) => prev.filter((_, i) => i !== index))
  }

  const updateMapping = (index: number, field: keyof MappingRow, value: string) => {
    setMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    )
  }

  const handleSave = async () => {
    // Validate mandatory fields have source columns
    for (const field of MANDATORY_FIELDS) {
      const mapping = mappings.find((m) => m.target_field === field)
      if (!mapping || !mapping.source_column) {
        toast.error(`${t('customerDb.mandatoryFieldRequired')}: ${field}`)
        return
      }
    }

    // Validate custom mappings
    for (const m of mappings) {
      if (!m.is_mandatory && (!m.source_column || !m.target_field)) {
        toast.error(t('customerDb.allFieldsRequired'))
        return
      }
    }

    // Check for duplicate source columns
    const sources = mappings.map((m) => m.source_column).filter(Boolean)
    if (new Set(sources).size !== sources.length) {
      toast.error(t('customerDb.duplicateSourceColumn'))
      return
    }

    // Check for duplicate target fields
    const targets = mappings.map((m) => m.target_field).filter(Boolean)
    if (new Set(targets).size !== targets.length) {
      toast.error(t('customerDb.duplicateTargetField'))
      return
    }

    setIsSaving(false)
  }

  const isLoading = isLoadingSchema || isLoadingMappings

  // Columns already used in other mapping rows (for filtering dropdowns)
  const usedColumns = new Set(mappings.map((m) => m.source_column).filter(Boolean))

  if (isLoading) {
    return (
      <div className="bg-card border border-border/50/80 rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-6">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="text-[14px] font-semibold text-gray-500">{t('customerDb.loadingSchema')}</span>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (schemaError && columns.length === 0) {
    return (
      <div className="bg-card border border-red-100/80 rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col items-center justify-center py-8 px-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-red-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-[15px] font-bold text-foreground mb-1">
            {t('customerDb.schemaFetchFailed') || 'Could not load table columns'}
          </h3>
          <p className="text-[13px] text-gray-500 text-center max-w-md mb-1">
            {schemaError}
          </p>
          <p className="text-[12px] text-gray-400 text-center max-w-md mb-6">
            {t('customerDb.schemaFetchFailedHint') || 'Please verify your database connection settings and ensure the database server allows connections from the whitelisted IP.'}
          </p>
          <Button
            onClick={fetchSchema}
            variant="outline"
            className="rounded-xl font-bold text-[13px] h-10 px-5 border-border/80"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('customerDb.retrySchema') || 'Retry'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border/50/80 rounded-3xl p-6 lg:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-[16px] font-bold text-foreground tracking-tight">
          {t('customerDb.fieldMappings')}
        </h3>
        <p className="text-[13px] text-gray-500 mt-0.5">
          {t('customerDb.fieldMappingsDesc')}
        </p>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_32px_1fr_40px] gap-3 mb-3 px-1">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          {t('customerDb.sourceColumn')}
        </span>
        <span />
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          {t('customerDb.targetField')}
        </span>
        <span />
      </div>

      {/* Mapping rows */}
      <div className="space-y-2.5">
        {mappings.map((mapping, index) => {
          const availableColumns = columns.filter(
            (c) => c.name === mapping.source_column || !usedColumns.has(c.name) || mapping.source_column === c.name
          )

          return (
            <div
              key={index}
              className={`grid grid-cols-[1fr_32px_1fr_40px] gap-3 items-center p-3 rounded-2xl transition-all ${
                mapping.is_mandatory
                  ? 'bg-amber-50/40 border border-amber-200/40'
                  : 'bg-muted/30/50 border border-border/50/60 hover:border-border/80'
              }`}
            >
              {/* Source column dropdown */}
              <div className="relative">
                <select
                  value={mapping.source_column}
                  onChange={(e) => updateMapping(index, 'source_column', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-card border border-border/80 rounded-xl text-[13px] font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all appearance-none cursor-pointer"
                >
                  <option value="">{t('customerDb.selectColumn')}</option>
                  {availableColumns.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name} ({col.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-gray-300" strokeWidth={2.5} />
              </div>

              {/* Target field */}
              {mapping.is_mandatory ? (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-card/80 border border-amber-200/50 rounded-xl">
                  <Lock className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
                  <span className="text-[13px] font-bold text-foreground">{mapping.target_field}</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100/80 px-1.5 py-0.5 rounded-md ml-auto uppercase">
                    {t('customerDb.required')}
                  </span>
                </div>
              ) : (
                <input
                  type="text"
                  value={mapping.target_field}
                  onChange={(e) => updateMapping(index, 'target_field', e.target.value)}
                  placeholder={t('customerDb.customFieldName')}
                  className="w-full px-3.5 py-2.5 bg-card border border-border/80 rounded-xl text-[13px] font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all placeholder:text-gray-400 placeholder:font-normal"
                />
              )}

              {/* Delete button */}
              <div className="flex items-center justify-center">
                {!mapping.is_mandatory ? (
                  <button
                    onClick={() => removeMapping(index)}
                    className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                ) : (
                  <div className="w-8" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add custom mapping button */}
      <button
        onClick={addCustomMapping}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-2xl text-[13px] font-semibold text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-muted/30/50 transition-all"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        {t('customerDb.addCustomMapping')}
      </button>

      {/* Save Mappings button - anchored to bottom right */}
      <div className="flex justify-end mt-6 pt-6 border-t border-border/40">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gray-900 hover:bg-black text-white rounded-xl px-6 font-bold text-[13px] h-11 shadow-md hover:shadow-lg transition-all"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {t('customerDb.saveMappings')}
        </Button>
      </div>
    </div>
  )
}
