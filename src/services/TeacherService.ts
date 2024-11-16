import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConflictException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Teacher } from "../entities/Teacher";
import { CreateTeacherDTO } from "../dto/CreateTeacherDTO";
import { AddGroupsDTO } from "../dto/AddStudentDTO";
import { OrganizationService } from "./OrganizationService";
import { ValidationService } from "./ValidationService";
import { UpdateTeacherDTO } from "../dto/UpdateTeacherDTO";
import { RemoveGroupDTO } from "../dto/RemoveGroupDTO";
import { RemoveTeacherIdDTO } from "../dto/RemoveTeacherIdDTO";
import { AuthService } from "./AuthService";
import { StudentService } from "./StudentService";

@Injectable()
export class TeacherService {
    constructor(
        @InjectRepository(Teacher) private teacherRepository: Repository<Teacher>,
        private readonly organizationService: OrganizationService,
        private readonly studentService: StudentService,
        @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService) {
    }

    async create(createTeacherDTO: CreateTeacherDTO): Promise<Teacher> {
        const organization = await this.organizationService.receiveById(createTeacherDTO.organizationId);

        const newTeacher = await this.teacherRepository.save({
            organizationId: createTeacherDTO.organizationId,
            name: createTeacherDTO.name
        });

        await this.organizationService.addTeacher(organization, newTeacher);

        return newTeacher;
    }

    async receive(teacherId: number): Promise<Teacher> {
        const teacher = await this.teacherRepository.findOneBy({ id: teacherId });

        if (teacher === null) {
            throw new NotFoundException("Данного преподавателя не существует.");
        }

        return teacher;
    }

    async receiveByUserId(userId: number, throwError = true): Promise<Teacher> {
        const teacher = await this.teacherRepository.findOneBy({ userID: userId });

        if (teacher === null) {
            if (throwError) {
                throw new NotFoundException("Данного преподавателя не существует.");
            }
        }

        return teacher;
    }

    async receiveByStudentId(studentId: number): Promise<Teacher[]> {
        return await this.teacherRepository
            .createQueryBuilder("teacher")
            .where(":studentId = ANY(teacher.studentIds)", { studentId })
            .getMany();
    }

    async activate(
        teacherId: number,
        userId: number,
        email: string,
        fromLogin = true
    ): Promise<void> {
        const teacher = await this.teacherRepository.findOneBy({ id: teacherId });

        if (teacher === null) {
            throw new NotFoundException("Данного преподавателя не существует.");
        }

        if (!ValidationService.isNothing(teacher.userID) && teacher.isActive) {
            throw new ConflictException("Данный преподаватель уже активирован и добавлен в организацию");
        }

        if (fromLogin) {
            const existingTeacher = await this.receiveByUserId(userId, false);
            if (!ValidationService.isNothing(existingTeacher)) {
                throw new ConflictException("Преподаватель для данного аккаунта уже существует. Для добавления в организацию создайте новый аккаунт.");
            }
        }

        teacher.isActive = true;
        teacher.userID = userId;
        teacher.email = email;

        await this.teacherRepository.save(teacher);
    }

    async addGroups(addGroupDTO: AddGroupsDTO, login: string): Promise<{ ok: boolean }> {
        const user = await this.authService.receiveUser(login);
        const teacher = await this.receiveByUserId(user.id);

        if (!teacher.groups.includes(addGroupDTO.group.toUpperCase())) {
            teacher.groups.push(addGroupDTO.group.toUpperCase());
        }

        await this.teacherRepository.save(teacher);
        return { ok: true };
    }

    async removeGroup(removeGroupDTO: RemoveGroupDTO, login: string): Promise<{ ok: boolean }> {
        const user = await this.authService.receiveUser(login);
        const teacher = await this.receiveByUserId(user.id);

        const upperCaseGroup = removeGroupDTO.group.toUpperCase();
        teacher.groups = teacher.groups.filter(existingGroup => existingGroup !== upperCaseGroup);

        await this.teacherRepository.save(teacher);
        return { ok: true };
    }

    async receiveGroups(login: string): Promise<string[]> {
        const user = await this.authService.receiveUser(login);
        const teacher = await this.receiveByUserId(user.id);
        return teacher.groups.map(group => group.toUpperCase());
    }

    async update(teacherId: number, updateTeacherDTO: UpdateTeacherDTO): Promise<Teacher> {
        const teacher = await this.receive(teacherId);
        let changeEmail = false;

        if (!ValidationService.isNothing(updateTeacherDTO.name)) {
            teacher.name = updateTeacherDTO.name;
        }

        if (!ValidationService.isNothing(updateTeacherDTO.userID)) {
            teacher.userID = updateTeacherDTO.userID;
        }

        if (!ValidationService.isNothing(updateTeacherDTO.isActive)) {
            teacher.isActive = updateTeacherDTO.isActive;
        }

        if (!ValidationService.isNothing(updateTeacherDTO.email)) {
            teacher.email = updateTeacherDTO.email;
            changeEmail = true;
        }

        await this.teacherRepository.save(teacher);

        if (changeEmail) {
            await this.authService.changeEmail(teacher.userID, updateTeacherDTO.email);
        }

        return teacher;
    }

    async delete(removeTeacherIdDTO: RemoveTeacherIdDTO): Promise<boolean> {
        const teacher = await this.receive(removeTeacherIdDTO.teacherId);
        if (teacher != null) {
            await this.teacherRepository.delete(teacher.id);
        }

        await this.organizationService.removeTeacherId(removeTeacherIdDTO);

        return true;
    }

    async receiveAllOrgGroups(login: string): Promise<string[]> {
        const user = await this.authService.receiveUser(login);
        const teacher = await this.receiveByUserId(user.id);

        return await this.studentService.receiveAllOrgGroups(teacher.organizationId);
    }
}
