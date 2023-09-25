import { PrismaUser } from "@modules/users/repositories/prisma-user";
import { PrismaPayment } from "../repositories/prisma-payment";
import { PaymentService } from "../services/payments";

export function makePayment() {
  const repoPay = new PrismaPayment()
  const repoUser = new PrismaUser()

  const make = new PaymentService(repoPay, repoUser)
  
  return {make}
}