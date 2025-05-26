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
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rest_1 = require("@octokit/rest");
const resource_entity_1 = require("../resource/resource.entity");
const uuid_1 = require("uuid");
const dotenv = require("dotenv");
dotenv.config();
let UploadService = class UploadService {
    constructor(resourceRepo) {
        this.resourceRepo = resourceRepo;
        this.octokit = new rest_1.Octokit({ auth: process.env.GITHUB_TOKEN });
        this.owner = process.env.GITHUB_OWNER;
        this.repo = process.env.GITHUB_REPO;
    }
    async handleUpload(file, type, name, detail, uploader_id) {
        if (!file || !type || !name) {
            throw new common_1.BadRequestException('缺少 type、name 或文件内容');
        }
        const path = type === 'avatar' ? `avatar/${name}` : `${type}/${name}`;
        const content = file.buffer.toString('base64');
        await this.octokit.repos.createOrUpdateFileContents({
            owner: this.owner,
            repo: this.repo,
            path,
            message: `upload ${path}`,
            content,
            committer: {
                name: 'Uploader Bot',
                email: 'bot@example.com',
            },
            author: {
                name: 'Uploader Bot',
                email: 'bot@example.com',
            },
        });
        const rawUrl = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/main/${path}`;
        const resource = this.resourceRepo.create({
            id: (0, uuid_1.v4)(),
            name,
            type,
            url: rawUrl,
            size: file.size,
            mime_type: file.mimetype,
            preview_url: type === 'image' ? rawUrl : null,
            detail,
            uploader_id,
        });
        await this.resourceRepo.save(resource);
        return rawUrl;
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(resource_entity_1.Resource)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UploadService);
//# sourceMappingURL=upload.service.js.map