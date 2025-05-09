import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtGuard implements CanActivate {
  private jwtService = new JwtService();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) throw new UnauthorizedException();

    const token = auth.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token);
      req.user = decoded;
      return true;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
