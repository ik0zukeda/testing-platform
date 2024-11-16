import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateTopicDTO } from "../dto/CreateTopicDTO";
import { Topic } from "../entities/Topic";
import { QuestionsDTO } from "../dto/QuestionsDTO";
import { QuestionService } from "./QuestionService";
import { OrganizationService } from "./OrganizationService";
import { ValidationService } from "./ValidationService";
import { UpdateTopicDTO } from "../dto/UpdateTopicDTO";
import { RemoveQuestionIdDTO } from "../dto/RemoveQuestionIdDTO";
import { RemoveTopicIdDTO } from "../dto/RemoveTopicIdDTO";
import { AuthService } from "./AuthService";
import { TeacherService } from "./TeacherService";

@Injectable()
export class TopicService {
    constructor(
        @InjectRepository(Topic) private topicRepository: Repository<Topic>,
        private readonly questionService: QuestionService,
        private readonly authService: AuthService,
        private readonly teacherService: TeacherService,
        private readonly organizationService: OrganizationService
    ) {
    }

    async create(createTopicDTO: CreateTopicDTO, login: string): Promise<Topic> {
        const user = await this.authService.receiveUser(login);
        const teacher = await this.teacherService.receiveByUserId(user.id);
        const organization = await this.organizationService.receiveById(teacher.organizationId);

        const topic = await this.topicRepository.findOneBy({
            name: createTopicDTO.name,
            organizationId: teacher.organizationId
        });

        if (topic !== null) {
            throw new ConflictException("Тема с таким названием уже существует.");
        }

        const newTopic = await this.topicRepository.save({
            organizationId: teacher.organizationId,
            name: createTopicDTO.name
        });

        await this.organizationService.addTopic(organization, newTopic);

        return newTopic;
    }

    async receive(topicId: number, full = false) {
        const topic = await this.topicRepository.findOneBy({ id: topicId });

        if (topic === null) {
            throw new NotFoundException("Темы с таким id не существует.");
        }

        if (full) {
            const questions = await this.questionService.receiveByIds(topic.questionIds);
            return {
                ...topic,
                questions
            };
        } else {
            return topic;
        }
    }

    async receiveAll(login: string): Promise<Topic[]> {
        const user = await this.authService.receiveUser(login);
        const teacher = await this.teacherService.receiveByUserId(user.id);

        return await this.topicRepository.find({
            where: { organizationId: teacher.organizationId },
            order: { id: "ASC" }
        });
    }

    async addQuestions(addQuestionsDTO: QuestionsDTO): Promise<Topic> {
        const topic = await this.receive(addQuestionsDTO.topicId);

        let questionIds = [];

        for (const q of addQuestionsDTO.questions) {
            const question = await this.questionService.create(q, addQuestionsDTO.topicId);
            questionIds.push(question.id);
        }

        topic.questionIds = topic.questionIds.concat(questionIds);
        await this.topicRepository.save(topic);

        return topic;
    }

    async addQuestionId(questionId: number, topicId: number): Promise<void> {
        const topic = await this.receive(topicId);
        topic.questionIds.push(questionId);
        await this.topicRepository.save(topic);
    }

    async removeQuestionId(removeQuestionIdDTO: RemoveQuestionIdDTO): Promise<{ ok: boolean }> {
        const topic = await this.receive(removeQuestionIdDTO.topicId);
        topic.questionIds = topic.questionIds.filter(id => id !== removeQuestionIdDTO.questionId);
        await this.topicRepository.save(topic);
        return await this.questionService.delete(removeQuestionIdDTO.questionId);
    }

    async update(topicId: number, updateTopicDTO: UpdateTopicDTO): Promise<Topic> {
        const topic = await this.receive(topicId);

        if (!ValidationService.isNothing(updateTopicDTO.name)) {
            topic.name = updateTopicDTO.name;
        }

        if (!ValidationService.isNothing(updateTopicDTO.organizationId)) {
            topic.organizationId = updateTopicDTO.organizationId;
        }

        await this.topicRepository.save(topic);

        return topic;
    }

    async delete(removeTopicIdDTO: RemoveTopicIdDTO) {
        const topic = await this.receive(removeTopicIdDTO.topicId);
        if (topic != null) {
            await this.topicRepository.delete(topic.id);
        }

        await this.organizationService.removeTopicId(removeTopicIdDTO);

        return true;
    }
}
