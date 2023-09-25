import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export interface TokenPayload {
  email: string
  id: number
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou inválido.' })
  }

  try {
    const decoded = jwt.verify(
      token.replace('Bearer ', ''),
      process.env.TOKEN_SECRET
    ) as TokenPayload
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}
