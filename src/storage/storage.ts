import * as vscode from 'vscode';
import { Pastebin } from '../clients/pastebin';
import { Gists } from '../clients/gists';
import { UtilClasses } from '../clients/util';


export class Storage {

    // private static instance: Storage;

    // private constructor() {
       
    // }

    // public static getWorkspaceStorage() : Storage {
    //     if (!Storage.instance) {
    //         Storage.instance = new Storage();
    //     }
    //     return Storage.instance;
    // }

    private service: string;

    public constructor(service : UtilClasses.Services) {
        this.service = service;
    }

    public addReference(document : vscode.TextDocument, reference : UtilClasses.Reference) {
        var s = this.getStorage();
        if (s[document.uri.path] === undefined) {
            s[document.uri.path] = JSON.parse("{}");
        }
        if (s[document.uri.path][this.service] === undefined) {
            s[document.uri.path][this.service] = JSON.parse("[]");
        }
        var ref = reference.toJSONObject();
        s[document.uri.path][this.service].push(ref);// = JSON.stringify(reference);
        this.updateStorage(s);
    }

    public getReferences(document : vscode.TextDocument) : Array<UtilClasses.Reference> {
        var s = this.getStorage();
        if (s[document.uri.path] === undefined) {
            return Array<UtilClasses.Reference>();
        }
        if (s[document.uri.path][this.service] === undefined) {
            return Array<UtilClasses.Reference>();
        }
        var r = Array<UtilClasses.Reference>();
        s[document.uri.path][this.service].forEach((k : any) => {
            var m : UtilClasses.Reference | null = null;
            if (this.service === 'pastebin') {
                m = Pastebin.Reference.fromJSONObject(k);
            } 
            if (this.service === 'gists') {
                m = Gists.Reference.fromJSONObject(k);
            }
            if (m !== null) {
                r.push(m);
            }
        });
        return r;
    }

    public deleteAllReferences(document : vscode.TextDocument) {
        var s = this.getStorage();
        if (s[document.uri.path] === undefined) {
            s[document.uri.path] = JSON.parse("{}");
        }
        if (s[document.uri.path][this.service] === undefined) {
            s[document.uri.path][this.service] = JSON.parse("[]");
        }
        this.updateStorage(s);
    }

    private getStorage() : any {
        var s: string = this.getConfiguration().get("storage")!;
        return JSON.parse(s);
    }

    private updateStorage(value : any) {
        var s = JSON.stringify(value);
        this.getConfiguration().update("storage", s, vscode.ConfigurationTarget.Workspace).then(() => {
            vscode.commands.executeCommand('gistify.service.refreshReferenceTable');
        }, (e) => {
            throw new Error("Could not update configuration for Workspace.");
        });
    }

    private getConfiguration() : vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration('gistify');
    }

}