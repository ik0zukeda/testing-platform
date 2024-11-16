import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTestDTO {
    @IsString()
    @IsNotEmpty()
    testName: string;

    @IsNumber()
    @IsNotEmpty()
    topicId: number;

    @IsNumber()
    @IsNotEmpty()
    questionCount: number;

    @IsNumber()
    @IsNotEmpty()
    attempts: number;

    @IsString()
    @IsNotEmpty()
    group: string;
}
