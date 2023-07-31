import { OpenAIApi } from "openai";
import { CommandOptions, CommandProviderBase } from "../Command/CommandProviderBase";
import { AutoCommentCommand } from "./AutoCommentCommand";
import * as vscode from "vscode";
import { ICommandProvider } from "../Command/ICommandProvider";
import { FirebaseAuthProvider } from "../AuthService/FirebaseAuthProvider";
import { SubscriptionPlanTier } from "../AuthService/SubscriptionPlanTier";

export default class AutoCommentCommandProvider extends CommandProviderBase implements ICommandProvider {
    private command: AutoCommentCommand | undefined;

    constructor(private readonly openAI: OpenAIApi, 
        context: vscode.ExtensionContext, 
        authProvider: FirebaseAuthProvider) {
        super(context, authProvider);
    }

    RegisterCommand(): vscode.Disposable {
        return this.RegisterCommandBase({
            UseAuthentication: SubscriptionPlanTier.Standard,
            UseProgress: {
                location: vscode.ProgressLocation.Notification, 
                cancellable: true, 
                title: "Generating Comment..."
            },
        })
    }

    protected RegisterCommandBase(commandOptions: CommandOptions): vscode.Disposable {
        if(!this.command) {
            this.command = new AutoCommentCommand(this.openAI);
        }
        return vscode.commands.registerCommand(
            this.command.CommandName,
            this.executeCommand.bind(this, this.command, commandOptions));
    }
}