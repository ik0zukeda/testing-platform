import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { AnswerDTO, QuestionDTO, ReturnQuestionDTO } from "../dto/QuestionsDTO";
import { Question } from "../entities/Question";
import { AnswerService } from "./AnswerService";
import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { TopicService } from "./TopicService";
import { ValidationService } from "./ValidationService";
import { UpdateQuestionDTO } from "../dto/UpdateQuestionDTO";
import { RemoveAnswerIdDTO } from "../dto/RemoveAnswerIdDTO";
import { Test } from "../entities/Test";

@Injectable()
export class QuestionService {
    constructor(
        @InjectRepository(Question) private questionRepository: Repository<Question>,
        private readonly answerService: AnswerService,
        @Inject(forwardRef(() => TopicService)) private readonly topicService: TopicService
    ) {
    }

    async create(questionDTO: QuestionDTO, topicId: number, addToParent: boolean = false): Promise<Question> {
        let answerIds = [];
        for (const a of questionDTO.answers) {
            const answer = await this.answerService.create(a);
            answerIds.push(answer.id);
        }

        const question = await this.questionRepository.save({
            topicId: topicId,
            questionText: questionDTO.questionText,
            answerIds: answerIds
        });

        if (addToParent) {
            await this.topicService.addQuestionId(question.id, topicId);
        }

        return question;
    }

    async receive(questionId: number): Promise<Question> {
        const question = await this.questionRepository.findOneBy({ id: questionId });

        if (question === null) {
            throw new NotFoundException("Вопроса с таким id не существует.");
        }

        return question;
    }

    async receiveWithAnswerText(questionId: number): Promise<ReturnQuestionDTO> {
        const question = await this.receive(questionId);
        let answers = [];
        for (const q of question.answerIds) {
            const answer = await this.answerService.receive(q);
            answers.push({
                answerId: answer.id,
                answerText: answer.answerText,
                isCorrect: answer.isCorrect
            });
        }

        return new ReturnQuestionDTO(question, answers);
    }

    async receiveWithAnswerTextWithoutIsCorrect(questionId: number): Promise<ReturnQuestionDTO> {
        const question = await this.receive(questionId);
        let answers = [];
        for (const q of question.answerIds) {
            const answer = await this.answerService.receive(q);
            answers.push({
                answerId: answer.id,
                answerText: answer.answerText
            });
        }

        return new ReturnQuestionDTO(question, answers);
    }

    async receiveByIds(questionIds: number[]): Promise<Question[]> {
        return await this.questionRepository.findBy({ id: In(questionIds) });
    }

    async addAnswers(answerDTOS: AnswerDTO[], questionId: number): Promise<Question> {
        const question = await this.receive(questionId);

        let answerIds = [];
        for (const a of answerDTOS) {
            const answer = await this.answerService.create(a);
            answerIds.push(answer.id);
        }

        question.answerIds = question.answerIds.concat(answerIds);

        await this.questionRepository.save(question);

        return question;
    }

    async addAnswerId(answerId: number, questionId: number): Promise<void> {
        const question = await this.receive(questionId);
        question.answerIds.push(answerId);
        await this.questionRepository.save(question);
    }

    async removeAnswerId(removeAnswerIdDTO: RemoveAnswerIdDTO): Promise<boolean> {
        const question = await this.receive(removeAnswerIdDTO.questionId);
        question.answerIds = question.answerIds.filter(id => id !== removeAnswerIdDTO.answerId);
        await this.questionRepository.save(question);
        await this.answerService.delete(removeAnswerIdDTO.answerId);
        return true;
    }

    async getTopicQuestionsCount(topicId: number): Promise<number> {
        return await this.questionRepository.countBy({ topicId: topicId });
    }

    async getRandomQuestions(test: Test): Promise<ReturnQuestionDTO[]> {
        const n = test.questionCount;
        const randomQuestions = await this.questionRepository
            .createQueryBuilder("question")
            .where(`question.topicId=${test.topicId}`)
            .orderBy("RANDOM()")
            .limit(n)
            .getMany();

        let returnQuestionDTOs: ReturnQuestionDTO[] = [];
        for (const q of randomQuestions) {
            returnQuestionDTOs.push(await this.receiveWithAnswerTextWithoutIsCorrect(q.id));
        }

        return returnQuestionDTOs;
    }

    async update(questionId: number, updateQuestionDTO: UpdateQuestionDTO): Promise<Question> {
        const question = await this.receive(questionId);

        if (!ValidationService.isNothing(updateQuestionDTO.questionText)) {
            question.questionText = updateQuestionDTO.questionText;
        }

        await this.questionRepository.save(question);

        return question;
    }

    async delete(questionId: number): Promise<{ ok: boolean }> {
        const question = await this.receive(questionId);
        if (question != null) {
            for (const answerId of question.answerIds) {
                await this.answerService.delete(answerId);
            }
            await this.questionRepository.delete(question.id);
        }

        return { ok: true };
    }
}
