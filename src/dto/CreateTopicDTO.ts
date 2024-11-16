import { IsNotEmpty, IsString } from "class-validator";

export class CreateTopicDTO {
    @IsNotEmpty()
    @IsString()
    name: string;
}
