import { payRoutes } from "@modules/payment/infra/http";
import { userRoute } from "@modules/users/infra/http";
import { Router } from "express";

const appRoutes = Router()

appRoutes.use(userRoute)
appRoutes.use(payRoutes)

export {appRoutes}