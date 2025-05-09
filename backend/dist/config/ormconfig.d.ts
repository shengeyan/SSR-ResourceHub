import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
declare const ormconfig: TypeOrmModuleOptions & DataSourceOptions;
export default ormconfig;
