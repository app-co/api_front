import { type Prisma, type user } from '@prisma/client'
import { type IRepoUser } from '../repositories/repo-user'
import WalletService from 'services/WalletService'
import formatUsername from '@utils/formatUser'
import { hash } from 'bcrypt'
import { AppError } from '@shared/errors/AppError'
import { IUser, type IUserUpdate } from '../dtos'
import { prisma } from '@shared/client'

export class UserService {
  constructor(
    private  repoUser: IRepoUser
  ) {}

  async create(data: IUser): Promise<user> {
    const findUsername = await this.repoUser.listByUsername(data.username)
    const findByEmail = await this.repoUser.listByEmail(data.email)
    const formattedUsername = formatUsername(data.username)
    let validateReferral = null

    if (formattedUsername.length < 4) {
      throw new Error('O nome de usuário deve ter no mínimo 4 caracteres.')
    }

    if(findUsername) {
      throw new AppError('Nome de usuário já cadastrado')
    }

    if(findByEmail) {
      throw new AppError('Email já cadastrado')
    }

    if (data.password && data.password.length < 6) {
      throw new Error('A senha precisa conter no mínimo 6 caracteres.')
    }

    if(data.referral_username) {
      const referal = await prisma.user.findFirst({where: {username: data.referral_username}})

      if(referal) {
        validateReferral = referal.id
      }
    }

    const saltRounds = 10
    const hashedPassword = data.password
      ? await hash(data.password, saltRounds)
      : ''

    const newWallet = await WalletService.create()

    const newUser = await this.repoUser.create({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      referral_id: validateReferral,
      wallet_id: newWallet.id,
      cpa_collected: false
    })

    return newUser
  }

  async update(data: IUserUpdate): Promise<user> {
    const user = await this.repoUser.listById(data.id)
    const allUsers = await this.repoUser.listAll()

    const anotherUser = allUsers.find(filter => {
      if(filter.id !== user.id) {
        return filter
      }else {
        return null
      }
      
    })
  

    if(!user) {
      throw new AppError('Usuário não encontrado')
    }

    let pass = null

    if (data.password ) {

      pass = await hash(data.password, 10)
    }

    if(data.email && anotherUser?.email === data.email) {
      throw new AppError('Email já cadastrado')
    }


    if(data.username && anotherUser?.username === data.username) {
      throw new AppError('Nome de usuário ja cadastrado')
    }
    const update = {
      ...data,
      password: pass
    }

    console.log(update)

    const updateUser = await this.repoUser.update(update)

    return updateUser

  }

  async listAll(): Promise<user[]> {
    const listAllUsers = await this.repoUser.listAll()

    return listAllUsers
  }

  async delete(id: number): Promise<user> {
    const listAllUsers = await this.repoUser.delete(id)

    return listAllUsers
  }
}