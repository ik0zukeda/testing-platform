import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { CreateTopicDTO } from "../dto/CreateTopicDTO";
import { TopicService } from "../services/TopicService";
import { QuestionsDTO } from "../dto/QuestionsDTO";
import { Topic } from "../entities/Topic";
import { UpdateTopicDTO } from "../dto/UpdateTopicDTO";
import { RemoveQuestionIdDTO } from "../dto/RemoveQuestionIdDTO";
import { RemoveTopicIdDTO } from "../dto/RemoveTopicIdDTO";
import { Roles, RolesGuard } from "../models/RolesGuard";
import { ERole } from "../models/ERole";

@Controller("api/topic")
@UseGuards(RolesGuard)
export class TopicController {
    constructor(private readonly topicService: TopicService) {
    }

    @Post("create")
    @Roles(ERole.Teacher)
    async create(@Req() req: any, @Body() createTopicDTO: CreateTopicDTO): Promise<Topic> {
        return await this.topicService.create(createTopicDTO, req.user.login);
    }

    @Post("remove_question")
    @Roles(ERole.Teacher)
    async removeQuestionId(@Body() removeQuestionIdDTO: RemoveQuestionIdDTO): Promise<{ ok: boolean }> {
        return await this.topicService.removeQuestionId(removeQuestionIdDTO);
    }

    @Put("update/:id")
    @Roles(ERole.Teacher)
    async update(@Param("id") id: number, @Body() updateTopicDTO: UpdateTopicDTO): Promise<Topic> {
        return await this.topicService.update(id, updateTopicDTO);
    }

    @Delete("delete")
    @Roles(ERole.Teacher)
    async delete(@Body() removeTopicIdDTO: RemoveTopicIdDTO): Promise<boolean> {
        return await this.topicService.delete(removeTopicIdDTO);
    }

    @Post("add_questions")
    @Roles(ERole.Teacher)
    async addQuestions(@Body() addQuestionsDTO: QuestionsDTO): Promise<Topic> {
        return await this.topicService.addQuestions(addQuestionsDTO);
    }

    @Get("receive/:topic_id")
    @Roles(ERole.Teacher)
    async receiveTopic(@Param("topic_id") topicId: number) {
        return await this.topicService.receive(topicId, false);
    }

    @Get("receive_full/:topic_id")
    @Roles(ERole.Teacher)
    async receiveFullTopic(@Param("topic_id") topicId: number) {
        return await this.topicService.receive(topicId, true);
    }

    @Get("receive_all")
    @Roles(ERole.Teacher)
    async receiveAll(@Req() req: any): Promise<Topic[]> {
        return await this.topicService.receiveAll(req.user.login);
    }
}
