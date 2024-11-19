import {Test, TestingModule} from '@nestjs/testing';
import * as request from 'supertest';
import {INestApplication} from '@nestjs/common';
import {AppModule} from '../src/app.module';

describe('StatisticsController (e2e)', () => {
    let app: INestApplication;
    let teacherToken: string;
    let adminToken: string;
    let studentToken: string;
    let teacherTest: any;
    let newTopic: any;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        teacherToken = (await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({login: 'sav@gmail.com', password: 'parol'})
            .expect(201)).body.token;

        adminToken = (await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({login: 'test@testing.com', password: 'testtest'})
            .expect(201)).body.token;

        studentToken = (await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({login: 'savenkovtaroslavviktorovich@gmail.com', password: 'parol'})
            .expect(201)).body.token

        teacherTest = (await request(app.getHttpServer())
            .post('/api/test/create')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({
                testName: 'Its sample test!',
                topicId: 1,
                questionCount: 1,
                attempts: 8,
                group: "M34051",
            })
            .expect(201)).body;

        newTopic = (await request(app.getHttpServer())
            .post('/api/topic/create')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({name: "New topic"})
            .expect(201)).body;
    });

    afterAll(async () => {
        await request(app.getHttpServer())
            .delete('/api/test/delete')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({
                testId: teacherTest.id,
            });

        await request(app.getHttpServer())
            .delete('/api/topic/delete')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({
                organizationId: newTopic.organizationId,
                topicId: newTopic.id,
            });

        await app.close();
    });

    it('AT013: Получение статистики по тесту', async () => {
        const testId = teacherTest.id;

        const statisticsResponse = await request(app.getHttpServer())
            .post('/api/test/get_students_best_results')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({testId: testId})
            .expect(201);

        expect(statisticsResponse.body).toEqual(
            expect.objectContaining({
                avgTime: null,
                avgScore: null,
                info: [],
            }),
        );
    });

    it('AT011: Получение активных тестов для преподавателей и студентов', async () => {
        const allTestsResponse1= await request(app.getHttpServer())
            .get('/api/test/receive_all')
            .set('Authorization', `Bearer ${teacherToken}`)
            .expect(200);

        expect(allTestsResponse1.body).toBeInstanceOf(Array);
        expect(allTestsResponse1.body.length).toBeGreaterThanOrEqual(1);

        const allTestsResponse2 = await request(app.getHttpServer())
            .get('/api/test/receive_all')
            .set('Authorization', `Bearer ${studentToken}`)
            .expect(200);

        expect(allTestsResponse2.body).toBeInstanceOf(Array);
        expect(allTestsResponse2.body.length).toBeGreaterThanOrEqual(1);

    });

    it('AT023: Попытка начать тест после лимита попыток', async () => {
        await request(app.getHttpServer())
            .post('/api/test/generate')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                testId: 36,
            })
            .expect(403);
    });

    it('AT022: Назначение теста без группы', async () => {
        await request(app.getHttpServer())
            .post('/api/test/create')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({
                testName: 'New test!',
                topicId: 1,
                questionCount: 1,
                attempts: 8
            })
            .expect(500);
    });

    it('AT021: Добавление пустого вопроса', async () => {
        await request(app.getHttpServer())
            .post(`/api/question/create/${teacherTest.topicId}`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({})
            .expect(500);
    });

    it('AT010: Назначение теста группе', async () => {
        expect(teacherTest.group === "M34051").toBe(true);
    });

    it('AT008: Создание темы', async () => {
        expect(newTopic !== null).toBe(true);
    });


});
