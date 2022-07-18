"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const jobs_route_1 = require("./routes/jobs.route");
const PORT = process.env.PORT || 9000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/job', jobs_route_1.jobRouter);
async function startup() {
    try {
        app.listen(PORT, () => console.log("SERVER RUNNING AT:" + PORT));
    }
    catch (e) {
        console.log(e.message);
    }
}
startup();
const fakeData = {
    srcList: ['dou'],
    keywords: ['React junior'],
    exp: 0
};
//# sourceMappingURL=index.js.map