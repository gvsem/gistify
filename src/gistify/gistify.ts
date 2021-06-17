import * as vscode from 'vscode';
import { Client } from '../clients/client';
import { Gists } from '../clients/gists';
import { Pastebin } from '../clients/pastebin';
import { UtilClasses } from "../clients/util";
import { Storage } from "../storage/storage";

let opn = require('opn');

export module Gistify {


    export class FileInfo {



    };

    export class References {

        public static getPastebin(document : vscode.TextDocument) : Array<UtilClasses.Reference> {
            var r = Array<UtilClasses.Reference>();
            new Storage('pastebin').getReferences(document).forEach((value, index, array) => {
                r.push(value);
            });
            return r;
        }

        public static getGists(document : vscode.TextDocument) : Array<UtilClasses.Reference> {
            var r = Array<UtilClasses.Reference>();
            new Storage('gists').getReferences(document).forEach((value, index, array) => {
                r.push(value);
            });
            return r;
        }

    }

    export class Publish {

        public static toPastebin(document: vscode.TextDocument, preferSelection: boolean, anonymously : boolean, privacy : Pastebin.Privacy, expire : Pastebin.ExpireDate) {
            
            new Promise((undefined, reject) => {

                let snippet : UtilClasses.Snippet | null;
                if (preferSelection) {
                    snippet = UtilClasses.snippetFromCurrentSelection(document);
                } else {
                    snippet = UtilClasses.snippetFromCurrentFile(document);
                }

                if (snippet === null) {
                    throw new Error("Snippet could not be created.");
                }

                var clientPromise: Promise<Pastebin.Client>;
                if (anonymously) {
                    clientPromise = Promise.resolve(Client.getAnonymousPastebinClient());
                } else {
                    clientPromise = Client.getUserPastebinClient();
                }

                clientPromise.then((client : Pastebin.Client) => {

                    if (anonymously && privacy === Pastebin.Privacy.private) {
                        privacy = Pastebin.Privacy.public;
                    }

                    client.upload(snippet!, privacy, expire).then((reference : Pastebin.Reference) => {
                        vscode.window.showInformationMessage("File/selection has been published at " + reference.getLink(), ...["Open link..."]).then((value : string | undefined) => {
                            if (value === "Open link...") {
                                opn(reference.getLink());
                            }
                        });
                        if (snippet!.getIsFile() && !document.isUntitled && !preferSelection) {
                            new Storage('pastebin').addReference(document, reference);
                        } else {
                            vscode.window.showWarningMessage("Publihed snippet is not tracked.\nUnknown, unworkspaced files and selections can not be tracked.", "OK");
                        }
                    }).catch((e : Error) => {
                        vscode.window.showErrorMessage(e.toString());
                    });

                }).catch((e : Error) => {
                    vscode.window.showErrorMessage(e.toString());
                });

            }).catch((e : Error) => {
                vscode.window.showErrorMessage(e.toString());
            });

        }


        public static toGists(document: vscode.TextDocument, preferSelection: boolean, privacy : Gists.Privacy, description : string) {
            
            new Promise((undefined, reject) => {

                let snippet : UtilClasses.Snippet | null;
                if (preferSelection) {
                    snippet = UtilClasses.snippetFromCurrentSelection(document);
                } else {
                    snippet = UtilClasses.snippetFromCurrentFile(document);
                }

                if (snippet === null) {
                    throw new Error("Snippet could not be created.");
                }

                Client.getGistsClient().then((client : Gists.Client) => {

                    client.upload(snippet!, privacy, description).then((reference : Gists.Reference) => {
                        vscode.window.showInformationMessage("File/selection has been published at " + reference.getLink(), ...["Open link..."]).then((value : string | undefined) => {
                            if (value === "Open link...") {
                                opn(reference.getLink());
                            }
                        });
                        if (snippet!.getIsFile() && !document.isUntitled && !preferSelection) {
                            new Storage('gists').addReference(document, reference);
                        } else {
                            vscode.window.showWarningMessage("Publihed snippet is not tracked.\nUnknown, unworkspaced files and selections can not be tracked.", "OK");
                        }
                    }).catch((e : Error) => {
                        vscode.window.showErrorMessage(e.toString());
                    });

                }).catch((e : Error) => {
                    vscode.window.showErrorMessage(e.toString());
                });

            }).catch((e : Error) => {
                vscode.window.showErrorMessage(e.toString());
            });

        }


    }



    interface IterableQuickPick extends vscode.QuickPickItem {
        i: number
    }
    
