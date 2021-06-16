import * as vscode from 'vscode';
import * as path from 'path';
import { UtilClasses } from '../clients/util';
import { Storage } from '../storage/storage';

export class NodeReferencesProvider implements vscode.TreeDataProvider<ReferenceNode> {
  constructor() {}

  getTreeItem(element: ReferenceNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ReferenceNode): Thenable<ReferenceNode[]> {

    return new Promise((accept) => {

        let editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            accept([]);
            return;
        }
        let d = editor.document;

        if (element === undefined) {
            var treeView = Array<ReferenceNode>();
            treeView.push(new ServiceTreeItem(
                'Pastebin',
                'pastebin',
                vscode.TreeItemCollapsibleState.Expanded
            ));
            treeView.push(new ServiceTreeItem(
                'Gists',
                'gists',
                vscode.TreeItemCollapsibleState.Expanded
            ));
            accept(treeView);
        }

        if (element instanceof ServiceTreeItem) {
            accept(element.getReferenceNodes(d));
            return;
        }

        return;


        var treeView = Array<ReferenceNode>();
        
        if (vscode.window.activeTextEditor === undefined) {
            vscode.window.showInformationMessage('No snippets published yet.');
            //accept(treeView);
        }   

        accept(treeView);
        return;
        
        // let d = vscode.window.activeTextEditor.document;

        // if (element) {
        // //   return Promise.resolve(
        // //     this.getDepsInPackageJson(
        // //       path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')
        // //     )
        // //   );
        //     Gistify.References.getGists(d).forEach((value) => {
        //         treeView[0].
        //     });
        // } else {
        // const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
        // if (this.pathExists(packageJsonPath)) {
        //     return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
        // } else {
        //     vscode.window.showInformationMessage('Workspace has no package.json');
        //     return Promise.resolve([]);
        // }
        // }

    });
  }


  private _onDidChangeTreeData: vscode.EventEmitter<ReferenceNode | undefined | null | void> = new vscode.EventEmitter<ReferenceNode | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ReferenceNode | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  
}

class ReferenceNode extends vscode.TreeItem {

};

class ServiceTreeItem extends ReferenceNode {
    constructor(
      public readonly label: string,
      private service: UtilClasses.Services,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
      super(label, collapsibleState);
    }
  
    readonly iconPath = new vscode.ThemeIcon('folder');

    public getReferenceNodes(document : vscode.TextDocument) : Array<ReferenceTreeItem> {
        var r = Array<ReferenceTreeItem>();
        new Storage(this.service).getReferences(document).forEach((value, index) => {
            var l = value.getReferenceTreeItem();
            if (l !== null) {
                r.push(l);
            }
        });
        return r;
    }
  
}

export class ReferenceTreeItem extends ReferenceNode {
  constructor(
    private name: string,
    private date: string,
    private link: string
  ) {
    super(name, vscode.TreeItemCollapsibleState.None);
    this.name = name;
    this.date = date;
    this.link = link;

    this.description = date;
    this.tooltip = `${this.name}\n${this.description}`;
  }

  readonly contextValue = "ReferenceTreeItem";
  readonly iconPath = new vscode.ThemeIcon('file-text');

  public getLink(): string {
    return this.link;
  }

}