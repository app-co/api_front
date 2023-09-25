import bcrypt from 'bcrypt'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { generateAlphanumericString } from '../../../helpers/generateTxId'
import AffilatedService from '../../../services/AffiliatedService'
import GerencianetService from '../../../services/GerencianetService'
import UserService from '../../../services/UserService'
import WalletService from '../../../services/WalletService'
import formatUsername from '../../../utils/formatUser'
import { prisma } from '../../client'
import {
  type AuthenticatedRequest,
  type TokenPayload,
  authMiddleware
} from '../../middlewares/authMiddleware'
import { uploadMiddleware } from '../middlewares/uploadMiddleware'
import { env } from 'process'
import { appRoutes } from './routes'

const ACCESS_TOKEN_EXPIRES_IN = 3600 * 8 // 15 minutos
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 // 7 dias

const routes = Router()

routes.use(appRoutes)

routes.get('/', (req, res) => res.json({ success: true }))


routes.get('/users/username/:username', async (req, res) => {
  const { username } = req.params
  try {
    const user = await UserService.getByUsername(username)

    res.status(201).send(user)
  } catch (error) {
    res.status(500).send(error)
  }
})

routes.get(
  '/users/profile',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id

      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        include: {
          wallet: true
        }
      })

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' })
      }

      return res.status(200).json(user)
    } catch (error) {
      return res.status(500).json({ error: 'Erro no servidor.' })
    }
  }
)

routes.put(
  '/users/:id/change-password',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.user
    const { password } = req.body
    try {
      const user = await UserService.editPassword(id, password)

      res.status(201).send(user)
    } catch (error) {
      res.status(500).send(error)
    }
  }
)

routes.post('/users/:id/ban', async (req, res) => {
  const { id } = req.params

  try {
    const newUser = await UserService.ban(Number(id), false)
    res.status(200).send(newUser)
  } catch (error) {
    res.status(500).send(error)
  }
})

routes.post('/users/:id/removeBan', async (req, res) => {
  const { id } = req.params

  try {
    const newUser = await UserService.ban(Number(id), true)
    res.status(200).send(newUser)
  } catch (error) {
    res.status(500).send(error)
  }
})

routes.get('/affiliates/:id/users', async (req, res) => {
  const { id } = req.params

  try {
    const users = await prisma.user.findMany({
      where: { referral_id: Number(id) }
    })
    res.status(200).send(users)
  } catch (error) {
    res.status(500).send(error)
  }
})

routes.post('/users/affiliated', async (req, res) => {
  try {
    const usersAffiliateds = await AffilatedService.getAllUsersAffiliateds()
    res.status(200).send(usersAffiliateds)
  } catch (error) {
    res.status(500).send(error)
  }
})

routes.post('/users/add-affiliateds', async (req, res) => {
  const { username, password, email, is_referrer } = req.body

  try {
    const newAffiliated = await AffilatedService.createAffiliateds({
      username,
      password,
      email,
      is_referrer
    })
    res.status(200).send(newAffiliated)
  } catch (error) {
    res.status(500).send(error)
  }
})

routes.post('/users/:id/convert-to-affiliate', async (req, res) => {
  const { id } = req.params

  try {
    const user = await UserService.convertToAffiliate(Number(id))
    res.status(200).send(user)
  } catch (error) {
    res.status(500).send(error)
  }
})

routes.post('/users/:id/convert-to-normal', async (req, res) => {
  const { id } = req.params

  try {
    const user = await UserService.convertToNormal(Number(id))
    res.status(200).send(user)
  } catch (error) {
    res.status(500).send(error)
  }
})


routes.post('/refresh', authMiddleware, (req: AuthenticatedRequest, res) => {
  const refreshToken = req.body.refreshToken

  // Verifique se o Refresh Token é válido
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.TOKEN_SECRET
    ) as TokenPayload

    // Se o Refresh Token for válido, gere um novo Access Token
    const newAccessTokenPayload = { id: decoded.id, email: decoded.email }
    const newAccessToken = jwt.sign(
      newAccessTokenPayload,
      process.env.TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN
      }
    )

    // novo tempo do Access Token  de expiração em minutos
    const accessExpiresInMinutes = ACCESS_TOKEN_EXPIRES_IN / 60

    res.json({
      newAuthToken: newAccessToken,
      expiresIn: accessExpiresInMinutes
    })
  } catch (err) {
    // Se o Refresh Token for inválido, responda com um erro
    res.status(401).json({ message: 'Refresh Token inválido' })
  }
})

