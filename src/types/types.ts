export interface ParserOptions {
    [key: string]: {
        path: string
        root: string
        buildQuery(keywords: string, expLevel: number): string
        equalizingExpDictionary: {
            [key: number]: string
        },
        selectors: IJobSelectors
    }
}

export interface IJobSelectors {
    [key: string]: string
    link: string
    imgCompany: string
    company: string
    title: string
    body: string
}

export interface IClientData {
    srcList: Array<string>
    keywords: Array<string>
    exp: number
}
