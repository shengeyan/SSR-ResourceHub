import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class JwtGuard implements CanActivate {
    private jwtService;
    canActivate(context: ExecutionContext): boolean;
}
