import { AuthenticationSession, Disposable, ExtensionContext, Memento } from "vscode";
import { IVscodeCommand } from "../Command/IVScodeCommand";
import { FirebaseAuthProvider } from "./FirebaseAuthProvider";

export class AuthenticationService implements Disposable {
    private readonly context: ExtensionContext;

    private readonly extensionPrefix = "firstextension";
    private readonly generateCommentKey = this.extensionPrefix + ".generatecomment";
    private readonly authProvider: FirebaseAuthProvider;

    private readonly sessionScopes: string[] = [
          "https://www.googleapis.com/auth/firebase.database",
          "https://www.googleapis.com/auth/userinfo.email"
        ]

    constructor(context: ExtensionContext, authProvider: FirebaseAuthProvider) {
        this.context = context;
        this.authProvider = authProvider;
    }
   
    async TryAuthenticate(): Promise<AuthenticationSession | undefined> {
        try {
            const sessions = await this.authProvider.getSessions(this.sessionScopes);
            if(sessions.length > 0) {
                return sessions[0];
            }
    
            const session = await this.authProvider.createSession(this.sessionScopes);
            return session;
        }
        catch(e) {
        }
    }

    TryAuthorizeCommand(command: IVscodeCommand): boolean {
        if(command.CommandName == this.generateCommentKey) {
            return true;
        } else {
            return false;
        }
    }

    Logout() {
       
    }

    dispose() {
        this.authProvider.dispose();
    }
}