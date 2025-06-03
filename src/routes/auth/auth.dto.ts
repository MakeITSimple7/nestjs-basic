import { RefreshToken } from './../../../generated/prisma/index.d'
import { Exclude, Expose } from 'class-transformer'
import { IsString, Length } from 'class-validator'
import { Match } from 'src/shared/decorators/custom-validator.decorator'

export class LoginBodyDTO {
  @IsString()
  email: string
  @IsString()
  @Length(6, 20, { message: 'Mật khẩu phải từ 6 đến 20 ký tự' })
  password: string
}

export class LoginResDTO {
  accessToken: string
  refreshToken: string

  constructor(partial: Partial<LoginResDTO>) {
    Object.assign(this, partial)
  }
}

export class RegisterBodyDTO extends LoginBodyDTO {
  @IsString()
  name: string
  @IsString()
  @Match('password', { message: 'Mật khẩu không khớp' })
  confirmPassword: string
}

export class RegisterResDTO {
  id: number
  email: string
  name: string
  @Exclude()
  password: string
  createdAt: Date
  updatedAt: Date

  @Expose()
  get emailName() {
    return `${this.email} - ${this.name}`
  }

  constructor(partial: Partial<RegisterResDTO>) {
    Object.assign(this, partial)
  }
}

export class RefreshTokenBodyDTO {
  @IsString()
  refreshToken: string
}

export class RefreshTokenResDTO extends LoginResDTO {}
