import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './resource.entity';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Resource])],
  providers: [ResourceService],
  controllers: [ResourceController],
})
export class ResourceModule {}
