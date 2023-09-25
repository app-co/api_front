export interface IUser {
  id?: number
  wallet_id?: number
  referral_id?: number
  referral_username?: string
  referral_settings_id?: number
  username: string
  created_at?: Date | string
  updated_at?: Date | string
  cpa_collected?: string
  is_referrer?: boolean
  born_date?: string
  document?: string
  document_type?: string
  email: string
  full_name?: string
  password?: string
  phone?: string
  reset_password_token?: string
  is_bann?: boolean
  is_admin?: boolean
}

export interface IUserUpdate {
  id: number
  wallet_id?: number
  referral_id?: number
  referral_settings_id?: number
  username?: string
  created_at?: Date | string
  updated_at?: Date | string
  cpa_collected?: boolean
  is_referrer?: boolean
  born_date?: string
  document?: string
  document_type?: string
  email?: string
  full_name?: string
  password?: string
  phone?: string
  reset_password_token?: string
  is_bann?: boolean
  is_admin?: boolean
}