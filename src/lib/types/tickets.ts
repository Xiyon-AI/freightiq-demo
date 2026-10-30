export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: string | null;
  status: string | null;
  source: string;
  organization_id: string;
  session_id: string | null;
  customer_id: string | null;
  assigned_to: string | null;
  contact_info: { name?: string; email?: string; phone?: string; number?: string } | null;
  metadata: Record<string, unknown>;
  tags: string[];
  resolution: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  ticket_email_notification?: { status?: string; recipient_email?: string | null } | null;
}

export interface TicketEmailConfig {
  enabled: boolean;
  to_email: string | null;
  fallbackRecipientEmail: string | null;
  effectiveRecipientEmail: string | null;
}
