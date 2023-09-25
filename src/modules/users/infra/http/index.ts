import { Router } from "express";
import { UserController } from "../controller/userController";
import { authMiddleware } from "@shared/middlewares/authMiddleware";
import { AuthController } from "../controller/auth-controller";

const userRoute = Router()

const controller = new UserController()
const authController = new AuthController()

userRoute.post('/users', controller.create)
userRoute.put('/users', authMiddleware, controller.update)
userRoute.get('/users/get-all', controller.listAll)

// USER LOGIN
userRoute.post('/login', authController.authUser)
userRoute.post('/login-google', authController.authWithGoogle)
userRoute.post('/login-painel', authController.authPainel)

export {userRoute}