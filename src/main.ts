import { TransformInterceptor } from './shared/interceptor/transform.interceptor'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common'
import { LoggingInterceptor } from './shared/interceptor/logging.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // tu dong loai bo cac field khong duoc khai bao decorator trong DTO
      forbidNonWhitelisted: true, // Nếu có field không được khai báo decorator trong DTO thì sẽ báo lỗi
      transform: true, // Tự động chuyển đổi dữ liệu sáng kiểu được khai báo trong DTO
      transformOptions: {
        enableImplicitConversion: true, // Request được ngầm định sang kiểu dữ liệu DTO
      },
      exceptionFactory: (validationErrors) => {
        console.log(validationErrors)
        return new UnprocessableEntityException(
          validationErrors.map((error) => ({
            field: error.property,
            error: Object.values(error.constraints as any).join(','),
          })),
        )
      },
    }),
  )
  app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalInterceptors(new TransformInterceptor())
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
