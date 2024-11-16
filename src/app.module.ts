import { TypeOrmModule } from "@nestjs/typeorm";
import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AppController } from "./controllers/app.controller";
import { AppService } from "./services/app.service";
import { Organization } from "./entities/Organization";
import { Teacher } from "./entities/Teacher";
import { Student } from "./entities/Student";
import { Topic } from "./entities/Topic";
import { Question } from "./entities/Question";
import { Answer } from "./entities/Answer";
import { TestAttempt } from "./entities/TestAttempt";
import { AttemptDetail } from "./entities/AttemptDetail";
import { AuthService } from "./services/AuthService";
import { AuthController } from "./controllers/AuthController";
import { User } from "./entities/User";
import { OrganizationController } from "./controllers/OrganizationController";
import { OrganizationService } from "./services/OrganizationService";
import { StudentController } from "./controllers/StudentController";
import { StudentService } from "./services/StudentService";
import { TeacherController } from "./controllers/TeacherController";
import { TeacherService } from "./services/TeacherService";
import { TopicController } from "./controllers/TopicController";
import { TopicService } from "./services/TopicService";
import { AnswerService } from "./services/AnswerService";
import { QuestionService } from "./services/QuestionService";
import { AnswerController } from "./controllers/AnswerController";
import { QuestionController } from "./controllers/QuestionController";
import { Test } from "./entities/Test";
import { TestService } from "./services/TestService";
import { TestController } from "./controllers/TestController";
import { TestAttemptService } from "./services/TestAttemptService";
import { AttemptDetailService } from "./services/AttemptDetailService";
import { Recover } from "./entities/Recover";
import { RecoverService } from "./services/RecoverService";
import { AuthMiddleware } from "./middlewares/AuthMiddleware";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "./models/RolesGuard";
import { AuthViewMiddleware } from "./middlewares/AuthViewMiddleware";
import { TeacherRoleMiddleware } from "./middlewares/TeacherRoleMiddleware";
import { StudentRoleMiddleware } from "./middlewares/StudentRoleMiddleware";
import { AdminRoleMiddleware } from "./middlewares/AdminRoleMiddleware";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Organization,
            Teacher,
            Student,
            Topic,
            Question,
            Answer,
            TestAttempt,
            AttemptDetail,
            User,
            Test,
            Recover
        ]),
        TypeOrmModule.forRoot({
            type: "postgres",
            ssl: true,
            host: process.env.DB_HOST,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: true,
            logging: false,
            entities: [
                Organization,
                Teacher,
                Student,
                Topic,
                Question,
                Answer,
                TestAttempt,
                AttemptDetail,
                User,
                Test,
                Recover
            ]
        })
    ],
    controllers: [
        AppController,
        AuthController,
        OrganizationController,
        StudentController,
        TeacherController,
        TopicController,
        QuestionController,
        AnswerController,
        TestController
    ],
    providers: [
        AppService,
        AuthService,
        OrganizationService,
        StudentService,
        TeacherService,
        TopicService,
        QuestionService,
        AnswerService,
        TestService,
        TestAttemptService,
        AttemptDetailService,
        RecoverService,
        {
            provide: APP_GUARD,
            useClass: RolesGuard
        }
    ],
    exports: [TypeOrmModule]
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .exclude({ path: "/", method: RequestMethod.ALL },
                { path: "/api/auth/login", method: RequestMethod.ALL },
                { path: "/api/auth/logout", method: RequestMethod.ALL },
                { path: "/api/auth/register", method: RequestMethod.ALL },
                { path: "/api/auth/activate", method: RequestMethod.ALL },
                { path: "/api/auth/check_invite_link", method: RequestMethod.ALL },
                { path: "/api/auth/recover_password", method: RequestMethod.ALL },
                { path: "/api/auth/check_recover_link", method: RequestMethod.ALL },
                { path: "/api/auth/update_password_after_recover", method: RequestMethod.ALL }
            )
            .forRoutes({ path: "/api/*", method: RequestMethod.ALL });

        consumer
            .apply(AuthViewMiddleware)
            .forRoutes({ path: "/changePassword", method: RequestMethod.ALL },
                { path: "/profile", method: RequestMethod.ALL },
                { path: "/active_tests", method: RequestMethod.ALL },
                { path: "/test", method: RequestMethod.ALL },
                { path: "/organization", method: RequestMethod.ALL },
                { path: "/manage-organization", method: RequestMethod.ALL },
                { path: "/topic", method: RequestMethod.ALL },
                { path: "/manage-topics", method: RequestMethod.ALL },
                { path: "/question", method: RequestMethod.ALL },
                { path: "/create_test", method: RequestMethod.ALL },
                { path: "/generated_test", method: RequestMethod.ALL },
                { path: "/update_test", method: RequestMethod.ALL },
                { path: "/stat", method: RequestMethod.ALL },
                { path: "/student_test_stat", method: RequestMethod.ALL },
                { path: "/groups", method: RequestMethod.ALL },
                { path: "/manage-groups", method: RequestMethod.ALL },
                { path: "/test_stats", method: RequestMethod.ALL });

        consumer
            .apply(TeacherRoleMiddleware)
            .forRoutes({ path: "/test_stats", method: RequestMethod.ALL },
                { path: "/topic", method: RequestMethod.ALL },
                { path: "/stat", method: RequestMethod.ALL },
                { path: "/student_test_stat", method: RequestMethod.ALL },
                { path: "/question", method: RequestMethod.ALL },
                { path: "/create_test", method: RequestMethod.ALL },
                { path: "/update_test", method: RequestMethod.ALL },
                { path: "/groups", method: RequestMethod.ALL },
                { path: "/manage-topics", method: RequestMethod.ALL }
            );

        consumer
            .apply(StudentRoleMiddleware)
            .forRoutes(
                { path: "/test", method: RequestMethod.ALL },
                { path: "/generated_test", method: RequestMethod.ALL },

            );

        consumer
            .apply(AdminRoleMiddleware)
            .forRoutes(
                { path: "/organization", method: RequestMethod.ALL },
                { path: "/manage-organization", method: RequestMethod.ALL },

            );
    }
}