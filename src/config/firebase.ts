import { FirebaseApp, initializeApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import { AppCheck, initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import dotenv from "dotenv";

export default class ExtensionConfiguration {

    private readonly firebaseConfig = {
        apiKey: "AIzaSyDuao76w3soGQkdCk7rdM28zOdT00eFWyA",
        authDomain: "https://codesenseai.com",
        projectId: "codesense-ai",
        storageBucket: "codesense-ai.appspot.com",
        messagingSenderId: "572669494840",
        appId: "1:572669494840:web:eed950d2ec862485e388cd",
        measurementId: "G-2327G1ENX5"
    }

    public get App() {
        return this.firebaseApp;
    }

    private firebaseApp: FirebaseApp | undefined;
    private firebaseAnalytics: Analytics | undefined;
    private firebaseAppCheck: AppCheck | undefined;

    Initialize(): void {
        dotenv.config();
        this.firebaseApp = initializeApp(this.firebaseConfig);
        // this.firebaseAnalytics = getAnalytics(this.firebaseApp);
        // this.firebaseAppCheck = initializeAppCheck(this.firebaseApp, {
        //     provider: new ReCaptchaV3Provider('abcdefghijklmnopqrstuvwxy-1234567890abcd'),
        //     isTokenAutoRefreshEnabled: true
        // });   
            
            
    }
}