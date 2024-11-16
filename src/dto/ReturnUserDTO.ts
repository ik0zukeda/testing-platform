import { ERole } from "../models/ERole";
import { User } from "../entities/User";

export class ReturnUserDTO {
    role: ERole;

    constructor(user: User) {
        this.role = user.role;
    }
}
