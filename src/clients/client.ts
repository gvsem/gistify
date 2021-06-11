import * as vscode from 'vscode';
import { Pastebin } from './pastebin';

export module Client {

    export function getAnonymousPastebinClient() : Pastebin.Client {
        let configuration = vscode.workspace.getConfiguration("gistify.pastebin")
        let apiToken = configuration.get("apiToken", null)
        if ((apiToken == null) || (apiToken == "")) {
            throw new Error("You need to speify apiToken in Gistify settings.")
        }
        return new Pastebin.Client(apiToken, null)
    }

    export function getUserPastebinClient() : Promise<Pastebin.Client> {
        let configuration = vscode.workspace.getConfiguration("gistify.pastebin")
        let apiToken = configuration.get("apiToken", null)
        if ((apiToken == null) || (apiToken == "")) {
            throw new Error("You need to speify apiToken in Gistify settings.")
        }
        var userToken = configuration.get("userToken", null)
        if ((userToken == null) || (userToken == "")) {
            var login = "";
            var password = "";
            return new Promise((resolve, reject) => {
                vscode.window.showInputBox({
                    placeHolder: "Enter Pastebin login",
                    value: configuration.get("defaultUserName", "")
                }).then((loginT: string) => {
                    login = loginT
                    return configuration.update("defaultUserName", login, true)
                }).then(() => {
                    return vscode.window.showInputBox({
                        placeHolder: "Enter Pastebin password",
                        password: true
                    })
                }).then((passwordT: string) => {
                    password = passwordT
                }).then(() => Pastebin.Client.retrieveUserToken(apiToken, login, password).then((newUserToken : string) => {
                    configuration.update("userToken", newUserToken, true)
                    resolve(new Pastebin.Client(apiToken, newUserToken))
                }).catch((e) => {
                    reject(e)
                }))
            })
        }

        return new Promise((resolve, reject) => {
            resolve(new Pastebin.Client(apiToken, userToken))
        })

    }

}


/*
EXAMPLE USAGE

import { UtilClasses } from './clients/util';
import { Client } from './clients/client';
import { Pastebin } from './clients/pastebin';

Client.getUserPastebinClient().then((client) => {
    client.upload(UtilClasses.snippetFromCurrentSelection(), Pastebin.Privacy.public, Pastebin.ExpireDate.oneDay).then((reference) => {
        vscode.window.showInformationMessage(reference.getLink());
    })
}).catch((e) => {
    vscode.window.showErrorMessage(e.toString())
})

*/