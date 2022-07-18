import express, {json} from "express"
import cors from "cors"
import Parser from "./parser/parser";
import {IClientData} from "./types/types";
import {jobRouter} from "./routes/jobs.route";
import axios from "axios";
import * as cheerio from "cheerio";

const PORT = process.env.PORT || 9000
const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/job', jobRouter)


async function startup () {
    try {
        app.listen(PORT, () => console.log("SERVER RUNNING AT:" + PORT))
    } catch (e) {
        console.log(e.message)
    }
}

startup()

const fakeData: IClientData = {
    srcList: ['dou'],
    keywords: ['React junior'],
    exp: 0
}

