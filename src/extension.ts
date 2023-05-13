/* eslint-disable @typescript-eslint/naming-convention */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { config } from "dotenv";
import { getNonce } from "./getNonce";
import { Configuration, OpenAIApi } from "openai";
import { GenerateCommentCommand } from "./services/commandService/impl/GenerateComment/GenerateCommentCommand";
import { GenerateExplanationCommand } from "./services/commandService/impl/GenerateExplanation/GenerateExplanationCommand";
import { ExplanationViewProvider } from "./services/viewProviders/ExplanationViewProvider";
config();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * Activates the extension and registers the necessary commands.
 * @param {vscode.ExtensionContext} context - The context of the extension.
 * @returns None
 */
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  console.log('Activating extension "CodeSense ai"');

  const configuration = new Configuration({
    organization: "org-dEtIga6fE6tm2FkqJmKYh9Qc",
    apiKey: "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",
  });
  const openai = new OpenAIApi(configuration);
  const provider = new ExplanationViewProvider(context.extensionUri);

  let generateExplanation = vscode.commands.registerCommand(
    "firstextension.generateexplanation",
    async () => {
      vscode.window.withProgress(
        {
          title: "Generating Explanation...",
          location: vscode.ProgressLocation.Notification,
          cancellable: true,
        },
        async (progress, token) => {
          const selection = vscode.window.activeTextEditor?.selection;
          if (
            selection?.start &&
            selection.end &&
            vscode.window.activeTextEditor
          ) {
            const content = vscode.window.activeTextEditor?.document.getText(
              new vscode.Range(selection.start, selection?.end)
            );

            if (!provider.view) {
              await vscode.commands.executeCommand(
                "generate-explanation.explanation.focus"
              );
            } else {
              provider.view?.show(true);
            }

            const result = await new GenerateExplanationCommand().ExecuteAsync({
              Content: content,
              OpenAiClient: openai,
              Provider: provider,
            });

            if (provider.view) {
              provider.view.webview.html = result;
            } else {
              vscode.window.showInformationMessage(
                "please select the code you would like to comment."
              );
            }
          }
        }
      );
    }
  );

  let generateComment = vscode.commands.registerCommand(
    "firstextension.generatecomment",
    async () => {
      vscode.window.withProgress(
        {
          title: "Generating Comment...",
          location: vscode.ProgressLocation.Notification,
          cancellable: true,
        },
        async (progress, token) => {
          const selection = vscode.window.activeTextEditor?.selection;
          if (
            selection?.start &&
            selection.end &&
            vscode.window.activeTextEditor
          ) {
            const content = vscode.window.activeTextEditor?.document.getText(
              new vscode.Range(selection.start, selection?.end)
            );
            const startPos = vscode.window.activeTextEditor?.document.lineAt(
              vscode.window.activeTextEditor?.selection.start.line
            ).range.start;
            const indentation = vscode.window.activeTextEditor?.document.lineAt(
              startPos.line
            ).firstNonWhitespaceCharacterIndex;

            const comment = await new GenerateCommentCommand().ExecuteAsync({
              Content: content,
              Indentation: indentation,
              OpenAiClient: openai,
            });

            if (comment) {
              vscode.window.activeTextEditor.edit((editBuilder) => {
                editBuilder.insert(startPos, comment);
              });
            }
          } else {
            vscode.window.showInformationMessage(
              "please select the code you would like to comment."
            );
          }
        }
      );
    }
  );

  context.subscriptions.push(
    generateComment,
    generateExplanation,
    vscode.window.registerWebviewViewProvider(
      ExplanationViewProvider.viewType,
      provider,
      {
        webviewOptions: { retainContextWhenHidden: true },
      }
    )
  );
}

// This method is called when your extension is deactivated
// export function deactivate() {}
