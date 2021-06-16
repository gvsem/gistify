import { ReferenceTreeItem } from '../gistify/referencesView';
import { UtilClasses } from './util';
var GitHub = require('github-api');

export module Gists {

    export class Reference extends UtilClasses.Reference {

        private link: string;

        constructor(link: string) {
            super();
            this.link = link;
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
            r['link'] = this.getLink();
            return r;
        }

        public static fromJSONObject(json : any) : Reference | null {
            super.fromJSONObject(null);
            if ((typeof json === 'object') && (typeof json['link'] === 'string')) {
                return new Reference(json['link']);
            }
            return null;
        }

        public getReferenceTreeItem() : ReferenceTreeItem | null {
            return new ReferenceTreeItem('Gists Ref', this.getLink());
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
                    if (data['status'] == 200) {
                        resolve(new Reference(data['data']['html_url']));
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