"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jwt = require("jsonwebtoken");
const SECRET = 'asdfghjk';
class JwtService {
    sign(payload) {
        return jwt.sign(payload, SECRET, { expiresIn: '7d' });
    }
    verify(token) {
        return jwt.verify(token, SECRET);
    }
}
exports.JwtService = JwtService;
//# sourceMappingURL=jwt.service.js.map