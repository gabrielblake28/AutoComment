import { ICommand } from "../../def/ICommand";
import { GenerateCommentCommandArgs } from "./GenerateCommentCommandArgs";

export class GenerateCommentCommand implements ICommand<string> {
  async ExecuteAsync(
    commandOptions: GenerateCommentCommandArgs
  ): Promise<string> {
    try {
      const models = await commandOptions.OpenAiClient.listModels();

      const result = await commandOptions.OpenAiClient.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Provide a comment for the following code, but keep it succint and readable to a non programmer: ${commandOptions.Content}`,
          },
        ],
        temperature: 0.5,
        stream: false,
      });

      return this.FormatComment(
        result.data.choices[0].message?.content ?? "",
        commandOptions.Indentation
      );
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private FormatComment = (comment: string, indentation: number): string => {
    let i = 0;
    let marker = 0;
    const escapeChar = `\r\n${" ".repeat(indentation)}//`;
    let formattedComment = "";

    while (i < comment.length) {
      i += 80;
      if (i >= comment.length) {
        formattedComment += `${escapeChar}${comment.substring(
          marker,
          comment.length
        )}\r\n`;
        break;
      }

      while (comment[i] !== " ") {
        i--;
      }
      formattedComment += `${escapeChar}${comment.substring(marker, i)}`;
      marker = i + 1;
    }

    return formattedComment;
  };
}
