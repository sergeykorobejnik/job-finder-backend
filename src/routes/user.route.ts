import {Router} from "express";
import Parser from "../parser/parser";

const userRouter = Router()

userRouter.post(
    '/register-keys',
    async (req, res) => {
        try {
            console.log(Parser.parse(req.body))
            res
                .status(200)
                .json({
                    title: "hello postman"
                })

        } catch (e) {
            console.log(e)
        }
    }
)