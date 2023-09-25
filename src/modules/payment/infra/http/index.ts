import { Router } from "express";
import { PaymentController } from "../controllers/payment-controller";

const payRoutes = Router()

const controler = new PaymentController()

payRoutes.post('/payments/create', controler.payPix)

export {payRoutes}