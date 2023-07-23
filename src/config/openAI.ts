import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({path: path.resolve(__dirname, "../..", ".env")});

const configuration = new Configuration({
    organization: "org-dEtIga6fE6tm2FkqJmKYh9Qc",
    apiKey: process.env.OA_API_KEY,
  });
  
export const openAI = new OpenAIApi(configuration);
  