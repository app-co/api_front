import { createServer } from 'http'

import { appConfig } from '../../config/app'

import { app } from './app'

console.log('create server')
export const server = createServer(app)
console.log('after create server')

server.listen(appConfig.port, () => {
  console.log('Running on port', appConfig.port)
})
