import { ReferenceTreeItem } from '../gistify/referencesView';
import { UtilClasses } from './util';
var GitHub = require('github-api');

export module Gists {

    export class Reference extends UtilClasses.Reference {

        private name: string;
        private link: string;
        private date: Date;

        constructor(name: string, link: string, date?: Date) {
            super();
            this.name = name;
            this.link = link;
            this.date = date !== undefined ? date : new Date();
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
            return r;
        }

        public static fromJSONObject(json : any) : Reference | null {
            super.fromJSONObject(null);
            if ((typeof json === 'object') && (typeof json['link'] === 'string')) {
                return new Reference(json['name'], json['link'], new Date(json['date']));
            }
            return null;
        }

        public getReferenceTreeItem() : ReferenceTreeItem | null {
            return new ReferenceTreeItem(this.name, this.date.toJSON(), this.getLink());
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
                        resolve(new Reference(snippet.getName(), data['data']['html_url'], new Date()));
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