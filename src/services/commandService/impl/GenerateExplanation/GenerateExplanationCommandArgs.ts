import { ICommandOptions } from "../../def/ICommandOptions";
import { OpenAIApi } from "openai";

import * as vscode from "vscode";
export interface GenerateExplanationCommandArgs extends ICommandOptions {
  OpenAiClient: OpenAIApi;
  Content: string;
  Provider: vscode.WebviewViewProvider;
}
