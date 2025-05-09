"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeCode = storeCode;
exports.verifyCode = verifyCode;
const cache = new Map();
function storeCode(email, code) {
    cache.set(email, { code, expires: Date.now() + 5 * 60 * 1000 });
}
function verifyCode(email, code) {
    const entry = cache.get(email);
    if (!entry)
        return false;
    const valid = entry.code === code && Date.now() < entry.expires;
    if (valid)
        cache.delete(email);
    return valid;
}
//# sourceMappingURL=email-verification.store.js.map