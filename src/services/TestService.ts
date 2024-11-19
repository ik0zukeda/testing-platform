import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Test } from "../entities/Test";
import { CreateTestDTO } from "../dto/CreateTestDTO";
import { AuthService } from "./AuthService";
import { ERole } from "../models/ERole";
import { TeacherService } from "./TeacherService";
import { StudentService } from "./StudentService";
import { GenerateTestDTO } from "../dto/GenerateTestDTO";
import { QuestionService } from "./QuestionService";
import { CheckTestDTO, ReturnGeneratedTest } from "../dto/CheckTestDTO";
import { AnswerService } from "./AnswerService";
import { Answer } from "../entities/Answer";
import { TestAttemptService } from "./TestAttemptService";
import { GetStudentsResultsDTO } from "../dto/GetStudentsResultsDTO";
import { BestStudentsAttempts, StudentAttempts } from "../dto/BestStudentAttemptDTO";
import { ReceiveByStudentIdAndTestIdWithStudentDTO } from "../dto/ReceiveByStudentIdAndTestIdWithStudentDTO";
import { DeleteTestDTO } from "../dto/DeleteTestDTO";
import { UpdateTestDTO } from "../dto/UpdateTestDTO";
import { ValidationService } from "./ValidationService";
import { TestWithUsedAttempts } from "../dto/ReturnTestsDTO";

@Injectable()
export class TestService {
    constructor(
        @InjectRepository(Test) private testRepository: Repository<Test>,
        private readonly authService: AuthService,
        private readonly teacherService: TeacherService,
        private readonly studentService: StudentService,
        private readonly questionService: QuestionService,
        private readonly answerService: AnswerService,
        private readonly testAttemptService: TestAttemptService
    ) {
    }

    async create(createTestDTO: CreateTestDTO, login: string): Promise<Test> {
        const user = await this.authService.receiveUser(login);
        const teacher = await this.teacherService.receiveByUserId(user.id);

        const topicQuestionsCount = await this.questionService.getTopicQuestionsCount(createTestDTO.topicId);

        if (topicQuestionsCount < createTestDTO.questionCount) {
            throw new ConflictException(`В банке вопросов этой темы недостаточно вопросов для создания теста с выбранным количеством вопросов. Вопросов в банке: ${topicQuestionsCount}`);
        }

        const existingTest = await this.testRepository.findOneBy({
            topic: createTestDTO.topicId,
            testName: createTestDTO.testName
        });

        if (!ValidationService.isNothing(existingTest)) {
            throw new ConflictException("Тест с таким названием уже существует");
        }

        return await this.testRepository.save({
            testName: createTestDTO.testName,
            topic: createTestDTO.topicId,
            topicId: createTestDTO.topicId,
            teacher: teacher.id,
            teacherId: teacher.id,
            questionCount: createTestDTO.questionCount,
            attempts: createTestDTO.attempts,
            group: createTestDTO.group
        });
    }

    async receiveAll(login: string): Promise<TestWithUsedAttempts[]> {
        const user = await this.authService.receiveUser(login);

        if (user.role === ERole.Teacher) {
            const teacher = await this.teacherService.receiveByUserId(user.id);
            const tests = await this.receiveByTeacherId(teacher.id);

            const result: TestWithUsedAttempts[] = [];
            for (const test of tests) {
                result.push(new TestWithUsedAttempts(test, "недоступно"));
            }

            return result;
        } else if (user.role === ERole.Student) {
            const student = await this.studentService.receiveByUserId(user.id);
            const tests = await this.testRepository.find({
                order: { id: "ASC" },
                where: { group: student.group },
                relations: ["teacher", "topic"]
            });

            const result: TestWithUsedAttempts[] = [];
            for (const test of tests) {
                const usedAttempts = await this.testAttemptService.receiveUsedAttemptsByStudentIdAndTestId(student.id, test.id);
                result.push(new TestWithUsedAttempts(test, usedAttempts));
            }

            return result;
        }
    }

    async receiveByTestWithUsedAttempts(testId: number, login: string): Promise<TestWithUsedAttempts> {
        const user = await this.authService.receiveUser(login);

        const student = await this.studentService.receiveByUserId(user.id);
        const test = await this.testRepository.findOne({
            where: { id: testId },
            relations: ["teacher", "topic"]
        });

        const usedAttempts = await this.testAttemptService.receiveUsedAttemptsByStudentIdAndTestId(student.id, test.id);
        return new TestWithUsedAttempts(test, usedAttempts);
    }

    async receiveByTestId(testId: number): Promise<Test> {
        const test = await this.testRepository.findOne({
            order: { id: "ASC" },
            where: { id: testId },
            relations: ["teacher", "topic"]
        });

        if (test === null) {
            throw new NotFoundException("Теста с таким id не существует.");
        }

        return test;
    }

