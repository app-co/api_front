import { makeUser } from '@modules/users/factories'
import { AppError } from '@shared/errors/AppError'
import { type Request, type Response } from 'express'

export class UserController {
  async create(req: Request, res: Response) {
    const {username, email, password, referral_username} = req.body

    const {make} = makeUser()
    const create = await make.create({username, email, password, referral_username}) 
    return res.json(create).status(201)

  }

  async listAll(req: Request, res: Response) {

    const {make} = makeUser()
    const list = await make.listAll()

    return res.json(list).status(201)
  }

  async update(req: Request, res: Response) {

    const {
      id,
      wallet_id,
      referral_id,
      referral_settings_id,
      username,
      created_at,
      updated_at,
      cpa_collected,
      is_referrer,
      born_date,
      document,
      document_type,
      email,
      full_name,
      password,
      phone,
      reset_password_token,
      is_bann,
      is_admin,
    } = req.body

    const {make} = makeUser()

    const update = await make.update({
      id,
      wallet_id,
      referral_id,
      referral_settings_id,
      username,
      created_at,
      updated_at,
      cpa_collected,
      is_referrer,
      born_date,
      document,
      document_type,
      email,
      full_name,
      password,
      phone,
      reset_password_token,
      is_bann,
      is_admin,
    })


    return res.json(update).status(201)
  }
}