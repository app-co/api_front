import { type Prisma, type user } from '@prisma/client'
import { type IRepoUser } from './repo-user'
import { type IUserUpdate } from '../dtos'
import { prisma } from '@shared/client'

export class PrismaUser implements IRepoUser {
  async create(data: Prisma.userUncheckedCreateInput): Promise<user> {
    const create = await prisma.user.create({data})

    return create
  }

  async update(data: IUserUpdate): Promise<user> {
    const up = await prisma.user.update({
      where: {id: data.id},
      data
    })

    return up
  }

  async listById(id: number): Promise<user> {
    const find = await prisma.user.findUnique({where: {id}, include: {wallet: true}})

    return find
  }

  async listByUsername(username: string): Promise<user> {
    const find = await prisma.user.findUnique({where: {username}})

    return find
  }

  async listByEmail(email: string): Promise<user> {
    const find = await prisma.user.findUnique({where: {email}})

    return find
  }

  async listAll(): Promise<user[]> {
    const list = await prisma.user.findMany({include: {wallet: true}})

    return list
  }

  async delete(id: number): Promise<user> {
    const del = await prisma.user.delete({where: {id}})

    return del
  }
}