import { JwtService } from '../jwt/jwt.service';
import { User } from './user.entity';
import { Repository } from 'typeorm';
export declare class AuthService {
    private readonly userRepo;
    private readonly jwtService;
    constructor(userRepo: Repository<User>, jwtService: JwtService);
    sendVerificationCode(email: any): Promise<{
        code: number;
        data: string;
        message: string;
    }>;
    register({ email, password, code }: {
        email: any;
        password: any;
        code: any;
    }): Promise<{
        code: number;
        data: {
            token: string;
        };
        message: string;
    }>;
    login({ email, password }: {
        email: string;
        password: string;
    }): Promise<{
        code: number;
        data: {
            token: string;
            user: User;
        };
        message: string;
    }>;
    resetPassword(email: string, code: string, newPassword: string): Promise<{
        code: number;
        message: string;
    }>;
    updateUser(userId: string, body: {
        username?: string;
        avatar?: string;
    }): Promise<{
        code: number;
        data: {
            userInfo: User;
        };
        message: string;
    }>;
}
