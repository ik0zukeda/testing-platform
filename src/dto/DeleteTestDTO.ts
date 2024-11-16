import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class DeleteTestDTO {
    @IsNumber()
    @IsNotEmpty()
    testId: number;
}