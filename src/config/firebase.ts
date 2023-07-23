import { FirebaseApp, initializeApp } from "firebase/app";
import { Analytics } from "firebase/analytics";
import { AppCheck } from "firebase/app-check";
import dotenv from "dotenv";
import path from "path";

export default class ExtensionConfiguration {

    private readonly firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
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
        dotenv.config({path: path.resolve(__dirname, "../..", ".env")});
        this.firebaseApp = initializeApp(this.firebaseConfig);       
    }
}