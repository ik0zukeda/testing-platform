import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { AnswerDTO } from "../dto/QuestionsDTO";
import { AnswerService } from "../services/AnswerService";
import { Answer } from "../entities/Answer";
import { UpdateAnswerDTO } from "../dto/UpdateAnswerDTO";
import { Roles, RolesGuard } from "../models/RolesGuard";
import { ERole } from "../models/ERole";

@Controller("api/answer")
@UseGuards(RolesGuard)
export class AnswerController {
    constructor(private readonly answerService: AnswerService) {
    }

    @Post("create/:question_id")
    @Roles(ERole.Teacher)
    async create(@Body() answerDTO: AnswerDTO, @Param("question_id") questionId: number): Promise<Answer> {
        return await this.answerService.create(answerDTO, questionId, true);
    }

    @Put("update/:id")
    @Roles(ERole.Teacher)
    async update(@Param("id") id: number, @Body() updateAnswerDTO: UpdateAnswerDTO): Promise<Answer> {
        return await this.answerService.update(id, updateAnswerDTO);
    }

    @Get("receive/:answer_id")
    @Roles(ERole.Teacher)
    async receiveTopic(@Param("answer_id") answerId: number): Promise<Answer> {
        return await this.answerService.receive(answerId);
    }
}
