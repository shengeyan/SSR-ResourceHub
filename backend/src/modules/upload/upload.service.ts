import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Octokit } from '@octokit/rest';
import { Resource } from '../resource/resource.entity';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class UploadService {
  private octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  private owner = process.env.GITHUB_OWNER;
  private repo = process.env.GITHUB_REPO;

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepo: Repository<Resource>,
  ) {}

  async handleUpload(file: any, type: string, name: string, detail: string) {
    if (!file || !type || !name) {
      throw new BadRequestException('缺少 type、name 或文件内容');
    }

    const path = `${type}/${name}`;
    const content = file.buffer.toString('base64');

    // 假设你在这里使用 GitHub API 或其他文件存储服务来存储文件
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

    // 存入数据库时保存 detail 字段
    const resource = this.resourceRepo.create({
      id: uuidv4(),
      name,
      type,
      url: rawUrl,
      size: file.size,
      mime_type: file.mimetype,
      preview_url: type === 'image' ? rawUrl : null,
      detail, // 保存 detail 字段
    });

    await this.resourceRepo.save(resource);

    return rawUrl;
  }
}
