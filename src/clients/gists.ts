import { GistsReferenceTreeItem, ReferenceTreeItem } from '../gistify/referencesView';
import { Pastebin } from './pastebin';
import { UtilClasses } from './util';
var GitHub = require('github-api');

export module Gists {

    export class Reference extends UtilClasses.Reference {

        private name: string;
        private link: string;
        private date: Date;
        private privacy : Gists.Privacy;
        private description : string;

        constructor(name: string, link: string, date: Date, privacy : Gists.Privacy, description : string) {
            super();
            this.name = name;
            this.link = link;
            this.date = date !== undefined ? date : new Date();
            this.privacy = privacy;
            this.description = description;
        }

        public getLink() : string {
            return this.link;
        }

        // public getId() : string {
        //     var s = this.link.split('/').pop();
        //     if (s !== undefined) {
        //         return s;
        //     }
        //     throw new Error("Reference is initialized with wrong link.");
        // }

        public toJSONObject() : any {
            super.toJSONObject();
            var r = JSON.parse('{}');
            r['name'] = this.name;
            r['link'] = this.getLink();
            r['date'] = this.date.toJSON();
            r['privacy'] = this.privacy;
            r['description'] = this.description;
            return r;
        }

        public static fromJSONObject(json : any) : Reference | null {
            super.fromJSONObject(null);
            if ((typeof json === 'object') && (typeof json['link'] === 'string')) {
                return new Gists.Reference(json['name'], json['link'], new Date(json['date']), json['privacy'], json['description']);
            }
            return null;
        }

        public getReferenceTreeItem() : ReferenceTreeItem | null {
            return new ReferenceTreeItem(this.name, this.date, this.getLink());
        }

    }

    export enum Privacy {
        public = "true",
        private = "false"
    }

    export class Client {
    
        private client: typeof GitHub;

        constructor(client : typeof GitHub) {
            this.client = client;
        }


        public upload(snippet : UtilClasses.Snippet, privacy : Gists.Privacy, description : string) : Promise<Reference> {
            return new Promise<Reference>((resolve, reject) => {

                let gist = this.client.getGist();

                var data = {
                    public: (privacy === Gists.Privacy.public),
                    description: description,
                    files: {
                        [snippet.getName()] : {
                           content: snippet.getData()
                        }
                    }
                };

                gist.create(data).then((data: string) => {
                    return gist.read();
                }).then((data: any) => {
                    console.log(data);
                    if (data['status'] === 200) {
                        resolve(new Gists.Reference(snippet.getName(), data['data']['html_url'], new Date(), privacy, description));
                    } else {
                        reject(new Error(data['statusText'] + " / " + data["data"]));
                    }
                }).catch((e: any) => {
                    reject(e);
                });

            });       
        }

    }


}