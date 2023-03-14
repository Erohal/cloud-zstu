import { Injectable, Scope } from '@nestjs/common';
import { IUser } from 'src/auth/typings/typings';
import { BridgerService } from 'src/bridger/bridger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as CryptoJs from 'crypto-js'

@Injectable({
  scope: Scope.REQUEST
})
export class GradeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bridger: BridgerService
  ) { }

  async syncGrades(user: IUser) {
    const session = await this.prisma.session.findUnique({ where: { userId: user.id } })
    this.bridger.fromCookieJar(session.cookie as string)
    const records = await this.bridger.getAllGrades()
    const tasks = []
    const updated = []
    for (const record of records) {
      const md5 = CryptoJs.MD5(user.id + record.kcbh + record.kcmc).toString()
      const preload = await this.prisma.record.findUnique({ where: { md5 } })
      if (!preload) {
        updated.push(record)
        const task = this.prisma.record.create({
          data: {
            student_id: user.username,
            md5,
            ...record
          }
        })
        tasks.push(task)
      }
    }

    await Promise.all(tasks)

    return {
      length: updated.length,
      items: updated
    }
  }

  async allGrades(user: IUser) {
    const session = await this.prisma.session.findUnique({ where: { userId: user.id } })
    this.bridger.fromCookieJar(session.cookie as string)
    const records = await this.bridger.getAllGrades()
    return {
      length: records.length,
      items: records
    }
  }

  async gpa(user: IUser, xn?: number, xq?: number) {
    const res = await this.prisma.record.aggregate({ where: { student_id: user.username, xn, xq, cj: { not: '放弃' } }, _sum: { xf: true, xfjd: true } })
    return { gpa: (res._sum.xfjd / res._sum.xf).toFixed(2) }
  }
}
