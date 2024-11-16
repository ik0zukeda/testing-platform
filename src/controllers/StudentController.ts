import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { StudentService } from "../services/StudentService";
import { CreateStudentDTO } from "../dto/CreateStudentDTO";
import { Student } from "../entities/Student";
import { UpdateStudentDTO } from "../dto/UpdateStudentDTO";
import { RemoveStudentIdDTO } from "../dto/RemoveStudentIdDTO";
import { Roles, RolesGuard } from "../models/RolesGuard";
import { ERole } from "../models/ERole";

@Controller("api/student")
@UseGuards(RolesGuard)
export class StudentController {
    constructor(private readonly studentService: StudentService) {
    }

    @Post("create")
    @Roles(ERole.Administrator, ERole.Teacher)
    async create(@Body() createStudentDTO: CreateStudentDTO): Promise<Student> {
        return await this.studentService.create(createStudentDTO);
    }

    @Put("update/:id")
    @Roles(ERole.Administrator, ERole.Teacher)
    async update(@Param("id") id: number, @Body() updateStudentDTO: UpdateStudentDTO): Promise<Student> {
        return await this.studentService.update(id, updateStudentDTO);
    }

    @Delete("delete")
    @Roles(ERole.Administrator, ERole.Teacher)
    async delete(@Body() removeStudentIdDTO: RemoveStudentIdDTO): Promise<boolean> {
        return await this.studentService.delete(removeStudentIdDTO);
    }

    @Get("receive/groups")
    @Roles(ERole.Administrator, ERole.Teacher)
    async receiveAllGroups(): Promise<string[]> {
        return await this.studentService.receiveAllGroups();
    }
}
