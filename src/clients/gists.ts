import { UtilClasses } from './util';
var GitHub = require('github-api');

export module Gists {

    export class Reference {

        private link: string;

        constructor(link: string) {
            this.link = link;
        }

        public getLink() : string {
            return this.link;
        }

        public getId() : string {
            var s = this.link.split('/').pop();
            if (s !== undefined) {
                return s;
            }
            throw new Error("Reference is initialized with wrong link.");
        }

    }

    export enum Privacy {
        public = "true",
        private = "false"
    }

    export class Client {
    
        private apiToken: string;
        private client: typeof GitHub;

        constructor(apiToken : string, client : typeof GitHub) {
            this.apiToken = apiToken;
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
                }).then((data: string) => {
                    console.log(data);
                    if (data['status'] == 200) {
                        resolve(new Reference(data['data']['html_url']));
                    } else {
                        reject(new Error(data['statusText'] + " / " + data["data"]));
                    }
                }).catch((e) => {
                    reject(e);
                });

            });       
        }

    }


}