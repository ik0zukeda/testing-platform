import * as jwt from "jsonwebtoken";
import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            throw new UnauthorizedException('Токен не передан');
        }

        const token = authHeader.split(' ')[1];
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
            next();
        } catch (err) {
            throw new UnauthorizedException('Неверный или истекший токен');
        }
    }
}
