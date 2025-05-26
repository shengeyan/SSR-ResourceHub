import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';
import { Resource } from './resource.entity';
import axios from 'axios';

const axiosInstance = axios.create({
  proxy: false, // 禁用代理
});
@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepo: Repository<Resource>,
    private dataSource: DataSource,
  ) {}

  // 查找单个资源
  async findOne(id: string): Promise<Resource> {
    const res = await this.resourceRepo.findOneBy({ id });
    if (!res) throw new NotFoundException('资源不存在');
    return res;
  }

  // 记数
  async increaseDownloadCount(id: string) {
    await this.resourceRepo.increment({ id }, 'download_count', 1);
  }

  // 下载资源
  async proxyDownload(resource: Resource, res) {
    try {
      const stream = await axiosInstance.get(resource.url, {
        responseType: 'stream',
      });

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${resource.name}"`,
      );
      res.setHeader(
        'Content-Type',
        resource.mime_type || 'application/octet-stream',
      );

      stream.data.pipe(res);
    } catch (error) {
      console.error('下载文件失败:', error.message);
      res.status(500).send('下载失败');
    }
  }
  // 按页查找
  async getPaginatedResources(type: string, page: number) {
    const validViews = {
      file: 'view_file_resources',
      image: 'view_image_resources',
      video: 'view_video_resources',
      audio: 'view_audio_resources',
    };

    const view = validViews[type];
    if (!view) throw new BadRequestException('无效的资源类型');

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

  // 搜索资源
  async searchResources(query: string) {
    // 使用模糊查询（LIKE）对 `name` 和 `detail` 字段进行搜索
    const data = await this.dataSource.query(
      `SELECT * FROM resources WHERE name LIKE ? OR detail LIKE ?`,
      [`%${query}%`, `%${query}%`],
    );

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

  // 根据ID查找资源
  async findByUploader(uploaderId: string) {
    const list = await this.resourceRepo.find({
      where: { uploader_id: uploaderId },
      order: { created_at: 'DESC' },
    });

    const total = list.length;
    const downloadTotal = list.reduce(
      (sum, item) => sum + (item.download_count || 0),
      0,
    );

    // 计算今日上传数
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 设置为今日零点

    const todayUploadCount = await this.resourceRepo.count({
      where: {
        uploader_id: uploaderId,
        created_at: MoreThanOrEqual(today),
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

  // 删除资源
  async delete(id: string) {
    const resource = await this.resourceRepo.findOneBy({ id });
    if (!resource) throw new NotFoundException('资源不存在');

    await this.resourceRepo.delete(id);

    return {
      code: 0,
      data: null,
      message: '删除成功',
    };
  }
}
