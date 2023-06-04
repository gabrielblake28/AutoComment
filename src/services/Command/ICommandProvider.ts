import { Disposable, ExtensionContext } from "vscode";

export interface ICommandProvider {
    RegisterCommand(context: ExtensionContext): Disposable;
}