// routes.post('/payments/create', async (req, res) => {
//   const { id, document, value, id_bonus } = req.body

//   const 632,000036 = await prisma.user.findFirst({
//     where: { id }
//   })

//   const documentFormatted = document
//     .replace('.', '')
//     .replace('.', '')
//     .replace('.', '')
//     .replace('-', '')

//   const valueFormatted = value
//     .replace('.', '')
//     .replace('.', '')
//     .replace(',', '.')

//   const numericValue = parseFloat(value.replace('R$', '').replace(',', '.')) // Converte para número

//   const valueInCents = Math.round(numericValue * 100) // Multiplica por 100 para obter o valor em centavos

//   const txId = generateAlphanumericString()

//   const currentDate = new Date()

//   console.log(txId)


//   try {
//     const payment = await prisma.payments.create({
//       data: {
//         amount: valueInCents,
//         user_id: user.id,
//         external_id: txId,
//         status: 'pendente',
//         expiration_date: new Date(
//           currentDate.setHours(currentDate.getHours() + 1)
//         ),
//         updated_at: new Date(),
//         created_at: new Date()
//       }
//     })

//     await prisma.wallet_transaction.create({
//       data: {
//         amount: valueInCents,
//         type: 'deposito',
//         uuid: txId,
//         wallet_id: user.wallet_id,
//         payment_id: payment.id,
//         updated_at: new Date(),
//         created_at: new Date()
//       }
//     })

//     const charge = await GerencianetService.createCharge(
//       txId,
//       user.username,
//       documentFormatted,
//       valueFormatted
//     )

//     const { id } = charge.loc

//     const qrcode = await GerencianetService.generateQrCode(id)

//     if (Number(id_bonus) !== 0) {
//       await prisma.bonus_users.create({
//         data: {
//           bonus_id: Number(id_bonus),
//           user_id: user.id,
//           payment_id: payment.id,
//           created_at: new Date(),
//           updated_at: new Date()
//         }
//       })
//     }
//     res.json(qrcode)
//   } catch (error) {
//     console.error(error)
//     res
//       .status(500)
//       .send(
//         'Erro ao processar a requisição. Por favor, tente novamente mais tarde.'
//       )
//   }
// })

routes.get(
  '/withdrawals',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.user
    try {
      const withdrawals = await prisma.withdraws.findMany({
        where: { user_id: id },
        orderBy: { id: 'desc' }
      })

      res.send({ withdrawals })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .send(
          `Erro ao processar a requisição. Por favor, tente novamente mais tarde. ${error}`
        )
    }
  }
)

routes.post('/affiliateds-withdrawals', async (req, res) => {
  const { id } = req.body

  try {
    const withdrawals = await prisma.withdraws.findMany({
      where: {
        id,
        user: {
          is_referrer: true
        }
      },
      orderBy: [{ status: 'asc' }, { id: 'asc' }],
      include: {
        user: true
      }
    })
    res.send({ withdrawals })
  } catch (error) {
    console.error(error)
    res.status(500).send(`Internal server error! ${error}`)
  }
})

