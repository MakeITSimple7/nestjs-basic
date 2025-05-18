import { PostsService } from './posts.service'
import { Body, Controller, Get, Post } from '@nestjs/common'

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getPosts() {
    await this.postsService.getPosts()
  }

  @Post()
  async createPosts(@Body() body: any) {
    await this.postsService.createPosts(body)
  }
}
