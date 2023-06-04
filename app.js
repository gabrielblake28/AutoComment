"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const port = process.env.PORT;
app.get("/auth/complete", async (req, res) => {
    await axios_1.default.get("vscode://firstextension/auth/complete");
    res.end();
});
exports.default = app;
//# sourceMappingURL=app.js.map