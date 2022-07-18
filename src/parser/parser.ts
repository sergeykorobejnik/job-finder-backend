import options from "./options";
import {IClientData, IJobSelectors, ParserOptions} from "../types/types";
import * as cheerio from "cheerio";
import * as Buffer from "buffer";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import {toCloudEventProtoFormat} from "firebase-admin/lib/eventarc/eventarc-utils";

type Root = ReturnType<typeof cheerio['load']>

interface IJobOptions {
    selectors: {
        title: string
        body: string
    }
    clientOptions: IClientData
}

interface IJob extends IJobSelectors {
    id: string
}


class Parser {
    srcList: Array<string>
    parserOptions: ParserOptions
    clientSrcList: IClientData["srcList"]
    clientSetting: IClientData

    constructor(options: ParserOptions) {
        this.srcList = Object.keys(options)
        this.parserOptions = options
        this.clientSrcList = [];
        this.clientSetting = {} as IClientData
    }

    createTemplate(keyType: any): Record<any, any> {
        if (Array.isArray(keyType)) return this.clientSrcList.reduce((a, v) => ({...a, [v]: [...keyType]}), {})
        if (typeof keyType === 'object') return this.clientSrcList.reduce((a, v) => ({...a, [v]: {...keyType}}), {})
        return this.clientSrcList.reduce((a, v) => ({...a, [v]: keyType}), {})
    }

    async parseHtml(links)
        : Promise<Record<keyof ParserOptions, Array<string | Buffer>>> {
        const documentList: Record<keyof ParserOptions, Array <string | Buffer>> = this.createTemplate([])
        for (const src in links) {
            for await (const link of links[src]) {
                documentList[src].push(await axios.get(link).then(res => res.data))
            }
        }
        return documentList
    }

    async loadCheerio(htmlList: Record<keyof ParserOptions, Array<string | Buffer>>)
        : Promise<Record<keyof ParserOptions, Array<Root>>> {
        const cheerioList: Record<keyof ParserOptions, Root[]> = this.createTemplate([])
        for (const src in htmlList) {
            for (const html of htmlList[src]) {
                cheerioList[src].push(cheerio.load(html))
            }
        }
        return cheerioList
    }

    async buildLinksAsync(clientSettings: IClientData): Promise<{ [k: string]: string[] }> {
        const {keywords, srcList, exp} = clientSettings
        const links: Record<keyof ParserOptions, string[]> = this.clientSrcList.reduce((a, v) => ({...a, [v]: []}), {})
        srcList.forEach((src) => {
            keywords.forEach(keyword => {
                const link = this.parserOptions[src].buildQuery(keyword, exp)
                links[src].push(link)
            })
        })
        return links
    }

    async buildJobList(cheerioList: Record<keyof ParserOptions, Array<Root>>):
        Promise<Record<keyof ParserOptions, Array<IJob>>> {
        const jobList: Record<keyof ParserOptions, Array<IJob>> = this.createTemplate([])
        const tempList: IJob[] = []
        for (const src of Object.keys(cheerioList)) {
            const {selectors, root} = this.parserOptions[src]
            for (const $ of cheerioList[src]) {
                for (const selector of Object.keys(this.parserOptions[src].selectors)) {
                    if (selector === 'link') {
                        $(selectors['title'])
                            .toArray()
                            .forEach(link => {
                                const linkStr = $(link).attr('href')
                            tempList.push(
                                {
                                    link: /http:\/\/|https:\/\//g.test(linkStr)
                                        ? linkStr
                                        : this.parserOptions[src].root + linkStr,
                                    id: uuidv4()
                                } as IJob
                            )

                        })
                        continue;
                    }
                    if (selector.includes('img')) continue;
                    if  (selector.includes('img')) {
                        for (const item in tempList) {
                            const html = (await axios.get(tempList[item].link)).data
                            const cheerioDoc = cheerio.load(html)
                            let imageUrl = cheerioDoc(selectors[selector]).attr('src')
                            if (imageUrl === undefined) {
                                imageUrl = cheerioDoc(selector).css('background-image').replace(/[url(")]/g,'')
                            }
                            tempList[item][selector] = 'IMAGE STRING'
                        }
                        continue;
                    }
                    $(selectors[selector])
                        .toArray()
                        .forEach((el, index) => {
                            tempList[index][selector] = $(el).text().replace(/\n\s+/g, ' ').trim()
                        })

                }

                const imageSelectors = Object.keys(selectors).filter(item => item.includes('img'))

                for (const imageSelector of imageSelectors) {
                    for (const item of tempList) {
                        const html = (await axios.get(item.link)).data
                        const cheerioDoc = cheerio.load(html)
                        let imageUrl = cheerioDoc(selectors[imageSelector]).attr('src')
                        if (imageUrl === undefined) {
                            imageUrl = cheerioDoc(selectors[imageSelector]).css('background-image')
                            imageUrl = imageUrl === 'none' || imageUrl === undefined
                                ? undefined
                                : imageUrl.match(/(('+[\s\S]+')|("+[\s\S]+"))/g)?.[0].replace(/'|"/g, '')
                            imageUrl = /http:\/\/|https:\/\//g.test(imageUrl) || imageUrl === undefined
                                ? imageUrl
                                : root + imageUrl
                        }
                        item[imageSelector] = imageUrl
                    }
                }

                jobList[src].push(...tempList)
                tempList.length = 0
            }
        }
        return jobList

    }


    async parse(data: IClientData) {
        this.clientSrcList = data.srcList
        const links = await this.buildLinksAsync(data)
        const documentList = await this.parseHtml(links)
        const cheerioList = await this.loadCheerio(documentList)
        const jobList = await this.buildJobList(cheerioList)
        return jobList
    }

}

export default new Parser(options)