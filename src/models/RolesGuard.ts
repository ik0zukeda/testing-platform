import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { SetMetadata } from '@nestjs/common';
import { ERole } from "./ERole";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get<ERole[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!roles.includes(user.role)) {
            throw new ForbiddenException('У вас нет прав для доступа к этому ресурсу');
        }

        return true;
    }
}


export const Roles = (...roles: ERole[]) => SetMetadata('roles', roles);
