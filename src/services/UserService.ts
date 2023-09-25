import bcrypt from 'bcrypt'
import { prisma } from '../shared/client'
import formatUsername from '../utils/formatUser'
import WalletService from './WalletService'

interface IUser {
  username: string
  email: string
  document?: string
  password?: string
  referral_id?: number
}

async function getAll() {
  try {
    const users = prisma.user.findMany({
      include: {
        wallet: true
      }
    })
    return await users
  } catch (error) {
    throw new Error('Erro ao pegar todos usuários: ' + error)
  }
}

async function create({ username, email, password, referral_id }: IUser) {
  try {
    const formattedUsername = formatUsername(username)

    if (formattedUsername.length < 4) {
      throw new Error('O nome de usuário deve ter no mínimo 4 caracteres.')
    }

    if (password && password.length < 6) {
      throw new Error('A senha precisa conter no mínimo 6 caracteres.')
    }

    const saltRounds = 10
    const hashedPassword = password
      ? await bcrypt.hash(password, saltRounds)
      : ''

    const newWallet = await WalletService.create()

    console.log('referral_id: ', referral_id)

    const newUser = await prisma.user.create({
      data: {
        username: formattedUsername,
        email,
        password: hashedPassword,
        referral_id,
        created_at: new Date(),
        wallet_id: newWallet.id,
        cpa_collected: false
      }
    })

    console.log(newUser)

    return newUser
  } catch (error) {
    throw new Error('Erro ao criar usuário: ' + error)
  }
}

async function getByUsername(username: string) {
  const user = await prisma.user.findFirst({ where: { username } })

  return user
}

async function edit(id: number, { username, email, document }: IUser) {
  try {
    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      throw new Error('Usuário não encontrado.')
    }

    const formattedUsername = formatUsername(username)

    if (formattedUsername.length < 4) {
      throw new Error('O nome de usuário deve ter no mínimo 4 caracteres.')
    }

    await prisma.user.update({
      where: { id },
      data: {
        username: formattedUsername,
        email,
        document
      }
    })

    return { message: 'Usuário atualizado com sucesso!' }
  } catch (error) {
    throw new Error('Erro ao editar usuário: ' + error)
  }
}

async function editPassword(id: number, password: string) {
  try {
    if (password.length < 6) {
      throw new Error('A senha precisa conter no mínimo 6 caracteres.')
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword
      }
    })

    return { message: 'Senha atualizada com sucesso!' }
  } catch (error) {
    throw new Error('Erro ao editar senha: ' + error)
  }
}

async function findById(id: number) {
  const data = await prisma.user.findFirst({
    where: { id }
  })
  return data
}

async function convertToAffiliate(id: number) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { is_referrer: true }
    })

    return user
  } catch (error) {
    throw new Error('Erro ao transformar usuário em afiliado!: ' + error)
  }
}

async function convertToNormal(id: number) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { is_referrer: false }
    })

    return user
  } catch (error) {
    throw new Error(
      'Erro ao transformar usuário afiliado em usuário normal!: ' + error
    )
  }
}

async function ban(id: number, remove: boolean = false) {
  if (!remove) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { is_bann: true }
      })

      return user
    } catch (error) {
      throw new Error('Erro ao banir usuário!: ' + error)
    }
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { is_bann: false }
    })

    return user
  } catch (error) {
    throw new Error('Erro ao banir usuário!: ' + error)
  }
}

const UserService = {
  create,
  getByUsername,
  edit,
  editPassword,
  findById,
  getAll,
  convertToAffiliate,
  convertToNormal,
  ban
}

export default UserService
