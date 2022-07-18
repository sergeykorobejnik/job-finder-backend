"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options = {
    djinni: {
        root: 'https://djinni.co',
        path: '/jobs',
        buildQuery(keywords, expLevel) {
            return this.root + this.path +
                `?exp_level=${this.equalizingExpDictionary[expLevel]}&keywords=${encodeURIComponent(keywords)}`;
        },
        equalizingExpDictionary: {
            0: 'no_exp',
            1: '1y',
            2: '2y'
        },
        selectors: {
            // leave link field empty
            link: '',
            //all img  url string should start with img...
            imgCompany: '.userpic-image',
            company: '.list-jobs__details__info a+a',
            title: 'a.profile',
            body: '.list-jobs__description',
        },
    },
    workua: {
        root: 'https://www.work.ua',
        path: 'https://www.work.ua/ru/jobs',
        buildQuery(keywords, expLevel) {
            return this.path +
                `-${encodeURIComponent(keywords
                    .replace(/\s/g, "+"))}`;
        },
        equalizingExpDictionary: {
            0: 'no_exp',
            1: '1y',
            2: '2y'
        },
        selectors: {
            // leave link field empty
            link: '',
            imgCompany: '.logo-job',
            company: '.job-link .add-top-xs>span:first-child',
            title: '.job-link h2 a[href^="/ru/jobs/"]',
            body: '.overflow.text-muted.add-top-sm.cut-bottom',
        },
    },
    dou: {
        root: 'https://jobs.dou.ua',
        path: '/vacancies',
        buildQuery(keywords, expLevel) {
            return this.root + this.path +
                `?search=${encodeURIComponent(keywords)}&exp=${this.equalizingExpDictionary[expLevel]}`;
        },
        equalizingExpDictionary: {
            0: '0-1',
            1: '1-3',
            2: '3-5'
        },
        selectors: {
            // leave link field empty
            link: '',
            imgCompany: 'a.logo img',
            company: '.company',
            title: 'a.vt',
            body: '.sh-info',
        },
    },
};
exports.default = options;
//# sourceMappingURL=options.js.map