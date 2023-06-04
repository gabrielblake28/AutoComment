import { OpenAIApi } from "openai";
import * as vscode from "vscode";
import { formatComment } from "../Command/commands";
import { IVscodeCommand } from "../Command/IVScodeCommand";
import { ExplanationViewProvider } from "../viewProviders/ExplanationViewProvider";

export class AutoExplanationCommand implements IVscodeCommand {
    public readonly CommandName = "codesense.generateexplanation";
    private readonly openAI: OpenAIApi;
    private readonly viewProvider: ExplanationViewProvider;

    private readonly chatGPTModel = "gpt-3.5.turbo";
    private readonly chatGPTRole = "user";
    private readonly explanationPrompt = "Please provide an explanation for the following code, but keep it succint and readable to a non programmer and try to avoid using programming terms:";
    private readonly temperature = 0.7;

    constructor(openAI: OpenAIApi, explanationViewProvider: ExplanationViewProvider) {
        this.openAI = openAI;
        this.viewProvider = explanationViewProvider;
    }

    public async ExecuteCommand(cancellationToken: vscode.CancellationToken): Promise<boolean> {                
        return await this.viewProvider.AddExplanation(cancellationToken);
    }

    private async GenerateExplanation(cancellationToken: vscode.CancellationToken): Promise<boolean> {
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
                    content: `${this.explanationPrompt} ${content}`,
                },
                ],
                temperature: this.temperature,
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
            } 
            else 
            {
                vscode.window.showInformationMessage("please select the code you would like to comment.");
            }

            return true;
        } catch (e) {
            vscode.window.showInformationMessage((e as Error).message);
            return false;
        }
    }
}
