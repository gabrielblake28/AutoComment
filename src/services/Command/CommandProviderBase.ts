import * as vscode from "vscode";
import { IVscodeCommand } from "./IVScodeCommand";
import { AuthenticationService } from "../AuthService/AuthService";
import { FirebaseAuthProvider } from "../AuthService/FirebaseAuthProvider";

export abstract class CommandProviderBase {
    protected readonly AuthService: AuthenticationService;    

    constructor(
        private readonly context: vscode.ExtensionContext, 
        private readonly authProvider: FirebaseAuthProvider) {
        this.AuthService = new AuthenticationService(context, authProvider);
    }

    protected abstract RegisterCommandBase(commandOptions: CommandOptions): vscode.Disposable;

    protected async executeCommand(command: IVscodeCommand, commandOptions: CommandOptions): Promise<Thenable<boolean>> {
        if(commandOptions.UseAuthentication) {
            if(!(await this.AuthService.TryAuthenticate())) {
                vscode.window.showErrorMessage("Please login to access services.")
                return false;
            }

            if(!this.AuthService.TryAuthorizeCommand(command)) {
                vscode.window.showErrorMessage("Your current plan does not support this command, redirecting to plans page.");

                if(!this.context.globalState.get("firstextension.authredirect")) {
                    this.context.globalState.update(`firstextension.authredirect`, true);
                    vscode.env.openExternal(vscode.Uri.parse("https://codesenseai.com/pricing"));
                }
            }   
        }

        if(commandOptions.UseProgress) {
            return vscode.window.withProgress(
                commandOptions.UseProgress,
                (_, token) => {
                    return command.ExecuteCommand(token);
                }
            )
        }

        return command.ExecuteCommand();
    }
}

export interface CommandOptions {
    UseAuthentication?: boolean,
    UseProgress?: CommandProgressOptions
}

export interface CommandProgressOptions extends vscode.ProgressOptions {};

