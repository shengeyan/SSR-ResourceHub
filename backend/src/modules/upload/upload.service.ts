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

  async handleUpload(
    file: any,
    type: string,
    name: string,
    detail: string,
    uploader_id: string,
  ) {
    if (!file || !type || !name) {
      throw new BadRequestException('缺少 type、name 或文件内容');
    }

    const path = type === 'avatar' ? `avatar/${name}` : `${type}/${name}`;
    const content = file.buffer.toString('base64');

    // Github存储
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
      id: uuidv4(),
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
}
