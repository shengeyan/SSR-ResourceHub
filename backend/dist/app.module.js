"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ormconfig_1 = require("./config/ormconfig");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./modules/auth/auth.module");
const upload_module_1 = require("./modules/upload/upload.module");
const resource_module_1 = require("./modules/resource/resource.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot(ormconfig_1.default),
            auth_module_1.AuthModule,
            upload_module_1.UploadModule,
            resource_module_1.ResourceModule,
            core_1.RouterModule.register([
                { path: 'api/v1', module: auth_module_1.AuthModule },
                { path: 'api/v1', module: upload_module_1.UploadModule },
                { path: 'api/v1', module: resource_module_1.ResourceModule },
            ]),
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map