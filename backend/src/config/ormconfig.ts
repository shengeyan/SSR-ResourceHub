// typeorm 配置文件

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { join } from 'path';
import databaseConfig from './dataBaseConfig';

const ormconfig: TypeOrmModuleOptions & DataSourceOptions = {
  type: 'mysql',
  host: databaseConfig.host,
  port: databaseConfig.port,
  username: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: true,
  logging: true,
};

export default ormconfig;
