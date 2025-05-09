import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { storeCode, verifyCode } from './email-verification.store';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// email config
const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: '2323499160@qq.com',
    pass: 'hlqiulunstkhdied',
  },
});

// SHA加密
function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // 发送验证码
  async sendVerificationCode(email) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('邮箱格式不正确');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    storeCode(email, code);

    try {
      await transporter.sendMail({
        from: '2323499160@qq.com',
        to: email,
        subject: '您的注册验证码',
        text: `您好，您的验证码是：${code}，5分钟内有效。`,
      });
    } catch (err) {
      console.error('发送邮件失败：', err);
      throw new BadRequestException('发送验证码失败');
    }

    return {
      code: 0,
      data: code,
      message: '验证码已发送至邮箱',
    };
  }

  // 注册
  async register({ email, password, code }) {
    if (!email || !password || !code) {
      throw new BadRequestException('缺少必要字段');
    }

    const valid = verifyCode(email, code);
    if (!valid) {
      throw new UnauthorizedException('验证码无效或已过期');
    }

    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) {
      throw new ConflictException('用户已存在');
    }

    const user = this.userRepo.create({
      email,
      password: sha256(password).toString(),
      username: email.split('@')[0],
      emailVerified: true,
      avatar: 'https://imgse.com/i/pi9vqjx',
    });
    await this.userRepo.save(user);

    const token = this.jwtService.sign({ id: user.id, email: user.email });

    return {
      code: 0,
      data: { token },
      message: '注册成功',
    };
  }

  // 登录
  async login({ email, password }: { email: string; password: string }) {
    if (!email || !password) {
      throw new BadRequestException('缺少必要字段');
    }

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || user.password !== sha256(password).toString()) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const token = this.jwtService.sign({ id: user.id, email: user.email });

    return {
      code: 0,
      data: { token, user },
      message: '登录成功',
    };
  }

  // 重置密码
  async resetPassword(email: string, code: string, newPassword: string) {
    if (!email || !code || !newPassword) {
      throw new BadRequestException('缺少必要字段');
    }

    const isValid = verifyCode(email, code);
    if (!isValid) {
      throw new UnauthorizedException('验证码无效或已过期');
    }

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    user.password = sha256(newPassword);
    await this.userRepo.save(user);

    return {
      code: 0,
      message: '密码重置成功',
    };
  }

  async updateUser(
    userId: string,
    body: { username?: string; avatar?: string },
  ) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (body.username) user.username = body.username;
    if (body.avatar) user.avatar = body.avatar;

    const userInfo = await this.userRepo.save(user);

    return {
      code: 0,
      data: { userInfo },
      message: '用户信息更新成功',
    };
  }
}