routes.post(
  '/withdrawals',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { amount } = req.body
    const { id } = req.user
    const txId = generateAlphanumericString()
    try {
      const withdraw = await prisma.withdraws.create({
        data: {
          txid: txId,
          user_id: id,
          amount,
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      const user = await prisma.user.findUnique({ where: { id } })

      const wallet = await prisma.wallet.findUnique({
        where: { id: user.wallet_id }
      })

      const newBalance = wallet.balance - amount

      const updateWallet = await prisma.wallet.update({
        where: { id: user.wallet_id },
        data: {
          balance: newBalance
        }
      })

      await prisma.wallet_transaction.create({
        data: {
          amount,
          type: 'saque',
          uuid: txId,
          wallet_id: user.wallet_id,
          withdraw_id: withdraw.id,
          updated_at: new Date(),
          created_at: new Date()
        }
      })

      res.send({ wallet: updateWallet })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .send(
          `Erro ao processar a requisição. Por favor, tente novamente mais tarde. ${error}`
        )
    }
  }
)

routes.put(
  '/withdrawals/:withdrawalId/cancel',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { withdrawalId } = req.params
    const { id } = req.user
    try {
      const user = await prisma.user.findUnique({ where: { id } })

      const wallet = await prisma.wallet.findUnique({
        where: { id: user.wallet_id }
      })

      const withdraw = await prisma.withdraws.findUnique({
        where: { id: Number(withdrawalId) }
      })

      const newBalance = wallet.balance + withdraw.amount

      const updateWithdrawals = await prisma.withdraws.update({
        where: { id: Number(withdrawalId) },
        data: {
          status: 'cancelado'
        }
      })

      const allWithdrawals = await prisma.withdraws.findMany({
        where: { user_id: id },
        orderBy: { id: 'desc' }
      })

      const updateWallet = await prisma.wallet.update({
        where: { id: user.wallet_id },
        data: {
          balance: newBalance
        }
      })

      res.send({ wallet: updateWallet, withdrawals: allWithdrawals })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .send(
          `Erro ao processar a requisição. Por favor, tente novamente mais tarde. ${error}`
        )
    }
  }
)

routes.get(
  '/wallet/transactions',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.user
    try {
      const user = await prisma.user.findUnique({ where: { id } })

      const wallet_transaction = await prisma.wallet_transaction.findMany({
        where: {
          wallet_id: user.wallet_id,
          NOT: {
            type: {
              in: ['adicionado', 'removido']
            }
          }
        },
        include: {
          payments_wallet_transaction_payment_idTopayments: true,
          withdraws: true
        }
      })

      res.send(wallet_transaction)
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .send(
          `Erro ao processar a requisição. Por favor, tente novamente mais tarde. ${error}`
        )
    }
  }
)

routes.get(
  '/wallet/rollovers',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.user

    const rollover = await prisma.rollovers.findFirst({
      where: {
        user_id: id,
        status: 'Em aberto'
      }
    })

    res.send({
      expected_value: rollover ? rollover.expected_value / 100 : null,
      moviment_atual: rollover ? rollover.moviment_atual / 100 : null
    })
  }
)

routes.post('/client/initGame', async (req, res) => {
  const { id } = req.body

  try {
    const user = await prisma.user.findFirst({ where: { id } })

    const wallet = await prisma.wallet.findFirst({
      where: { id: user.wallet_id }
    })
    res.status(200).send({
      username: user.username,
      balance: wallet.balance,
      wallet_id: wallet.id
    })
  } catch (error) {
    res
      .status(500)
      .send(
        `Erro ao processar a requisição. Por favor, tente novamente mais tarde. ${error}`
      )
  }
})

routes.post('/client/wallet_balance', async (req, res) => {
  const { wallet_id, newBalance } = req.body

  try {
    const wallet = await prisma.wallet.findFirst({
      where: { id: wallet_id }
    })

    const updateWallet = await prisma.wallet.update({
      where: { id: wallet_id },
      data: {
        balance: Number(newBalance)
      }
    })

    res.status(200).send({ balance: newBalance })
  } catch (error) {
    res
      .status(500)
      .send(
        `Erro ao processar a requisição. Por favor, tente novamente mais tarde. ${error}`
      )
  }
})

routes.post('/client/add-balance', async (req, res) => {
  const { balance, user } = req.body
  try {
    const txId = generateAlphanumericString()

    const userID = await prisma.user.findFirst({
      where: { id: user },
      include: {
        wallet: true
      }
    })

    const newWallet = await WalletService.addBalanceToWallet(user, balance)

    await prisma.wallet_transaction.create({
      data: {
        amount: balance,
        type: 'adicionado',
        uuid: txId,
        wallet_id: userID.wallet_id,
        updated_at: new Date(),
        created_at: new Date()
      }
    })

    res.status(200).send(newWallet)
  } catch (error) {
    res
      .status(500)
      .send(
        `Erro ao processar a requisição. Por favor, tente novamente mais tarde. ${error}`
      )
  }
})

routes.post('/client/remove-balance', async (req, res) => {
  const { balance, user } = req.body
  try {
    const txId = generateAlphanumericString()

    const userID = await prisma.user.findFirst({
      where: { id: user },
      include: {
        wallet: true
      }
    })

    const newWallet = await WalletService.removeBalanceToWallet(user, balance)

    await prisma.wallet_transaction.create({
      data: {
        amount: balance,
        type: 'removido',
        uuid: txId,
        wallet_id: userID.wallet_id,
        updated_at: new Date(),
        created_at: new Date()
      }
    })
    res.status(200).send(newWallet)
  } catch (error) {
    res
      .status(500)
      .send(
        `Erro ao processar a requisição. Por favor, tente novamente mais tarde. ${error}`
      )
  }
})

