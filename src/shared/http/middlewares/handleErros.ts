import { NextFunction, Request, Response } from 'express'

import { AppError } from '../../errors/AppError'

export const handleErrors = (
  err: Error,
  request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: NextFunction
) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      message: err.message
    })
  }

  console.error(err)

  return response.status(500).json({
    message: 'Internal server error'
  })
}
