import { DataSource, Repository } from 'typeorm';
import { Resource } from './resource.entity';
export declare class ResourceService {
    private readonly resourceRepo;
    private dataSource;
    constructor(resourceRepo: Repository<Resource>, dataSource: DataSource);
    findOne(id: string): Promise<Resource>;
    increaseDownloadCount(id: string): Promise<void>;
    proxyDownload(resource: Resource, res: any): Promise<void>;
    getPaginatedResources(type: string, page: number): Promise<{
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
    findByUploader(uploaderId: string): Promise<{
        code: number;
        data: {
            list: Resource[];
            total: number;
            downloadTotal: number;
            todayUploadCount: number;
        };
        message: string;
    }>;
    delete(id: string): Promise<{
        code: number;
        data: any;
        message: string;
    }>;
}
