"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRouter = void 0;
const express_1 = require("express");
const parser_1 = __importDefault(require("../parser/parser"));
const jobRouter = (0, express_1.Router)();
exports.jobRouter = jobRouter;
jobRouter.post("/parse", async (req, res) => {
    try {
        console.log(req.body);
        res
            .status(200)
            .json(await parser_1.default.parse(req.body));
    }
    catch (e) {
        console.log(e);
    }
});
jobRouter.get("/test", async (req, res) => {
    try {
        const fakeData = {
            srcList: ['djinni'],
            keywords: ['React junior'],
            exp: 0
        };
        res
            .status(200)
            .json(await parser_1.default.parse(fakeData));
    }
    catch (e) {
        console.log(e);
    }
});
//# sourceMappingURL=jobs.route.js.map