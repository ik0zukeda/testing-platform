import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RecoverPasswordDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class UpdatePasswordAfterRecoverDTO {
    @IsString()
    @IsNotEmpty()
    link: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class UpdatePasswordDTO {
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class CheckRecoverLinkDTOs {
    @IsString()
    @IsNotEmpty()
    link: string;
}