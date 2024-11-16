import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { TestAttempt } from "../entities/TestAttempt";
import { BestStudentAttemptDTO, BestStudentsAttempts, StudentAttempts } from "../dto/BestStudentAttemptDTO";
import { StudentService } from "./StudentService";
import { Test } from "../entities/Test";

export class TestAttemptService {
    constructor(@InjectRepository(TestAttempt) private testAttemptRepository: Repository<TestAttempt>,
                private readonly studentService: StudentService) {
    }

    async create(studentId: number, topicId: number, score: number, testId: number, duration: number, questionCount: number): Promise<TestAttempt> {
        return await this.testAttemptRepository.save({
            studentId: studentId,
            topicId: topicId,
            score: score,
            testId: testId,
            timeSpent: duration,
            questionCount: questionCount
        });
    }

    async receive(testAttemptId: number): Promise<TestAttempt> {
        const testAttempt = await this.testAttemptRepository.findOne({
            where: { id: testAttemptId },
            relations: ["test"]
        });

        if (testAttempt === null) {
            throw new NotFoundException("Попытки решения теста с таким id не существует.");
        }

        return testAttempt;
    }

    async receiveByStudentIdAndTestIdWithStudent(studentId: number, test: Test): Promise<StudentAttempts> {
        const student = await this.studentService.receive(studentId);
        const studentAttempts = await this.receiveByStudentIdAndTestId(studentId, test.id);
        return new StudentAttempts(student, studentAttempts, test);
    }

    async receiveByStudentIdAndTestId(studentId: number, testId: number): Promise<TestAttempt[]> {
        return await this.testAttemptRepository.findBy({ studentId: studentId, test: testId });
    }

    async receiveUsedAttemptsByStudentIdAndTestId(studentId: number, testId: number): Promise<number> {
        return await this.testAttemptRepository.countBy({ studentId: studentId, testId: testId });
    }

    async receiveBestStudentAttempt(studentId: number, testId: number): Promise<BestStudentAttemptDTO> {
        const studentAttempts = await this.receiveByStudentIdAndTestId(studentId, testId);
        const usedAttempts = studentAttempts.length;
        const maxScore = studentAttempts.reduce((max, attempt) => Math.max(max, attempt.score), 0);
        const minTimeSpent = studentAttempts.reduce((min, attempt) => Math.min(min, attempt.timeSpent), Infinity);
        const student = await this.studentService.receive(studentId);

        return new BestStudentAttemptDTO(student, usedAttempts, maxScore, minTimeSpent);
    }

    async receiveBestStudentsAttempts(test: Test): Promise<BestStudentsAttempts> {
        const studentIds = await this.receiveAllStudentsByTestId(test.id);
        const bestAttempts: BestStudentAttemptDTO[] = [];
        for (const sId of studentIds) {
            bestAttempts.push(await this.receiveBestStudentAttempt(sId, test.id));
        }

        const avgTime = bestAttempts.reduce((cur, attempt) => cur + attempt.minTimeSpent, 0) / bestAttempts.length;
        const avgScore = bestAttempts.reduce((cur, attempt) => cur + attempt.maxScore, 0) / bestAttempts.length;

        return new BestStudentsAttempts(avgTime, avgScore, bestAttempts, test);
    }

    async receiveAllStudentsByTestId(testId: number): Promise<number[]> {
        const studentIds = [];
        const result = await this.testAttemptRepository
            .createQueryBuilder("test_attempt")
            .select("DISTINCT test_attempt.studentId")
            .where("test_attempt.test = :testId", { testId })
            .getRawMany();

        result.forEach((r) => {
            studentIds.push(r.studentId);
        })

        return studentIds;
    }
}