// Painel de Gerenciamento
routes.post('/painel/withdrawals', async (req, res) => {
  try {
    const withdrawals = await prisma.withdraws.findMany({
      orderBy: [{ status: 'asc' }, { id: 'asc' }],
      include: {
        user: true
      }
    })

    res.send({ withdrawals })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .send(
        `Erro ao processar a requisição. Por favor, tente novamente mais tarde. ${error}`
      )
  }
})

routes.post('/painel/withdrawals/:id/approve', async (req, res) => {
  const withdrawalId = Number(req.params.id)

  try {
    await prisma.withdraws.update({
      where: { id: withdrawalId },
      data: { status: 'realizado' }
    })

    const withdraw = await prisma.withdraws.findMany({
      orderBy: [{ status: 'asc' }, { id: 'asc' }],
      include: { user: true }
    })

    res.send(withdraw)
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .send(
        `Erro ao processar a requisição. Por favor, tente novamente mais tarde. ${error}`
      )
  }
})

routes.post('/painel/withdrawals/:id/reject', async (req, res) => {
  const withdrawalId = Number(req.params.id)

  try {
    const withdraw = await prisma.withdraws.update({
      where: { id: withdrawalId },
      data: { status: 'reprovado' }
    })

    const user = await prisma.user.findFirst({
      where: {
        id: withdraw.user_id
      }
    })

    const wallet = await prisma.wallet.findFirst({
      where: {
        id: user.wallet_id
      }
    })

    await prisma.wallet.update({
      where: {
        id: user.wallet_id
      },
      data: {
        balance: wallet.balance + withdraw.amount
      }
    })

    const withdraws = await prisma.withdraws.findMany({
      orderBy: [{ status: 'asc' }, { id: 'asc' }],
      include: { user: true }
    })

    res.send(withdraws)
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .send(
        `Erro ao processar a requisição. Por favor, tente novamente mais tarde. ${error}`
      )
  }
})

routes.post('/create/webhook-gerencianet', (req, res) => {
  const { urlNotification } = req.body

  const cn_pix = env.CN_PIX

  try {
    GerencianetService.createWebhook(urlNotification, cn_pix)

    res.json({ error: false, message: 'Webhook Cadastrado com sucesso!' })
  } catch (error) {
    console.log('erro: ', error)
    res
      .status(500)
      .send(
        `Erro ao processar a requisição. Por favor, tente novamente mais tarde. ${error}`
      )
  }
})

routes.get('/details/webhook-gerencianet', async (req, res) => {
  try {
    const response = await GerencianetService.detailsWebhookPix()

    res.status(200).json({ response })
  } catch (error) {
    console.log()
    res
      .status(500)
      .send(
        `Erro ao processar a requisição. Por favor, tente novamente mais tarde. ${error}`
      )
  }
})

routes.post('/payments/webhook/:pix?', async (req, res) => {
  try {
    const objto = req.body
    if(objto.pix) {
      const {txid, valor} = objto.pix[0]
      let value = valor
      value = value.replace(/\D/g, '')

      const payment = await prisma.payments.findFirst({
        where: {
          external_id: txid,
          status: 'pendente'
        }
      })

      

      const bonus_users = await prisma.bonus_users.findFirst({
        where: {
          payment_id: payment.id
        }
      })


      if (bonus_users?.bonus_id) {
        const bonus = await prisma.bonus.findFirst({
          where: {
            id: bonus_users.bonus_id
          }
        })

        const rollover = await prisma.rollovers.findFirst({
          where: {
            user_id: bonus_users.user_id
          },
          orderBy: {
            id: 'desc'
          }
        })

        await prisma.rollovers.update({
          where: {
            id: rollover.id
          },
          data: {
            status: 'Expirado'
          }
        })

        const currentDate = new Date()
        const expire_at = new Date(currentDate)
        expire_at.setDate(currentDate.getDate() + bonus.days_expire)

        const expected_value =
          (Number(value) + bonus.percentage / 100) * bonus.rollover_percent

        await prisma.rollovers.create({
          data: {
            bonus_id: bonus.id,
            user_id: bonus_users.user_id,
            expected_value,
            moviment_atual: 0,
            status: 'Em aberto',
            created_at: new Date(),
            updated_at: new Date(),
            expire_at
          }
        })
      } else {
        const currentDate = new Date()
        const expire_at = new Date(currentDate)
        expire_at.setDate(currentDate.getDate() + 365)

        const rollover = await prisma.rollovers.findFirst({
          where: {
            user_id: payment.user_id
          },
          orderBy: {
            id: 'desc'
          }
        })

        if(rollover) {
          await prisma.rollovers.update({
            where: {
              id: rollover.id
            },
            data: {
              status: 'Expirado'
            }
          })
        }

        await prisma.rollovers.create({
          data: {
            user_id: payment.user_id,
            expected_value: Number(value),
            moviment_atual: 0,
            status: 'Em aberto',
            created_at: new Date(),
            updated_at: new Date(),
            expire_at
          }
        })
      }


      if (payment) {
        const user = await prisma.user.findUnique({
          where: {
            id: payment.user_id
          }
        })

        const wallet_user = await prisma.wallet.findFirst({
          where: {
            id: user.wallet_id
          }
        })

        await prisma.wallet.update({
          where: {
            id: user.wallet_id
          },
          data: {
            balance: wallet_user.balance + Number(value)
          }
        })

        await prisma.payments.update({
          where: {
            id: payment.id
          },
          data: {
            status: 'concluido',
            updated_at: new Date()
          }
        })
      }
    }

    console.log(objto)

    return res.json(objto).status(201)
  } catch (error) {
    console.log(error, 'erro webhook')
    
  }
  // console.log(res, 'response')

})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({ storage })

