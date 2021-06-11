import * as vscode from 'vscode';

export module UtilClasses {

    export class Snippet {

        protected name: string
        protected format: string

        protected data: string

        protected isFile: boolean
        protected filename: string

        constructor(name: string, format: string, data: string) {
            this.name = name
            this.format = format
            this.data = data
            this.isFile = false
            this.filename = ""
        }

        public initAsFile(filename: string) {
            this.isFile = true
            this.filename = filename
        }

        public print() {
            console.log("Snippet name: " + this.name)
            console.log("Code format: " + this.format)
            console.log("Data length: " + this.data.length)
            console.log("Is related to file: " + this.isFile)
            if (this.isFile) {
                console.log("Related filename: " + this.filename)
            }

        }

        public getName() : string {
            return this.name
        }

        public getFormat() : string {
            return this.format
        }

        public getData() : string {
            return this.data
        }

        public getIsFile() : boolean {
            return this.isFile
        }

        public getFilename() : string | null {
            if (this.isFile) {
                return this.filename
            }
            return null
        }

    }

    export function snippetFromCurrentFile() : UtilClasses.Snippet {

        let filename = vscode.window.activeTextEditor.document.uri.path
        let name = filename.split('\\').pop().split('/').pop()
        let format = vscode.window.activeTextEditor.document.languageId
        let data = vscode.window.activeTextEditor.document.getText()

        let snippet = new UtilClasses.Snippet(name, format, data)
        snippet.initAsFile(filename)
        return snippet

    }

    export function snippetFromCurrentSelection() : UtilClasses.Snippet {

        let selection: vscode.Selection = vscode.window.activeTextEditor.selection
        if (selection.isEmpty) {
            return snippetFromCurrentFile()
        }

        let filename = vscode.window.activeTextEditor.document.uri.path
        let name = filename.split('\\').pop().split('/').pop()
        let format = vscode.window.activeTextEditor.document.languageId

        let range = new vscode.Range(selection.start, selection.end)
        let data = vscode.window.activeTextEditor.document.getText(range)

        return new UtilClasses.Snippet(name, format, data)

    }

}

/*
EXAMPLE USAGE

import { UtilClasses } from './clients/util';

let snippet = UtilClasses.snippetFromCurrentSelection()
snippet.print()

*/