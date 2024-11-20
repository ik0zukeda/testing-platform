import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/User";
import { Repository } from "typeorm";
import { LoginDTO } from "../dto/LoginDTO";
import { ReturnUserDTO } from "../dto/ReturnUserDTO";
import { ERole } from "../models/ERole";
import { RegisterDTO } from "../dto/RegisterDTO";
import { StudentService } from "./StudentService";
import { TeacherService } from "./TeacherService";
import { GetInviteLinkDTO } from "../dto/GetInviteLinkDTO";
import { CodeLinkService } from "./CodeLinkService";
import { OrganizationService } from "./OrganizationService";
import { ReturnCheckInviteLinkDTO } from "../dto/ReturnCheckInviteLinkDTO";
import {
    CheckRecoverLinkDTOs,
    RecoverPasswordDTO,
    UpdatePasswordAfterRecoverDTO,
    UpdatePasswordDTO
} from "../dto/RecoverPasswordDTO";
import { CheckInviteLinkDTO } from "../dto/CheckInviteLinkDTO";
import { Email } from "../models/Email";
import { v4 as uuidv4 } from "uuid";
import { RecoverService } from "./RecoverService";
import * as jwt from "jsonwebtoken";
import { Response } from "express";
import * as process from "node:process";
import { ActivateActorDTO } from "../dto/ActivateActorDTO";
import { DeleteUserDTO } from "../dto/DeleteUserDTO";

const bcrypt = require("bcrypt");
const crypto = require("crypto");

