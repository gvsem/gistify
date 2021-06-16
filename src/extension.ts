// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { UtilClasses } from './clients/util';
import { Client } from './clients/client';
import { Pastebin } from './clients/pastebin';
import { Gists } from './clients/gists';
import { Storage } from './storage/storage';
import { Gistify } from './gistify/gistify';
import { NodeReferencesProvider, ReferenceTreeItem } from './gistify/referencesView';
import { getVSCodeDownloadUrl } from 'vscode-test/out/util';
let opn = require('opn');



// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	// vscode.window.createTreeView('nodeReferences', {
	// 	treeDataProvider: new NodeReferencesProvider()
	// });

	const nodeDependenciesProvider = new NodeReferencesProvider();
	vscode.window.registerTreeDataProvider('nodeReferences', nodeDependenciesProvider);

	let refreshReferenceTable = () => nodeDependenciesProvider.refresh();

	vscode.commands.registerCommand('gistify.service.refreshReferenceTable', refreshReferenceTable);

	vscode.window.onDidChangeActiveTextEditor(() => {
		vscode.commands.executeCommand('gistify.service.refreshReferenceTable');
	});

	setInterval(refreshReferenceTable, 60 * 1000);
	
	// vscode.workspace.onDidSaveTextDocument((e: vscode.TextDocument) => {
	// 	new Storage('pastebin').notifySaved(e);
	// });

	//vscode.window.t

	//vscode.window.work
	  
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json


	let publishPastebinAnonymousCommand = vscode.commands.registerCommand('gistify.publish.pastebin.anonymous', () => {

		try {
			
			let d = vscode.window.activeTextEditor?.document;
			if ((d === undefined) || (d.getText() === '')) {
				throw new Error("No current document.");
			}

			Gistify.selectSource().then((fromFile: boolean) => {
				Gistify.publishPastebin(d!, fromFile, true).then(() => {

				});
			});
		} catch (e : any) {
			vscode.window.showErrorMessage(e.toString());
		}

	});

	let publishPastebinCommand = vscode.commands.registerCommand('gistify.publish.pastebin', () => {

		try {
			
			let d = vscode.window.activeTextEditor?.document;
			if ((d === undefined) || (d.getText() === '')) {
				throw new Error("No current document.");
			}

			Gistify.selectSource().then((fromFile: boolean) => {
				Gistify.publishPastebin(d!, fromFile, false).then(() => {

				});
			});
		} catch (e : any) {
			vscode.window.showErrorMessage(e.toString());
		}

	});

	let publishGistsCommand = vscode.commands.registerCommand('gistify.publish.gists', () => {

		try {
			
			let d = vscode.window.activeTextEditor?.document;
			if ((d === undefined) || (d.getText() === '')) {
				throw new Error("No current document.");
			}

			Gistify.selectSource().then((fromFile: boolean) => {
					Gistify.publishGists(d!, fromFile).then(() => {

					});
			});

		} catch (e : any) {
			vscode.window.showErrorMessage(e.toString());
		}

	});

	context.subscriptions.push(publishGistsCommand, publishPastebinCommand, publishPastebinAnonymousCommand);

	let publishCommand = vscode.commands.registerCommand('gistify.publish', () => {

		try {
			
			let d = vscode.window.activeTextEditor?.document;
			if ((d === undefined) || (d.getText() === '')) {
				throw new Error("No current document.");
			}

			Gistify.selectSource().then((fromFile: boolean) => {

				Gistify.selectService().then((i : number) => {

					if ((i === 0) || (i === 1)) {
						Gistify.publishPastebin(d!, fromFile, i === 0).then(() => {

						});
					}

					if (i === 2) {
						Gistify.publishGists(d!, fromFile).then(() => {

						});
					}

				});
			});
		} catch (e : any) {
			vscode.window.showErrorMessage(e.toString());
		}


	});


	let publishSelectionCommand = vscode.commands.registerCommand('gistify.publishSelection', () => {

		try {
			
			let d = vscode.window.activeTextEditor?.document;
			if ((d === undefined) || (d.getText() === '')) {
				throw new Error("No current document.");
			}

			let fromFile: boolean = false;

			Gistify.selectService().then((i : number) => {

				if ((i === 0) || (i === 1)) {
					Gistify.publishPastebin(d!, fromFile, i === 0).then(() => {

					});
				}

				if (i === 2) {
					Gistify.publishGists(d!, fromFile).then(() => {

					});
				}

			});

		} catch (e : any) {
			vscode.window.showErrorMessage(e.toString());
		}

	});


	context.subscriptions.push(publishCommand, publishSelectionCommand);

	let openReferenceTreeItemCommand = vscode.commands.registerCommand(
		'gistify.service.openReferenceTreeItem',
		(item: ReferenceTreeItem) => opn(item.getLink())
	);

	context.subscriptions.push(openReferenceTreeItemCommand);

	let copyReferenceTreeItemLink = vscode.commands.registerCommand(
		'gistify.service.copyReferenceTreeItemLink',
		(item: ReferenceTreeItem) => {
			vscode.env.clipboard.writeText(item.getLink());
			vscode.window.showInformationMessage("Link copied to clipboard.");
		}
	);

	context.subscriptions.push(copyReferenceTreeItemLink);

}

// this method is called when your extension is deactivated
export function deactivate() {}

