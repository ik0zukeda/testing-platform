import { Question } from "../entities/Question";
import { IsArray, IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class AnswerDTO {
    @IsString()
    @IsNotEmpty()
    answerText: string;

    @IsBoolean()
    @IsNotEmpty()
    isCorrect: boolean;
}

export class QuestionDTO {
    @IsString()
    @IsNotEmpty()
    questionText: string;

    @IsArray()
    answers: AnswerDTO[]
}

export class QuestionsDTO {
    topicId: number;
    questions: QuestionDTO[]
}

export class CheckQuestionDTO {
    id: number;
    answerTexts: string[];
}

export class ReturnAnswerDTO extends AnswerDTO {
    answerId: number;
}

export class ReturnQuestionDTO {
    id: number;
    questionText: string;
    answers: ReturnAnswerDTO[];

    constructor(question: Question, answers: ReturnAnswerDTO[]) {
        this.id = question.id;
        this.questionText = question.questionText;
        this.answers = answers;
    }
}