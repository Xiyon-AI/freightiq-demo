'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Plus, X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useActiveOrg } from '@/components/providers/OrgProvider'

type TicketFormValues = z.infer<ReturnType<typeof getTicketSchema>>

const getTicketSchema = (t: (key: string) => string) => z.object({
  title: z.string().min(1, t('tickets.titleRequired')),
  category: z.string().min(1, t('tickets.categoryRequired')),
  priority: z.string().min(1, t('tickets.priorityRequired')),
  status: z.string().min(1, t('tickets.statusRequired')),
  description: z.string().optional(),
  source: z.string().optional(),
  tags: z.string().optional(),
  
  customerId: z.string().optional(),
  sessionId: z.string().optional(),
  assignedTo: z.string().optional(),
  
  contactInfo: z.string().refine((val: string) => {
    if (!val) return true;
    try {
      JSON.parse(val);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: t('common.invalidJson') }),
  metadata: z.string().refine((val: string) => {
    if (!val) return true;
    try {
      JSON.parse(val);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: t('common.invalidJson') }),
})

interface AddTicketSheetProps {
  onCreated?: () => void
}

export function AddTicketSheet({ onCreated: _onCreated }: AddTicketSheetProps) {
  const { t } = useLanguage()
  const { activeOrg } = useActiveOrg()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  void setIsSubmitting
  const ticketSchema = getTicketSchema(t)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema as any),
    defaultValues: {
      title: '',
      category: 'support',
      priority: 'medium',
      status: 'open',
      description: '',
      source: 'voice_agent',
      tags: '',
      sessionId: '',
      assignedTo: '',
      contactInfo: '{}',
      metadata: '{}',
    },
  })

  const onSubmit = async (_data: TicketFormValues) => {}

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) reset()
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button className="bg-gray-900 hover:bg-black text-white rounded-xl px-5 py-2 flex items-center gap-1.5 h-auto text-[13px] font-bold shadow-md transition-all hover:shadow-lg border border-transparent cursor-pointer">
          <Plus className="w-4 h-4" strokeWidth={3} />
          {t('tickets.addTicket')}
        </Button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content 
          className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[500px] bg-card shadow-2xl outlined-none focus:outline-none flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300 sm:rounded-l-3xl border-l border-border/50"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/50/80">
            <div>
              <Dialog.Title className="text-xl font-bold text-foreground tracking-tight">{t('tickets.addTicket')}</Dialog.Title>
              <Dialog.Description className="text-[13px] text-gray-500 mt-1">
                {t('tickets.addTicketDesc')}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
            <form id="add-ticket-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Primary Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground tracking-tight uppercase tracking-wider">{t('tickets.primaryDetails')}</h3>
                
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('tickets.subjectTitle')} <span className="text-rose-500">*</span></label>
                    <input 
                      {...register('title')}
                      className={`w-full px-4 py-2.5 bg-muted/30/50 border ${errors.title ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/20' : 'border-border/80 focus:border-gray-300 focus:ring-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 transition-all text-foreground font-medium placeholder:text-gray-400`}
                      placeholder={t('tickets.titlePlaceholder')}
                    />
                    {errors.title && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.title.message}</p>}
                  </div>

                  {/* Organization (read-only from active org context) */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('customers.organization')}</label>
                    <div className="w-full px-4 py-2.5 bg-muted/30/30 border border-border/60 rounded-xl text-sm text-neutral-600 font-medium min-h-[42px] flex items-center">
                      {activeOrg ? activeOrg.name : <span className="text-neutral-400 italic">{t('tickets.noOrgSelected')}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('tickets.category')}</label>
                      <select 
                        {...register('category')}
                        className={`w-full px-4 py-2.5 bg-muted/30/50 border ${errors.category ? 'border-rose-300 focus:border-rose-400' : 'border-border/80 focus:border-gray-300 focus:ring-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 transition-all text-foreground font-medium appearance-none`}
                      >
                        <option value="support">Support</option>
                        <option value="billing">Billing</option>
                        <option value="technical">Technical</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('tickets.priority')}</label>
                      <select 
                        {...register('priority')}
                        className={`w-full px-4 py-2.5 bg-muted/30/50 border ${errors.priority ? 'border-rose-300 focus:border-rose-400' : 'border-border/80 focus:border-gray-300 focus:ring-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 transition-all text-foreground font-medium appearance-none`}
                      >
                        <option value="low">{t('common.low')}</option>
                        <option value="medium">{t('common.medium')}</option>
                        <option value="high">{t('common.high')}</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('tickets.status')}</label>
                      <select 
                        {...register('status')}
                        className={`w-full px-4 py-2.5 bg-muted/30/50 border ${errors.status ? 'border-rose-300 focus:border-rose-400' : 'border-border/80 focus:border-gray-300 focus:ring-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 transition-all text-foreground font-medium appearance-none`}
                      >
                        <option value="open">{t('common.open')}</option>
                        <option value="in_progress">{t('common.inProgress')}</option>
                        <option value="resolved">{t('common.resolved')}</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('tickets.source')}</label>
                      <input 
                        {...register('source')}
                        className="w-full px-4 py-2.5 bg-muted/30/50 border border-border/80 focus:border-gray-300 focus:ring-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 transition-all text-foreground font-medium placeholder:text-gray-400"
                        placeholder="voice_agent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('tickets.description')}</label>
                    <textarea 
                      {...register('description')}
                      rows={4}
                      className="w-full px-4 py-3 bg-muted/30/50 border border-border/80 focus:border-gray-300 focus:ring-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 transition-all text-foreground font-medium placeholder:text-gray-400 resize-none"
                      placeholder={t('tickets.descPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('tickets.tags')}</label>
                    <input 
                      {...register('tags')}
                      className="w-full px-4 py-2.5 bg-muted/30/50 border border-border/80 focus:border-gray-300 focus:ring-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 transition-all text-foreground font-medium placeholder:text-gray-400"
                      placeholder={t('tickets.tagsPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              <hr className="border-border/50" />

              {/* Advanced / Optional Fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground tracking-tight uppercase tracking-wider">{t('tickets.advancedDetails')}</h3>
                
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Session ID</label>
                    <input
                      {...register('sessionId')}
                      className="w-full px-4 py-2.5 bg-muted/30/50 border border-border/80 focus:border-gray-300 focus:ring-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 transition-all text-foreground font-mono placeholder:text-gray-400 placeholder:font-sans"
                      placeholder="Optional session UUID"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('tickets.assignedToPlaceholder')}</label>
                    <input 
                      {...register('assignedTo')}
                      className="w-full px-4 py-2.5 bg-muted/30/50 border border-border/80 focus:border-gray-300 focus:ring-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 transition-all text-foreground font-medium placeholder:text-gray-400"
                      placeholder="UUID"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('tickets.contactInfo')}</label>
                      <textarea 
                        {...register('contactInfo')}
                        rows={3}
                        className={`w-full px-4 py-3 bg-muted/30/50 border ${errors.contactInfo ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/20' : 'border-border/80 focus:border-gray-300 focus:ring-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 transition-all text-foreground font-mono`}
                        placeholder="{\n  \x22key\x22: \x22value\x22\n}"
                      />
                      {errors.contactInfo && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.contactInfo.message}</p>}
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('tickets.metadata')}</label>
                      <textarea 
                        {...register('metadata')}
                        rows={3}
                        className={`w-full px-4 py-3 bg-muted/30/50 border ${errors.metadata ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/20' : 'border-border/80 focus:border-gray-300 focus:ring-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 transition-all text-foreground font-mono`}
                        placeholder="{\n  \x22key\x22: \x22value\x22\n}"
                      />
                      {errors.metadata && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.metadata.message}</p>}
                    </div>
                  </div>

                </div>
              </div>

            </form>
          </div>

          <div className="px-6 py-5 border-t border-border/50 flex items-center gap-3">
            <Dialog.Close asChild>
              <Button variant="outline" className="flex-1 rounded-xl font-semibold" disabled={isSubmitting}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              type="submit"
              form="add-ticket-form"
              disabled={isSubmitting}
              className="flex-1 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-sm"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t('common.saving')}</>
              ) : (
                t('tickets.saveTicket')
              )}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
