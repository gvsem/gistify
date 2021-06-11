// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { UtilClasses } from './clients/util';
import { Client } from './clients/client';
import { Pastebin } from './clients/pastebin';
import { Gists } from './clients/gists';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "gistify" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('gistify.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		
		vscode.window.showInformationMessage('Hello World from Gistify!');

		//let snippet = UtilClasses.snippetFromCurrentSelection()
		//snippet.print()

		//var client = Client.getAnonymousPastebinClient()
		// Client.getUserPastebinClient().then((client) => {
		// 	client.upload(UtilClasses.snippetFromCurrentSelection(), Pastebin.Privacy.public, Pastebin.ExpireDate.oneDay).then((reference) => {
		// 		vscode.window.showInformationMessage(reference.getLink());
		// 	})
		// }).catch((e) => {
		// 	vscode.window.showErrorMessage(e.toString())
		// })

		// Client.getGistsClient().then((client) => {
		// 	client.upload(UtilClasses.snippetFromCurrentSelection(), Gists.Privacy.public, "test gist").then((reference) => {
		// 		vscode.window.showInformationMessage(reference.getLink());
		// 	}).catch((e) => {
		// 		vscode.window.showErrorMessage(e.toString());
		// 	});
		// }).catch((e) => {
		// 	vscode.window.showErrorMessage(e.toString());
		// });

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
