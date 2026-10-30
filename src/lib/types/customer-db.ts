// ---------------------------------------------------------------------------
// Customer DB integration types — external connections & field mappings
// ---------------------------------------------------------------------------

export type ConnectionStatus = "untested" | "connected" | "failed";

export type DbType = "mysql"; // future: "postgres" | "mssql"

export interface ExternalDbConnection {
  id: string;
  organization_id: string;
  db_type: DbType;
  host: string;
  port: number;
  username: string;
  password_encrypted: string;
  database_name: string;
  table_or_view: string;
  connection_status: ConnectionStatus;
  last_tested_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Connection as returned by GET (password masked, never plaintext) */
export interface ExternalDbConnectionMasked
  extends Omit<ExternalDbConnection, "password_encrypted"> {
  password_display: string; // "••••••••"
}

export interface CustomerFieldMapping {
  id: string;
  connection_id: string;
  organization_id: string;
  source_column: string;
  target_field: string;
  is_mandatory: boolean;
  display_order: number;
  created_at: string;
}

/** Column info returned by the Customer Data Plane schema endpoint */
export interface ColumnInfo {
  name: string;
  type: string;
}

/** Request body for saving/updating mappings */
export interface MappingSavePayload {
  mappings: {
    source_column: string;
    target_field: string;
    is_mandatory: boolean;
    display_order: number;
  }[];
}

/** Paginated query result from Customer Data Plane */
export interface CustomerDataQueryResult {
  rows: Record<string, string | number | null>[];
  total: number;
  page: number;
  page_size: number;
}

/** Connection test result */
export interface ConnectionTestResult {
  status: "connected" | "failed";
  message: string;
  row_count?: number;
}

/** Schema result from Customer Data Plane */
export interface SchemaResult {
  columns: ColumnInfo[];
  table_or_view: string;
}

/** Form values for connection drawer */
export interface ConnectionFormValues {
  host: string;
  port: number;
  username: string;
  password: string;
  database_name: string;
  table_or_view: string;
}

/** The 3 mandatory system fields */
export const MANDATORY_FIELDS = ["name", "email", "phone"] as const;
export type MandatoryField = (typeof MANDATORY_FIELDS)[number];
