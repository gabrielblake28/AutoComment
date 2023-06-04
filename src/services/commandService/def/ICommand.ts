import { ICommandOptions } from "./ICommandOptions";

export interface ICommand<T> {
  ExecuteAsync(commandOptions: ICommandOptions): Promise<T>;
}
