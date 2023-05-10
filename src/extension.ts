/* eslint-disable @typescript-eslint/naming-convention */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { config } from "dotenv";
import { generateComment, generateExplanation } from "./commands/commands";
import { ExplanationPanel } from "./explanationPanel";
import { SidebarProvider } from "./sidebarProvider";
import { getNonce } from "./getNonce";
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

  const explanationProvider = new ExplanationViewProvider(context.extensionUri);

  // let expalanationViewCmd = vscode.commands.registerCommand(
  //   "firstextension.explanationview",
  //   () => {
  //     vscode.window.registerWebviewViewProvider(
  //       ExplanationViewProvider.viewType,
  //       explanationProvider,
  //       {
  //         webviewOptions: { retainContextWhenHidden: true },
  //       }
  //     );
  //   }
  // );

  let autoExplanation = vscode.commands.registerCommand(
    "firstextension.generateexplanation",
    async () => {
      // explanationProvider.addExplanation();

      vscode.window.showInputBox({ prompt: "Did this work?" });

      vscode.window.withProgress(
        {
          title: "Generating Explanation...",
          location: vscode.ProgressLocation.Notification,
          cancellable: true,
        },
        (progress, token) => {
          return generateExplanation();
        }
      );
    }
  );

  let addExp = vscode.commands.registerCommand("firstextension.addexp", () => {
    explanationProvider.addExplanation();
  });

  let autoCommentCmd = vscode.commands.registerCommand(
    "firstextension.generatecomment",
    async () => {
      vscode.window.withProgress(
        {
          title: "Generating Comment...",
          location: vscode.ProgressLocation.Notification,
          cancellable: true,
        },
        (progress, token) => {
          return generateComment();
        }
      );
    }
  );

  context.subscriptions.push(
    autoCommentCmd,
    autoExplanation,
    vscode.window.registerWebviewViewProvider(
      ExplanationViewProvider.viewType,
      explanationProvider,
      {
        webviewOptions: { retainContextWhenHidden: true },
      }
    ),
    addExp
  );
}

class ExplanationViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "generate-explanation.explanation";

  private _view?: vscode.WebviewView;
  private _response?: string;
  private _promtp?: string;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      let code = data.value;
      const snippet = new vscode.SnippetString();
      snippet.appendText(code);
      // insert the code as a snippet into the active text editor
      vscode.window.activeTextEditor?.insertSnippet(snippet);
    });
  }

  public addExplanation() {
    if (this._view) {
      this._view?.show?.(true);
      this._view?.webview.postMessage("generateExplanation");
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">

      <!--
        Use a content security policy to only allow loading styles from our extension directory,
        and only allow scripts that have a specific nonce.
        (See the 'webview-sample' extension sample for img-src content security policy examples)
      -->
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

      <meta name="viewport" content="width=device-width, initial-scale=1.0">

      <link href="${styleResetUri}" rel="stylesheet">
      <link href="${styleVSCodeUri}" rel="stylesheet">
      <link href="${styleMainUri}" rel="stylesheet">

      <title>Cat Colors</title>
    </head>
    <body>
    
      <div>
        <h1>This is for explaining code</h1>
        <button class="add-color-button">Add Color</button>
      </div>

      

      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
  }
}

// This method is called when your extension is deactivated
// export function deactivate() {}
