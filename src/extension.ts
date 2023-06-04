import * as vscode from "vscode";
import { Configuration, OpenAIApi } from "openai";
import { GenerateCommentCommand } from "./services/commandService/impl/GenerateComment/GenerateCommentCommand";
import { ExplanationViewProvider } from "./services/viewProviders/ExplanationViewProvider";
import ExtensionConfiguration from "./config/firebase";
import AutoExplanationProvider from "./services/AutoExplanation/AutoExplanationCommandProvider";
import AutoCommentCommandProvider from "./services/AutoComment/AutoCommentCommandProvider";
import { openAI } from "./config/openAI";
import { FirebaseAuthProvider } from "./services/AuthService/FirebaseAuthProvider";


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * Activates the extension and registers the necessary commands.
 * @param {vscode.ExtensionContext} context - The context of the extension.
 * @returns None
 */
export function activate(context: vscode.ExtensionContext) {

  const extensionConfiguration = new ExtensionConfiguration();
  extensionConfiguration.Initialize();

  const provider = new ExplanationViewProvider(context.extensionUri);
  const firebaseAuthProvider = new FirebaseAuthProvider(context, extensionConfiguration);

  let generateExplanation = vscode.commands.registerCommand(
    "codesense.generateexplanation",
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
            if (!provider.view) {
              await vscode.commands.executeCommand(
                "generate-explanation.explanation.focus"
              );
            } else {
              provider.view?.show(true);
            }

            if (provider.view) {
              await provider.addExplanation();
            }
          }
        }
      );
    }
  );

  let generateComment = vscode.commands.registerCommand(
    "codesense.generatecomment",
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
    new AutoExplanationProvider(openAI, context, firebaseAuthProvider).RegisterCommand(),
    new AutoCommentCommandProvider(openAI, context, firebaseAuthProvider).RegisterCommand(),
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
