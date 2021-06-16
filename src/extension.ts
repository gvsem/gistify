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



interface IterableQuickPick extends vscode.QuickPickItem {
	i: number
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	// vscode.window.createTreeView('nodeReferences', {
	// 	treeDataProvider: new NodeReferencesProvider()
	// });

	const nodeDependenciesProvider = new NodeReferencesProvider();
	vscode.window.registerTreeDataProvider('nodeReferences', nodeDependenciesProvider);

	vscode.commands.registerCommand('gistify.service.refreshReferenceTable', () => {
	  nodeDependenciesProvider.refresh();
	});

	vscode.window.onDidChangeActiveTextEditor(() => {
		vscode.commands.executeCommand('gistify.service.refreshReferenceTable');
	});

	// vscode.workspace.onDidSaveTextDocument((e: vscode.TextDocument) => {
	// 	new Storage('pastebin').notifySaved(e);
	// });

	//vscode.window.t

	//vscode.window.work
	  
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let publishCommand = vscode.commands.registerCommand('gistify.publish', () => {

		try {
			
			let d = vscode.window.activeTextEditor?.document;
			if (d === undefined) {
				throw new Error("No current document.");
			}

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

			let fileOrSelection : Array<IterableQuickPick> = [
                {
                    label: "Publish whole file",
                    description: "Publish " + UtilClasses.snippetFromCurrentFile(d)?.getName(),
                    i: 0
                }, {
                    label: "Publish selection",
                    description: "Snippet from current document selection",
                    i: 1
                }
            ];

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

			var i = -1;
			var publishFile = -1;
			var privacy = -1;
			vscode.window.showQuickPick(services, {title: "Select service to publish service:"}).then((selection: IterableQuickPick | undefined) => {
				if (selection !== undefined) {
					i = selection.i;
				}
			}).then(() => {
				
				var selectionPromise = vscode.window.showQuickPick(fileOrSelection, {title: "Select snippet source:"});
				if (UtilClasses.isSelectionEmpty()) {
					selectionPromise = Promise.resolve(fileOrSelection[0]);
				}
				selectionPromise.then((selection: IterableQuickPick | undefined) => {
					if (selection !== undefined) {
						publishFile = selection.i;
					}
				}).then(() => {
				
					if (i === 1) {
						pasteBinPrivacy.push({
							label: "Private",
							description: "For user " + vscode.workspace.getConfiguration("gistify.pastebin").get('defaultUserName'),
							i: 2
						});
					}
					if ((i === 0) || (i === 1)) {
						vscode.window.showQuickPick(pasteBinPrivacy, {title: "Specify Pastebin privacy:"}).then((selection: IterableQuickPick | undefined) => {
							if (selection !== undefined) {
								privacy = selection.i;
							}
						}).then(() => {
							vscode.window.showQuickPick(pasteBinExpire, {title: "Specify Pastebin expire date:"}).then((selection: vscode.QuickPickItem | undefined) => {
								if (selection !== undefined) {
									var exp = selection.label as Pastebin.ExpireDate;
									Gistify.Publish.toPastebin(d!, publishFile === 1, i === 0, privacy, exp);
								}
							});
						});
					}
					if (i === 2) {
						vscode.window.showQuickPick(gistsPrivacy, {title: "Specify Gists privacy:"}).then((selection: IterableQuickPick | undefined) => {
							if (selection !== undefined) {
								privacy = selection.i;
							}
						}).then(() => {
							vscode.window.showInputBox({title: "Optionally: specify description for this gist."}).then((description: string | undefined) => {
								if (description !== undefined) {
									Gistify.Publish.toGists(d!, publishFile === 1, (privacy === 0 ? Gists.Privacy.public : Gists.Privacy.private), description!);
								}
							});
						});
					}

				});
			});


			//Gistify.Publish.
		} catch (e : any) {
			vscode.window.showErrorMessage(e.toString());
		}



		// var snippet = UtilClasses.snippetFromCurrentSelection();
		// if (snippet === null) {
		// 	return;
		// }
		// var d = vscode.window.activeTextEditor!;

		// Client.getUserPastebinClient().then((client : Pastebin.Client) => {
		// 	client.upload(snippet!, Pastebin.Privacy.public, Pastebin.ExpireDate.oneDay).then((reference : Pastebin.Reference) => {
		// 		vscode.window.showInformationMessage("File/selection has been published at " + reference.getLink(), ...["Open link..."]).then((value : string | undefined) => {
		// 			if (value === "Open link...") {
		// 				opn(reference.getLink());
		// 			}
		// 		});
		// 		if (snippet!.getIsFile() && !d.document.isUntitled) {
		// 			// Promise.resolve(new Storage('pastebin').addReference(d.document, reference)).then(() => {
		// 			// 	vscode.commands.executeCommand('gistify.service.refreshReferenceTable');
		// 			// });
		// 			new Storage('pastebin').addReference(d.document, reference);
		// 			//vscode.commands.executeCommand('gistify.service.refreshReferenceTable');
		// 		} else {
		// 			vscode.window.showWarningMessage("Publihed snippet is not tracked. $(gist) -Unknown files and selections can not be tracked.", "OK").then((value : string | undefined) => {
		// 				if (value === 'OK') {
						
		// 				}
		// 			});
		// 		}
		// 	});
		// }).catch((e : Error) => {
		// 	vscode.window.showErrorMessage(e.toString());
		// });

	});

	context.subscriptions.push(publishCommand);

	let referencesCommand = vscode.commands.registerCommand('gistify.references', () => {


	});

	context.subscriptions.push(referencesCommand);

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









// var s : Storage = new Storage('pastebin');
		// var d = vscode.window.activeTextEditor.document!;
		// console.log(d.uri);
		// console.log(d.fileName);
		// s.addReference(d, new Pastebin.Reference("alalal"));

		// console.log(s.getReferences(d));
		// //s.deleteAllReferences(d);
		// console.log(s.getReferences(d));


		// let snippet = UtilClasses.snippetFromCurrentSelection()
		// snippet.print()

		// var clientPromise = Client.getAnonymousPastebinClient();
		// или
		// var clientPromise = Client.getUserPastebinClient();

		// clientPromise.then((client) => {
		// 	client.upload(
		// 		UtilClasses.snippetFromCurrentSelection(),
		// 		Pastebin.Privacy.public,
		// 		Pastebin.ExpireDate.oneDay,
		// 	)
		// 	.then((reference) => {
		// 		vscode.window.showInformationMessage(reference.getLink());
		// 	})
		// 	.catch((e) => {
		// 		vscode.window.showErrorMessage(e.toString());
		// 	});
		// }).catch((e) => {
		// 	vscode.window.showErrorMessage(e.toString());
		// });

		// Client.getGistsClient().then((client) => {
		// 	client.upload(UtilClasses.snippetFromCurrentSelection(), Gists.Privacy.private, "test gist").then((reference) => {
		// 		vscode.window.showInformationMessage(reference.getLink());
		// 	}).catch((e) => {
		// 		vscode.window.showErrorMessage(e.toString());
		// 	});
		// }).catch((e) => {
		// 	vscode.window.showErrorMessage(e.toString());
		// });
