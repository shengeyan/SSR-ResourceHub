import { Repository } from 'typeorm';
import { Resource } from '../resource/resource.entity';
export declare class UploadService {
    private readonly resourceRepo;
    private octokit;
    private owner;
    private repo;
    constructor(resourceRepo: Repository<Resource>);
    handleUpload(file: any, type: string, name: string, detail: string): Promise<string>;
}
