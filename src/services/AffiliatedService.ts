import { prisma } from '../shared/client'
import formatUsername from '../utils/formatUser'
import generateSlug from '../utils/generateSlug'
import bcrypt from 'bcrypt'
import WalletService from './WalletService'

type IAffiliated = {
  username: string
  password?: string
  email: string
  is_referrer: boolean
}

async function getAllUsersAffiliateds() {
  try {
    const affiliateUsers = await prisma.user.findMany({
      where: { is_referrer: true }
    })

    const usersWithCounts = []

    for (const affiliateUser of affiliateUsers) {
      const referredUsers = await prisma.user.findMany({
        where: {
          referral_id: affiliateUser.id
        }
      })

      usersWithCounts.push({
        ...affiliateUser,
        quantityUserAffiliate: referredUsers.length,
        userAffiliate: referredUsers
      })
    }

    return usersWithCounts
  } catch (error) {
    const affiliateds = await prisma.user.findFirst({
      where: { is_referrer: true }
    })

    if (!affiliateds) {
      throw new Error('Nenhum afiliado encontrado ...')
    }
    return affiliateds
  }
}

async function createAffiliateds({
  username,
  email,
  password,
  is_referrer
}: IAffiliated) {
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

    const roles = ['ROLE_USER']
    const slug = generateSlug(email)

    const newAffiliateds = await prisma.user.create({
      data: {
        wallet_id: newWallet.id,
        username: username,
        password: hashedPassword,
        email: email,
        is_referrer,
        created_at: new Date()
      }
    })

    return newAffiliateds
  } catch (error) {
    const validation = await prisma.user.findFirst({
      where: { is_referrer: true }
    })
    if (!validation) {
      throw new Error(
        'Erro ao criar afiliado, verifique os campos corretamente!'
      )
    }
    return validation
  }
}

const AffilatedService = {
  getAllUsersAffiliateds,
  createAffiliateds
}

export default AffilatedService
