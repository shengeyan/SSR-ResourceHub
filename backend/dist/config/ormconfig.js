"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const dataBaseConfig_1 = require("./dataBaseConfig");
const ormconfig = {
    type: 'mysql',
    host: dataBaseConfig_1.default.host,
    port: dataBaseConfig_1.default.port,
    username: dataBaseConfig_1.default.username,
    password: dataBaseConfig_1.default.password,
    database: dataBaseConfig_1.default.database,
    entities: [(0, path_1.join)(__dirname, '..', '**', '*.entity.{ts,js}')],
    synchronize: true,
    logging: true,
};
exports.default = ormconfig;
//# sourceMappingURL=ormconfig.js.map