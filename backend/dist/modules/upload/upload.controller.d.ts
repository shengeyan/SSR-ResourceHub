import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    upload(file: any, type: string, name: string, detail: string): Promise<{
        code: number;
        data: {
            url: string;
        };
        message: string;
    }>;
}
