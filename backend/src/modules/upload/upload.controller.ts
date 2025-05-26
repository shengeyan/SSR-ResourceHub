import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: any,
    @Body('type') type: string,
    @Body('name') name: string,
    @Body('detail') detail: string,
    @Body('uploader_id') uploader_id: string,
  ) {
    const url = await this.uploadService.handleUpload(
      file,
      type,
      name,
      detail,
      uploader_id,
    );

    return {
      code: 0,
      data: { url },
      message: '上传成功',
    };
  }
}
