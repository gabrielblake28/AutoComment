import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: "org-dEtIga6fE6tm2FkqJmKYh9Qc",
    apiKey: "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",
  });
  
export const openAI = new OpenAIApi(configuration);
  