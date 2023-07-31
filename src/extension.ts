import * as vscode from "vscode";
import { ExplanationViewProvider } from "./services/ExplanationViewProvider/ExplanationViewProvider";
import ExtensionConfiguration from "./config/firebase";
import AutoExplanationProvider from "./services/AutoExplanation/AutoExplanationCommandProvider";
import AutoCommentCommandProvider from "./services/AutoComment/AutoCommentCommandProvider";
import { openAI } from "./config/openAI";
import { FirebaseAuthProvider } from "./services/AuthService/FirebaseAuthProvider";
import { AuthenticationService } from "./services/AuthService/AuthService";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * Activates the extension and registers the necessary commands.
 * @param {vscode.ExtensionContext} context - The context of the extension.
 * @returns None
 */
export function activate(context: vscode.ExtensionContext) {
  vscode.window.registerUriHandler({
    async handleUri(uri: vscode.Uri) {
      if (uri.path == "/auth_complete") {
        var params = new URLSearchParams(uri.query);

        const accessToken = params.get("code");
        if (accessToken) {
          var session = await new AuthenticationService(
            context,
            firebaseAuthProvider
          ).TryAuthenticateSession(accessToken);

          if (session) {
            vscode.window.showInformationMessage("Sign in was successful");
            return;
          }
        }
      }

      vscode.window.showErrorMessage(
        "Sign in was unsuccessful. Please try again. If your problem persists, contact us at support@codesenseai.com"
      );
    },
  });

  console.log(context.extension.extensionUri, context.extension.id);
  const extensionConfiguration = new ExtensionConfiguration();
  extensionConfiguration.Initialize();

  const explanationViewProvider = new ExplanationViewProvider(
    openAI,
    context.extensionUri
  );
  const firebaseAuthProvider = new FirebaseAuthProvider(
    context,
    extensionConfiguration
  );

  context.subscriptions.push(
    new AutoExplanationProvider(
      openAI,
      context,
      firebaseAuthProvider,
      explanationViewProvider
    ).RegisterCommand(),
    new AutoCommentCommandProvider(
      openAI,
      context,
      firebaseAuthProvider
    ).RegisterCommand(),
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
