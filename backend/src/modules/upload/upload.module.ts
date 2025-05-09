import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { Resource } from '../resource/resource.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Resource])],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
