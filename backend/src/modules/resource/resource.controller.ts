import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { Response } from 'express';

@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get('download')
  async download(@Query('id') id: string, @Res() res: Response) {
    const resource = await this.resourceService.findOne(id);
    this.resourceService.increaseDownloadCount(id); // 异步计数
    await this.resourceService.proxyDownload(resource, res);
  }
  @Get('list')
  async getResources(
    @Query('type') type: string,
    @Query('page') page: number = 1,
  ) {
    return this.resourceService.getPaginatedResources(type, page);
  }

  @Get('search')
  async searchResources(@Query('query') query: string) {
    return this.resourceService.searchResources(query);
  }

  // ✅ 新增：根据 uploader_id 获取该用户所有资源
  @Get('by-uploader')
  async getResourcesByUploader(@Query('uploader_id') uploaderId: string) {
    return this.resourceService.findByUploader(uploaderId);
  }

  // ✅ 可选：删除资源
  @Post('delete')
  async deleteResource(@Body() body: { id: string }) {
    return this.resourceService.delete(body.id);
  }
}
