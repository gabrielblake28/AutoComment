import * as vscode from "vscode";
import { getNonce } from "../../getNonce";
import { OpenAIApi } from "openai";

export class ExplanationViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "generate-explanation.explanation";

  public view?: vscode.WebviewView;

  constructor(private readonly openAI: OpenAIApi, private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this.view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  public async AddExplanation(cancellationToken: vscode.CancellationToken): Promise<boolean> {
    if (!this.view) {
      await vscode.commands.executeCommand("generate-explanation.explanation.focus");
    } else {
      this.view?.show?.(true);
    }

    // Get the selected text of the active editor
    const selection = vscode.window.activeTextEditor?.selection;
    // If a user does not want to append this information to their prompt, leave it as an empty string

    if (selection?.start && selection.end) {
      const content = vscode.window.activeTextEditor?.document.getText(
        new vscode.Range(selection.start, selection?.end)
      );

      const result = await this.openAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Please provide an explanation for the following code, but keep it succint and readable to a non programmer and try to avoid using programming terms: ${content}`,
          },
        ],
        temperature: 0.7,
      });

      if (this.view) {
        this.view.webview.html = this._getHtmlForWebview(
          this.view.webview,
          result.data.choices[0].message?.content ?? ""
        );

        return true;
      }
    } else {
      vscode.window.showInformationMessage(
        "please select the code you would like to comment."
      );

      return false;
    }

    return false;
  }

  private _getHtmlForWebview(webview: vscode.Webview, content: string = "") {
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
  
      </head>
      <body>
      
        <div >    
          <div class="content">${content}</div>  
        </div>
  
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}
