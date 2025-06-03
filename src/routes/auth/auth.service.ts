import { LoginBodyDTO } from './auth.dto'
import { PrismaService } from './../../shared/services/prisma.service'
import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { HasingService } from 'src/shared/services/hasing.service'
import { TokenService } from 'src/shared/services/token.service'
import { isNotFoundPrismaError, isUniqueConstraintError } from 'src/shared/helpers'

@Injectable()
export class AuthService {
  constructor(
    private readonly hasingService: HasingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
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
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Email already exists')
      }
      console.log(error)
      throw error
    }
  }

  async login(body: LoginBodyDTO) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    })

    if (!user) {
      throw new UnauthorizedException('Account is not exist')
    }

    const isPasswordMatch = await this.hasingService.compare(body.password, user.password)

    if (!isPasswordMatch) {
      throw new UnprocessableEntityException({
        field: 'password',
        error: 'Password is incorrect',
      })
    }

    const tokens = await this.generateTokens({ userId: user.id })
    return tokens
  }

  async generateTokens(payload: { userId: number }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ])

    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)

    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: new Date(decodedRefreshToken.exp * 1000),
      },
    })

    return { accessToken, refreshToken }
  }

  async refreshToken(refreshToken: string) {
    try {
      //1. Kiem tra refreshToken hop le hay khong
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)

      //2. Kiem tra refreshToken ton tai trong db khong
      await this.prismaService.refreshToken.findUniqueOrThrow({
        where: {
          token: refreshToken,
        },
      })

      //3. Xoas refreshToken cu
      await this.prismaService.refreshToken.delete({
        where: {
          token: refreshToken,
        },
      })
      //4. Tao moi
      return await this.generateTokens({ userId })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token has been revoked')
      }
    }
  }
}
