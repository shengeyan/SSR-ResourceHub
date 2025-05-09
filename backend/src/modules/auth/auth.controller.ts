import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from '../jwt/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-code')
  async sendCode(@Body('email') email: string) {
    return this.authService.sendVerificationCode(email);
  }

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; code: string },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  @Post('me')
  @UseGuards(JwtGuard)
  async getProfile(@Req() req: any) {
    return { user: req.user };
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; code: string; newPassword: string },
  ) {
    return this.authService.resetPassword(
      body.email,
      body.code,
      body.newPassword,
    );
  }

  @Post('update-user')
  @UseGuards(JwtGuard)
  async updateUser(
    @Req() req,
    @Body() body: { username?: string; avatar?: string },
  ) {
    return this.authService.updateUser(req.user.id, body);
  }
}
