import * as vscode from 'vscode';
import {ReferenceTreeItem} from '../gistify/referencesView';
import { Linkable } from '../util';

export module UtilClasses {

    export type Services = 'pastebin' | 'gists';

    export abstract class Reference implements Linkable {

        public toJSONObject() : any {
    
        }
    
        public static fromJSONObject(json : any) : Reference | null {
            return null;
        }

        public getReferenceTreeItem() : ReferenceTreeItem | null {
            return null;
        }

        abstract getLink() : string;
    
    };

    export class Snippet {

        protected name: string;
        protected format: string;

        protected data: string;

        protected isFile: boolean;
        protected filename: string;

        constructor(name: string, format: string, data: string) {
            this.name = name;
            this.format = format;
            this.data = data;
            this.isFile = false;
            this.filename = "";
        }

        public initAsFile(filename: string) {
            this.isFile = true;
            this.filename = filename;
        }

        public print() {
            console.log("Snippet name: " + this.name);
            console.log("Code format: " + this.format);
            console.log("Data length: " + this.data.length);
            console.log("Is related to file: " + this.isFile);
            if (this.isFile) {
                console.log("Related filename: " + this.filename);
            }
        }

        public getName() : string {
            return this.name;
        }

        public getFormat() : string {
            return this.format;
        }

        public getData() : string {
            return this.data;
        }

        public getIsFile() : boolean {
            return this.isFile;
        }

        public getFilename() : string | null {
            if (this.isFile) {
                return this.filename;
            }
            return null;
        }

    }

    export function snippetFromCurrentFile(document: vscode.TextDocument) : UtilClasses.Snippet | null {

        let filename = document.uri.path;
        let name = filename.split('\\').pop()?.split('/').pop();
        let format = document.languageId;
        let data = document.getText();

        let snippet = new UtilClasses.Snippet(name!, format, data);
        snippet.initAsFile(filename);
        return snippet;

    }

    export function snippetFromCurrentSelection(document: vscode.TextDocument) : UtilClasses.Snippet | null {

        if (vscode.window.activeTextEditor === undefined) {
            return null;
        }
        
        let selection: vscode.Selection = vscode.window.activeTextEditor.selection;
        if (selection.isEmpty) {
            return snippetFromCurrentFile(document);
        }

        let filename = document.uri.path;
        let name = filename.split('\\').pop()?.split('/').pop();
        let format = document.languageId;

        let range = new vscode.Range(selection.start, selection.end);
        let data = document.getText(range);

        return new UtilClasses.Snippet(name!, format, data);

    }

    export function isSelectionEmpty() : boolean {
        if (vscode.window.activeTextEditor === undefined) {
            return false;
        }
        
        let selection: vscode.Selection = vscode.window.activeTextEditor.selection;
        return selection.isEmpty;
    }

}


/*
EXAMPLE USAGE

import { UtilClasses } from './clients/util';

let snippet = UtilClasses.snippetFromCurrentSelection()
snippet.print()

*/