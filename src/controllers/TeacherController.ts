import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { TeacherService } from "../services/TeacherService";
import { CreateTeacherDTO } from "../dto/CreateTeacherDTO";
import { AddGroupsDTO } from "../dto/AddStudentDTO";
import { Teacher } from "../entities/Teacher";
import { UpdateTeacherDTO } from "../dto/UpdateTeacherDTO";
import { RemoveGroupDTO } from "../dto/RemoveGroupDTO";
import { RemoveTeacherIdDTO } from "../dto/RemoveTeacherIdDTO";
import { Roles, RolesGuard } from "../models/RolesGuard";
import { ERole } from "../models/ERole";

@Controller("api/teacher")
@UseGuards(RolesGuard)
export class TeacherController {
    constructor(private readonly teacherService: TeacherService) {
    }

    @Post("create")
    @Roles(ERole.Administrator)
    async create(@Body() createTeacherDTO: CreateTeacherDTO): Promise<Teacher> {
        return await this.teacherService.create(createTeacherDTO);
    }

    @Put("update/:id")
    @Roles(ERole.Administrator)
    async update(@Param("id") id: number, @Body() updateTeacherDTO: UpdateTeacherDTO): Promise<Teacher> {
        return await this.teacherService.update(id, updateTeacherDTO);
    }

    @Delete("delete")
    @Roles(ERole.Administrator)
    async delete(@Body() removeTeacherIdDTO: RemoveTeacherIdDTO): Promise<boolean> {
        return await this.teacherService.delete(removeTeacherIdDTO);
    }

    @Post("add_group")
    @Roles(ERole.Teacher)
    async addGroups(@Req() req: any, @Body() addStudentDto: AddGroupsDTO): Promise<{ ok: boolean }> {
        return await this.teacherService.addGroups(addStudentDto, req.user.login);
    }

    @Post("remove_group")
    @Roles(ERole.Teacher)
    async removeGroup(@Req() req: any, @Body() removeGroupDTO: RemoveGroupDTO): Promise<{ ok: boolean }> {
        return await this.teacherService.removeGroup(removeGroupDTO, req.user.login);
    }

    @Get("groups")
    @Roles(ERole.Teacher)
    async receiveGroups(@Req() req: any): Promise<string[]> {
        return await this.teacherService.receiveGroups(req.user.login);
    }

    @Get("receive/org/groups")
    @Roles(ERole.Administrator, ERole.Teacher)
    async receiveAllOrgGroups(@Req() req: any): Promise<string[]> {
        return await this.teacherService.receiveAllOrgGroups(req.user.login);
    }
}
