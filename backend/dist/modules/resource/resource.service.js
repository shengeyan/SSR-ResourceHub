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
exports.ResourceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const resource_entity_1 = require("./resource.entity");
const axios_1 = require("axios");
const axiosInstance = axios_1.default.create({
    proxy: false,
});
let ResourceService = class ResourceService {
    constructor(resourceRepo, dataSource) {
        this.resourceRepo = resourceRepo;
        this.dataSource = dataSource;
    }
    async findOne(id) {
        const res = await this.resourceRepo.findOneBy({ id });
        if (!res)
            throw new common_1.NotFoundException('资源不存在');
        return res;
    }
    async increaseDownloadCount(id) {
        await this.resourceRepo.increment({ id }, 'download_count', 1);
    }
    async proxyDownload(resource, res) {
        try {
            const stream = await axiosInstance.get(resource.url, {
                responseType: 'stream',
            });
            res.setHeader('Content-Disposition', `attachment; filename="${resource.name}"`);
            res.setHeader('Content-Type', resource.mime_type || 'application/octet-stream');
            stream.data.pipe(res);
        }
        catch (error) {
            console.error('下载文件失败:', error.message);
            res.status(500).send('下载失败');
        }
    }
    async getPaginatedResources(type, page) {
        const validViews = {
            file: 'view_file_resources',
            image: 'view_image_resources',
            video: 'view_video_resources',
            audio: 'view_audio_resources',
        };
        const view = validViews[type];
        if (!view)
            throw new common_1.BadRequestException('无效的资源类型');
        const limit = 12;
        const offset = (page - 1) * limit;
        const [data, count] = await Promise.all([
            this.dataSource.query(`SELECT * FROM ${view} LIMIT ? OFFSET ?`, [
                limit,
                offset,
            ]),
            this.dataSource.query(`SELECT COUNT(*) as total FROM ${view}`),
        ]);
        return {
            code: 0,
            data: {
                list: data,
                total: Number(count[0].total),
            },
            message: '获取成功',
        };
    }
    async searchResources(query) {
        const data = await this.dataSource.query(`SELECT * FROM resources WHERE name LIKE ? OR detail LIKE ?`, [`%${query}%`, `%${query}%`]);
        const total = data.length;
        return {
            code: 0,
            data: {
                list: data,
                total: total,
            },
            message: '搜索成功',
        };
    }
    async findByUploader(uploaderId) {
        const list = await this.resourceRepo.find({
            where: { uploader_id: uploaderId },
            order: { created_at: 'DESC' },
        });
        const total = list.length;
        const downloadTotal = list.reduce((sum, item) => sum + (item.download_count || 0), 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayUploadCount = await this.resourceRepo.count({
            where: {
                uploader_id: uploaderId,
                created_at: (0, typeorm_2.MoreThanOrEqual)(today),
            },
        });
        return {
            code: 0,
            data: {
                list,
                total,
                downloadTotal,
                todayUploadCount,
            },
            message: '获取用户资源成功',
        };
    }
    async delete(id) {
        const resource = await this.resourceRepo.findOneBy({ id });
        if (!resource)
            throw new common_1.NotFoundException('资源不存在');
        await this.resourceRepo.delete(id);
        return {
            code: 0,
            data: null,
            message: '删除成功',
        };
    }
};
exports.ResourceService = ResourceService;
exports.ResourceService = ResourceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(resource_entity_1.Resource)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], ResourceService);
//# sourceMappingURL=resource.service.js.map