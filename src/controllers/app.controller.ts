import { Controller, Get, Param, Redirect, Res } from "@nestjs/common";
import { Response } from "express";

@Controller()
export class AppController {
    constructor() {
    }

    @Get()
    @Redirect("auth", 302)
    root() {
    }

    @Get(":pageName")
    async dynamicPage(@Param("pageName") pageName: string, @Res() res: Response) {
        res.render(pageName);
    }

    @Get("test/test")
    test() {
        return 'Hello World!'
    }
}
