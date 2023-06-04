import * as vscode from "vscode";
import { OpenAIApi } from "openai";
import { CommandOptions, CommandProviderBase } from "../Command/CommandProviderBase";
import { AutoExplanationCommand } from "./AutoExplanationCommand";
import { ICommandProvider } from "../Command/ICommandProvider";
import { FirebaseAuthProvider } from "../AuthService/FirebaseAuthProvider";
import { ExplanationViewProvider } from "../viewProviders/ExplanationViewProvider";

export default class AutoExplanationProvider extends CommandProviderBase implements ICommandProvider {
    private command: AutoExplanationCommand | undefined;

    constructor(
        private readonly openAI: OpenAIApi, 
        context: vscode.ExtensionContext, 
        authProvider: FirebaseAuthProvider,
        private readonly explanationViewProvider: ExplanationViewProvider) {
        super(context, authProvider);
    }

    public RegisterCommand(): vscode.Disposable {
        return this.RegisterCommandBase({
            UseAuthentication: true, 
            UseProgress: {
                title: "Generating Explanation...",
                location: vscode.ProgressLocation.Notification,
                cancellable: true,
            }
        });
    }

    protected RegisterCommandBase(commandOptions: CommandOptions): vscode.Disposable {
        if(!this.command) {
            this.command = new AutoExplanationCommand(this.openAI, this.explanationViewProvider);
        }

        return vscode.commands.registerCommand(this.command.CommandName, this.executeCommand.bind(this, this.command, commandOptions))
    }
}