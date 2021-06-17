import * as vscode from 'vscode';
import { Pastebin } from '../clients/pastebin';
import { Gists } from '../clients/gists';
import { UtilClasses } from '../clients/util';


export class Storage {

    private service: string;

    public constructor(service : UtilClasses.Services) {
        this.service = service;
    }

    public addReference(document : vscode.TextDocument, reference : UtilClasses.Reference) {
        let s = this.getStorage();

        if (s[document.uri.path] === undefined) {
            s[document.uri.path] = JSON.parse("{}");
        }

        if (s[document.uri.path][this.service] === undefined) {
            s[document.uri.path][this.service] = JSON.parse("[]");
        }

        let ref = reference.toJSONObject();
        s[document.uri.path][this.service].unshift(ref);
        this.updateStorage(s);
    }

    public getReferences(document : vscode.TextDocument) : Array<UtilClasses.Reference> {
        let s = this.getStorage();

        if (s[document.uri.path] === undefined) {
            return Array<UtilClasses.Reference>();
        }

        if (s[document.uri.path][this.service] === undefined) {
            return Array<UtilClasses.Reference>();
        }

        let r = Array<UtilClasses.Reference>();
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
        let s = this.getStorage();

        if (s[document.uri.path] === undefined) {
            s[document.uri.path] = JSON.parse("{}");
        }

        if (s[document.uri.path][this.service] === undefined) {
            s[document.uri.path][this.service] = JSON.parse("[]");
        }

        this.updateStorage(s);
    }

    private getStorage() : any {
        let s: string = this.getConfiguration().get("storage")!;
        return JSON.parse(s);
    }

    private updateStorage(value : any) {
        let s = JSON.stringify(value);
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