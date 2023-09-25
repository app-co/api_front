import { makePayment } from "@modules/payment/factories/make-payment";
import { Request, Response } from "express";

export class PaymentController {
  async payPix(req: Request, res: Response) {
    const {id, document, value, id_bonus} = req.body
    const {make} = makePayment()

    const payPix = await make.payPix({id_bonus, document, value, id})

    return res.json(payPix).status(201)
  }
}