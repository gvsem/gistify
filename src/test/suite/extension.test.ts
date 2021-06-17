import * as assert from 'assert';
import * as tmp from 'tmp';
import * as path from 'path';
import * as fs from 'fs';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { UtilClasses } from '../../clients/util';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Snippet handles file', async () => {

		tmp.dir((err, dirPath, cleanupCallback) => {
			if (err) {
				throw err;
			}

			const filePath = path.join(dirPath, "code.py");

			fs.writeFile(dirPath, 'print("Hello")', async () => {

				const uri = vscode.Uri.file(filePath);
				const document = await vscode.workspace.openTextDocument(uri);
				const snippet = UtilClasses.snippetFromCurrentFile(document)!;

				assert.strictEqual('python', snippet.getFormat());
				assert.strictEqual('code.py', snippet.getName());
				assert.strictEqual(filePath, snippet.getFilename());
				assert.strictEqual('print("Hello")', snippet.getData());
				assert.ok(snippet.getIsFile());

			});

			cleanupCallback();
		});
	});
});
