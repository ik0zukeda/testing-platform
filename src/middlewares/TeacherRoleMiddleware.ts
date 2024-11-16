import { Injectable, NestMiddleware } from "@nestjs/common";
import { ERole } from "../models/ERole";

@Injectable()
export class TeacherRoleMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const user = req.user;
        const role = user.role;
        if (role != ERole.Teacher) {
            res.render("403")
        } else {
            next();
        }
    }
}