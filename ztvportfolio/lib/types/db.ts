export interface Invite {
  id: string
  email: string
  invite_hash: string
  signature: string
  created_at: Date
  expires_at: Date | null
  is_active: boolean
  used: boolean
  used_at?: Date | null
}

export interface Session {
  id: number
  session_id: string
  invite_hash: string
  session_fingerprint: string
  ip_address: string
  user_agent: string
  created_at: Date
  last_seen: Date
  active: boolean
}

export interface IpBinding {
  id: number
  invite_hash: string
  ip_address: string
  bound_ip: string
  bound_at: Date
}

export interface AuditLog {
  id: number
  event_type: string
  invite_hash: string | null
  session_id: string | null
  ip_address: string | null
  user_agent: string | null
  details: Record<string, any> | null
  created_at: Date
}

export interface LeakTracking {
  id: number
  session_fingerprint: string
  asset_url: string
  signature: string
  accessed_at: Date
  ip_address: string | null
  user_agent: string | null
}

export interface AdminKey {
  id: number
  public_key: string
  key_name: string | null
  created_at: Date
  is_active: boolean
}