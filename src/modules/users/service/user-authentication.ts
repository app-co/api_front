import { AppError } from "@shared/errors/AppError";
import { IRepoUser } from "../repositories/repo-user";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { makeUser } from "../factories";

interface ILoginUser {
  email: string
  password: string
}

interface ILoginGoogle {
  email: string
  username: string
  referral_username: string
}

const ACCESS_TOKEN_EXPIRES_IN = 3600 * 8 // 15 minutos
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 // 7 dias


export class UserAuthentication {
  constructor (
    private repoUser: IRepoUser
  ) {}

  async loginPainel(data: ILoginUser): Promise<any> {
    const user = await this.repoUser.listByEmail(data.email)

    if(!user) {
      throw new AppError('Credenciais inválidas', 401)
    }


    const isPasswordValid = await compare(data.password, user.password)

    if (!isPasswordValid) {
      throw new AppError('Credenciais inválidas.')
    }

    if (!user.is_admin && !user.is_referrer) {
      throw new AppError('Usuário sem permissão para login', 401)
    }

    if (user.is_bann) {
      throw new AppError('Usuário banido.', 401)
    }

    const accessTokenPayload = { id: user.id, email: user.email }
    const token = sign(accessTokenPayload, process.env.TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    })

    const refreshTokenPayload = { id: user.id }
    const refreshToken = sign(
      refreshTokenPayload,
      process.env.TOKEN_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
      }
    )

    const accessExpiresInMinutes = ACCESS_TOKEN_EXPIRES_IN / 60 // Definir o tempo de expiração do access token em minutos
    const refreshExpiresInMinutes = REFRESH_TOKEN_EXPIRES_IN / 60 // Definir o tempo de expiração do refresh token em minutos

    return {
      user, token, experesIn: accessExpiresInMinutes, refreshToken, refreshExpiresIn: refreshExpiresInMinutes
    }
  }

  async loginGoogle(data: ILoginGoogle): Promise<any> {
    const {make} = makeUser()
    const user = await this.repoUser.listByEmail(data.email)

    if(user && user.is_bann) {
      throw new AppError('Usuário banido', 401)
    }

    const referal = await this.repoUser.listByUsername(data.referral_username)
    const referaId = referal ? referal.id : null

    const newUser = !user && await make.create(
      {
        referral_id: referaId, 
        email: data.email, 
        username: data.username
      }
    )

    const accessTokenPayload = {
      id: user ? user.id : newUser.id,
      email: user ? user.email : newUser.email
    }
    const token = sign(accessTokenPayload, process.env.TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    })

    const refreshTokenPayload = { id: user ? user.id : newUser.id }
    const refreshToken = sign(
      refreshTokenPayload,
      process.env.TOKEN_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
      }
    )

    const accessExpiresInMinutes = ACCESS_TOKEN_EXPIRES_IN / 60 // Definir o tempo de expiração do access token em minutos
    const refreshExpiresInMinutes = REFRESH_TOKEN_EXPIRES_IN / 60 // Definir o tempo de expiração do refresh token em minutos

    return {
      user: newUser || user,
      token,
      expiresIn: accessExpiresInMinutes,
      refreshToken,
      refreshTokenExpireIn: refreshExpiresInMinutes
    }
  }

  async loginUser(data: ILoginUser): Promise<any> {
    const user = await this.repoUser.listByEmail(data.email)

    if(!user) {
      throw new AppError('Credenciais inválidas.', 401)
    }

    const isValidPassword = compare(user.password, data.password)

    if(!isValidPassword) {
      throw new AppError('Credenciais inválidas.', 401)
    }

    const accessTokenPayload = { id: user.id, email: user.email }
    const token = sign(accessTokenPayload, process.env.TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    })

    const refreshTokenPayload = { id: user.id }
    const refreshToken = sign(
      refreshTokenPayload,
      process.env.TOKEN_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
      }
    )

    const accessExpiresInMinutes = ACCESS_TOKEN_EXPIRES_IN / 60 // Definir o tempo de expiração do access token em minutos
    const refreshExpiresInMinutes = REFRESH_TOKEN_EXPIRES_IN / 60 // Definir o tempo de expiração do refresh token em minutos

    return {
      user,
      token,
      expiresIn: accessExpiresInMinutes,
      refreshToken,
      refreshTokenExpireIn: refreshExpiresInMinutes
    }
  }
}