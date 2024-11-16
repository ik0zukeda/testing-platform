import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AddStudentDTO {
    @IsNumber()
    @IsNotEmpty()
    organizationId: number;

    @IsNumber()
    @IsNotEmpty()
    studentId: number;
}

export class AddGroupsDTO {
    @IsString()
    @IsNotEmpty()
    group: string;
}

export class ReceiveTeacherGroups {
    @IsNumber()
    @IsNotEmpty()
    teacherId: number;
}