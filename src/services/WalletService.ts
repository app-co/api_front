import { prisma } from '../shared/client'

async function create() {
  try {
    const newWallet = await prisma.wallet.create({ data: { balance: 0 } })

    return newWallet
  } catch (error) {
    throw new Error('Erro ao criar carteira: ' + error.message)
  }
}

async function addBalanceToWallet(idUser: number, balance: number) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: idUser },
      include: {
        wallet: true
      }
    })

    const newWallet = await prisma.wallet.update({
      where: { id: user.wallet_id },
      data: { balance: user.wallet.balance + balance }
    })

    return newWallet
  } catch (error) {
    throw new Error('Erro ao criar carteira: ' + error.message)
  }
}

async function removeBalanceToWallet(idUser: number, balance: number) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: idUser },
      include: {
        wallet: true
      }
    })

    const newWallet = await prisma.wallet.update({
      where: { id: user.wallet_id },
      data: { balance: user.wallet.balance - balance }
    })

    return newWallet
  } catch (error) {
    throw new Error('Erro ao criar carteira: ' + error.message)
  }
}

const WalletService = { create, addBalanceToWallet, removeBalanceToWallet }

export default WalletService
