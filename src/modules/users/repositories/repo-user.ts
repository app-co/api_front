import { type Prisma, type user } from '@prisma/client'
import { type IUserUpdate } from '../dtos'

export interface IRepoUser {
  create(data: Prisma.userUncheckedCreateInput): Promise<user>
  update(data: IUserUpdate): Promise<user>
  listAll(): Promise<user[]>
  delete(id: number): Promise<user>
  listById(id: number): Promise<user>
  listByUsername(username: string): Promise<user>
  listByEmail(email: string): Promise<user>
}