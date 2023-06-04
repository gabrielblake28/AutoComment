import { CancellationToken } from "vscode";

export interface IVscodeCommand {
    CommandName: string;
    ExecuteCommand(cancellationToken?: CancellationToken): Thenable<boolean>;
}