    async receiveByTeacherId(teacherId: number): Promise<Test[]> {
        return await this.testRepository.find({ where: { teacher: teacherId }, relations: ["teacher", "topic"] });
    }

    async generateTest(generateTestDTO: GenerateTestDTO, login: string): Promise<ReturnGeneratedTest> {
        const testId = generateTestDTO.testId;
        const test = await this.receiveByTestId(testId);

        const user = await this.authService.receiveUser(login);
        const student = await this.studentService.receiveByUserId(user.id);

        //todo протестировать
        const usedAttempts = await this.testAttemptService.receiveUsedAttemptsByStudentIdAndTestId(student.id, testId);
        if (usedAttempts >= test.attempts) {
            throw new ForbiddenException("Использованы все попытки для данного теста");
        }

        const randomQuestions = await this.questionService.getRandomQuestions(test);
        return new ReturnGeneratedTest(testId, randomQuestions);
    }

    async checkTest(checkTestDTO: CheckTestDTO, login: string): Promise<{ score: number }> {
        const user = await this.authService.receiveUser(login);
        const student = await this.studentService.receiveByUserId(user.id);

        const test = await this.receiveByTestId(checkTestDTO.testId);
        const duration = checkTestDTO.duration;

        let correctAnswers = 0;
        const allAnswers = checkTestDTO.answers;

        for (const a of allAnswers) {
            const question = await this.questionService.receive(a.id);
            const qAnswers: Answer[] = [];
            for (const qa of question.answerIds) {
                qAnswers.push(await this.answerService.receive(qa));
            }

            const qCorrectAnswersCount = qAnswers.filter((a) => a.isCorrect).length;
            const aSelectedCorrectAnswersCount = a.answerTexts.length;

            if (qCorrectAnswersCount === aSelectedCorrectAnswersCount) {
                const isAllCorrect = a.answerTexts.every(answerText =>
                    qAnswers.filter(ans => ans.isCorrect).some(correctAnswer => correctAnswer.answerText === answerText)
                );

                if (isAllCorrect) {
                    correctAnswers += 1;
                }
            }
        }

        await this.testAttemptService.create(student.id, test.topicId, correctAnswers, test.id, duration, allAnswers.length);
        return { score: correctAnswers };
    }

    async getStudentsResults(getStudentsResultsDTO: GetStudentsResultsDTO): Promise<BestStudentsAttempts> {
        const test = await this.receiveByTestId(getStudentsResultsDTO.testId);
        return await this.testAttemptService.receiveBestStudentsAttempts(test);
    }

    async receiveByStudentIdAndTestIdWithStudent(receiveByStudentIdAndTestIdWithStudentDTO: ReceiveByStudentIdAndTestIdWithStudentDTO): Promise<StudentAttempts> {
        const test = await this.receiveByTestId(receiveByStudentIdAndTestIdWithStudentDTO.testId);
        return await this.testAttemptService.receiveByStudentIdAndTestIdWithStudent(receiveByStudentIdAndTestIdWithStudentDTO.studentId, test);
    }

    async update(testId: number, updateTestDTO: UpdateTestDTO) {
        const test = await this.receiveByTestId(testId);
        updateTestDTO.id = test.id;

        if (!ValidationService.isNothing(updateTestDTO.testName)) {
            test.testName = updateTestDTO.testName;
        }

        if (!ValidationService.isNothing(updateTestDTO.topicId)) {
            test.topic = updateTestDTO.topicId;
            test.topicId = updateTestDTO.topicId;
        }

        if (!ValidationService.isNothing(updateTestDTO.attempts)) {
            test.attempts = updateTestDTO.attempts;
        }

        if (!ValidationService.isNothing(updateTestDTO.questionCount)) {
            const topicQuestionsCount = await this.questionService.getTopicQuestionsCount(updateTestDTO.topicId);

            if (topicQuestionsCount < updateTestDTO.questionCount) {
                throw new ConflictException(`В банке вопросов этой темы недостаточно вопросов для создания теста с выбранным количеством вопросов. Вопросов в банке: ${topicQuestionsCount}`);
            }

            test.questionCount = updateTestDTO.questionCount;
        }

        if (!ValidationService.isNothing(updateTestDTO.group)) {
            test.group = updateTestDTO.group;
        }

        return await this.testRepository.save(updateTestDTO);
    }

    async delete(deleteTestDTO: DeleteTestDTO, login: string) {
        const testId = deleteTestDTO.testId;

        const user = await this.authService.receiveUser(login);
        const teacher = await this.teacherService.receiveByUserId(user.id);

        const test = await this.receiveByTestId(testId);

        if (test.teacherId != teacher.id) {
            throw new ForbiddenException("Вы не имеете права на удаление данного теста");
        }

        await this.testRepository.delete(testId);

        return true;
    }
}
