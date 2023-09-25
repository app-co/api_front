import 'dotenv/config'
import 'express-async-errors'
import bodyParser from 'body-parser'

import cors from 'cors'
import express, { Request, Response } from 'express'
import { routes } from './routes'
import { handleErrors } from './middlewares/handleErros'
import { AppError } from '@shared/errors/AppError'

const app = express()

app.use(express.json())
app.use(bodyParser.json())
app.use(cors())
app.use(routes)
app.use(handleErrors)

app.use((err: Error, request: Request, response: Response) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({ message: err.message })
  }

  return response.status(500).json({
    status: 'error',
    message: ` Internal server error - ${err.message}`
  })
})

export { app }
