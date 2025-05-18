import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module'
import { PostsModule } from './routes/posts/posts.module'
import { AuthService } from './routes/auth/auth.service'
import { AuthModule } from './routes/auth/auth.module'

@Module({
  imports: [SharedModule, PostsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
