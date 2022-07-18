import {Router} from "express";
import Parser from "../parser/parser";
import {IClientData} from "../types/types";

const jobRouter = Router()
jobRouter.post(
    "/parse",
    async (req, res) => {
        try {
            console.log(req.body)
            res
                .status(200)
                .json(await Parser.parse(req.body as IClientData))
        } catch (e) {
            console.log(e)
        }
    }
)
jobRouter.get(
    "/test",
    async (req, res) => {
        try {
            const fakeData: IClientData = {
                srcList: ['djinni'],
                keywords: ['React junior'],
                exp: 0
            }
            res
                .status(200)
                .json(await Parser.parse(fakeData))
        } catch (e) {
            console.log(e)
        }
    }
)

export {jobRouter}