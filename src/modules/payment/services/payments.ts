import { IRepoUser } from "@modules/users/repositories/repo-user";
import { ICreatePayment } from "../dtos";
import { IRepoPayment } from "../repositories/repo-paymente";
import { generateAlphanumericString } from "helpers/generateTxId";

function caracterRemove(value: string) {
  let text = value
  text = value.replace(/\D/g, '')

  return text
}

export class PaymentService {
  constructor (
    private repoPayment: IRepoPayment,
    private repoUser: IRepoUser
  ) {}

  async payPix(data: ICreatePayment): Promise<any> {
    const user = await this.repoUser.listById(data.id)

    const documentFormatted = caracterRemove(data.document)
    const formatted = caracterRemove(data.value)

  const numericValue = parseFloat(data.value.replace('R$', '').replace(',', '.')) // Converte para número


    const valueCents = Math.round(Number(formatted))


    const txId = generateAlphanumericString()
    const currentDate = new Date()

    const payment = await this.repoPayment.create({
      amount: valueCents,
      user_id: user.id,
      external_id: txId,
      status: 'pendente',
      expiration_date: new Date(currentDate.setHours(currentDate.getHours() + 1))
    })
  }

}