import { PrismaUser } from '../repositories/prisma-user'
import { UserAuthentication } from '../service/user-authentication'
import { UserService } from '../service/user-service'

export function makeUser() {
  const repo = new PrismaUser()

  const makeUser = new UserService(repo)
  const makeAuth = new UserAuthentication(repo)

  return {make: makeUser, makeAuth}
}