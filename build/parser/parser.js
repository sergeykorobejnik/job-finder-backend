"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = __importDefault(require("./options"));
const cheerio = __importStar(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
class Parser {
    srcList;
    parserOptions;
    clientSrcList;
    clientSetting;
    constructor(options) {
        this.srcList = Object.keys(options);
        this.parserOptions = options;
        this.clientSrcList = [];
        this.clientSetting = {};
    }
    createTemplate(keyType) {
        if (Array.isArray(keyType))
            return this.clientSrcList.reduce((a, v) => ({ ...a, [v]: [...keyType] }), {});
        if (typeof keyType === 'object')
            return this.clientSrcList.reduce((a, v) => ({ ...a, [v]: { ...keyType } }), {});
        return this.clientSrcList.reduce((a, v) => ({ ...a, [v]: keyType }), {});
    }
    async parseHtml(links) {
        const documentList = this.createTemplate([]);
        for (const src in links) {
            for await (const link of links[src]) {
                documentList[src].push(await axios_1.default.get(link).then(res => res.data));
            }
        }
        return documentList;
    }
    async loadCheerio(htmlList) {
        const cheerioList = this.createTemplate([]);
        for (const src in htmlList) {
            for (const html of htmlList[src]) {
                cheerioList[src].push(cheerio.load(html));
            }
        }
        return cheerioList;
    }
    async buildLinksAsync(clientSettings) {
        const { keywords, srcList, exp } = clientSettings;
        const links = this.clientSrcList.reduce((a, v) => ({ ...a, [v]: [] }), {});
        srcList.forEach((src) => {
            keywords.forEach(keyword => {
                const link = this.parserOptions[src].buildQuery(keyword, exp);
                links[src].push(link);
            });
        });
        return links;
    }
    async buildJobList(cheerioList) {
        const jobList = this.createTemplate([]);
        const tempList = [];
        for (const src of Object.keys(cheerioList)) {
            const { selectors, root } = this.parserOptions[src];
            for (const $ of cheerioList[src]) {
                for (const selector of Object.keys(this.parserOptions[src].selectors)) {
                    if (selector === 'link') {
                        $(selectors['title'])
                            .toArray()
                            .forEach(link => {
                            const linkStr = $(link).attr('href');
                            tempList.push({
                                link: /http:\/\/|https:\/\//g.test(linkStr)
                                    ? linkStr
                                    : this.parserOptions[src].root + linkStr,
                                id: (0, uuid_1.v4)()
                            });
                        });
                        continue;
                    }
                    if (selector.includes('img'))
                        continue;
                    if (selector.includes('img')) {
                        for (const item in tempList) {
                            const html = (await axios_1.default.get(tempList[item].link)).data;
                            const cheerioDoc = cheerio.load(html);
                            let imageUrl = cheerioDoc(selectors[selector]).attr('src');
                            if (imageUrl === undefined) {
                                imageUrl = cheerioDoc(selector).css('background-image').replace(/[url(")]/g, '');
                            }
                            tempList[item][selector] = 'IMAGE STRING';
                        }
                        continue;
                    }
                    $(selectors[selector])
                        .toArray()
                        .forEach((el, index) => {
                        tempList[index][selector] = $(el).text().replace(/\n\s+/g, ' ').trim();
                    });
                }
                const imageSelectors = Object.keys(selectors).filter(item => item.includes('img'));
                for (const imageSelector of imageSelectors) {
                    for (const item of tempList) {
                        const html = (await axios_1.default.get(item.link)).data;
                        const cheerioDoc = cheerio.load(html);
                        let imageUrl = cheerioDoc(selectors[imageSelector]).attr('src');
                        if (imageUrl === undefined) {
                            imageUrl = cheerioDoc(selectors[imageSelector]).css('background-image');
                            imageUrl = imageUrl === 'none' || imageUrl === undefined
                                ? undefined
                                : imageUrl.match(/(('+[\s\S]+')|("+[\s\S]+"))/g)?.[0].replace(/'|"/g, '');
                            imageUrl = /http:\/\/|https:\/\//g.test(imageUrl) || imageUrl === undefined
                                ? imageUrl
                                : root + imageUrl;
                        }
                        item[imageSelector] = imageUrl;
                    }
                }
                jobList[src].push(...tempList);
                tempList.length = 0;
            }
        }
        return jobList;
    }
    async parse(data) {
        this.clientSrcList = data.srcList;
        const links = await this.buildLinksAsync(data);
        const documentList = await this.parseHtml(links);
        const cheerioList = await this.loadCheerio(documentList);
        const jobList = await this.buildJobList(cheerioList);
        return jobList;
    }
}
exports.default = new Parser(options_1.default);
//# sourceMappingURL=parser.js.map