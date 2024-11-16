import { IsNotEmpty, IsString } from "class-validator";

export class RemoveGroupDTO {
    @IsString()
    @IsNotEmpty()
    group: string;
}