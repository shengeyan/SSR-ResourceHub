"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_service_1 = require("../jwt/jwt.service");
const email_verification_store_1 = require("./email-verification.store");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const user_entity_1 = require("./user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
        user: '2323499160@qq.com',
        pass: 'hlqiulunstkhdied',
    },
});
function sha256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}
let AuthService = class AuthService {
    constructor(userRepo, jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }
    async sendVerificationCode(email) {
        if (!email || !email.includes('@')) {
            throw new common_1.BadRequestException('邮箱格式不正确');
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        (0, email_verification_store_1.storeCode)(email, code);
        try {
            await transporter.sendMail({
                from: '2323499160@qq.com',
                to: email,
                subject: '您的注册验证码',
                text: `您好，您的验证码是：${code}，5分钟内有效。`,
            });
        }
        catch (err) {
            console.error('发送邮件失败：', err);
            throw new common_1.BadRequestException('发送验证码失败');
        }
        return {
            code: 0,
            data: code,
            message: '验证码已发送至邮箱',
        };
    }
    async register({ email, password, code }) {
        if (!email || !password || !code) {
            throw new common_1.BadRequestException('缺少必要字段');
        }
        const valid = (0, email_verification_store_1.verifyCode)(email, code);
        if (!valid) {
            throw new common_1.UnauthorizedException('验证码无效或已过期');
        }
        const exists = await this.userRepo.findOne({ where: { email } });
        if (exists) {
            throw new common_1.ConflictException('用户已存在');
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
    async login({ email, password }) {
        if (!email || !password) {
            throw new common_1.BadRequestException('缺少必要字段');
        }
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user || user.password !== sha256(password).toString()) {
            throw new common_1.UnauthorizedException('邮箱或密码错误');
        }
        const token = this.jwtService.sign({ id: user.id, email: user.email });
        return {
            code: 0,
            data: { token, user },
            message: '登录成功',
        };
    }
    async resetPassword(email, code, newPassword) {
        if (!email || !code || !newPassword) {
            throw new common_1.BadRequestException('缺少必要字段');
        }
        const isValid = (0, email_verification_store_1.verifyCode)(email, code);
        if (!isValid) {
            throw new common_1.UnauthorizedException('验证码无效或已过期');
        }
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            throw new common_1.BadRequestException('用户不存在');
        }
        user.password = sha256(newPassword);
        await this.userRepo.save(user);
        return {
            code: 0,
            message: '密码重置成功',
        };
    }
    async updateUser(userId, body) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        if (body.username)
            user.username = body.username;
        if (body.avatar)
            user.avatar = body.avatar;
        const userInfo = await this.userRepo.save(user);
        return {
            code: 0,
            data: { userInfo },
            message: '用户信息更新成功',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_service_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map