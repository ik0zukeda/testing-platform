import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { OrganizationService } from "../services/OrganizationService";
import { Organization } from "../entities/Organization";
import { CreateOrganizationDTO } from "../dto/CreateOrganizationDTO";
import { UpdateOrganizationDTO } from "../dto/UpdateOrganizationDTO";
import { Roles, RolesGuard } from "../models/RolesGuard";
import { ERole } from "../models/ERole";

@Controller("api/organization")
@UseGuards(RolesGuard)
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) {
    }

    @Get("receive_all")
    async receiveAll(): Promise<Organization[]> {
        return await this.organizationService.receiveAll();
    }

    @Get('receive_with_all/:name')
    async receiveWithAll(@Param("name") name: string) {
        return await this.organizationService.getOrganizationWithEntities(name);
    }

    @Get("receive/:name")
    async receive(@Param("name") name: string): Promise<Organization> {
        return await this.organizationService.receiveByName(name);
    }

    @Get("receive_by_id/:id")
    async receiveById(@Param("id") id: number): Promise<Organization> {
        return await this.organizationService.receiveById(id);
    }

    @Post("create")
    @Roles(ERole.Administrator)
    async create(@Body() createOrganizationDTO: CreateOrganizationDTO): Promise<number> {
        return await this.organizationService.create(createOrganizationDTO);
    }

    @Post("create_with_return")
    @Roles(ERole.Administrator)
    async create_with_return(@Body() createOrganizationDTO: CreateOrganizationDTO): Promise<Organization> {
        return await this.organizationService.create_with_return(createOrganizationDTO);
    }

    @Put("update/:id")
    @Roles(ERole.Administrator)
    async update(@Param("id") id: number, @Body() updateOrganizationDTO: UpdateOrganizationDTO): Promise<Organization> {
        return await this.organizationService.update(id, updateOrganizationDTO);
    }

    // @Post("add_student")
    // async addStudent(@Body() addStudentDto: AddStudentDTO): Promise<boolean> {
    //     return await this.organizationService.addStudent(addStudentDto);
    // }

    // @Post("add_teacher")
    // async addTeacher(@Body() addTeacherDTO: AddTeacherDTO): Promise<boolean> {
    //     return await this.organizationService.addTeacher(addTeacherDTO);
    // }

    // @Post("add_topic")
    // async addTopic(@Body() addTopicDTO: AddTopicDTO): Promise<boolean> {
    //     return await this.organizationService.addTopic(addTopicDTO);
    // }
}
