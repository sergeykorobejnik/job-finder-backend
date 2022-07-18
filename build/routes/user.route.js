"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parser_1 = __importDefault(require("../parser/parser"));
const userRouter = (0, express_1.Router)();
userRouter.post('/register-keys', async (req, res) => {
    try {
        console.log(parser_1.default.parse(req.body));
        res
            .status(200)
            .json({
            title: "hello postman"
        });
    }
    catch (e) {
        console.log(e);
    }
});
//# sourceMappingURL=user.route.js.map