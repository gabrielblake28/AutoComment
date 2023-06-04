import * as vscode from "vscode";
import { CommandProviderBase } from "../Command/CommandProviderBase";
import { IVscodeCommand } from "../Command/IVScodeCommand";
import { OpenAIApi } from "openai";
import { formatComment } from "../Command/commands";

export class AutoCommentCommand implements IVscodeCommand {
    private readonly openAI: OpenAIApi;
    public readonly CommandName: string = "firstextension.generatecomment";

    private readonly progressTitle = "Generating Comment...";
    private readonly chatGPTModel = "gpt-3.5-turbo";
    private readonly chatGPTRole = "user";
    private readonly chatGPTPrompt = "Please provide a comment for the following selection, but keep it succint and readable to a non programmer:";
    private readonly selectCodeText =  "please select the code you would like to comment.";

    constructor(openAI: OpenAIApi) {
        this.openAI = openAI;
    }

    public ExecuteCommand(cancellationToken: vscode.CancellationToken): Thenable<boolean> {
          return this.GenerateComment(cancellationToken);      
    }

    private async GenerateComment(cancellationToken: vscode.CancellationToken): Promise<boolean> {
        try {

        const selection = vscode.window.activeTextEditor?.selection;
        if (selection?.start && selection.end) {
          const content = vscode.window.activeTextEditor?.document.getText(
            new vscode.Range(selection.start, selection?.end)
          );
    
          const result = await this.openAI.createChatCompletion({
            model: this.chatGPTModel,
            messages: [
              {
                role: this.chatGPTRole,
                content: `${this.chatGPTPrompt} ${content}`,
              },
            ],
            temperature: 0.7,
          });
    
          const highlights = await vscode.commands.executeCommand(
            "vscode.executeDocumentSymbolProvider",
            vscode.window.activeTextEditor?.document.uri
          );
    
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
          return true;
        } else {
          vscode.window.showInformationMessage(this.selectCodeText);
          return false;
        }
      } catch (e: any) {
        vscode.window.showInformationMessage((e as Error).message);
        return false;
      }
    }
}

