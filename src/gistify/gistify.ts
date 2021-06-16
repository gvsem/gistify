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
                        if (snippet!.getIsFile() && !document.isUntitled) {
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
                        if (snippet!.getIsFile() && !document.isUntitled) {
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







}