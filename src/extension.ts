import * as vscode from "vscode";
import { ExplanationViewProvider } from "./services/ExplanationViewProvider/ExplanationViewProvider";
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

  const explanationViewProvider = new ExplanationViewProvider(openAI,context.extensionUri);
  const firebaseAuthProvider = new FirebaseAuthProvider(context, extensionConfiguration);

  context.subscriptions.push(
    new AutoExplanationProvider(openAI, context, firebaseAuthProvider, explanationViewProvider).RegisterCommand(),
    new AutoCommentCommandProvider(openAI, context, firebaseAuthProvider).RegisterCommand(),
    vscode.window.registerWebviewViewProvider(
      ExplanationViewProvider.viewType,
      explanationViewProvider,
      {
        webviewOptions: { retainContextWhenHidden: true },
      }
    )  
    );
}

// This method is called when your extension is deactivated
// export function deactivate() {}
