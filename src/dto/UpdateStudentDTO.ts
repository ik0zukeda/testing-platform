import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateStudentDTO {
    @IsNumber()
    @IsOptional()
    userID: number;

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    group: string;

    @IsString()
    @IsOptional()
    email: string;
}