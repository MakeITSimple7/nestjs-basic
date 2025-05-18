import { PrismaService } from './../../shared/services/prisma.service'
import { ConflictException, Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library'
import { HasingService } from 'src/shared/services/hasing.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hasingService: HasingService,
    private readonly prismaService: PrismaService,
  ) {}

  async register(body: any) {
    try {
      const hashedPassword = await this.hasingService.hash(body.password)
      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
        },
      })
      return user
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already exists')
      }
      console.log(error)
      throw error
    }
  }
}
