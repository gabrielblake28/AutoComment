import {
  AuthenticationSession,
  Disposable,
  ExtensionContext,
  Memento,
  window,
} from "vscode";
import { IVscodeCommand } from "../Command/IVScodeCommand";
import { FirebaseAuthProvider } from "./FirebaseAuthProvider";
import { SubscriptionPlanTier } from "./SubscriptionPlanTier";

export class AuthenticationService implements Disposable {
  private readonly context: ExtensionContext;

  private readonly extensionPrefix = "firstextension";
  private readonly generateCommentKey =
    this.extensionPrefix + ".generatecomment";
  private readonly authProvider: FirebaseAuthProvider;

  private readonly sessionScopes: string[] = [
    "https://www.googleapis.com/auth/firebase",
    "https://www.googleapis.com/auth/firebase.database",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  constructor(context: ExtensionContext, authProvider: FirebaseAuthProvider) {
    this.context = context;
    this.authProvider = authProvider;
  }

  async GetAuthenticatedSession(): Promise<AuthenticationSession | undefined> {
    try {
      const sessions = await this.authProvider.getSessions(this.sessionScopes);
      if (sessions.length > 0) {
        return sessions[0];
      }

      await this.authProvider.LaunchSession(this.sessionScopes);

      return undefined;
    } catch (e) {}
  }

  async TryAuthenticateSession(accessToken: string) {
    return await this.authProvider.CreateSessionWithAccessToken(
      this.sessionScopes,
      accessToken
    );
  }

  TryAuthorizeCommand(
    scopes: string[],
    subscriptionPlan: SubscriptionPlanTier
  ): boolean {
    if (scopes.indexOf(subscriptionPlan) !== -1) {
      return true;
    } else {
      return false;
    }
  }

  Logout() {}

  dispose() {
    this.authProvider.dispose();
  }
}