    export function selectService() : Thenable<number> {
        let services : Array<IterableQuickPick> = [
            {
                label: "Pastebin (anonymous)",
                description: "",
                i: 0
            }, {
                label: "Pastebin",
                description: "",
                i: 1
            }, {
                label: "Gists",
                description: "",
                i: 2
            }
        ];
        return new Promise<number>((accept, reject) => {
            vscode.window.showQuickPick(services, {title: "Select service to publish:"}).then((selection: IterableQuickPick | undefined) => {
                if (selection !== undefined) {
                    accept(selection.i);
                } else{
                    reject(-1);
                }
            });
        });
    }
    
    export function selectSource() : Thenable<boolean> {
        let fileOrSelection : Array<IterableQuickPick> = [
            {
                label: "Publish whole file",
                description: "Publish current opened file", // + UtilClasses.snippetFromCurrentFile(d)?.getName(),
                i: 0
            }, {
                label: "Publish selection",
                description: "Snippet from current document selection",
                i: 1
            }
        ];
        return new Promise<boolean>((accept, reject) => {
            var selectionPromise = vscode.window.showQuickPick(fileOrSelection, {title: "Select snippet source:"});
            if (UtilClasses.isSelectionEmpty()) {
                selectionPromise = Promise.resolve(fileOrSelection[0]);
            }
            selectionPromise.then((selection: IterableQuickPick | undefined) => {
                if (selection !== undefined) {
                    accept(selection.i === 0);
                } else {
                    reject(true);
                }
            });
        });
    }
    
    export function publishPastebin(d : vscode.TextDocument, wholeFile : boolean, anonymous : boolean) : Thenable<void> {
           
        if (d.getText() === "") {
            vscode.window.showErrorMessage('Empty document.');
            return Promise.resolve();
        }

        let pasteBinPrivacy : Array<IterableQuickPick> = [
            {
                label: "Public",
                description: "",
                i: 0
            }, {
                label: "Unlisted",
                description: "",
                i: 1
            }
        ];
    
        let pasteBinExpire : Array<vscode.QuickPickItem> = [
            { label: "N",description: "Will be kept forever."},
            { label: "10M",description: "10 minutes"},
            { label: "1H",description: "1 hour"},
            { label: "1D",description: "1 day"},
            { label: "1W",description: "1 week"},
            { label: "2W",description: "2 weeks"},
            { label: "1M",description: "1 month"},
            { label: "6M",description: "6 months"},
            { label: "1Y",description: "1 year"},
        ];
    
        var privacy = -1;
    
        if (!anonymous) {
            pasteBinPrivacy.push({
                label: "Private",
                description: "For user " + vscode.workspace.getConfiguration("gistify.pastebin").get('defaultUserName'),
                i: 2
            });
        }
    
        return vscode.window.showQuickPick(pasteBinPrivacy, {title: "Specify Pastebin privacy:"}).then((selection: IterableQuickPick | undefined) => {
            if (selection !== undefined) {
                privacy = selection.i;
            } else {
                return Promise.resolve();
            }
        }).then(() => {
            if (privacy === -1) {
                return Promise.resolve();
            }
            vscode.window.showQuickPick(pasteBinExpire, {title: "Specify Pastebin expire date:"}).then((selection: vscode.QuickPickItem | undefined) => {
                if (selection !== undefined) {
                    var exp = selection.label as Pastebin.ExpireDate;
                    Gistify.Publish.toPastebin(d!, !wholeFile, anonymous, privacy, exp);
                }
            });
        });
    
    }
    
    
    export function publishGists(d : vscode.TextDocument, wholeFile : boolean) : Thenable<void> {
    
        if (d.getText() === "") {
            vscode.window.showErrorMessage('Empty document.');
            return Promise.resolve();
        }

        let gistsPrivacy : Array<IterableQuickPick> = [
            {
                label: "Public",
                description: "",
                i: 0
            }, {
                label: "Private",
                description: "",
                i: 1
            }
        ];
    
        var privacy = -1;
    
        return vscode.window.showQuickPick(gistsPrivacy, {title: "Specify Gists privacy:"}).then((selection: IterableQuickPick | undefined) => {
            if (selection !== undefined) {
                privacy = selection.i;
            } else {
                return Promise.resolve();
            }
        }).then(() => {
            if (privacy === -1) {
                return Promise.resolve();
            }
            vscode.window.showInputBox({title: "Optionally: specify description for this gist."}).then((description: string | undefined) => {
                if (description !== undefined) {
                    Gistify.Publish.toGists(d!, !wholeFile, (privacy === 0 ? Gists.Privacy.public : Gists.Privacy.private), description!);
                }
            });
        });
    
    }
    



}