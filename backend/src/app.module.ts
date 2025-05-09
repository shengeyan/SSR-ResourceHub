import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from './config/ormconfig';
import { RouterModule } from '@nestjs/core';

import { AuthModule } from './modules/auth/auth.module';
import { UploadModule } from './modules/upload/upload.module';
import { ResourceModule } from './modules/resource/resource.module';

@Module({
  imports: [
    // MySQL config
    TypeOrmModule.forRoot(ormconfig),
    // Module
    AuthModule,
    UploadModule,
    ResourceModule,
    // Router
    RouterModule.register([
      { path: 'api/v1', module: AuthModule },
      { path: 'api/v1', module: UploadModule },
      { path: 'api/v1', module: ResourceModule },
    ]),
  ],
})
export class AppModule {}
