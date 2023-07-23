import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: "org-dEtIga6fE6tm2FkqJmKYh9Qc",
    apiKey: "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",
  });
  
export const openAI = new OpenAIApi(configuration);
  