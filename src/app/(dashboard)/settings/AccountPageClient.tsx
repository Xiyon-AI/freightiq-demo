'use client'

import { useState, useEffect, useRef } from 'react'
import { Pencil, Save, X, Trash2, Loader2, Camera, Plus, Building2, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { SecuritySettings } from './SecuritySettings'

interface Profile {
  id?: string
  full_name?: string
  first_name?: string
  last_name?: string
  phone?: string
  bio?: string
  gender?: string
  dob?: string
  national_id?: string
  country?: string
  city_state?: string
  postal_code?: string
  tax_id?: string
  avatar_url?: string
}

interface Organization {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  created_at: string
  role: string
}

interface PendingInvitation {
  id: string
  organizationId: string
  role: string
  status: string
  invitedAt: string
  organization: {
    id: string
    name: string
    slug: string
    plan: string
    status: string
  }
}

interface TeamMember {
  id: string
  organizationId: string
  userId: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  role: string
  status: string
  acceptedAt: string | null
  createdAt: string
}

interface OrganizationVoiceSettings {
  organizationId: string
  agentInstanceId: string | null
  updatedAt: string | null
  recording: {
    enabled: boolean
    disclosures: Record<string, string>
    source: 'organization' | 'platform'
  }
  allowInterruptions: {
    enabled: boolean
    source: 'organization' | 'platform'
  }
}

interface OrganizationVoiceSettingsForm {
  recordingEnabled: boolean
  allowInterruptions: boolean
  disclosures: {
    en: string
    bn: string
  }
}

const EMPTY_ORGANIZATION_VOICE_SETTINGS_FORM: OrganizationVoiceSettingsForm = {
  recordingEnabled: false,
  allowInterruptions: false,
  disclosures: {
    en: '',
    bn: '',
  },
}

function toOrganizationVoiceSettingsForm(
  settings?: OrganizationVoiceSettings | null
): OrganizationVoiceSettingsForm {
  if (!settings) {
    return EMPTY_ORGANIZATION_VOICE_SETTINGS_FORM
  }

  return {
    recordingEnabled: settings.recording.enabled,
    allowInterruptions: settings.allowInterruptions.enabled,
    disclosures: {
      en: settings.recording.disclosures.en ?? '',
      bn: settings.recording.disclosures.bn ?? '',
    },
  }
}







interface AccountPageClientProps {
  initialProfile: Profile
  userEmail: string
  initialOrganizations: Organization[]
}

export default function AccountPageClient({ initialProfile, userEmail, initialOrganizations }: AccountPageClientProps) {
  const { t } = useLanguage()
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Profile>(initialProfile)
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations)
  const [isCreatingOrg, setIsCreatingOrg] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [showNewOrgInput, setShowNewOrgInput] = useState(false)
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null)
  const [editingOrgName, setEditingOrgName] = useState('')
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null)
  const [savingOrgId, setSavingOrgId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [isInvitingMember, setIsInvitingMember] = useState(false)
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
  const [resendingMemberId, setResendingMemberId] = useState<string | null>(null)
  const [acceptingInvitationId, setAcceptingInvitationId] = useState<string | null>(null)
  const [rejectingInvitationId, setRejectingInvitationId] = useState<string | null>(null)
  const [editedVoiceSettings, setEditedVoiceSettings] = useState<OrganizationVoiceSettingsForm>(
    EMPTY_ORGANIZATION_VOICE_SETTINGS_FORM
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeOrganizationId = organizations[0]?.id ?? null
  const activeOrganization = organizations[0] ?? null
  const canEditVoiceSettings = activeOrganization?.role === 'owner' || activeOrganization?.role === 'admin'
  const canManageTeam = activeOrganization?.role === 'owner' || activeOrganization?.role === 'admin'
  const voiceSettings: OrganizationVoiceSettings | null = {
    organizationId: activeOrganizationId ?? 'demo-org',
    agentInstanceId: null,
    updatedAt: '2026-10-30T00:00:00.000Z',
    recording: { enabled: false, disclosures: { en: '', bn: '' }, source: 'platform' },
    allowInterruptions: { enabled: true, source: 'platform' },
  }
  const invitations: PendingInvitation[] = []
  const teamMembers: TeamMember[] = [{ id: 'demo-member', organizationId: 'demo-org', userId: 'demo-user', email: userEmail, fullName: 'Alex Morgan', avatarUrl: null, role: 'admin', status: 'active', acceptedAt: '2026-01-15T12:00:00.000Z', createdAt: '2026-01-15T12:00:00.000Z' }]

  void [setProfile, setIsSaving, setIsDeleting, setIsUploadingAvatar, setIsCreatingOrg, setDeletingOrgId, setSavingOrgId, setIsInvitingMember, setUpdatingMemberId, setRemovingMemberId, setResendingMemberId, setAcceptingInvitationId, setRejectingInvitationId, editedVoiceSettings]
  void canEditVoiceSettings
  void activeOrganizationId

  useEffect(() => {
    setOrganizations(initialOrganizations)
  }, [initialOrganizations])

  useEffect(() => {
    setEditedVoiceSettings(toOrganizationVoiceSettingsForm(voiceSettings))
  }, [voiceSettings])

  const handleEdit = () => {
    setIsEditing(true)
    setEditedProfile(profile)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProfile(profile)
  }

  const handleSave = async () => {}

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (_e: React.ChangeEvent<HTMLInputElement>) => {}

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {}

  const handleInputChange = (field: keyof Profile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCreateOrg = async () => {}

  const handleUpdateOrg = async (_orgId: string) => {}

  const handleDeleteOrg = async (_orgId: string) => {}







  const handleAcceptInvitation = async (_invitation: PendingInvitation) => {}

  const handleRejectInvitation = async (_invitation: PendingInvitation) => {}

  const handleInviteMember = async () => {}

  const handleResendTeamInvitation = async (_member: TeamMember) => {}

  const handleUpdateMemberRole = async (_member: TeamMember, _nextRole: 'admin' | 'member') => {}

  const handleRemoveMember = async (_member: TeamMember) => {}

  const handleVoiceSettingsSave = async () => {}
  void handleVoiceSettingsSave

  const displayProfile = isEditing ? editedProfile : profile
  const activeTeamMembers = teamMembers.filter((member) => member.status === 'active')
  const pendingTeamInvitations = teamMembers.filter((member) => member.status === 'invited')

  const renderTabButton = (id: string, label: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`shrink-0 w-auto md:w-full text-center md:text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
        activeTab === id
          ? 'bg-foreground text-background shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex-1 w-full p-4 lg:p-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('settings.title')}</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 flex md:flex-col gap-2 md:gap-0 md:space-y-1 overflow-x-auto pb-4 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {renderTabButton('profile', t('settings.myProfile'))}
            {renderTabButton('password', t('settings.passwordSecurity'))}
            {renderTabButton('organizations', t('settings.organizations'))}
            {renderTabButton('invitations', t('settings.invitations') || 'Invitations')}
            {renderTabButton('team_member', t('settings.teamMember'))}
            {renderTabButton('billing', t('settings.billing'))}
            {renderTabButton('data_export', t('settings.dataExport'))}
            
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="shrink-0 w-auto md:w-full text-center md:text-left px-4 py-2.5 md:mt-4 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center justify-center md:justify-start gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {isDeleting ? t('settings.deleting') : t('settings.deleteAccount')}
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 pb-20">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground tracking-tight mb-2">{t('settings.myProfile')}</h2>
                
                {/* Profile Card */}
                <div className="bg-card rounded-3xl border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 md:p-8">
                  <div className="flex flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center flex-shrink-0 relative z-10">
                          <img 
                            src={displayProfile.avatar_url || "https://api.dicebear.com/9.x/notionists/svg?seed=Felix"} 
                            alt={displayProfile.full_name || t('account.fullName') || 'Full Name'} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <button
                          onClick={handleAvatarClick}
                          disabled={isUploadingAvatar}
                          className="absolute inset-0 z-20 w-16 h-16 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isUploadingAvatar ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          ) : (
                            <Camera className="w-5 h-5 text-white" />
                          )}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground tracking-tight leading-tight">
                          {displayProfile.full_name || t('account.fullName') || 'Your Name'}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 mt-0.5">
                          {displayProfile.bio || t('account.noBio') || 'No bio'}
                        </p>
                        <p className="text-sm font-medium text-gray-400 mt-0.5">
                          {[displayProfile.city_state, displayProfile.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 mt-1 sm:mt-0">
                      {!isEditing ? (
                        <Button 
                          onClick={handleEdit}
                          className="bg-accent/10 hover:bg-accent/20 text-accent-foreground dark:text-white rounded-xl px-5 py-2 flex items-center gap-2 h-auto text-sm font-medium transition-colors shadow-none"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          {t('account.edit') || 'Edit'}
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button onClick={handleCancel} variant="outline" className="rounded-xl px-4 py-2 h-auto text-sm font-medium">
                            <X className="w-3.5 h-3.5" />
                            {t('account.cancel') || 'Cancel'}
                          </Button>
                          <Button onClick={handleSave} disabled={isSaving} className="bg-gray-900 hover:bg-black text-white rounded-xl px-5 py-2 h-auto text-sm font-medium">
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {t('account.save') || 'Save'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Information Card */}
                <div className="bg-card rounded-3xl border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 md:p-8">
                  <h3 className="text-lg font-bold text-foreground tracking-tight mb-6">{t('account.personalDetails') || 'Personal Information'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <InputField label={t('account.firstName') || 'First Name'} value={displayProfile.first_name || ""} onChange={(value) => handleInputChange('first_name', value)} readOnly={!isEditing} />
                    <InputField label={t('account.lastName') || 'Last Name'} value={displayProfile.last_name || ""} onChange={(value) => handleInputChange('last_name', value)} readOnly={!isEditing} />
                    <InputField label={t('account.emailAddress') || 'Email Address'} value={userEmail} type="email" readOnly={true} />
                    <InputField label={t('account.phone') || 'Phone'} value={displayProfile.phone || ""} onChange={(value) => handleInputChange('phone', value)} type="tel" readOnly={!isEditing} />
                    <InputField label={t('account.bio') || 'Bio'} value={displayProfile.bio || ""} onChange={(value) => handleInputChange('bio', value)} readOnly={!isEditing} />
                    <InputField label={t('account.gender') || 'Gender'} value={isEditing ? (displayProfile.gender || "") : (displayProfile.gender ? (t(`common.${displayProfile.gender.toLowerCase()}`) || displayProfile.gender) : "")} onChange={(value) => handleInputChange('gender', value)} readOnly={!isEditing} />
                    <InputField label={t('account.dateOfBirth') || 'Date of Birth'} value={displayProfile.dob || ""} onChange={(value) => handleInputChange('dob', value)} type="date" readOnly={!isEditing} />
                    <InputField label={t('account.nationalId') || 'National ID'} value={displayProfile.national_id || ""} onChange={(value) => handleInputChange('national_id', value)} readOnly={!isEditing} />
                  </div>
                </div>

                {/* Address Card */}
                <div className="bg-card rounded-3xl border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 md:p-8">
                  <h3 className="text-lg font-bold text-foreground tracking-tight mb-6">{t('account.address') || 'Address'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <InputField label={t('account.country') || 'Country'} value={displayProfile.country || ""} onChange={(value) => handleInputChange('country', value)} readOnly={!isEditing} />
                    <InputField label={t('account.cityState') || 'City/State'} value={displayProfile.city_state || ""} onChange={(value) => handleInputChange('city_state', value)} readOnly={!isEditing} />
                    <InputField label={t('account.postalCode') || 'Postal Code'} value={displayProfile.postal_code || ""} onChange={(value) => handleInputChange('postal_code', value)} readOnly={!isEditing} />
                    <InputField label={t('account.taxId') || 'TAX ID'} value={displayProfile.tax_id || ""} onChange={(value) => handleInputChange('tax_id', value)} readOnly={!isEditing} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'organizations' && (
              <div className="bg-card rounded-3xl border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    {t('account.organizations') || 'Organizations'}
                  </h3>
                  {!showNewOrgInput && (
                    <Button
                      onClick={() => setShowNewOrgInput(true)}
                      className="bg-gray-900 hover:bg-black text-white rounded-xl px-5 py-2 flex items-center gap-2 h-auto text-sm font-medium transition-colors shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t('account.newOrganization') || 'New Organization'}
                    </Button>
                  )}
                </div>

                {/* New org input */}
                {showNewOrgInput && (
                  <div className="flex items-center gap-3 mb-6 p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl">
                    <input
                      type="text"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateOrg()}
                      placeholder={t('account.orgNamePlaceholder') || 'Organization Name'}
                      className="flex-1 rounded-xl border border-border/80 px-4 py-2.5 text-sm font-medium text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all placeholder:text-gray-400"
                      autoFocus
                    />
                    <Button
                      onClick={handleCreateOrg}
                      disabled={isCreatingOrg || !newOrgName.trim()}
                      className="bg-gray-900 hover:bg-black text-white rounded-xl px-5 py-2 flex items-center gap-2 h-auto text-sm font-medium transition-colors shadow-sm"
                    >
                      {isCreatingOrg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      {t('account.create') || 'Create'}
                    </Button>
                    <Button
                      onClick={() => { setShowNewOrgInput(false); setNewOrgName('') }}
                      variant="outline"
                      className="rounded-xl px-4 py-2 h-auto text-sm font-medium"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}

                {/* Org list */}
                <div className="space-y-3">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className="flex items-center justify-between p-4 bg-muted/30/80 border border-border/50 rounded-xl group hover:border-border transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        {editingOrgId === org.id ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={editingOrgName}
                              onChange={(e) => setEditingOrgName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleUpdateOrg(org.id)}
                              className="flex-1 rounded-xl border border-border/80 px-4 py-2 text-sm font-medium text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all"
                              autoFocus
                            />
                            <Button
                              onClick={() => handleUpdateOrg(org.id)}
                              disabled={savingOrgId === org.id || !editingOrgName.trim()}
                              className="bg-gray-900 hover:bg-black text-white rounded-full px-4 py-1.5 h-auto text-xs font-medium shadow-sm"
                            >
                              {savingOrgId === org.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            </Button>
                            <Button
                              onClick={() => { setEditingOrgId(null); setEditingOrgName('') }}
                              variant="outline"
                              className="rounded-full px-4 py-1.5 h-auto text-xs"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-semibold text-foreground truncate">{org.name}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {organizations[0]?.id === org.id && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-300 text-gray-900">
                                  {t('account.current') || 'Current'}
                                </span>
                              )}
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-900 text-yellow-300 capitalize">
                                {t(`common.${org.role.toLowerCase()}`) || org.role}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700 capitalize">
                                {t(`common.${org.plan.toLowerCase()}`) || org.plan}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500 capitalize">
                                {t(`common.${org.status.toLowerCase()}`) || org.status}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {editingOrgId !== org.id && (
                        <div className="flex items-center gap-2 ml-4">
                          {org.role === 'owner' && (
                            <div className="flex items-center gap-1.5 opacity-0 md:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditingOrgId(org.id); setEditingOrgName(org.name) }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Rename"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {organizations.length > 1 && (
                                <button
                                  onClick={() => handleDeleteOrg(org.id)}
                                  disabled={deletingOrgId === org.id}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Delete"
                                >
                                  {deletingOrgId === org.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {organizations.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">{t('account.noOrgs') || 'No organizations found.'}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'invitations' && (
              <div className="bg-card rounded-3xl border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 md:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground tracking-tight">
                      {t('settings.invitations') || 'Invitations'}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('settings.invitationsDescription') || 'Review organization invitations sent to your account and decide whether to join or decline them.'}
                    </p>
                  </div>
                  <Badge variant="outline" className="self-start capitalize">
                    {invitations.length} {invitations.length === 1 ? (t('settings.invitationSingle') || 'pending invite') : (t('settings.invitationPlural') || 'pending invites')}
                  </Badge>
                </div>

                {invitations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 px-6 py-12 text-center">
                    <p className="text-sm font-medium text-foreground">
                      {t('settings.noInvitationsTitle') || 'No pending invitations'}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t('settings.noInvitationsDescription') || 'When another organization invites you, it will appear here until you accept or reject it.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitations.map((invitation) => {
                      const isAccepting = acceptingInvitationId === invitation.id
                      const isRejecting = rejectingInvitationId === invitation.id
                      const isMutating = isAccepting || isRejecting

                      return (
                        <div
                          key={invitation.id}
                          className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-foreground truncate">
                                  {invitation.organization.name}
                                </p>
                                <Badge variant="secondary" className="capitalize">
                                  {t(`common.${invitation.role.toLowerCase()}`) || invitation.role}
                                </Badge>
                                <Badge variant="outline">
                                  {t('common.pending') || 'Pending'}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {t('settings.invitationMessage') || 'You have been invited to join this organization.'}
                              </p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                {t('settings.invitedAtLabel') || 'Sent'} {new Date(invitation.invitedAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleAcceptInvitation(invitation)}
                                disabled={isMutating}
                                className="bg-[#FDEB86] text-black hover:bg-[#FDEB86]/90"
                              >
                                {isAccepting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : null}
                                {t('settings.acceptInvitation') || 'Accept'}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectInvitation(invitation)}
                                disabled={isMutating}
                              >
                                {isRejecting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : null}
                                {t('settings.rejectInvitation') || 'Reject'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'team_member' && (
              <div className="bg-card rounded-3xl border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 md:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground tracking-tight">
                      {t('settings.teamMember')}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('settings.teamDescription') || `Manage members and pending invitations for ${activeOrganization?.name ?? 'your active organization'}.`}
                    </p>
                  </div>
                  {activeOrganization && (
                    <Badge variant="outline" className="self-start capitalize">
                      {t(`common.${activeOrganization.role.toLowerCase()}`) || activeOrganization.role}
                    </Badge>
                  )}
                </div>

                {!activeOrganizationId ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 px-6 py-10 text-center">
                    <p className="text-sm font-medium text-foreground">
                      {t('settings.teamNoOrganizationTitle') || 'No active organization selected'}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t('settings.teamNoOrganizationDescription') || 'Choose or create an active organization before managing team members.'}
                    </p>
                  </div>
                ) : !canManageTeam ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 px-6 py-10 text-center">
                    <p className="text-sm font-medium text-foreground">
                      {t('settings.teamManagePermissionTitle') || 'Team management is limited to organization owners and admins'}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t('settings.teamManagePermissionDescription') || 'Switch to an organization where you have admin access to invite members, update roles, or remove access.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {t('settings.teamInviteEmail') || 'Member email'}
                          </label>
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(event) => setInviteEmail(event.target.value)}
                            placeholder={t('settings.teamInviteEmailPlaceholder') || 'teammate@example.com'}
                            className="w-full rounded-xl border border-border/80 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400"
                          />
                        </div>
                        <div className="space-y-1.5 lg:w-44">
                          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {t('settings.teamInviteRole') || 'Role'}
                          </label>
                          <select
                            value={inviteRole}
                            onChange={(event) => setInviteRole(event.target.value as 'admin' | 'member')}
                            className="w-full rounded-xl border border-border/80 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400"
                          >
                            <option value="member">{t('common.member') || 'Member'}</option>
                            <option value="admin">{t('common.admin') || 'Admin'}</option>
                          </select>
                        </div>
                        <Button
                          type="button"
                          onClick={handleInviteMember}
                          disabled={isInvitingMember || !inviteEmail.trim()}
                          className="bg-[#FDEB86] text-black hover:bg-[#FDEB86]/90"
                        >
                          {isInvitingMember ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                          {t('settings.teamInviteAction') || 'Invite member'}
                        </Button>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {t('settings.teamInviteHelper') || 'New invitees finish account setup first, then accept the invitation from inside the platform.'}
                      </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <h4 className="text-sm font-semibold text-foreground">
                              {t('settings.teamActiveMembers') || 'Active members'}
                            </h4>
                            <Badge variant="outline">{activeTeamMembers.length}</Badge>
                          </div>
                          {activeTeamMembers.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 px-6 py-8 text-sm text-muted-foreground text-center">
                              {t('settings.teamNoMembers') || 'No active team members yet.'}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {activeTeamMembers.map((member) => {
                                const isUpdating = updatingMemberId === member.id
                                const isRemoving = removingMemberId === member.id
                                const nextRole = member.role === 'admin' ? 'member' : 'admin'
                                const isOwner = member.role === 'owner'
                                const isSelf = member.userId === initialProfile.id
                                const showRoleToggle = !isOwner && !isSelf
                                const showRemove = !isOwner

                                return (
                                  <div key={member.id} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className="text-sm font-semibold text-foreground truncate">
                                            {member.fullName || member.email || 'Team member'}
                                          </p>
                                          <Badge variant="secondary" className="capitalize">
                                            {t(`common.${member.role.toLowerCase()}`) || member.role}
                                          </Badge>
                                          <Badge variant="outline">
                                            {t('common.active') || 'Active'}
                                          </Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">{member.email}</p>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                          {t('settings.teamJoinedLabel') || 'Joined'}{' '}
                                          {new Date(member.acceptedAt || member.createdAt).toLocaleString()}
                                        </p>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-2">
                                        {showRoleToggle && (
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleUpdateMemberRole(member, nextRole)}
                                            disabled={isUpdating || isRemoving}
                                          >
                                            {isUpdating ? (
                                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : null}
                                            {nextRole === 'admin'
                                              ? (t('settings.teamMakeAdmin') || 'Make admin')
                                              : (t('settings.teamMakeMember') || 'Make member')}
                                          </Button>
                                        )}
                                        {showRemove && (
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRemoveMember(member)}
                                            disabled={isUpdating || isRemoving}
                                          >
                                            {isRemoving ? (
                                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                              <Trash2 className="h-3.5 w-3.5" />
                                            )}
                                            {isSelf
                                              ? (t('settings.teamLeaveOrgAction') || 'Leave')
                                              : (t('settings.teamRemoveMemberAction') || 'Remove')}
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <h4 className="text-sm font-semibold text-foreground">
                              {t('settings.teamPendingInvites') || 'Pending invitations'}
                            </h4>
                            <Badge variant="outline">{pendingTeamInvitations.length}</Badge>
                          </div>
                          {pendingTeamInvitations.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 px-6 py-8 text-sm text-muted-foreground text-center">
                              {t('settings.teamNoPendingInvites') || 'No pending invitations for this organization.'}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {pendingTeamInvitations.map((member) => {
                                const isUpdating = updatingMemberId === member.id
                                const isRemoving = removingMemberId === member.id
                                const isResending = resendingMemberId === member.id
                                const nextRole = member.role === 'admin' ? 'member' : 'admin'

                                return (
                                  <div key={member.id} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className="text-sm font-semibold text-foreground truncate">
                                            {member.fullName || member.email || 'Pending invite'}
                                          </p>
                                          <Badge variant="secondary" className="capitalize">
                                            {t(`common.${member.role.toLowerCase()}`) || member.role}
                                          </Badge>
                                          <Badge variant="outline">
                                            {t('common.pending') || 'Pending'}
                                          </Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">{member.email}</p>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                          {t('settings.invitedAtLabel') || 'Sent'} {new Date(member.createdAt).toLocaleString()}
                                        </p>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleResendTeamInvitation(member)}
                                          disabled={isUpdating || isRemoving || isResending}
                                        >
                                          {isResending ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                          ) : null}
                                          {t('settings.teamResendInvite') || 'Resend'}
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleUpdateMemberRole(member, nextRole)}
                                          disabled={isUpdating || isRemoving || isResending}
                                        >
                                          {isUpdating ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                          ) : null}
                                          {nextRole === 'admin'
                                            ? (t('settings.teamMakeAdmin') || 'Make admin')
                                            : (t('settings.teamMakeMember') || 'Make member')}
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleRemoveMember(member)}
                                          disabled={isUpdating || isRemoving || isResending}
                                        >
                                          {isRemoving ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                          ) : (
                                            <X className="h-3.5 w-3.5" />
                                          )}
                                          {t('settings.teamCancelInviteAction') || 'Cancel invite'}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'password' && <SecuritySettings />}

            {['billing', 'data_export'].includes(activeTab) && (
              <div className="bg-card rounded-3xl border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 md:p-8 flex items-center justify-center min-h-[400px]">
                <p className="text-gray-400 font-medium">{t('settings.comingSoon')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-foreground">
                {t('settings.deleteAccountTitle')}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-gray-600 leading-relaxed">
              {t('settings.deleteAccountDesc')}
            </AlertDialogDescription>
            <div className="mt-3 space-y-3">
              <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-700">
                <li>{t('settings.deleteAccountItem1')}</li>
                <li>{t('settings.deleteAccountItem2')}</li>
                <li>{t('settings.deleteAccountItem3')}</li>
                <li>{t('settings.deleteAccountItem4')}</li>
              </ul>
              <div className="text-sm font-semibold text-foreground">
                {t('settings.deleteAccountConfirm')}
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="rounded-xl">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              {t('settings.deleteAccountConfirmBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface InputFieldProps {
  label: string
  value: string
  onChange?: (value: string) => void
  type?: string
  readOnly?: boolean
}

function InputField({ label, value, onChange, type = "text", readOnly = false }: InputFieldProps) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-gray-500 mb-1.5">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-xl border border-border/80 px-4 py-2.5 text-sm font-medium text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all placeholder:text-gray-400 ${readOnly ? 'cursor-not-allowed bg-muted/30' : ''}`}
        readOnly={readOnly}
      />
    </div>
  )
}
