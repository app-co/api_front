import { payments } from "@prisma/client";
import { ICreatePayment, IPayment } from "../dtos";

export interface IRepoPayment {
  create(data: IPayment): Promise<payments>
  webHoo(): Promise<any>
}