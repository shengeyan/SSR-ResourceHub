"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const resource_entity_1 = require("./resource.entity");
const resource_service_1 = require("./resource.service");
const resource_controller_1 = require("./resource.controller");
let ResourceModule = class ResourceModule {
};
exports.ResourceModule = ResourceModule;
exports.ResourceModule = ResourceModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([resource_entity_1.Resource])],
        providers: [resource_service_1.ResourceService],
        controllers: [resource_controller_1.ResourceController],
    })
], ResourceModule);
//# sourceMappingURL=resource.module.js.map