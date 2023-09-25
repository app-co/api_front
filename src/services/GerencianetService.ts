import Gerencianet from 'gn-api-sdk-typescript'
import { options } from '../config'

async function createCharge(
  txid: string,
  name: string,
  document: string,
  value: string
) {
  const body = {
    calendario: {
      expiracao: 3600
    },
    devedor: {
      cpf: document,
      nome: name
    },
    valor: {
      original: `${value}`
    },
    chave: process.env.GN_PIX
  }

  const params = {
    txid
  }

  const gerencianet = new Gerencianet(options)

  try {
    const response = await gerencianet.pixCreateCharge(params, body)
    return response
  } catch (error) {
    console.log(error)
    throw new Error('Erro na chamada à API externa: ' + error.message)
  }
}

async function generateQrCode(id: number) {
  const gerencianet = new Gerencianet(options)

  const params = {
    id
  }

  try {
    const response = gerencianet.pixGenerateQRCode(params)
    return response
  } catch (error) {
    // Trate o erro aqui ou retorne a promessa rejeitada para que a rota possa tratar o erro
    return await Promise.reject(new Error('Erro ao gerar QRCODE: ' + error.message))
  }
}

async function createWebhook(urlNotification: string, chavePIX: string) {
  const body = {
    webhookUrl: urlNotification
  }
  options.validateMtls = false

  const chave = process.env.GN_PIX
  
  const params = {
    chave
  }
  
  const gerencianet = new Gerencianet(options)

  try {
    await gerencianet.pixConfigWebhook(params, body).then(h => {
      console.log(h)
    })
  } catch (error) {
    console.log(error, 'error')
    // return await Promise.reject(new Error('Erro ao gerar WEBHOOK: ' + error.message))
    
  }
  
}

async function detailsWebhookPix() {
  const params = {
    chave: process.env.GN_PIX
  }
  
  const gerencianet = new Gerencianet(options)

  try {
    const response = await gerencianet.pixDetailWebhook(params)

    console.log(response)

    return response
  } catch (error) {
    console.log(error)
    // Trate o erro aqui ou retorne a promessa rejeitada para que a rota possa tratar o erro
    return await Promise.reject(new Error('Erro ao gerar QRCODE: ' + error.message))
  }
}

async function webhookPix() {
  // Aguardando produção para validação de Webhook
  const gerencianet = new Gerencianet(options)

}

const GerencianetService = { createCharge, generateQrCode, webhookPix, createWebhook, detailsWebhookPix }

export default GerencianetService
