import * as vscode from 'vscode';
import { UtilClasses } from '../clients/util';
import { Storage } from '../storage/storage';
import { Pastebin } from '../clients/pastebin';
import { Gists } from '../clients/gists';
import moment = require('moment');
import { Linkable } from '../util';

export class NodeReferencesProvider implements vscode.TreeDataProvider<ReferenceNode> {
  constructor() { }

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
        let treeView = Array<ServiceTreeItem>();
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
        if ((treeView[0].getReferenceNodes(d).length === 0) && (treeView[1].getReferenceNodes(d).length === 0)) {
          accept([]);
          return;
        }
        accept(treeView);
      }

      if (element instanceof ServiceTreeItem) {
        accept(element.getReferenceNodes(d));
        return;
      }

      return;

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

  public getReferenceNodes(document: vscode.TextDocument): Array<ReferenceTreeItem> {
    let r = Array<ReferenceTreeItem>();
    if (document.isUntitled) {
      return r;
    }
    new Storage(this.service).getReferences(document).forEach((value, index) => {
      var l = value.getReferenceTreeItem();
      if (l !== null) {
        r.push(l);
      }
    });
    return r;
  }

}

export class ReferenceTreeItem extends ReferenceNode implements Linkable {
  constructor(
    private name: string,
    private date: Date,
    private link: string
  ) {
    super(name, vscode.TreeItemCollapsibleState.None);
    this.name = name;
    this.date = date;
    this.link = link;

    this.description = moment(date).fromNow();
    this.tooltip = `${this.name}\n${date.toJSON()}`;
  }

  readonly contextValue = "ReferenceTreeItem";
  readonly iconPath = new vscode.ThemeIcon('file-text');

  public getLink(): string {
    return this.link;
  }

}

export class PastebinReferenceTreeItem extends ReferenceTreeItem {
  constructor(
    name: string,
    date: Date,
    link: string,
    private privacy: Pastebin.Privacy,
    private expire: Pastebin.ExpireDate
  ) {
    super(name, date, link);
    this.privacy = privacy;
    this.expire = expire;

    let privacyLine = '';

    if (this.privacy === 0) {
      privacyLine = 'Privacy: public';
    } else if (this.privacy === 1) {
      privacyLine = 'Privacy: unlisted';
    } else if (this.privacy === 2) {
      privacyLine = 'Privacy: private';
    }

    this.tooltip += '\n\n';
    this.tooltip += privacyLine + '\n';
    this.tooltip += 'Expiry time: ' + this.expire + '\n';

  }

  readonly contextValue = "ReferenceTreeItem";
  readonly iconPath = new vscode.ThemeIcon('file-text');

}

export class GistsReferenceTreeItem extends ReferenceTreeItem {
  constructor(
    name: string,
    date: Date,
    link: string,
    private privacy: Gists.Privacy,
    private descriptionSnippet: string
  ) {
    super(name, date, link);
    this.privacy = privacy;
    this.descriptionSnippet = descriptionSnippet;

    this.tooltip += '\n\n';
    this.tooltip += 'Privacy: ' + (this.privacy === Gists.Privacy.public ? "public" : "private") + '\n';
    this.tooltip += 'Description: ' + this.descriptionSnippet + '\n';

  }

  readonly contextValue = "ReferenceTreeItem";
  readonly iconPath = new vscode.ThemeIcon('file-text');

}