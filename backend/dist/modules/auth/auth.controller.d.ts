import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    sendCode(email: string): Promise<{
        code: number;
        data: string;
        message: string;
    }>;
    register(body: {
        email: string;
        password: string;
        code: string;
    }): Promise<{
        code: number;
        data: {
            token: string;
        };
        message: string;
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        code: number;
        data: {
            token: string;
            user: import("./user.entity").User;
        };
        message: string;
    }>;
    getProfile(req: any): Promise<{
        user: any;
    }>;
    resetPassword(body: {
        email: string;
        code: string;
        newPassword: string;
    }): Promise<{
        code: number;
        message: string;
    }>;
    updateUser(req: any, body: {
        username?: string;
        avatar?: string;
    }): Promise<{
        code: number;
        data: {
            userInfo: import("./user.entity").User;
        };
        message: string;
    }>;
}
