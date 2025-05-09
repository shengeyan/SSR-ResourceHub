import { ResourceService } from './resource.service';
import { Response } from 'express';
export declare class ResourceController {
    private readonly resourceService;
    constructor(resourceService: ResourceService);
    download(id: string, res: Response): Promise<void>;
    getResources(type: string, page?: number): Promise<{
        code: number;
        data: {
            list: any;
            total: number;
        };
        message: string;
    }>;
    searchResources(query: string): Promise<{
        code: number;
        data: {
            list: any;
            total: any;
        };
        message: string;
    }>;
    getResourcesByUploader(uploaderId: string): Promise<{
        code: number;
        data: {
            list: import("./resource.entity").Resource[];
            total: number;
            downloadTotal: number;
            todayUploadCount: number;
        };
        message: string;
    }>;
    deleteResource(body: {
        id: string;
    }): Promise<{
        code: number;
        data: any;
        message: string;
    }>;
}
