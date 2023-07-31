import {
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSession,
  Disposable,
  Event,
  EventEmitter,
  ExtensionContext,
  Uri,
  authentication,
  env,
  window,
} from "vscode";
import {
  GoogleAuthProvider,
  OAuthCredential,
  getAuth,
  signInWithCredential,
} from "firebase/auth";
import { google } from "googleapis";
import * as vscode from "vscode";
import ExtensionConfiguration from "../../config/firebase";
import { OAuth2Client } from "googleapis-common";
import { uuid } from "uuidv4";
import { SubscriptionPlanTier } from "./SubscriptionPlanTier";
import { create } from "domain";
import { access } from "fs";

export class FirebaseAuthProvider
  implements AuthenticationProvider, Disposable
{
  private sessions: AuthenticationSession[] = [];
  private readonly disposable: Disposable;
  private readonly authProvider: GoogleAuthProvider = new GoogleAuthProvider();
  oauth2Client: OAuth2Client;

  constructor(
    private readonly context: ExtensionContext,
    private readonly extensionConfiguration: ExtensionConfiguration
  ) {
    this.disposable = Disposable.from(
      authentication.registerAuthenticationProvider(
        `firebase`,
        `firebase_authprovider`,
        this,
        { supportsMultipleAccounts: false }
      )
    );
    this.ClearCacheCredentials();
    this.oauth2Client = new google.auth.OAuth2(
      "572669494840-uemo4hei0sqv8utjddf8knjrgc6gd2h1.apps.googleusercontent.com",
      "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",
      "http://localhost:8000/auth/complete"
    );
  }

  dispose() {
    this.disposable.dispose();
  }

  get onDidChangeSessions(): Event<AuthenticationProviderAuthenticationSessionsChangeEvent> {
    return new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>()
      .event;
  }

  getSessions(
    scopes?: readonly string[] | undefined
  ): Thenable<readonly AuthenticationSession[]> {
    const returnSessions: AuthenticationSession[] = [];
    return new Promise((resolve) => {
      if (!scopes || scopes.length == 0) {
        return resolve(this.sessions);
      }

      for (let i = 0; i < this.sessions.length; i++) {
        let invalid = false;
        for (let j = 0; j < scopes.length; j++) {
          if (
            this.sessions[i].scopes.indexOf(this.sessions[i].scopes[j]) == -1
          ) {
            invalid = true;
            break;
          }
        }

        if (!invalid) {
          returnSessions.push(this.sessions[i]);
        }
      }

      return resolve(returnSessions);
    });
  }

  async LaunchSession(scopes: string[]) {
    const url = this.oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: "offline",

      // If you only need one scope you can pass it as a string
      scope: scopes,
    });

    env.openExternal(await env.asExternalUri(Uri.parse(url)));
  }

  CreateSessionWithAccessToken(
    scopes: readonly string[],
    accessToken: string
  ): Thenable<AuthenticationSession> {
    try {
      return new Promise(async (resolve, reject) => {
        const sortedScopes = [...scopes].sort();

        let credential = await this.TryAuthenticateSession(accessToken);

        if (!credential) {
          credential = await this.TryRefreshAuthenticatedSession(
            sortedScopes,
            this.context.globalState.get("firstextension.refresh_token")
          );
        }

        if (credential) {
          const user = await signInWithCredential(getAuth(), credential);

          if (user) {
            const token = await user.user.getIdTokenResult();

            sortedScopes.push(token.claims.stripeRole);
            sortedScopes.push(SubscriptionPlanTier.Free);

            const session = {
              accessToken: await user.user.getIdToken(),
              account: {
                id: user.user.uid,
                label: user.user.email || "",
              },
              id: uuid(),
              scopes: sortedScopes,
            };

            this.sessions.push(session);
            resolve(session);
          }
        }
      });
    } catch (e) {
      this.ClearCacheCredentials();
      throw e;
    }
  }

  createSession(scopes: readonly string[]): Thenable<AuthenticationSession> {
    const accessToken: string | undefined = this.context.globalState.get(
      "firstextension.access_token"
    );

    if (!accessToken) {
      throw new Error("Access token is invalid");
    }

    return this.CreateSessionWithAccessToken(scopes, accessToken);
  }

  async requestPersonalAccessToken(): Promise<string | undefined> {
    const result = await vscode.window.showInputBox({
      password: true,
      prompt: "Please enter your access token.",
      ignoreFocusOut: true,
    });
    return result;
  }

  removeSession(sessionId: string): Thenable<void> {
    return new Promise((resolve) => {
      this.sessions = this.sessions.filter(
        (session) => session.id !== sessionId
      );
      resolve();
    });
  }

  private async TryAuthenticateSession(
    accessToken: string
  ): Promise<OAuthCredential | undefined> {
    const { tokens } = await this.oauth2Client.getToken(
      decodeURIComponent(accessToken || "")
    );
    this.CacheCredentials(
      tokens.id_token ?? undefined,
      tokens.access_token ?? undefined,
      tokens.refresh_token ?? undefined
    );

    return GoogleAuthProvider.credential(tokens.id_token, tokens.access_token);
  }

  private async TryRefreshAuthenticatedSession(
    sortedScopes: string[],
    refreshToken?: string
  ) {
    if (!refreshToken) {
      return;
    }

    const { tokens } = await this.oauth2Client.getToken(refreshToken);
    this.CacheCredentials(
      tokens.id_token ?? undefined,
      tokens.access_token ?? undefined,
      tokens.refresh_token ?? undefined
    );

    return GoogleAuthProvider.credential(tokens.id_token, tokens.access_token);
  }

  private CacheCredentials(
    id_token?: string,
    access_token?: string,
    refresh_token?: string
  ): void {
    this.context.globalState.update("firstextension.id_token", id_token);
    this.context.globalState.update(
      "firstextension.access_credential",
      access_token
    );
    this.context.globalState.update(
      "firstextension.refresh_token",
      refresh_token
    );
  }

  private ClearCacheCredentials() {
    this.context.globalState.update("firstextension.id_token", null);
    this.context.globalState.update("firstextension.access_credential", null);
    this.context.globalState.update("firstextension.refresh_token", null);
  }
}
