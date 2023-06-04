import { ICommandOptions } from "../../def/ICommandOptions";
import { OpenAIApi } from "openai";

export interface GenerateCommentCommandArgs extends ICommandOptions {
  OpenAiClient: OpenAIApi;
  Content: string;
  Indentation: number;
}
