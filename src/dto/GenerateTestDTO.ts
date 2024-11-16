import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class GenerateTestDTO {
    @IsNumber()
    @IsNotEmpty()
    testId: number;
}