import { GnCredentials } from 'gn-api-sdk-typescript'

export const options: GnCredentials = {
  // PRODUÇÃO = false
  // HOMOLOGAÇÃO = true
  sandbox: false,
  client_id: process.env.GN_CLIENT_KEY,
  client_secret: process.env.GN_CLIENT_SECRET,
  certificate: process.env.GN_CERTIFICATE_PATH
}
