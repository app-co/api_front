export interface IPayment {
  id?: number
  user_id: number 
  amount: number
  external_id: string 
  status: string 
  expiration_date: Date | string
  updated_at?: Date | string
  created_at?: Date | string
}

export interface ICreatePayment {
  id?: number 
  document: string
  value: string 
  id_bonus: number
}