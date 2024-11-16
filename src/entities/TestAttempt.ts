import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Test } from "./Test";

@Entity()
export class TestAttempt {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    studentId: number;

    @Column({ nullable: false })
    topicId: number;

    @Column({ nullable: false })
    testId: number;

    @ManyToOne(() => Test, { nullable: false })
    @JoinColumn({ name: 'testId' })
    test: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    attemptDate: Date;

    @Column({ nullable: false })
    score: number;

    @Column({ nullable: false })
    questionCount: number;

    @Column({ nullable: false })
    timeSpent: number;

    constructor(
        studentId: number,
        topicId: number,
        attemptDate: Date,
        score: number,
        testId: number,
        timeSpent: number,
        questionCount: number,
    ) {
        this.studentId = studentId;
        this.topicId = topicId;
        this.attemptDate = attemptDate;
        this.score = score;
        this.test = testId;
        this.questionCount = questionCount;
        this.timeSpent = timeSpent;
    }
}