routes.post('/bonus', upload.single('img_url'), async (req, res) => {
  const {
    name,
    limit,
    limit_user,
    maximiun_deposit,
    rollover,
    days_expire,
    minimiun_deposit,
    percentage
  } = req.body

  console.log(percentage)
  console.log(typeof percentage)

  const imageUrl = req.file.path

  const bonus = await prisma.bonus.create({
    data: {
      name,
      limit: Number(limit),
      limit_user: Number(limit_user),
      rollover_percent: Number(rollover),
      percentage: Number(percentage),
      days_expire: Number(days_expire),
      maximiun_deposit:
        Number(maximiun_deposit) == 0 ? null : Number(maximiun_deposit),
      minimiun_deposit: Number(minimiun_deposit),
      img_url: imageUrl,
      created_at: new Date(),
      updated_at: new Date()
    }
  })

  res.status(200).send(bonus)
})

routes.get('/bonus', async (req, res) => {
  const user_id = Number(req.query.id ? req.query.id : 0)

  const bonus_users = await prisma.bonus_users.findMany({
    where: {
      user_id
    }
  })

  const bonus = await prisma.bonus.findMany({
    where: {
      status: 'ativo',
      NOT: {
        id: {
          in: bonus_users.map((bonus) => bonus.bonus_id)
        }
      }
    }
  })

  res.status(200).send(bonus)
})

routes.delete('/bonus/:id/disable', async (req, res) => {
  const bonusId = Number(req.params.id)

  // Verificar se o bônus existe
  if (!bonusId) {
    return res.status(404).send('Bônus não encontrado')
  }

  // Obter o bônus do banco de dados
  const bonus = await prisma.bonus.update({
    where: {
      id: bonusId
    },
    data: {
      status: 'inativo'
    }
  })

  res.status(200).send(bonus)
})

routes.get('/cpa/affiliated/:id', async (req, res) => {
  const { id } = req.params

  const cpa = await prisma.cpa_colleted.findMany({
    where: {
      affiliated_id: Number(id)
    }
  })

  res.send(cpa)
})

// routes.post('/reset-password/request', async (req, res) => {
//   const { email } = req.body

//   try {
//     const user = await prisma.user.findFirst({
//       where: {
//         email
//       }
//     })

//     if (!user) {
//       return res.status(404).send('Usuário não encontrado')
//     }

//     await prisma.password_reset_request.updateMany({
//       where: {
//         user_id: user.id,
//         is_active: true,
//         expires_at: {
//           lt: new Date()
//         }
//       },
//       data: {
//         is_active: false
//       }
//     })

//     const existingActiveRequest = await prisma.password_reset_request.findFirst(
//       {
//         where: {
//           user_id: user.id,
//           expires_at: {
//             gte: new Date()
//           },
//           is_active: true
//         }
//       }
//     )

//     if (existingActiveRequest) {
//       return res
//         .status(409)
//         .json({ error: 'Já existe uma solicitação de troca de senha ativa' })
//     }

//     const token = generateAlphanumericString()

//     const now = new Date()
//     const expires_at = new Date(now.getTime() + 2 * 60 * 60 * 1000) // Adicionando 2 horas em milissegundos

