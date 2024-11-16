import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Organization } from "../entities/Organization";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrganizationDTO } from "../dto/CreateOrganizationDTO";
import { Student } from "../entities/Student";
import { Teacher } from "../entities/Teacher";
import { Topic } from "../entities/Topic";
import { RemoveStudentIdDTO } from "../dto/RemoveStudentIdDTO";
import { RemoveTeacherIdDTO } from "../dto/RemoveTeacherIdDTO";
import { RemoveTopicIdDTO } from "../dto/RemoveTopicIdDTO";
import { UpdateOrganizationDTO } from "../dto/UpdateOrganizationDTO";
import { ValidationService } from "./ValidationService";

@Injectable()
export class OrganizationService {
    constructor(
        @InjectRepository(Organization) private organizationRepository: Repository<Organization>,
        @InjectRepository(Teacher) private readonly teacherRepository: Repository<Teacher>,
        @InjectRepository(Student) private readonly studentRepository: Repository<Student>,
        @InjectRepository(Topic) private readonly topicRepository: Repository<Topic>
    ) {
    }

    async create(createOrganizationDTO: CreateOrganizationDTO): Promise<number> {
        const organization = await this.organizationRepository.findOneBy({
            name: createOrganizationDTO.name
        });

        if (organization !== null) {
            throw new ConflictException(
                "Организация с таким названием уже существует."
            );
        }

        const newOrganization = await this.organizationRepository.save({
            name: createOrganizationDTO.name,
            address: createOrganizationDTO.address,
            phone: createOrganizationDTO.phone,
            email: createOrganizationDTO.email,
            responsiblePerson: createOrganizationDTO.responsiblePerson
        });
        return newOrganization.id;
    }

    async receiveByName(name: string): Promise<Organization> {
        const organization = await this.organizationRepository.findOneBy({
            name: name
        });

        if (organization === null) {
            throw new NotFoundException(
                "Организации с таким названием не существует."
            );
        }

        return organization;
    }

    async receiveById(id: number): Promise<Organization> {
        const organization = await this.organizationRepository.findOneBy({
            id: id
        });

        if (organization === null) {
            throw new NotFoundException(
                "Организации с таким id не существует."
            );
        }

        return organization;
    }

    async getOrganizationWithEntities(name: string) {
        const organization = await this.receiveByName(name);

        const teachers = await this.teacherRepository.findBy({ id: In(organization.teacherIds) });
        const students = await this.studentRepository.findBy({ id: In(organization.studentIds) });

        return {
            ...organization,
            teachers,
            students
        };
    }

    async addStudent(organization: Organization, student: Student): Promise<boolean> {
        if (!organization.studentIds.includes(student.id)) {
            organization.studentIds.push(student.id);
            await this.organizationRepository.save(organization);
        }

        return true;
    }

    async removeStudentId(removeStudentIdDTO: RemoveStudentIdDTO): Promise<boolean> {
        const organization = await this.receiveById(removeStudentIdDTO.organizationId);
        organization.studentIds = organization.studentIds.filter(id => id !== removeStudentIdDTO.studentId);
        await this.organizationRepository.save(organization);
        return true;
    }

    async addTeacher(organization: Organization, teacher: Teacher): Promise<boolean> {
        if (!organization.teacherIds.includes(teacher.id)) {
            organization.teacherIds.push(teacher.id);
            await this.organizationRepository.save(organization);
        }

        return true;
    }

    async removeTeacherId(removeTeacherIdDTO: RemoveTeacherIdDTO): Promise<boolean> {
        const organization = await this.receiveById(removeTeacherIdDTO.organizationId);
        organization.teacherIds = organization.teacherIds.filter(id => id !== removeTeacherIdDTO.teacherId);
        await this.organizationRepository.save(organization);
        return true;
    }

    async addTopic(organization: Organization, topic: Topic): Promise<boolean> {
        if (!organization.topicIds.includes(topic.id)) {
            organization.topicIds.push(topic.id);
            await this.organizationRepository.save(organization);
        }

        return true;
    }

    async removeTopicId(removeTopicIdDTO: RemoveTopicIdDTO): Promise<boolean> {
        const organization = await this.receiveById(removeTopicIdDTO.organizationId);
        organization.topicIds = organization.topicIds.filter(id => id !== removeTopicIdDTO.topicId);
        await this.organizationRepository.save(organization);
        return true;
    }

    async update(orgId: number, updateOrganizationDTO: UpdateOrganizationDTO): Promise<Organization> {
        const organization = await this.receiveById(orgId);

        if (!ValidationService.isNothing(updateOrganizationDTO.name)) {
            organization.name = updateOrganizationDTO.name;
        }

        if (!ValidationService.isNothing(updateOrganizationDTO.address)) {
            organization.address = updateOrganizationDTO.address;
        }

        if (!ValidationService.isNothing(updateOrganizationDTO.phone)) {
            organization.phone = updateOrganizationDTO.phone;
        }

        if (!ValidationService.isNothing(updateOrganizationDTO.responsiblePerson)) {
            organization.responsiblePerson = updateOrganizationDTO.responsiblePerson;
        }

        if (!ValidationService.isNothing(updateOrganizationDTO.email)) {
            organization.email = updateOrganizationDTO.email;
        }

        await this.organizationRepository.save(organization);

        return organization;
    }

    async receiveAll() {
        return await this.organizationRepository.find({ order: { id: "ASC" } });
    }
}
