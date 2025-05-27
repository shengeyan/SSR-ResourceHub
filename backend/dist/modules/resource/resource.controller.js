"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceController = void 0;
const common_1 = require("@nestjs/common");
const resource_service_1 = require("./resource.service");
let ResourceController = class ResourceController {
    constructor(resourceService) {
        this.resourceService = resourceService;
    }
    async download(id, res) {
        const resource = await this.resourceService.findOne(id);
        this.resourceService.increaseDownloadCount(id);
        await this.resourceService.proxyDownload(resource, res);
    }
    async getResources(type, page = 1) {
        return this.resourceService.getPaginatedResources(type, page);
    }
    async searchResources(query) {
        return this.resourceService.searchResources(query);
    }
    async getResourcesByUploader(uploaderId) {
        return this.resourceService.findByUploader(uploaderId);
    }
    async increaseDownload(body) {
        await this.resourceService.increaseDownloadCount(body.id);
        return {
            code: 0,
            data: null,
            message: '下载次数已增加',
        };
    }
    async deleteResource(body) {
        return this.resourceService.delete(body.id);
    }
};
exports.ResourceController = ResourceController;
__decorate([
    (0, common_1.Get)('download'),
    __param(0, (0, common_1.Query)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "download", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "getResources", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "searchResources", null);
__decorate([
    (0, common_1.Get)('by-uploader'),
    __param(0, (0, common_1.Query)('uploader_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "getResourcesByUploader", null);
__decorate([
    (0, common_1.Post)('increase-download'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "increaseDownload", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "deleteResource", null);
exports.ResourceController = ResourceController = __decorate([
    (0, common_1.Controller)('resource'),
    __metadata("design:paramtypes", [resource_service_1.ResourceService])
], ResourceController);
//# sourceMappingURL=resource.controller.js.map