import * as vscode from "vscode";
import { ICommand } from "../../def/ICommand";
import { GenerateExplanationCommandArgs } from "./GenerateExplanationCommandArgs";

export class GenerateExplanationCommand implements ICommand<string> {
  async ExecuteAsync(commandOptions: GenerateExplanationCommandArgs) {
    const result = await commandOptions.OpenAiClient.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Please provide an explanation for the following code, but keep it succint and readable to a non programmer and try to avoid using programming terms: ${commandOptions.Content}`,
        },
      ],
      temperature: 0.7,
    });

    return result.data.choices[0].message?.content ?? "";
  }
}
