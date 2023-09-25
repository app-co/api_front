import { makeUser } from "@modules/users/factories";
import { Request, Response } from "express";

export class AuthController {
  async authWithGoogle(req: Request, res: Response) {
    const {email, username, referral_username} = req.body

    const {makeAuth} = makeUser()

    const auth = await makeAuth.loginGoogle({email, username, referral_username})

    return res.json(auth).status(201)
  }

  async authPainel(req: Request, res: Response) {
    const {email, password} = req.body

    const {makeAuth} = makeUser()

    const auth = await makeAuth.loginPainel({email, password})

    return res.json(auth).status(201)
  }

  async authUser(req: Request, res: Response) {
    const {email, password} = req.body

    const {makeAuth} = makeUser()

    const auth = await makeAuth.loginUser({email, password})

    return res.json(auth).status(201)
  }
}