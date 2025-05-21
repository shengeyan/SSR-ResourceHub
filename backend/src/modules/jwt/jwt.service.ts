import * as jwt from 'jsonwebtoken';

// const SECRET = 'your-secret-key'; 
const SECRET = 'asdfghjk'; 

export class JwtService {
  sign(payload: any): string {
    return jwt.sign(payload, SECRET, { expiresIn: '7d' });
  }

  verify(token: string): any {
    return jwt.verify(token, SECRET);
  }
}
