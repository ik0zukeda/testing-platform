import { Injectable, NestMiddleware } from "@nestjs/common";
import { ERole } from "../models/ERole";

@Injectable()
export class StudentRoleMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const user = req.user;
        const role = user.role;
        if (role != ERole.Student) {
            res.render("403")
        } else {
            next();
        }
    }
}