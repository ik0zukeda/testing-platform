import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { AnswerDTO, QuestionDTO, ReturnQuestionDTO } from "../dto/QuestionsDTO";
import { QuestionService } from "../services/QuestionService";
import { Question } from "../entities/Question";
import { UpdateQuestionDTO } from "../dto/UpdateQuestionDTO";
import { RemoveAnswerIdDTO } from "../dto/RemoveAnswerIdDTO";
import { Roles, RolesGuard } from "../models/RolesGuard";
import { ERole } from "../models/ERole";

@Controller("api/question")
@UseGuards(RolesGuard)
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {
    }

    @Post("create/:topic_id")
    @Roles(ERole.Teacher)
    async create(@Body() questionDTO: QuestionDTO, @Param("topic_id") topicId: number): Promise<Question> {
        return await this.questionService.create(questionDTO, topicId, true);
    }

    @Put("update/:id")
    @Roles(ERole.Teacher)
    async update(@Param("id") id: number, @Body() updateTeacherDTO: UpdateQuestionDTO): Promise<Question> {
        return await this.questionService.update(id, updateTeacherDTO);
    }

    @Post("remove_answer")
    @Roles(ERole.Teacher)
    async removeAnswerId(@Body() removeAnswerIdDTO: RemoveAnswerIdDTO): Promise<boolean> {
        return await this.questionService.removeAnswerId(removeAnswerIdDTO);
    }

    @Post("add_answers/:question_id")
    @Roles(ERole.Teacher)
    async addAnswers(@Body() answerDTOS: AnswerDTO[], @Param("question_id") questionId: number): Promise<Question> {
        return await this.questionService.addAnswers(answerDTOS, questionId);
    }

    @Get("receive/:question_id")
    @Roles(ERole.Teacher)
    async receiveQuestion(@Param("question_id") questionId: number): Promise<ReturnQuestionDTO> {
        return await this.questionService.receiveWithAnswerText(questionId);
    }
}