@Injectable()
export class AuthService {
    private readonly emailSender: Email;

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private readonly studentService: StudentService,
        private readonly organizationRepository: OrganizationService,
        private readonly teacherService: TeacherService,
        private readonly recoverService: RecoverService
    ) {
        this.emailSender = new Email();
    }

    async login(data: LoginDTO, res: Response): Promise<{ user: ReturnUserDTO, token: string }> {
        const hashedLogin = crypto
            .createHash("sha256")
            .update(data.login)
            .digest("hex");

        const user = await this.receiveUser(hashedLogin, false);

        if (user === null || !bcrypt.compareSync(data.password, user.password)) {
            throw new NotFoundException("Пользователя с таким логином или паролем не существует.");
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, login: hashedLogin },
            process.env.JWT_SECRET,
            { expiresIn: "3h" }
        );

        // let actorId: number;
        // if (user.role === ERole.Teacher) {
        //     actorId = (await this.teacherService.receiveByUserId(user.id)).id;
        // } else if (user.role === ERole.Student) {
        //     actorId = (await this.studentService.receiveByUserId(user.id)).id;
        // }

        res.cookie("auth-token", token, { httpOnly: false, secure: false, maxAge: 10800000 });
        return {
            user: new ReturnUserDTO(user),
            token
            // actorId
        };
    }

    async loginAndActivate(activateStudentDTO: ActivateActorDTO) {
        const actorId = activateStudentDTO.actorId;
        const login = activateStudentDTO.login;
        const password = activateStudentDTO.password;

        const hashedLogin = crypto
            .createHash("sha256")
            .update(login)
            .digest("hex");

        const user = await this.receiveUser(hashedLogin, false);

        if (user === null || !bcrypt.compareSync(password, user.password)) {
            throw new NotFoundException("Пользователя с таким логином или паролем не существует.");
        }

        if (user.role === ERole.Teacher) {
            await this.teacherService.activate(actorId, user.id, login);
        } else if (user.role === ERole.Student) {
            await this.studentService.activate(actorId, user.id, login);
        }

        return true;
    }

    async register(data: RegisterDTO, res: Response): Promise<any> {
        const hashedLogin = crypto
            .createHash("sha256")
            .update(data.login)
            .digest("hex");

        const user = await this.receiveUser(hashedLogin, false);

        if (user !== null) {
            throw new ConflictException(
                "Пользователь с таким логином уже существует."
            );
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);

        const newUser = await this.userRepository.save({
            login: hashedLogin,
            password: hashedPassword,
            role: data.role
        });

        try {
            if (data.role === ERole.Teacher) {
                await this.teacherService.activate(
                    data.actorId,
                    newUser.id,
                    data.login,
                    false
                );
            } else if (data.role === ERole.Student) {
                await this.studentService.activate(
                    data.actorId,
                    newUser.id,
                    data.login,
                    false
                );
            }

            const token = jwt.sign(
                { id: newUser.id, role: newUser.role, login: hashedLogin },
                process.env.JWT_SECRET,
                { expiresIn: "3h" }
            );

            res.cookie("auth-token", token, { httpOnly: false, secure: false, maxAge: 10800000 });
            return {
                user: new ReturnUserDTO(newUser),
                token
                // actorId
            };

        } catch (e) {
            await this.userRepository.delete(newUser.id);
            throw e;
        }
    }

    async getInviteLink(body: GetInviteLinkDTO): Promise<string> {
        const url = process.env.URL + "/invite?link=";
        const link = await CodeLinkService.generateInviteLink(
            body.role,
            body.actorId,
            body.orgName,
            body.isActive
        );

        return url + link;
    }

    async checkInviteLink(body: CheckInviteLinkDTO): Promise<ReturnCheckInviteLinkDTO> {
        const link = body.link;
        try {
            const data: GetInviteLinkDTO = (await CodeLinkService.decrypt(
                link
            )) as GetInviteLinkDTO;

            if (data.role !== ERole.Teacher && data.role !== ERole.Student) {
                return new ReturnCheckInviteLinkDTO(false, null, "Попытка добавления неопознанного пользователя");
            }

            data.role === ERole.Teacher
                ? await this.teacherService.receive(data.actorId)
                : await this.studentService.receive(data.actorId);

            await this.organizationRepository.receiveByName(data.orgName);
            return new ReturnCheckInviteLinkDTO(true, data, null);
        } catch (e) {
            return new ReturnCheckInviteLinkDTO(false, null, e.message);
        }
    }

    async receiveUser(login: string, throwError: boolean = true): Promise<User> {
        const user = await this.userRepository.findOneBy({ login: login });

        if (user === null) {
            if (throwError) {
                throw new NotFoundException(
                    "Пользователя с таким логином не существует."
                );
            }
        }

        return user;
    }

    async recoverPassword(body: RecoverPasswordDTO): Promise<boolean> {
        const hashedLogin = crypto
            .createHash("sha256")
            .update(body.email)
            .digest("hex");

        const user = await this.receiveUser(hashedLogin, false);

        if (user == null) {
            return true;
        }

        const uuid = uuidv4();
        const url = `${process.env.URL}/recover?link=${uuid}`;
        const text = "Уважаемый пользователь Testing Platform!\n" +
            "\n" +
            `Мы получили запрос на восстановление пароля к Вашему аккаунту Testing Platform: ${body.email}. Ваша ссылка подтверждения:\n` +
            "\n" +
            `${url}\n` +
            "\n" +
            `Если Вы не запрашивали эту ссылку, возможно, кто-то пытается получить доступ к Вашему аккаунту ${body.email}. Никому не передавайте эту ссылку.\n` +
            "\n" +
            "С уважением,\n" +
            "\n" +
            "Команда Аккаунтов Testing Platform";
        try {
            await this.emailSender.sendMail("Восстановление пароля на сайте Testing Platform", body.email, text);
            await this.recoverService.create(body.email, uuid);
            return true;
        } catch (e) {
            return false;
        }
    }

    async updatePasswordAfterRecover(body: UpdatePasswordAfterRecoverDTO): Promise<boolean> {
        const email = await this.getEmailFromRecoverLink(body.link);
        if (email === null) {
            return false;
        }

        const hashedLogin = crypto
            .createHash("sha256")
            .update(email)
            .digest("hex");

        const user = await this.receiveUser(hashedLogin);
        user.password = await bcrypt.hash(body.password, 12);
        await this.userRepository.save(user);
        await this.recoverService.delete(email);
        return true;
    }

    async checkRecoverLink(body: CheckRecoverLinkDTOs): Promise<boolean> {
        return await this.recoverService.checkRecoverLink(body.link);
    }

    async getEmailFromRecoverLink(link: string): Promise<string | null> {
        return await this.recoverService.getEmailFromRecoverLink(link);
    }

    async updatePassword(body: UpdatePasswordDTO, login: string): Promise<boolean> {
        const user = await this.receiveUser(login);
        user.password = await bcrypt.hash(body.password, 12);
        await this.userRepository.save(user);
        return true;
    }

    async changeEmail(userId: number, newEmail: string) {
        const newLogin = crypto
            .createHash("sha256")
            .update(newEmail)
            .digest("hex");

        const user = await this.userRepository.findOneBy({ id: userId });
        const exUser = await this.userRepository.findOneBy({ login: newLogin });

        if (exUser != null) {
            throw new ConflictException("Пользователь с такой почтой уже существует");
        }

        user.login = newLogin;

        await this.userRepository.save(user);
    }

    async delete(body: DeleteUserDTO) {
        const user = await this.userRepository.findOneBy({ id: body.userId });

        if (!user) {
            throw new NotFoundException("Такого пользователя нет!");
        }

        if (user.role === ERole.Teacher) {
            const teacher = await this.teacherService.receiveByUserId(user.id, false);
            if (teacher) {
                await this.teacherService.delete({ organizationId: teacher.organizationId, teacherId: teacher.id });
            }
        } else if (user.role === ERole.Student) {
            const student = await this.studentService.receiveByUserId(user.id, false);
            if (student) {
                await this.studentService.delete({ organizationId: student.organizationId, studentId: student.id });
            }
        }

        await this.userRepository.delete(user);
        return true;
    }
}
