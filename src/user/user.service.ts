import { Injectable, Scope } from '@nestjs/common';
import { IUser } from 'src/auth/typings/typings';
import { BridgerService } from 'src/bridger/bridger.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({
  scope: Scope.REQUEST
})
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bridger: BridgerService
  ) { }

  async login(username: string, password: string) {
    this.bridger.fromUserPass(username, password)
    if (!await this.bridger.login()) return null

    const preload = await this.prisma.user.findUnique({ where: { student_id: username } })
    if (preload) return { id: preload.id, username: preload.student_id }

    const user = await this.prisma.user.create({
      data: {
        student_id: username,
        ...await this.bridger.getPersonalInfo(),
        session: {
          create: {
            cookie: JSON.stringify(this.bridger.getCookieJar()),
            password: password
          }
        }
      }
    })
    return { id: user.id, username: user.student_id }
  }

  async deactivate(user: IUser) {
    return await this.prisma.user.delete({ where: { id: user.id } })
  }

  async info(user: IUser) {
    return await this.prisma.user.findUnique({ where: { id: user.id } })
  }
}