//     await prisma.password_reset_request.create({
//       data: {
//         user_id: user.id,
//         token,
//         expires_at
//       }
//     })

//     const emailSubject = 'Solicitação de Redefinição de Senha'
//     const emailContent = `
//       <p>Olá,</p>
//       <p>Você solicitou uma redefinição de senha. Clique no link abaixo para prosseguir:</p>
//       <a href="${process.env.HOST_CASINO}/forget-password?token=${token}">Redefinir Senha</a>
//     `

//     sendEmail({ to: user.email, subject: emailSubject, html: emailContent })

//     res.status(200).send({ success: true })
//   } catch (error) {
//     res.status(500).json({ error: 'Ocorreu um erro no servidor' })
//   }
// })

// routes.post('/reset-password/validate-token', async (req, res) => {
//   const { token } = req.body

//   const resetRequest = await prisma.password_reset_request.findFirst({
//     where: {
//       token,
//       expires_at: {
//         gte: new Date()
//       },
//       is_active: true
//     }
//   })

//   if (!resetRequest) {
//     return res.status(400).send({
//       validate: false,
//       message: 'Token de redefinição inválido ou expirado'
//     })
//   }

//   res.status(200).send({ validate: true })
// })

// routes.post('/reset-password/confirm', async (req, res) => {
//   const { token, password } = req.body

//   const resetRequest = await prisma.password_reset_request.findFirst({
//     where: {
//       token,
//       expires_at: {
//         gte: new Date()
//       },
//       is_active: true
//     }
//   })

//   if (!resetRequest) {
//     return res
//       .status(400)
//       .json({ error: 'Token de redefinição inválido ou expirado' })
//   }

//   const user = await prisma.user.findUnique({
//     where: {
//       id: resetRequest.user_id
//     }
//   })

//   if (!user) {
//     return res.status(404).json({ error: 'Usuário não encontrado' })
//   }

//   const saltRounds = 10
//   const hashedNewPassword = await bcrypt.hash(password, saltRounds)

//   await prisma.user.update({
//     where: {
//       id: user.id
//     },
//     data: {
//       password: hashedNewPassword
//     }
//   })

//   await prisma.password_reset_request.update({
//     where: {
//       id: resetRequest.id
//     },
//     data: {
//       is_active: false
//     }
//   })

//   res.status(200).send({ success: true })
// })

routes.post(
  '/validate-document',
  uploadMiddleware,
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.user
    const files = req.files

    // Process and store the files as required
    // For example, save the files to a specific directory using fs module

    const document = await prisma.document.create({
      data: {
        user_id: id,
        file_one: files[0].path,
        file_two: files[1].path
      }
    })

    console.log(files)
    res.status(200).send(document)
  }
)

routes.get(
  '/check-document-validation',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.user

    try {
      const existingValidation = await prisma.document.findFirst({
        where: {
          user_id: id
        }
      })

      res.send(existingValidation)
    } catch (error) {
      console.error('Erro ao verificar validação do documento:', error)
      return res
        .status(500)
        .json({ error: 'Erro ao verificar validação do documento' })
    }
  }
)

routes.get('/all-document-validations', async (req, res) => {
  try {
    const documentValidations = await prisma.document.findMany()
    res.send(documentValidations)
  } catch (error) {
    console.error('Erro ao obter todas as validações de documentos:', error)
    return res
      .status(500)
      .json({ error: 'Erro ao obter todas as validações de documentos' })
  }
})

routes.post('/approve-document-validation/:validationId', async (req, res) => {
  const { validationId } = req.params

  try {
    const updatedValidation = await prisma.document.update({
      where: { id: parseInt(validationId) },
      data: { status: 1 }
    })

    res.send(updatedValidation)
  } catch (error) {
    console.error('Erro ao aprovar a validação do documento:', error)
    return res
      .status(500)
      .json({ error: 'Erro ao aprovar a validação do documento' })
  }
})

routes.post('/reject-document-validation/:validationId', async (req, res) => {
  const { validationId } = req.params
  const { desc } = req.body
  try {
    const updatedValidation = await prisma.document.update({
      where: { id: parseInt(validationId) },
      data: { status: 2, desc }
    })

    res.send(updatedValidation)
  } catch (error) {
    console.error('Erro ao reprovar a validação do documento:', error)
    return res
      .status(500)
      .json({ error: 'Erro ao reprovar a validação do documento' })
  }
})

export { routes }
