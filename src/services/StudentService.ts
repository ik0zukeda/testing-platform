import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConflictException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Student } from "../entities/Student";
import { CreateStudentDTO } from "../dto/CreateStudentDTO";
import { OrganizationService } from "./OrganizationService";
import { ValidationService } from "./ValidationService";
import { UpdateStudentDTO } from "../dto/UpdateStudentDTO";
import { RemoveStudentIdDTO } from "../dto/RemoveStudentIdDTO";
import { AuthService } from "./AuthService";

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(Student) private studentRepository: Repository<Student>,
        private readonly organizationService: OrganizationService,
        @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService
    ) {
    }

    async create(createStudentDTO: CreateStudentDTO): Promise<Student> {
        const organization = await this.organizationService.receiveById(createStudentDTO.organizationId);

        const newStudent = await this.studentRepository.save({
            organizationId: createStudentDTO.organizationId,
            name: createStudentDTO.name,
            group: createStudentDTO.group.toUpperCase()
        });

        await this.organizationService.addStudent(organization, newStudent);

        return newStudent;
    }

    async receive(studentId: number): Promise<Student> {
        const student = await this.studentRepository.findOneBy({ id: studentId });

        if (student === null) {
            throw new NotFoundException("Студента с таким id не существует.");
        }

        return student;
    }

    async receiveByUserId(userId: number, throwError = true): Promise<Student> {
        const student = await this.studentRepository.findOneBy({ userID: userId });

        if (student === null) {
            if (throwError) {
                throw new NotFoundException("Студента с таким id не существует.");
            }
        }

        return student;
    }

    async activate(
        studentId: number,
        userId: number,
        email: string,
        fromLogin = true
    ): Promise<void> {
        const student = await this.studentRepository.findOneBy({ id: studentId });

        if (student === null) {
            throw new NotFoundException("Студента с таким id не существует.");
        }

        if (!ValidationService.isNothing(student.userID) && student.isActive) {
            throw new ConflictException("Данный студент уже активирован и добавлен в организацию");
        }

        if (fromLogin) {
            const existingStudent = await this.receiveByUserId(userId, false);
            if (!ValidationService.isNothing(existingStudent)) {
                throw new ConflictException("Студент для данного аккаунта уже существует. Для добавления в организацию создайте новый аккаунт.");
            }
        }

        student.isActive = true;
        student.userID = userId;
        student.email = email;

        await this.studentRepository.save(student);
    }

    async receiveAllOrgGroups(orgId: number): Promise<string[]> {
        const groups: string[] = [];
        const result = await this.studentRepository
            .createQueryBuilder("student")
            .select("DISTINCT student.group")
            .where(`student.organizationId=${orgId}`)
            .getRawMany();

        result.forEach((r) => {
            groups.push(r.group);
        });

        return groups.map(group => group.toUpperCase());
    }

    async receiveAllGroups(): Promise<string[]> {
        const groups: string[] = [];
        const result = await this.studentRepository
            .createQueryBuilder("student")
            .select("DISTINCT student.group")
            .getRawMany();

        result.forEach((r) => {
            groups.push(r.group);
        });

        return groups.map(group => group.toUpperCase());
    }

    async update(studentId: number, updateStudentDTO: UpdateStudentDTO): Promise<Student> {
        const student = await this.receive(studentId);
        let changeEmail = false;

        if (!ValidationService.isNothing(updateStudentDTO.name)) {
            student.name = updateStudentDTO.name;
        }

        if (!ValidationService.isNothing(updateStudentDTO.userID)) {
            student.userID = updateStudentDTO.userID;
        }

        if (!ValidationService.isNothing(updateStudentDTO.email)) {
            student.email = updateStudentDTO.email;
            changeEmail = true;
        }

        if (!ValidationService.isNothing(updateStudentDTO.group)) {
            student.group = updateStudentDTO.group;
        }

        await this.studentRepository.save(student);

        if (changeEmail) {
            await this.authService.changeEmail(student.userID, updateStudentDTO.email);
        }

        return student;
    }

    async delete(removeStudentIdDTO: RemoveStudentIdDTO): Promise<boolean> {
        const student = await this.receive(removeStudentIdDTO.studentId);
        if (student != null) {
            await this.studentRepository.delete(student.id);
        }

        await this.organizationService.removeStudentId(removeStudentIdDTO);

        return true;
    }
}
