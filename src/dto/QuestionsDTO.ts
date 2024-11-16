import { Question } from "../entities/Question";

export class AnswerDTO {
    answerText: string;
    isCorrect: boolean;
}

export class QuestionDTO {
    questionText: string;
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