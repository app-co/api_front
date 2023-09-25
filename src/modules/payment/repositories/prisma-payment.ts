import { payments } from "@prisma/client";
import { IPayment } from "../dtos";
import { IRepoPayment } from "./repo-paymente";
import { prisma } from "@shared/client";

export class PrismaPayment implements IRepoPayment {
  async create(data: IPayment): Promise<payments> {
    const pay = await prisma.payments.create({data})
    return pay
  }

  async webHoo(): Promise<any> {
       
  }
}