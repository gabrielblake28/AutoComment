import * as vscode from "vscode";
import { IVscodeCommand } from "./IVScodeCommand";
import { AuthenticationService } from "../AuthService/AuthService";
import { FirebaseAuthProvider } from "../AuthService/FirebaseAuthProvider";
import { SubscriptionPlanTier as SubscriptionPlanTier } from "../AuthService/SubscriptionPlanTier";

export abstract class CommandProviderBase {
    protected readonly AuthService: AuthenticationService;    

    constructor(
        protected readonly context: vscode.ExtensionContext, 
        authProvider: FirebaseAuthProvider) {
        this.AuthService = new AuthenticationService(context, authProvider);
    }

    protected abstract RegisterCommandBase(commandOptions: CommandOptions): vscode.Disposable;

    protected async executeCommand(command: IVscodeCommand, commandOptions: CommandOptions): Promise<Thenable<boolean>> {
        if(commandOptions.UseAuthentication) {
            var session = await this.AuthService.TryAuthenticate();
            if(!session) {
                vscode.window.showErrorMessage("Please login to access services.")
                return false;
            }

            if(!this.AuthService.TryAuthorizeCommand([...session.scopes], commandOptions.UseAuthentication)) {
                vscode.window.showErrorMessage("Your current plan does not support this command.");

                if(!this.context.globalState.get("firstextension.authredirect")) {
                    this.context.globalState.update(`firstextension.authredirect`, true);
                    vscode.env.openExternal(vscode.Uri.parse("https://codesenseai.com/pricing"));
                }

                return false;
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
    UseAuthentication?: SubscriptionPlanTier,
    UseProgress?: CommandProgressOptions,
}

export interface CommandProgressOptions extends vscode.ProgressOptions {};

