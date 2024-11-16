import { Injectable, NestMiddleware } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthViewMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const cookie = req.headers.cookie;

        if (!cookie) {
            res.render('403');
            return;
        }

        const token = cookie.split('=')[1];

        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
            next();
        } catch (err) {
            res.render('403');
            return;
        }
    }
}
