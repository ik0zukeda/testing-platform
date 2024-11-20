import { IsNotEmpty, IsNumber } from "class-validator";

export class DeleteUserDTO {
    @IsNumber()
    @IsNotEmpty()
    userId: number;
}
