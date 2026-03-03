import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { PostsController } from './post.controller';
import { PostsService } from './post.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
