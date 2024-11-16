import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateTestDTO {
    id: number;

    @IsString()
    @IsOptional()
    testName: string;

    @IsNumber()
    @IsOptional()
    topicId: number;

    @IsNumber()
    @IsOptional()
    questionCount: number;

    @IsNumber()
    @IsOptional()
    attempts: number;

    @IsString()
    @IsOptional()
    group: string;
}