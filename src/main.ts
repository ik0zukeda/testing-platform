import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

const dotenv = require("dotenv");

async function bootstrap() {
    dotenv.config({ path: "env/.env" });
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.useGlobalPipes(new ValidationPipe());

    var hbs = require("hbs");
    hbs.registerPartials(join(__dirname, "..", "views", "partials"));
    app.set("view engine", "hbs");
    app.set("views", join(__dirname, "..", "views", "layouts"));
    app.useStaticAssets(join(__dirname, "..", "public"));

    await app.listen(3000);
}

bootstrap();
