import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ActivateActorDTO {
    @IsNotEmpty()
    @IsNumber()
    actorId: number;

    @IsNotEmpty()
    @IsNumber()
    role: number;

    @IsNotEmpty()
    @IsEmail()
    login: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
