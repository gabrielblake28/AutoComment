import * as vscode from "vscode";
import { Configuration, OpenAIApi } from "openai";
import { start } from "repl";
import { openAI } from "../../config/openAI";


export async function generateComment() {

  try {
    const selection = vscode.window.activeTextEditor?.selection;
    if (selection?.start && selection.end) {
      const content = vscode.window.activeTextEditor?.document.getText(
        new vscode.Range(selection.start, selection?.end)
      );

      const result = await openAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Please provide a comment for the following selection, but keep it succint and readable to a non programmer: ${content}`,
          },
        ],
        temperature: 0.7,
      });

      vscode.window.activeTextEditor?.edit((editBuilder) => {
        if (vscode.window.activeTextEditor) {
          const startPos = vscode.window.activeTextEditor.document.lineAt(
            vscode.window.activeTextEditor?.selection.start.line
          ).range.start;
          const indentation = vscode.window.activeTextEditor.document.lineAt(
            startPos.line
          ).firstNonWhitespaceCharacterIndex;
          editBuilder.insert(
            startPos,

            formatComment(
              result.data.choices[0].message?.content ?? "",
              indentation
            )
          );
        }
      });
    } else {
      vscode.window.showInformationMessage(
        "please select the code you would like to comment."
      );
    }
  } catch (e) {
    vscode.window.showInformationMessage((e as Error).message);
  }
}

export const formatComment = (comment: string, indentation: number) => {
  let i = 0;
  let marker = 0;
  const escapeChar = `\r\n${" ".repeat(indentation)}//`;
  let formattedComment = "";

  while (i < comment.length) {
    i += 120;
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
