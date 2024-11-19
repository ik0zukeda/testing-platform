import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "../services/AuthService";
import { Response } from 'express';
import { LoginDTO } from "../dto/LoginDTO";
import { RegisterDTO } from "../dto/RegisterDTO";
import { GetInviteLinkDTO } from "../dto/GetInviteLinkDTO";
import { ReturnCheckInviteLinkDTO } from "../dto/ReturnCheckInviteLinkDTO";
import {
    CheckRecoverLinkDTOs,
    RecoverPasswordDTO,
    UpdatePasswordAfterRecoverDTO,
    UpdatePasswordDTO
} from "../dto/RecoverPasswordDTO";
import { CheckInviteLinkDTO } from "../dto/CheckInviteLinkDTO";
import { Roles, RolesGuard } from "../models/RolesGuard";
import { ERole } from "../models/ERole";
import { ActivateActorDTO } from "../dto/ActivateActorDTO";
import { DeleteUserDTO } from "../dto/DeleteUserDTO";

@Controller("api/auth")
@UseGuards(RolesGuard)
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post("login")
    async login(@Body() body: LoginDTO, @Res() res: Response) {
        const result = await this.authService.login(body, res);
        res.json(result);
    }

    @Get("logout")
    async logout(@Res() res: Response) {
        res.cookie('auth-token', '', { expires: new Date(0), httpOnly: true });
        res.json("success logout");
    }

    @Post("activate")
    async activate(@Body() activateStudentDTO: ActivateActorDTO): Promise<boolean> {
        return await this.authService.loginAndActivate(activateStudentDTO);
    }

    @Post("register")
    async register(@Body() body: RegisterDTO, @Res() res: Response) {
        const result = await this.authService.register(body, res);
        res.json(result);
    }

    @Post("get_invite_link")
    @Roles(ERole.Teacher, ERole.Administrator)
    async getInviteLink(@Body() body: GetInviteLinkDTO): Promise<string> {
        return await this.authService.getInviteLink(body);
    }

    @Post("check_invite_link")
    async checkInviteLink(@Body() body: CheckInviteLinkDTO): Promise<ReturnCheckInviteLinkDTO> {
        return await this.authService.checkInviteLink(body);
    }

    @Post("recover_password")
    async recoverPassword(@Body() body: RecoverPasswordDTO): Promise<boolean> {
        return await this.authService.recoverPassword(body);
    }

    @Post("check_recover_link")
    async checkRecoverLink(@Body() body: CheckRecoverLinkDTOs): Promise<boolean> {
        return await this.authService.checkRecoverLink(body);
    }

    @Post("update_password_after_recover")
    async updatePasswordAfterRecover(@Body() body: UpdatePasswordAfterRecoverDTO): Promise<boolean> {
        return await this.authService.updatePasswordAfterRecover(body);
    }

    @Post("update_password")
    async updatePassword(@Req() req: any, @Body() body: UpdatePasswordDTO): Promise<boolean> {
        return await this.authService.updatePassword(body, req.user.login);
    }

    @Post("delete")
    @Roles(ERole.Administrator)
    async delete(@Body() body: DeleteUserDTO): Promise<boolean> {
        return await this.authService.delete(body);
    }
}
