import * as vscode from 'vscode';
import { Pastebin } from './pastebin';
import { Gists } from './gists';
const gitHub = require('github-api');

export module Client {

    export function getAnonymousPastebinClient(): Promise<Pastebin.Client> {
        let configuration = vscode.workspace.getConfiguration("gistify.pastebin");
        let apiToken = configuration.get("apiToken", null);

        if ((apiToken === null) || (apiToken === "")) {
            throw new Error("Please, set the gistify.pastebin.apiToken setting");
        }

        return new Promise((resolve) => resolve(new Pastebin.Client(apiToken!, null)));
    }

    export function getUserPastebinClient(): Promise<Pastebin.Client> {
        let configuration = vscode.workspace.getConfiguration("gistify.pastebin");
        let apiToken = configuration.get("apiToken", null);

        if ((apiToken === null) || (apiToken === "")) {
            throw new Error("Please, set the gistify.pastebin.apiToken setting");
        }

        let userToken = configuration.get("userToken", null);

        if ((userToken === null) || (userToken === "")) {
            let login = "";
            let password = "";

            return new Promise((resolve, reject) => {
                vscode.window.showInputBox({
                    placeHolder: "Enter Pastebin login",
                    value: configuration.get("defaultUserName", "")

                }).then((loginT: string | undefined) => {

                    if (loginT !== undefined) {
                        login = loginT;
                        return configuration.update("defaultUserName", login, true);
                    }

                }).then(() => {

                    return vscode.window.showInputBox({
                        placeHolder: "Enter Pastebin password",
                        password: true
                    });

                }).then((passwordT: string | undefined) => {

                    if (passwordT !== undefined) {
                        password = passwordT;
                    }

                }).then(() => Pastebin.Client.retrieveUserToken(
                    apiToken!, login, password

                ).then((newUserToken: string) => {

                    configuration.update("userToken", newUserToken, true);
                    resolve(new Pastebin.Client(apiToken!, newUserToken));

                }).catch((e) => {
                    reject(e);
                }));
            });
        }

        return new Promise((resolve) => {
            resolve(new Pastebin.Client(apiToken!, userToken));
        });

    }

    export function getGistsClient(): Promise<Gists.Client> {
        let configuration = vscode.workspace.getConfiguration("gistify.gists");
        var userToken = configuration.get("userToken", null);

        if ((userToken === null) || (userToken === "")) {
            throw new Error("Please, set the gistify.gists.userToken setting");
        }

        return new Promise((resolve, reject) => {

            try {
                let client = new gitHub({
                    token: userToken
                });
                resolve(new Gists.Client(client));
            } catch (e) {
                reject(e);
            }

        });

    }

}